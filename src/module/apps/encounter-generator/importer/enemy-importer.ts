import { EncounterGeneratorImporter } from './base'

export class EncounterGeneratorEnemyImporter extends EncounterGeneratorImporter {
  protected rowListElementSelector: string = 'div.enemy-template-list-rows'
  protected templatesUrl: string = 'get_enemy_template_list'
  protected tabName: string = 'enemies'

  public rankMap = {
    1: 'Rabble 1',
    2: 'Novice 2',
    3: 'Skilled 3',
    4: 'Veteran 4',
    5: 'Master 5'
  }

  public reverseRankMap = {
    'Rabble 1': 1,
    'Novice 2': 2,
    'Skilled 3': 3,
    'Veteran 4': 4,
    'Master 5': 5
  }

  public raceList: Record<string, boolean> = {}
  public racesReady: boolean = false

  private selectedRaces: Record<string, boolean> = {}
  private selectedRanks: Record<string, boolean> = {}

  protected filters: {
    search: string
    ranks: Record<string, boolean>
  }

  protected prepareFilters(): void {
    this.filters = {
      search: '',
      ranks: {
        'Rabble 1': false,
        'Novice 2': false,
        'Skilled 3': false,
        'Veteran 4': false,
        'Master 5': false
      }
    }
  }

  protected filterTemplates(template: any) {
    let include = true
    const searchText = this.filters.search
    const nameAndRace = template.name.toLocaleLowerCase() + template.race.toLocaleLowerCase()
    if (Object.keys(this.selectedTags).length) {
      include = false
      for (let tag of template.tags) {
        if (Object.keys(this.selectedTags).includes(tag)) {
          include = true
        }
      }
    }
    if (!nameAndRace.includes(searchText.toLocaleLowerCase())) {
      include = false
    }
    if (
      Object.keys(this.selectedRaces).length &&
      !Object.keys(this.selectedRaces).includes(template.race)
    ) {
      include = false
    }
    if (
      Object.keys(this.selectedOwners).length &&
      !Object.keys(this.selectedOwners).includes(template.owner)
    ) {
      include = false
    }
    if (
      Object.keys(this.selectedRanks).length &&
      !Object.keys(this.selectedRanks).includes(String(template.rank))
    ) {
      include = false
    }
    return include
  }

  private searchEnemies(searchInput: HTMLInputElement) {
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

  private async getRaces() {
    if (!this.allTemplates) {
      this.allTemplates = await this.loadTemplates()
    }
    let races: any = {}
    for (let template of this.allTemplates) {
      races[template.race] = false
    }
    this.raceList = this.orderObjectByKey(races)
    this.racesReady = true
  }

  public override render(): void {
    super.render()
    if (!this.racesReady) {
      this.getRaces()
    }
  }

  public override activateListeners(): void {
    super.activateListeners()
    const enemyFilters = this.element.querySelector<HTMLElement>('.template-list-filters')
    if (!enemyFilters) return
    const searchInput = enemyFilters.querySelector<HTMLInputElement>('input[name=searchTerm]')
    if (searchInput) {
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.searchEnemies(searchInput)
        }
      })
    }
    enemyFilters.querySelector('.search-button')?.addEventListener('click', () => {
      if (searchInput) this.searchEnemies(searchInput)
    })
    enemyFilters.querySelectorAll<HTMLInputElement>('.race').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const raceName = checkbox.dataset.raceName!

        this.raceList[raceName] = checkbox.checked
        if (checkbox.checked) {
          this.selectedRaces[raceName] = true
        } else {
          delete this.selectedRaces[raceName]
        }
      })
    })
    enemyFilters.querySelectorAll<HTMLInputElement>('.rank').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const rank = checkbox.dataset.rank!
        const rankName = checkbox.dataset.rankName!

        this.filters.ranks[rankName] = checkbox.checked
        if (checkbox.checked) {
          this.selectedRanks[rank] = true
        } else {
          delete this.selectedRanks[rank]
        }
      })
    })
  }

  public async importEnemy(id: string) {
    let response = await fetch(`${this.skollProxyBaseUrl}generate_enemy_json?id=${id}`)
    let template = await response.json()
    this.importEnemyFromJson(template)
  }

  public async importEnemyFromJson(jsonObject: any) {
    let skollEnemy = jsonObject
    if (Array.isArray(jsonObject)) {
      skollEnemy = jsonObject[0]
    }
    await this.actorBuilder.createActor(skollEnemy, null)
  }
}
