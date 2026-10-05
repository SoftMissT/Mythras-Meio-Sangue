export class SheetPostRender {
  private sheetElement: HTMLElement

  constructor(sheetElement: HTMLElement) {
    this.sheetElement = sheetElement
  }

  public postRender() {
    this.applyStatStyles()
  }

  private applyStatStyles() {
    this.sheetElement.querySelectorAll<HTMLInputElement>('.modifier').forEach((modifier) => {
      const statToModify = modifier
        .closest('[data-stat]')
        ?.querySelectorAll<HTMLElement>('.modifiable')
      const value = Number(modifier.value)
      if (value > 0) {
        modifier.classList.remove('decreased')
        modifier.classList.add('increased')
        statToModify?.forEach((el) => {
          el.classList.remove('decreased')
          el.classList.add('increased')
        })
      } else if (value < 0) {
        modifier.classList.remove('increased')
        modifier.classList.add('decreased')
        statToModify?.forEach((el) => {
          el.classList.remove('increased')
          el.classList.add('decreased')
        })
      } else {
        modifier.classList.remove('decreased', 'increased')
        statToModify?.forEach((el) => el.classList.remove('decreased', 'increased'))
      }
    })
  }
}
