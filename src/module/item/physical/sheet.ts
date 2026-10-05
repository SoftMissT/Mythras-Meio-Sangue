import { ItemSheetBase } from '@item/ItemSheetBase'
import { PhysicalItemMythras } from '.'

export class PhysicalItemSheetMythras<
  TItem extends PhysicalItemMythras
> extends ItemSheetBase<TItem> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const sheetData: any = await super._prepareContext(options)

    return {
      ...sheetData,
      availableStorage: this.item.availableStorage,
      weaponSizeLabels: [
        { value: 'S', label: 'MYTHRAS.Small' },
        { value: 'M', label: 'MYTHRAS.Medium' },
        { value: 'L', label: 'MYTHRAS.Large' },
        { value: 'H', label: 'MYTHRAS.Huge' },
        { value: 'E', label: 'MYTHRAS.Enormous' },
        { value: 'BE', label: 'MYTHRAS.Beyond_Enormous' }
      ],
      weaponReachLabels: [
        { value: 'T', label: 'MYTHRAS.Touch' },
        { value: 'S', label: 'MYTHRAS.Short' },
        { value: 'M', label: 'MYTHRAS.Medium' },
        { value: 'L', label: 'MYTHRAS.Long' },
        { value: 'VL', label: 'MYTHRAS.Very_Long' }
      ]
    }
  }
}
