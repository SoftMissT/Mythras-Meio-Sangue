import { SpellMythras } from '.'
import { ItemSheetBase } from '@item/ItemSheetBase'

export class SpellSheetMythras extends ItemSheetBase<SpellMythras> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const itemData: any = await super._prepareContext(options)

    return {
      ...itemData,
      availableMagicSkills: this.item.availableMagicSkills,
      stats: {
        intensity: {
          label: 'MYTHRAS.Intensity',
          derivedName: 'intensity',
          derivedValue: this.item.intensity,
          modifierName: 'system.intensity.mod',
          modifierValue: itemData.system.intensity.mod
        },
        magnitude: {
          label: 'MYTHRAS.Magnitude',
          derivedName: 'magnitude',
          derivedValue: this.item.magnitude,
          modifierName: 'system.magnitude.mod',
          modifierValue: itemData.system.magnitude.mod
        }
      }
    }
  }
}
