import { CreatureMythras } from '@actor'

export class CharacterMythras<
  TParent extends TokenDocument | null = TokenDocument | null
> extends CreatureMythras<TParent> {
  async _preCreate(data: any, options: any, user: any) {
    await super._preCreate(data, options, user)

    let initData = {
      'prototypeToken.actorLink': true
    }
    this.updateSource(initData)
  }
}
