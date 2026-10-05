import { PhysicalItemSheetMythras } from '@item/physical/sheet'
import { ArmorMythras } from '.'

export class ArmorSheetMythras extends PhysicalItemSheetMythras<ArmorMythras> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const sheetData: any = await super._prepareContext(options)

    return {
      ...sheetData,
      availableHitLocations: this.item.availableHitLocations
    }
  }
}
