import { EncounterGeneratorEnemyDetail } from './detail/enemy-detail'
import { EncounterGeneratorEnemyImporter } from './importer/enemy-importer'
import { EncounterGeneratorPartyImporter } from './importer/party-importer'

export class EncounterGenerator extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  private enemyImporter!: EncounterGeneratorEnemyImporter
  private partyImporter!: EncounterGeneratorPartyImporter

  onReady() {
    console.log('Mythras | Initializing app: EncounterGenerator')
    this.enemyImporter = new EncounterGeneratorEnemyImporter(this)
    this.partyImporter = new EncounterGeneratorPartyImporter(this)
    this.injectActorDirectory()
  }

  override get title() {
    return 'Mythras Encounter Generator'
  }

  static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration> = {
    classes: ['mythras', 'sheet'],
    position: { width: 800, height: 700 },
    window: { resizable: true, controls: [] }
  }

  static override PARTS: Record<string, { template: string }> = {
    main: {
      template: 'systems/mythras/templates/apps/encounter-generator/encounter-generator.hbs'
    }
  }

  protected override async _prepareContext(
    _options: ApplicationRenderOptions
  ): Promise<object> {
    return {
      tabs: [
        { name: 'enemies', label: 'Generate Enemies' },
        { name: 'parties', label: 'Generate Parties' },
        { name: 'from-json', label: 'Generate from JSON' },
        { name: 'credits', label: 'Credits' }
      ],
      enemies: this.enemyImporter,
      parties: this.partyImporter
    }
  }

  protected override _onRender(context: object, options: ApplicationRenderOptions): void {
    super._onRender(context, options)
    this.enemyImporter.render()
    this.partyImporter.render()
    this.enemyImporter.activateListeners()
    this.partyImporter.activateListeners()
    this.bindTabNavigation()
    this.bindTemplateLists()
  }

  /** Tabs are not managed by HandlebarsApplicationMixin: apply the persisted tab
   * state to the freshly rendered markup and bind click handling once per render. */
  private bindTabNavigation() {
    const nav = this.element.querySelector<HTMLElement>('.sheet-tabs[data-group]')
    if (!nav) return
    const group = nav.getAttribute('data-group') || 'primary'
    const first = nav.querySelector<HTMLElement>('[data-tab]')?.dataset.tab
    const active = this.tabGroups[group] ?? first
    if (!active) return
    this.tabGroups[group] = active

    const applyState = (tab: string) => {
      nav.querySelectorAll<HTMLElement>('[data-tab]').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-tab') === tab)
      })
      this.element
        .querySelectorAll<HTMLElement>(`.tab[data-group="${group}"]`)
        .forEach((el) => {
          el.classList.toggle('active', el.getAttribute('data-tab') === tab)
        })
    }

    applyState(active)
    nav.addEventListener('click', (event) => {
      const tab = (event.target as HTMLElement)
        .closest<HTMLElement>('[data-tab]')
        ?.getAttribute('data-tab')
      if (!tab) return
      event.preventDefault()
      this.tabGroups[group] = tab
      applyState(tab)
    })
  }

  private bindTemplateLists(): void {
    // Import buttons
    const importButtons = this.element.querySelectorAll<HTMLElement>('.import-button')
    importButtons.forEach((btn) =>
      btn.addEventListener('click', (event) => {
        event.stopPropagation()
        const target = event.target as HTMLElement
        const elem = target.closest<HTMLElement>('[data-template-id]')
        if (!elem) return

        const id = elem.dataset.templateId!
        const type = elem.dataset.templateType!
        if (type === 'enemy') this.enemyImporter.importEnemy(id)
        else if (type === 'party') this.partyImporter.importParty(id)
      })
    )

    const templateRows = this.element.querySelectorAll<HTMLElement>('[data-template-id]')
    templateRows.forEach((row) =>
      row.addEventListener('click', (event) => {
        event.preventDefault()
        const id = row.dataset.templateId!
        const type = row.dataset.templateType!
        const name = row.dataset.templateName!
        const tags = row.dataset.templateTags!
        if (type === 'enemy') {
          const detail = new EncounterGeneratorEnemyDetail(id, name, tags)
          detail.render(true)
        }
      })
    )

    const createEnemyJson = this.element.querySelector<HTMLInputElement>('#create-enemy-json')
    const createEnemyButton = this.element.querySelector<HTMLButtonElement>('#create-enemy-button')
    if (createEnemyJson && createEnemyButton) {
      createEnemyButton.addEventListener('click', (event) => {
        event.preventDefault()
        this.enemyImporter.importEnemyFromJson(JSON.parse(createEnemyJson.value))
      })
    }

    const createPartyJson = this.element.querySelector<HTMLInputElement>('#create-party-json')
    const createPartyButton = this.element.querySelector<HTMLButtonElement>('#create-party-button')
    if (createPartyJson && createPartyButton) {
      createPartyButton.addEventListener('click', (event) => {
        event.preventDefault()
        this.partyImporter.importPartyFromJson(JSON.parse(createPartyJson.value))
      })
    }
  }

  injectActorDirectory() {
    const directory = ui.actors.element as any
    const htmlElem: HTMLElement | null =
      directory instanceof HTMLElement ? directory : directory?.[0] ?? null
    if (htmlElem && htmlElem.querySelector('.encounter-generator-btn')) return

    const container = document.createElement('div')
    container.classList.add('encounter-generator-btn-container')
    container.innerHTML = `<button class="encounter-generator-btn">Mythras Encounter Generator</button>`

    if (game.user.isGM) {
      const footerElem = htmlElem?.querySelector('footer')
      if (footerElem) footerElem.append(container)
    }

    const button = container.querySelector('.encounter-generator-btn')
    if (button) {
      button.addEventListener('click', (ev: MouseEvent) => {
        ev.preventDefault()
        this.render(true)
      })
    }
  }
}
