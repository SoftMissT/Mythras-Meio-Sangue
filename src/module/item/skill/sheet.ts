import { ItemSheetBase } from '@item/ItemSheetBase'
import { SkillMythras } from '.'

export class SkillSheetMythras extends ItemSheetBase<SkillMythras> {
  protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
    const sheetData: any = await super._prepareContext(options)
    return {
      ...sheetData,
      encPenalty: (this.item as any).encPenalty,
      totalVal: (this.item as any).totalVal,
      characteristicsLabels: [
        { value: 'str', label: 'MYTHRAS.Strength' },
        { value: 'con', label: 'MYTHRAS.Constitution' },
        { value: 'siz', label: 'MYTHRAS.Size' },
        { value: 'dex', label: 'MYTHRAS.Dexterity' },
        { value: 'int', label: 'MYTHRAS.Intelligence' },
        { value: 'pow', label: 'MYTHRAS.Power' },
        { value: 'cha', label: 'MYTHRAS.Charisma' }
      ],
      magicSkillTypeLabels: [
        { value: 'FM', label: 'MYTHRAS.Folk_Magic' },
        { value: 'TR', label: 'MYTHRAS.Trance' },
        { value: 'BI', label: 'MYTHRAS.Binding' },
        { value: 'ME', label: 'MYTHRAS.Meditation' },
        { value: 'MY', label: 'MYTHRAS.Mysticism' },
        { value: 'IN', label: 'MYTHRAS.Invocation' },
        { value: 'SH', label: 'MYTHRAS.Shaping' },
        { value: 'DE', label: 'MYTHRAS.Devotion' },
        { value: 'EX', label: 'MYTHRAS.Exhort' }
      ]
    }
  }
}
