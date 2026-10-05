import { PhysicalItemSheetMythras } from '@item/physical/sheet'
import { CyberModuleMythras } from '.'

export class CyberModuleSheetMythras extends PhysicalItemSheetMythras<CyberModuleMythras> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const sheetData: any = await super._prepareContext(options)
    return {
      ...sheetData,
      availableHitLocations: this.item.availableHitLocations,
      cyberModuleAvailibilityLabels: this.item.cyberModuleAvailibilityLabels
    }
  }
}
