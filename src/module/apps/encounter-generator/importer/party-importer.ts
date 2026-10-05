import { EncounterGeneratorImporter } from './base'

export class EncounterGeneratorPartyImporter extends EncounterGeneratorImporter {
  protected rowListElementSelector: string = 'div.party-template-list-rows'
  protected templatesUrl: string = 'get_party_template_list'
  protected tabName: string = 'parties'

  protected filters: {
    search: string
  }

  protected prepareFilters(): void {
    this.filters = {
      search: ''
    }
  }

  protected filterTemplates(template: any) {
    let include = true
    const searchText = this.filters.search
    if (Object.keys(this.selectedTags).length) {
      include = false
      for (let tag of template.tags) {
        if (Object.keys(this.selectedTags).includes(tag)) {
          include = true
        }
      }
    }
    if (!template.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
      include = false
    }
    if (
      Object.keys(this.selectedOwners).length &&
      !Object.keys(this.selectedOwners).includes(template.owner)
    ) {
      include = false
    }

    return include
  }

  private searchParties(searchInput: HTMLInputElement) {
    if (this.showAdvancedFilters) {
      this.element.querySelectorAll<HTMLElement>('[data-filter-list]').forEach((element) => {
        const listName = element.dataset.filterList!
        this.filterListLastScrollTops[listName] = element.scrollTop
      })
    }
    this.filters.search = searchInput.value
    this.scrollLimit = 100
    this.lastScrollTop = 0
    this.templatesPage = []
    this.dataReady = false
    this.showLoader = true
    this.encounterGenerator.render(true)
  }

  public override activateListeners(): void {
    super.activateListeners()
    const partyFilters = this.element.querySelector<HTMLElement>('.template-list-filters')
    if (!partyFilters) return
    const searchInput = partyFilters.querySelector<HTMLInputElement>('input[name=searchTerm]')
    if (searchInput) {
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.searchParties(searchInput)
        }
      })
    }
    partyFilters.querySelector('.search-button')?.addEventListener('click', () => {
      if (searchInput) this.searchParties(searchInput)
    })
  }

  public async importParty(id: string) {
    let response = await fetch(`${this.skollProxyBaseUrl}generate_party_json?id=${id}`)
    let template = await response.json()
    this.importPartyFromJson(template)
  }

  public async importPartyFromJson(jsonObject: any) {
    let folder = await Folder.create({
      name: `${jsonObject['party_name']}`,
      type: 'Actor'
    })
    jsonObject.enemies.forEach(async (enemy: any) => {
      await this.actorBuilder.createActor(enemy, folder.id)
    })
  }
}
