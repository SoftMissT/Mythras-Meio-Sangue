import { EncounterGeneratorActorBuilder } from '../actor-builder'

export class EncounterGeneratorEnemyDetail extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  private skollProxyBaseUrl: string = 'https://www.megproxy.com/'
  private dataReady: boolean = false
  private showLoader: boolean = true
  private enemy: any = {}

  private actorBuilder: EncounterGeneratorActorBuilder

  constructor(
    private enemyId: string,
    private enemyName: string,
    private tags: string,
    options: Partial<ApplicationConfiguration> = {}
  ) {
    super(options)
    this.actorBuilder = new EncounterGeneratorActorBuilder()
  }

  override get title() {
    return this.enemyName
  }

  static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration> = {
    classes: ['mythras', 'sheet'],
    position: { width: 550, height: 600 },
    window: { resizable: true, controls: [] }
  }

  static override PARTS: Record<string, { template: string }> = {
    main: {
      template: 'systems/mythras/templates/apps/encounter-generator/detail/enemy-detail.hbs'
    }
  }

  protected override async _prepareContext(
    _options: ApplicationRenderOptions
  ): Promise<object> {
    const tagList = this.tags.split(',')
    return {
      enemyName: this.enemyName,
      enemy: this.enemy,
      showLoader: this.showLoader,
      dataReady: this.dataReady,
      tags: tagList
    }
  }

  protected override _onRender(context: object, options: ApplicationRenderOptions): void {
    super._onRender(context, options)
    if (!this.dataReady) {
      this.getEnemyData()
    }

    const refreshButton = this.element.querySelector<HTMLElement>('.refresh-button')
    refreshButton?.addEventListener('click', (event) => {
      event.preventDefault()
      this.showLoader = true
      this.dataReady = false
      this.render(true)
    })

    const importButton = this.element.querySelector<HTMLElement>('.import-button')
    importButton?.addEventListener('click', (event) => {
      event.preventDefault()
      this.importEnemy()
    })
  }

  private async getEnemyData() {
    this.enemy = await this.loadEnemy()
    this.showLoader = false
    this.dataReady = true
    this.render(true)
  }

  private async loadEnemy(): Promise<any[]> {
    let response = await fetch(`${this.skollProxyBaseUrl}generate_enemy_json?id=${this.enemyId}`)
    let template = await response.json()
    return template[0]
  }

  private async importEnemy() {
    await this.actorBuilder.createActor(this.enemy, null)
  }
}
