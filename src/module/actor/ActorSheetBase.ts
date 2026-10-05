import { ActorData, ActorMythras } from '@actor/base'
import { HitLocationMythras } from '@item/hit-location'
import { CultBrotherhoodMythras } from '@item/cult-brotherhood'
import { MagicSkillMythras } from '@item/magic-skill'
import { SkillMythras } from '@item/skill'
import { SpellMythras } from '@item/spell'
import { StorageMythras } from '@item/storage'
import { Roller } from '@module/roller'
import { SheetPostRender } from '@module/sheet-common/sheet-post-render'
import { ActorAttributes } from '@actor/attribute'
import { ActorCharacteristic, ActorCharacteristics } from '@actor/characteristic'
import { EquipmentTypes } from '@item/equipment'

export abstract class ActorSheetBase<TActor extends ActorMythras> extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2<Actor>
) {
  // The mixin resolves ActorSheetV2<Actor>; narrow the accessor back to the concrete actor type.
  override get actor(): TActor {
    return super.actor as TActor
  }
  roller: Roller

  static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration> = {
    classes: ['mythras', 'sheet', 'actor'],
    tag: 'form',
    position: { width: 800, height: 900 },
    actions: {
      editImage: ActorSheetBase.#editImage
    }
  }

  static override PARTS: Record<string, { template: string }> = {
    main: {
      // The theme decides the template, so it can only be resolved at render time.
      get template() {
        return game.mythras.theme.getTheme().getCharacterActorTemplate()
      }
    }
  }

  constructor(options: Partial<DocumentSheetConfiguration>) {
    super(options)
    this.roller = new Roller(this.actor)
  }

  static async #editImage(this: ActorSheetBase<any>, _event: Event, target: HTMLElement) {
    const field = target.dataset.field || 'img'
    const current = (this.actor as any)[field]
    const fp = new FilePicker({
      type: 'image',
      current,
      callback: (path: string) => this.actor.update({ [field]: path })
    })
    fp.render(true)
  }

  /**
   * @returns All data needed to render the template of this actor
   */
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    let actorSystem: ActorData = this.actor.system
    let actorAttributes: ActorAttributes = actorSystem.attributes
    let actorChar: any = actorSystem.characteristics

    const data: any = {
      items: { ...this.actor.itemTypes },
      armorPenalty: this.actor.armorPenalty,
      fatigue: this.actor.fatigue,
      encumbrance: this.actor.encumbrance,
      movement: this.actor.movement,
      statTracker: this.actor.statTracker,
      magicSkillNames: this.actor.itemTypes.spell
        .map((spell) => ({ value: spell.magicSkillName, label: spell.magicSkillName }))
        .filter((v, i, a) => a.findIndex((o) => o.value === v.value) === i),
      system: actorSystem,
      actor: this.actor,
      isClassicTheme: game.mythras.theme.isClassic(),
      tabs: [
        {
          name: 'core',
          label: 'MYTHRAS.Character'
        },
        {
          name: 'combat',
          label: 'MYTHRAS.Combat'
        },
        {
          name: 'abilities',
          label: 'MYTHRAS.Abilities'
        },
        {
          name: 'equipment',
          label: 'MYTHRAS.Equipment'
        },
        {
          name: 'notes',
          label: 'MYTHRAS.Journal'
        }
      ],
      stats: {
        actionPoints: {
          isAttribute: true,
          tracked: true,
          label: 'MYTHRAS.ACTION_POINTS',
          derivedName: 'maxActionPoints',
          currentValue: actorAttributes.actionPoints.value,
          derivedValue: this.actor.maxActionPoints,
          modifierName: 'system.attributes.actionPoints.mod',
          modifierValue: actorAttributes.actionPoints.mod
        },
        damageMod: {
          isAttribute: true,
          tracked: false,
          label: 'MYTHRAS.DAMAGE_MOD',
          derivedName: 'damageMod',
          derivedValue: this.actor.damageMod,
          modifierName: 'system.attributes.damageMod.mod',
          modifierValue: actorAttributes.damageMod.mod
        },
        experienceMod: {
          isAttribute: true,
          tracked: false,
          label: 'MYTHRAS.EXPERIENCE_MOD',
          derivedName: 'experienceMod',
          derivedValue: this.actor.experienceMod,
          modifierName: 'system.attributes.experienceMod.mod',
          modifierValue: actorAttributes.experienceMod.mod
        },
        healingRate: {
          isAttribute: true,
          tracked: false,
          label: 'MYTHRAS.HEALING_RATE',
          derivedName: 'healingRate',
          derivedValue: this.actor.healingRate,
          modifierName: 'system.attributes.healingRate.mod',
          modifierValue: actorAttributes.healingRate.mod
        },
        initiativeBonus: {
          isAttribute: true,
          tracked: false,
          label: 'MYTHRAS.INITIATIVE_BONUS',
          derivedName: 'initiativeBonus',
          derivedValue: this.actor.initiativeBonus,
          modifierName: 'system.attributes.initiativeBonus.mod',
          modifierValue: actorAttributes.initiativeBonus.mod
        },
        luckPoints: {
          isAttribute: true,
          tracked: true,
          label: 'MYTHRAS.LUCK_POINTS',
          derivedName: 'maxLuckPoints',
          currentValue: actorAttributes.luckPoints.value,
          derivedValue: this.actor.maxLuckPoints,
          modifierName: 'system.attributes.luckPoints.mod',
          modifierValue: actorAttributes.luckPoints.mod
        },
        magicPoints: {
          isAttribute: true,
          tracked: true,
          label: game.mythras.theme.getTheme().relabel('Actor-getData', 'MYTHRAS.MAGIC_POINTS'),
          derivedName: 'maxMagicPoints',
          currentValue: actorAttributes.magicPoints.value,
          derivedValue: this.actor.maxMagicPoints,
          modifierName: 'system.attributes.magicPoints.mod',
          modifierValue: actorAttributes.magicPoints.mod
        },
        tenacity: {
          isAttribute: false,
          tracked: true,
          label: 'MYTHRAS.TENACITY',
          derivedName: 'maxTenacity',
          currentValue: actorAttributes.tenacity.value,
          derivedValue: this.actor.maxTenacity,
          modifierName: 'system.attributes.tenacity.mod',
          modifierValue: actorAttributes.tenacity.mod
        },
        experienceRoll: {
          isAttribute: false,
          tracked: true,
          label: 'MYTHRAS.EXPERIENCE_ROLLS',
          currentValue: actorAttributes.experienceRoll
        }
      },
      characteristics: {
        str: {
          derivedValue: this.actor.characteristics.str,
          value: actorChar.str.value,
          mod: this.actor.characteristicsMod.str,
          label: 'MYTHRAS.STRENGTH'
        },
        con: {
          derivedValue: this.actor.characteristics.con,
          value: actorChar.con.value,
          mod: this.actor.characteristicsMod.con,
          label: 'MYTHRAS.CONSTITUTION'
        },
        siz: {
          derivedValue: this.actor.characteristics.siz,
          value: actorChar.siz.value,
          mod: this.actor.characteristicsMod.siz,
          label: 'MYTHRAS.SIZE'
        },
        dex: {
          derivedValue: this.actor.characteristics.dex,
          value: actorChar.dex.value,
          mod: this.actor.characteristicsMod.dex,
          label: 'MYTHRAS.DEXTERITY'
        },
        int: {
          derivedValue: this.actor.characteristics.int,
          value: actorChar.int.value,
          mod: this.actor.characteristicsMod.int,
          label: 'MYTHRAS.INTELLIGENCE'
        },
        pow: {
          derivedValue: this.actor.characteristics.pow,
          value: actorChar.pow.value,
          mod: this.actor.characteristicsMod.pow,
          label: 'MYTHRAS.POWER'
        },
        cha: {
          derivedValue: this.actor.characteristics.cha,
          value: actorChar.cha.value,
          mod: this.actor.characteristicsMod.cha,
          label: 'MYTHRAS.CHARISMA'
        }
      },
      fatigueLevelLabels: [
        { value: 'fresh', label: 'MYTHRAS.Fresh' },
        { value: 'winded', label: 'MYTHRAS.Winded' },
        { value: 'tired', label: 'MYTHRAS.Tired' },
        { value: 'wearied', label: 'MYTHRAS.Wearied' },
        { value: 'exhausted', label: 'MYTHRAS.Exhausted' },
        { value: 'debilitated', label: 'MYTHRAS.Debilitated' },
        { value: 'incapacitated', label: 'MYTHRAS.Incapacitated' },
        { value: 'semi-conscious', label: 'MYTHRAS.Semi-Conscious' },
        { value: 'comatose', label: 'MYTHRAS.Comatose' },
        { value: 'dead', label: 'MYTHRAS.Dead' }
      ],
      equipmentTypes: EquipmentTypes
    }

    // Journal HTML enrichment
    data.journalHTML = await TextEditor.enrichHTML(data.system.journal, {
      secrets: this.actor.isOwner,
      rollData: data.rollData
    })

    // Abilities HTML enrichment
    data.abilitiesDesc = await TextEditor.enrichHTML(data.system.abilitiesDesc, {
      secrets: this.actor.isOwner,
      rollData: data.rollData
    })

    this.sortItems(data)
    return data
  }

  private sortItems(sheetData: any) {
    // Assign and return
    sheetData.items.hitLocation.sort((a: HitLocationMythras, b: HitLocationMythras) => {
      return a.system.rollRangeStart - b.system.rollRangeStart
    })
    sheetData.items.standardSkill.sort((a: SkillMythras, b: SkillMythras) => {
      return a.name.localeCompare(b.name)
    })
    sheetData.items.professionalSkill.sort((a: SkillMythras, b: SkillMythras) => {
      return a.name.localeCompare(b.name)
    })
    sheetData.items.magicSkill.sort((a: MagicSkillMythras, b: MagicSkillMythras) => {
      return a.name.localeCompare(b.name)
    })
    sheetData.items.storage.sort((a: StorageMythras, b: StorageMythras) => {
      return a.name.localeCompare(b.name)
    })
    sheetData.items.cultBrotherhood.sort((a: CultBrotherhoodMythras, b: CultBrotherhoodMythras) => {
      return a.name.localeCompare(b.name)
    })
    sheetData.items.spell.sort((a: SpellMythras, b: SpellMythras) => {
      return a.magicSkillName.localeCompare(b.magicSkillName)
    })
  }

  protected override _onRender(context: object, options: DocumentSheetRenderOptions): void {
    super._onRender(context, options)

    const root = this.element
    const on = (selector: string, type: string, listener: (event: Event) => void) => {
      root.querySelectorAll(selector).forEach((el) => el.addEventListener(type, listener))
    }

    // Listens for item-input updates. Element with [data-item] that contain inputs
    // are listened to. If an input changes, update the embedded document associated with
    // that data-item using the data-item-id attribute on that same element
    on('[data-item] input, [data-item] select', 'change', async (event) => {
      const target = event.target as HTMLInputElement
      const itemId = target.closest('[data-item]')?.getAttribute('data-item-id')
      const propertyPath = target.getAttribute('data-item-property')
      const item = itemId ? this.actor.items.get(itemId) : undefined
      if (!item || !propertyPath) return
      let newValue: string | boolean = target.value
      if (target.type === 'checkbox') {
        newValue = target.checked
      }
      const propertyName = propertyPath !== 'name' ? `system.${propertyPath}` : 'name'
      await this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: item.id,
          [propertyName]: newValue
        }
      ])
    })

    // Everything below here is only needed if the sheet is editable
    if (this.isEditable) {
      // Add Actor Item
      on('.item-create', 'click', this.onItemCreate.bind(this))

      // Update Actor Item
      on('.item-edit', 'click', (event) => {
        const li = (event.currentTarget as HTMLElement).closest('.item')
        const itemId = li?.getAttribute('data-item-id')
        const item = itemId ? this.actor.items.get(itemId) : undefined
        item?.sheet.render(true)
      })

      // Delete Actor Item
      on('.item-delete', 'click', async (event) => {
        const li = (event.currentTarget as HTMLElement).closest('.item')
        const itemId = li?.getAttribute('data-item-id')
        const item = itemId ? this.actor.items.get(itemId) : undefined
        if (!item) return

        const proceed = await foundry.applications.api.DialogV2.confirm({
          window: { title: 'Delete', controls: [] },
          content: `<p>Are you sure you want to delete ${item.name}</p>`,
          modal: true
        })
        if (proceed) item.delete()
      })

      // Skill roll button listeners
      on('.rollableSkill', 'contextmenu', (event) => {
        this.handleItemRoll(event, this.roller.rollSkill.bind(this.roller))
      })
      on('.rollableSkill', 'click', (event) => {
        void this.handleSkillRollClick(event)
      })

      // Melee Weapon roll button listener
      on('.rollableMeleeDamage', 'click', (event) => {
        this.handleItemRoll(event, this.roller.rollMeleeDamage.bind(this.roller))
      })

      // Ranged Weapon roll button listener
      on('.rollableRangedDamage', 'click', (event) => {
        this.handleItemRoll(event, this.roller.rollRangedDamage.bind(this.roller))
      })

      // Hit Location roll button listener
      on('.roll-hitlocations-button', 'click', (event) => {
        event.preventDefault()
        this.roller.rollHitLocation()
      })

      // Recover M-Space conflict pool button listener
      on('.recoverCharacteristicPools', 'click', (event) => {
        this.handleRecoverCharacteristicPools(event)
      })

      on('.stat-settings', 'click', (event) => {
        event.preventDefault()
        new foundry.applications.api.DialogV2({
          window: { title: 'Stat Tracker', controls: [] },
          content: '<p>Coming soon :)</p>',
          buttons: []
        }).render({ force: true })
      })

      on('.stat-increase', 'click', (event) => {
        event.preventDefault()
        this.shiftTrackedStat(event, 1)
      })

      on('.stat-decrease', 'click', (event) => {
        event.preventDefault()
        this.shiftTrackedStat(event, -1)
      })

      on('#equipmentSearch', 'input', (event) => {
        this.searchEquipment((event.target as HTMLInputElement).value)
      })
    }

    this.bindTabNavigation()
    this.postRender()
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

  private postRender() {
    new SheetPostRender(this.element).postRender()
    this.applyEncumbranceStyles()
    this.applyWoundedHitLocationStyles()
    this.filterSpells()
    this.filterEquipment()
  }

  private applyEncumbranceStyles() {
    const segments = this.element.querySelectorAll(
      '.encumbrance-bar .percent-segment-filled'
    )
    let state = ''
    if (this.actor.encumbrance.isOverMaxLoad) {
      state = 'maxload'
    } else if (this.actor.encumbrance.isOverloaded) {
      state = 'overloaded'
    } else if (this.actor.encumbrance.isBurdened) {
      state = 'burdened'
    }
    segments.forEach((segment) => {
      segment.classList.remove('burdened', 'overloaded', 'maxload')
      if (state) segment.classList.add(state)
    })
  }

  private applyWoundedHitLocationStyles() {
    //@ts-ignore
    const hitLocations: HitLocationMythras[] = this.actor.items.filter(
      (item) => item.type == 'hitLocation'
    )
    for (let hitLocation of hitLocations) {
      let currentHp = hitLocation.system.currentHp
      let hitLocationElement = this.element.querySelector<HTMLElement>(
        `.hitLocation-table [data-item-id="${hitLocation.id}"]`
      )

      if (currentHp <= hitLocation.maxHp * -1 && !!hitLocationElement) {
        hitLocationElement.style.backgroundColor = '#c5000094'
      } else if (currentHp <= 0 && !!hitLocationElement) {
        hitLocationElement.style.backgroundColor = '#ed5b1585'
      }
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param event   The originating click event
   * @private
   */
  private onItemCreate(event: Event) {
    event.preventDefault()
    const header = event.currentTarget as HTMLElement
    // Get the type of item to create.
    const type = header.dataset.type!
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset)
    // Initialize a default name.
    var name = `New ${type.capitalize().replace(/([a-z])([A-Z])/g, '$1 $2')}`
    if (game.i18n) {
      name = game.i18n.localize(`MYTHRAS.New_${type}`)
    }
    delete data['type']
    // Prepare the item object.
    const itemData: any = {
      name: name,
      type: type,
      system: data
    }

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments('Item', [itemData])
  }

  private handleItemRoll(event: Event, rollFunction: (item: Item<ActorMythras>) => any) {
    event.preventDefault()
    const itemId = (event.currentTarget as HTMLElement).closest('[data-item-id]')
      ?.getAttribute('data-item-id')
    const item = itemId ? this.actor.items.get(itemId) : undefined
    if (!item) return
    rollFunction(item)
  }

  private async handleSkillRollClick(event: Event) {
    event.preventDefault()
    // Identify which skill was clicked
    const li = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-item-id]')
    const skillId = li?.dataset.itemId
    let skill: SkillMythras
    if (!skillId) {
      skill = this.actor.sortedSkills[0]
      if (!skill) {
        return
      }
    } else {
      skill = this.actor.items.get(skillId) as unknown as SkillMythras
    }
    this.handleSkillRoll(skill)
  }

  public async handleSkillRoll(
    skill: SkillMythras,
    contestedRollOptions?: {
      contestedSkill?: SkillMythras
      contestedActor?: ActorMythras
      contestedSuccess?: string
      contestedScore?: number
      contestedRollDifficulty?: number
      contestedRollAugmentation?: string
    }
  ) {
    // Check if the roll is contested.
    let isContestedRoll = false
    if (
      !!contestedRollOptions &&
      !!contestedRollOptions.contestedSkill &&
      !!contestedRollOptions.contestedActor &&
      !!contestedRollOptions.contestedSuccess &&
      !!contestedRollOptions.contestedScore &&
      !!contestedRollOptions.contestedRollDifficulty
    ) {
      isContestedRoll = true
    }

    const targetTokenActor = game.user.targets.first()?.actor as ActorMythras
    const isTokenTargeted =
      !!targetTokenActor &&
      targetTokenActor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED)
    let targetName = ``
    let targetAugmentSkills
    if (isTokenTargeted) {
      targetName = targetTokenActor.name
      targetAugmentSkills = targetTokenActor.sortedSkills.map((i) => {
        const s = i as unknown as SkillMythras
        return { id: s.id, label: `${s.name} (${s.totalVal}%)` }
      })
    }

    // 1) Build a text summary of the current modifiers for the tooltip
    const modifiersList = this.roller.getSkillRollModifiers(skill)
    let modText = modifiersList
      .map((m) => {
        return `<strong>${m.name}:</strong><br/> ${m.value}`
      })
      .join('<br/>')
    let isModTextVisible = true
    if (!modText) {
      modText = game.i18n.localize('MYTHRAS.No_Penalties')
      isModTextVisible = false
    }

    // Prepare difficulty labels
    const difficulties = [
      game.i18n.localize('MYTHRAS.very_easy_dif'),
      game.i18n.localize('MYTHRAS.easy_dif'),
      game.i18n.localize('MYTHRAS.standard_dif'),
      game.i18n.localize('MYTHRAS.hard_dif'),
      game.i18n.localize('MYTHRAS.formidable_dif'),
      game.i18n.localize('MYTHRAS.herculean_dif')
    ].map((label, idx) => ({ value: idx, label, selected: idx === 2 }))

    // Prepare augmentable skills
    const augmentSkills = this.actor.sortedSkills
      //.filter(i => i.id !== skill.id) // prevent a character from augmenting a skill with their same skill (currently broken since it doesn't account for the ability to change the selected skill)
      .map((i) => {
        const s = i as unknown as SkillMythras
        return { id: s.id, label: `${s.name} (${s.totalVal}%)`, selected: s.id === skill.id }
      })

    const content = await renderTemplate('systems/mythras/templates/dialogs/skillRoll-dialog.hbs', {
      skillName: skill.name,
      skillTotal: skill.totalVal,
      modText,
      difficulties,
      augmentSkills,
      isTokenTargeted,
      targetName,
      targetAugmentSkills,
      isModTextVisible,
      areLuckPointsAvailable:
        Number(this.actor.statTracker.trackedStats.luckPoints.value) > 0 ? true : false
    })

    // UI state management for the dialog's conditional sections
    const initDialogUi = (element: HTMLElement) => {
      const rollForm = element.querySelector<HTMLFormElement>('form')
      if (!rollForm) return
      const skillCap = rollForm.querySelector<HTMLElement>('#cap-skill-container')
      const skillAugment = rollForm.querySelector<HTMLElement>('#augment-skill-container')
      const customAugment = rollForm.querySelector<HTMLElement>('#augment-custom-container')
      const targetSkillAugment = rollForm.querySelector<HTMLElement>(
        '#target-augment-skill-container'
      )
      const augmentSkillSelect = rollForm.querySelector<HTMLSelectElement>(
        '#augment-skill-container select[name="augmentSkill"]'
      )
      const capSkillSelect = rollForm.querySelector<HTMLSelectElement>(
        '#cap-skill-container select[name="capSkill"]'
      )
      if (!skillCap || !skillAugment || !customAugment || !targetSkillAugment) return

      // Hide them all initially
      skillCap.style.display = 'none'
      skillAugment.style.display = 'none'
      customAugment.style.display = 'none'
      targetSkillAugment.style.display = 'none'

      // Show every option, then hide the currently picked skill from a select
      const hideSkillOption = (select: HTMLSelectElement | null, skillId: string) => {
        if (!select) return
        select.querySelectorAll<HTMLOptionElement>('option').forEach((opt) => {
          opt.style.display = ''
          opt.selected = false
        })
        const excluded = select.querySelector<HTMLOptionElement>(`option[value="${skillId}"]`)
        if (excluded) {
          excluded.style.display = 'none'
          excluded.selected = false
        }
        if (select.value === skillId) {
          const available = Array.from(select.options).find(
            (opt) => opt.style.display !== 'none'
          )
          select.value = available ? available.value : ''
        }
      }

      hideSkillOption(augmentSkillSelect, skill.id)
      hideSkillOption(capSkillSelect, skill.id)

      // On radio change, show/hide appropriately
      rollForm.addEventListener('change', (ev) => {
        const target = ev.target as HTMLElement | null
        if (!target) return
        if (target instanceof HTMLInputElement && target.name === 'augmentOption') {
          skillCap.style.display = 'none'
          skillAugment.style.display = 'none'
          customAugment.style.display = 'none'
          targetSkillAugment.style.display = 'none'

          switch (target.value) {
            case 'skillCap':
              skillCap.style.display = ''
              break
            case 'skillAugment':
              skillAugment.style.display = ''
              break
            case 'customAugment':
              customAugment.style.display = ''
              break
            case 'targetSkillAugment':
              targetSkillAugment.style.display = ''
              break
          }
        } else if (target instanceof HTMLSelectElement && target.name === 'rolledSkill') {
          // Lookup and reset the skill variable
          skill = this.actor.items.get(target.value) as unknown as SkillMythras
          hideSkillOption(augmentSkillSelect, skill.id)
          hideSkillOption(capSkillSelect, skill.id)
        }
      })
    }

    // Show the dialog
    const dialog = new (class extends foundry.applications.api.DialogV2 {
      protected override _onRender(context: object, options: ApplicationRenderOptions): void {
        super._onRender(context, options)
        initDialogUi(this.element)
      }
    })({
      window: {
        title: `${isContestedRoll ? `${game.i18n.localize('MYTHRAS.Contested')} ` : ``}${game.i18n.localize('MYTHRAS.Roll')}`,
        resizable: true,
        controls: []
      },
      content,
      position: { width: 600, height: 440 },
      buttons: [
        {
          action: 'roll',
          icon: '<i class="fas fa-dice"></i>',
          label: game.i18n.localize('MYTHRAS.Roll'),
          default: true,
          callback: (_event, _button, dialog) => {
            const form = dialog.element.querySelector('form')
            if (!form) return
            const data = new FormData(form)

              const difficulty = Number(data.get('difficulty'))
              const augmentOption = String(data.get('augmentOption'))

              let capSkill: SkillMythras | undefined
              let augmentSkill: SkillMythras | undefined
              let targetAugmentSkill: SkillMythras | undefined
              let customAugment: number | undefined
              let customAugmentReason: string | undefined
              const useLuckPoint: string = String(data.get('useLuckPoint'))

              switch (augmentOption) {
                case 'skillCap': {
                  const cid = String(data.get('capSkill') || '')
                  capSkill = cid
                    ? (this.actor.items.get(cid) as unknown as SkillMythras)
                    : undefined
                  break
                }
                case 'skillAugment': {
                  const aid = String(data.get('augmentSkill') || '')
                  augmentSkill = aid
                    ? (this.actor.items.get(aid) as unknown as SkillMythras)
                    : undefined
                  break
                }
                case 'customAugment': {
                  customAugment = Number(data.get('augmentCustomValue'))
                  customAugmentReason = String(data.get('augmentCustomReason'))
                  break
                }
                case 'targetSkillAugment': {
                  const aid = String(data.get('targetAugmentSkill') || '')
                  targetAugmentSkill = aid
                    ? (targetTokenActor.items.get(aid) as unknown as SkillMythras)
                    : undefined
                  break
                }
              }

              this.roller.rollSkillWithOptions(skill, {
                difficulty,
                capSkill,
                augmentSkill,
                customAugment,
                customAugmentReason,
                targetAugmentSkill,
                targetName,
                isContestedRoll,
                useLuckPoint,
                contestedActor: contestedRollOptions?.contestedActor,
                contestedSkill: contestedRollOptions?.contestedSkill,
                contestedSuccess: contestedRollOptions?.contestedSuccess,
                contestedScore: contestedRollOptions?.contestedScore,
                contestedRollDifficulty: contestedRollOptions?.contestedRollDifficulty,
                contestedRollAugmentation: contestedRollOptions?.contestedRollAugmentation
              })
            }
          }
      ]
    })
    dialog.render({ force: true })
  }

  private async filterSpells() {
    const actorData = this.actor.system
    let filterBy = actorData.spellFilterOption
    let items: any[] = [...this.element.querySelectorAll('.spell-list-table .item')]
    for (let item of items) {
      switch (filterBy) {
        case 'All':
          item.classList.add('active')
          break

        case `${filterBy}`:
          item.dataset.itemSource !== `${filterBy}`
            ? item.classList.remove('active')
            : item.classList.add('active')
          break
      }
    }
  }

  private async filterEquipment() {
    const actorData = this.actor.system
    let filterBy = actorData.equipmentFilterOption
    let items: any[] = [...this.element.querySelectorAll('.equipment-table .item')]
    for (let item of items) {
      switch (filterBy) {
        case 'All':
          item.classList.add('active')
          break

        case `${filterBy}`:
          item.dataset.itemType !== `${filterBy}`
            ? item.classList.remove('active')
            : item.classList.add('active')
          break
      }
    }
  }

  private async searchEquipment(searchBy: string) {
    this.filterEquipment()

    let items: any[] = [...this.element.querySelectorAll('.equipment-table .item.active')]
    for (let item of items) {
      item.dataset.itemName.toLocaleLowerCase().includes(searchBy.toLocaleLowerCase())
        ? item.classList.add('active')
        : item.classList.remove('active')
    }
  }

  /**
   * Theme M-Space introduced a conflict pool mechanic which is based on the primary characteristics.
   * These pools are depleted by use and need to be refilled by resting.
   */
  private handleRecoverCharacteristicPools(event: Event) {
    event.preventDefault()
    let k: keyof ActorCharacteristics
    for (k in this.actor.system.characteristics) {
      const actorCharacteristic: ActorCharacteristic = this.actor.system.characteristics[k]
      if (actorCharacteristic.value != actorCharacteristic.pool) {
        actorCharacteristic.pool = actorCharacteristic.value
      }
    }
    this.render(false)
  }

  private shiftTrackedStat(event: Event, delta: number) {
    const data: any = this.actor.system
    const statID = (event.target as HTMLElement).closest<HTMLElement>('[data-stat-name]')
      ?.dataset.statName
    if (!statID) return

    let trackedStats = data.trackedStats
    this.actor.update({
      ['system.trackedStats.' + statID + '.value']: Number(trackedStats[statID].value) + delta
    })
  }
}
