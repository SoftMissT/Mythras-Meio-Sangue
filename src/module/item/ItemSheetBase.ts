import { ItemMythras } from '@item/base'
import { SheetPostRender } from '@module/sheet-common/sheet-post-render'

export class ItemSheetBase<TItem extends ItemMythras> extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2<Item>
) {
  sheetPostRender!: SheetPostRender

  // The mixin resolves ItemSheetV2<Item>; narrow the accessor back to the concrete item type.
  override get item(): TItem {
    return super.item as TItem
  }

  static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration> = {
    classes: ['mythras', 'sheet', 'item'],
    tag: 'form',
    position: { width: 495, height: 550 },
    actions: {
      editImage: ItemSheetBase.#editImage
    }
  }

  /** One template file per item type; the type name keys the part so
   * `_configureRenderOptions` can pick the right one per instance. */
  static override PARTS: Record<string, { template: string }> = {
    hitLocation: { template: 'systems/mythras/templates/item/item-hitLocation-sheet.hbs' },
    cultBrotherhood: { template: 'systems/mythras/templates/item/item-cultBrotherhood-sheet.hbs' },
    standardSkill: { template: 'systems/mythras/templates/item/item-skill-sheet.hbs' },
    professionalSkill: { template: 'systems/mythras/templates/item/item-skill-sheet.hbs' },
    passion: { template: 'systems/mythras/templates/item/item-skill-sheet.hbs' },
    magicSkill: { template: 'systems/mythras/templates/item/item-magicSkill-sheet.hbs' },
    combatStyle: { template: 'systems/mythras/templates/item/item-combatStyle-sheet.hbs' },
    'melee-weapon': { template: 'systems/mythras/templates/item/item-melee-weapon-sheet.hbs' },
    'ranged-weapon': { template: 'systems/mythras/templates/item/item-ranged-weapon-sheet.hbs' },
    currency: { template: 'systems/mythras/templates/item/item-currency-sheet.hbs' },
    storage: { template: 'systems/mythras/templates/item/item-storage-sheet.hbs' },
    equipment: { template: 'systems/mythras/templates/item/item-equipment-sheet.hbs' },
    armor: { template: 'systems/mythras/templates/item/item-armor-sheet.hbs' },
    spell: { template: 'systems/mythras/templates/item/item-spell-sheet.hbs' },
    cyberModule: { template: 'systems/mythras/templates/item/item-cyberModule-sheet.hbs' }
  }

  /** Render exactly one part: the template file chosen by this item's type. */
  protected override _configureRenderOptions(options: ApplicationRenderOptions): void {
    super._configureRenderOptions(options)
    const type = this.item.type
    if (!(type in ItemSheetBase.PARTS)) {
      throw new Error(`Mythras | No item sheet template registered for type "${type}"`)
    }
    options.parts = [type]
  }

  static async #editImage(this: ItemSheetBase<any>, _event: Event, target: HTMLElement) {
    const field = target.dataset.field || 'img'
    const current = (this.item as any)[field]
    const fp = new FilePicker({
      type: 'image',
      current,
      callback: (path: string) => this.item.update({ [field]: path })
    })
    fp.render(true)
  }

  /**
   * @returns All data needed to render the template of this item
   */
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const item = this.item

    // Enrich HTML description
    const descriptionHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      (item.system as any).description,
      {
        secrets: item.isOwner,
        documents: true,
        rollData: item.getRollData() as Record<string, unknown>
      }
    )

    return {
      item,
      system: item.system,
      descriptionHTML,
      editable: this.isEditable,
      isClassicTheme: game.mythras.theme.isClassic()
    }
  }

  protected override _onRender(context: object, options: DocumentSheetRenderOptions): void {
    super._onRender(context, options)
    this.sheetPostRender = new SheetPostRender(this.element)
    this.postRender()
    this.bindTabNavigation()
  }

  private postRender() {
    this.sheetPostRender.postRender()
  }

  /**
   * Tabs are not managed by HandlebarsApplicationMixin: apply the persisted tab
   * state to the freshly rendered markup and bind click handling once per render.
   */
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
}
