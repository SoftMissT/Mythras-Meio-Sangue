import { EncounterGenerator } from '@apps/encounter-generator'
import { EncounterGeneratorActorBuilder } from '@apps/encounter-generator/actor-builder'

export abstract class EncounterGeneratorImporter {
  constructor(protected encounterGenerator: EncounterGenerator) {
    this.prepareFilters()
    this.actorBuilder = new EncounterGeneratorActorBuilder()
  }

  get templateList(): HTMLElement {
    return this.element.querySelector<HTMLElement>(this.rowListElementSelector)!
  }

  get element(): HTMLElement {
    return this.encounterGenerator.element.querySelector<HTMLElement>(`.${this.tabName}`)!
  }

  protected actorBuilder: EncounterGeneratorActorBuilder

  public showAdvancedFilters: boolean = false
  public showLoader: boolean = true
  public dataReady: boolean = false
  public templatesPage: any[] = []
  public tagList: any = {}
  public ownerList: any = {}
  public selectedTags: any = {}
  public selectedOwners: any = {}

  protected abstract templatesUrl: string
  protected abstract rowListElementSelector: string
  protected abstract tabName: string
  protected abstract filters: any
  protected abstract prepareFilters(): void
  protected abstract filterTemplates(template: any): void

  protected skollProxyBaseUrl: string = 'https://www.megproxy.com/'
  protected scrollLimitHit: boolean = false
  protected scrollLimit: number = 100
  protected totalTemplateCount: number = 0
  protected totalFilteredCount: number = 0
  protected lastScrollTop: number = 0

  protected allTemplates: any[]
  private tagsReady: boolean = false
  private ownersReady: boolean = false
  protected filterListLastScrollTops: any = {}

  public render() {
    this.templateList.scrollTop = this.lastScrollTop
    if (!this.dataReady) {
      this.getTemplatesPage()
    }
    if (!this.tagsReady) {
      this.getTags()
    }
    if (!this.ownersReady) {
      this.getOwners()
    }
    this.toggleFilterSection()
    this.scrollFilterLists()
  }

  public activateListeners() {
    this.templateList.addEventListener('scroll', async (event) => {
      if (this.scrollLimit >= this.totalFilteredCount) {
        return
      }
      const target = event.currentTarget as HTMLElement
      if (target.scrollTop + target.clientHeight === target.scrollHeight) {
        const currentValue = this.scrollLimit
        const maxValue = this.totalTemplateCount ?? 0
        if (currentValue < maxValue && !this.scrollLimitHit) {
          this.scrollLimitHit = true
          const newValue = Math.clamp(currentValue + 100, 100, maxValue)
          this.scrollLimit = newValue
          this.lastScrollTop = target.scrollTop
          this.dataReady = false
          this.showLoader = true
          this.encounterGenerator.render(true)
        }
      }
    })

    this.element
      .querySelector('.advanced-filters-button')
      ?.addEventListener('click', (_event) => {
        this.showAdvancedFilters = !this.showAdvancedFilters
        this.toggleFilterSection()
      })
    this.element.querySelectorAll<HTMLInputElement>('.tag').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const tagName = checkbox.dataset.tagName!
        this.tagList[tagName] = checkbox.checked
        if (checkbox.checked) {
          this.selectedTags[tagName] = true
        } else {
          delete this.selectedTags[tagName]
        }
      })
    })
    this.element.querySelectorAll<HTMLInputElement>('.owner').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const ownerName = checkbox.dataset.ownerName!
        this.ownerList[ownerName] = checkbox.checked
        if (checkbox.checked) {
          this.selectedOwners[ownerName] = true
        } else {
          delete this.selectedOwners[ownerName]
        }
      })
    })
  }

  private scrollFilterLists() {
    this.element
      .querySelectorAll<HTMLElement>('[data-filter-list]')
      .forEach((list) => {
        const listName = list.dataset.filterList!
        if (this.filterListLastScrollTops[listName] !== undefined) {
          list.scrollTop = this.filterListLastScrollTops[listName]
        }
      })
  }

  private toggleFilterSection() {
    const section = this.element.querySelector<HTMLElement>('.advanced-filters-section')
    if (!section) return
    if (this.showAdvancedFilters) {
      section.style.display = ''
      this.scrollFilterLists()
    } else {
      section.style.display = 'none'
    }
  }

  protected async getTemplatesPage() {
    if (!this.allTemplates) {
      this.allTemplates = await this.loadTemplates()
    }
    let filtered = this.allTemplates.filter(this.filterTemplates.bind(this))
    this.totalFilteredCount = filtered.length
    this.templatesPage = filtered.slice(0, this.scrollLimit)
    this.dataReady = true
    this.scrollLimitHit = false
    this.showLoader = false
    this.encounterGenerator.render(true)
  }

  protected async getTags() {
    if (!this.allTemplates) {
      this.allTemplates = await this.loadTemplates()
    }
    let tags: any = {}
    for (let template of this.allTemplates) {
      for (let tag of template.tags) {
        tags[tag] = false
      }
    }
    delete tags['']
    this.tagList = this.orderObjectByKey(tags)
    this.tagsReady = true
  }

  protected async getOwners() {
    if (!this.allTemplates) {
      this.allTemplates = await this.loadTemplates()
    }
    let owners: any = {}
    for (let template of this.allTemplates) {
      owners[template.owner] = false
    }
    this.ownerList = this.orderObjectByKey(owners)
    this.ownersReady = true
  }

  protected orderObjectByKey(unordered: any) {
    const ordered = Object.keys(unordered)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .reduce((obj: any, key) => {
        obj[key] = unordered[key]
        return obj
      }, {})

    return ordered
  }

  protected async loadTemplates(): Promise<any[]> {
    let response = await fetch(`${this.skollProxyBaseUrl}${this.templatesUrl}`)
    let templates = await response.json()
    this.totalTemplateCount = templates.length
    return templates
  }
}
