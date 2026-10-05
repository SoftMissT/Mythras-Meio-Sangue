import { CharacterSheetMythras } from '@actor/character/sheet'
import { ActorMythras } from './base'

export class ActorSheetClassRegistry {
  /**
   * If you want to offer alternative actor sheets, this would be the place to add them
   */
  static registerSheetClasses() {
    console.log(`Mythras | register actor sheet classes from registry`)
    Actors.unregisterSheet('core', ActorSheet)
    ActorSheetClassRegistry.doRegister(CharacterSheetMythras, ['character'], true)
    // ToDo create vehicle, starship actors?
  }

  private static doRegister(
    documentClass: ConstructorOf<
      ActorSheet<ActorMythras> | foundry.applications.api.DocumentSheetV2<Actor>
    >,
    types: string[],
    isDefault: boolean
  ) {
    // registerSheet accepts V2 sheets at runtime (v13+), but the vendored types only declare
    // the V1 signature because Actor["sheet"] is narrowed to ActorSheet. Single cast boundary.
    Actors.registerSheet(
      'mythras',
      documentClass as unknown as ConstructorOf<ActorSheet<ActorMythras>>,
      {
        types: types,
        makeDefault: isDefault
      }
    )
  }
}
