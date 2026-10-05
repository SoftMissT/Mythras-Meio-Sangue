import { PhysicalItemSheetMythras } from '@item/physical/sheet'
import { EquipmentMythras, EquipmentTypes } from '.'

export class EquipmentSheetMythras extends PhysicalItemSheetMythras<EquipmentMythras> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const sheetData: any = await super._prepareContext(options)

    return {
      ...sheetData,
      equipmentTypes: EquipmentTypes
    }
  }
}
