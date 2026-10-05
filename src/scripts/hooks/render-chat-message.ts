import { ActorMythras, ActorSheetBase } from '@actor'
import { SkillMythras } from '@module/item/skill'

export const RenderChatMessage = {
  listen: (): void => {
    Hooks.on('renderChatMessage', (_app, html: HTMLElement) => {
      const chatButtons = [...html.querySelectorAll('.apply-damage')]
      const chatMessage = chatButtons[chatButtons.length - 1] as HTMLElement | undefined
      const revealButton = html.querySelector('.revealDamage') as HTMLElement | null
      const damageElement = html.querySelector('.damageElement') as HTMLElement | null

      if (chatMessage) {
        chatMessage.style.backgroundColor = 'white'
        chatMessage.textContent = 'Apply Damage'
        if (!game.user.isGM) chatMessage.style.display = 'none'

        revealButton?.addEventListener('click', function revealDamage() {
          damageElement.style.cssText = `height: 100%;
                                         width: 100%;`
        })

        chatMessage.addEventListener('click', function applyDamage() {
          const targetTokenActor = (game.scenes.active as any).data.tokens.find(
            (i: any) => i.id == chatMessage.dataset.targetToken
          )

          if (game.user.isGM) {
            const hitLocation: any = targetTokenActor.actor.getEmbeddedDocument(
              'Item',
              chatMessage.dataset.hitLocationId
            )
            const totalArmor = Number(hitLocation.data.data.ap)
            const armorMitigatedDamage =
              Number(chatMessage.dataset.damage) > totalArmor
                ? Number(chatMessage.dataset.damage) - totalArmor
                : 0

            hitLocation.update({
              'data.currentHp': Number(hitLocation.data.data.currentHp) - armorMitigatedDamage
            })
            chatMessage.textContent = 'Damage Applied'
            chatMessage.style.backgroundColor = 'rgba(88, 88, 88, 0.705)'
            chatMessage.removeEventListener('click', applyDamage)
          }
        })
      }
    })

    Hooks.on('renderChatMessage', (_message: ChatMessage, html: HTMLElement) => {
      html.querySelector('.btn-contested-roll')?.addEventListener('click', async () => {
        // 1) Ensure there is exactly one controlled token
        const controlled = game.canvas.tokens.controlled
        if (controlled.length !== 1) {
          return ui.notifications.warn(game.i18n.localize('MYTHRAS.MSG_Must_have_token_selected'))
        }
        const actor = controlled[0].actor as ActorMythras
        const actorSheet = actor.sheet as unknown as ActorSheetBase<ActorMythras>

        const skill = actor.sortedSkills[0] as SkillMythras

        const attr = (name: string): string | undefined =>
          html.querySelector(`[data-${name}]`)?.getAttribute(`data-${name}`) ?? undefined
        const num = (name: string): number | undefined => {
          const value = attr(name)
          return value === undefined || value === '' ? undefined : Number(value)
        }

        const contestedActor = game.actors.get(attr('roll-actor-id') ?? '')
        const contestedSkill = contestedActor?.items.get(attr('roll-skill-id') ?? '')
        const contestedScore = num('roll-value')
        const contestedSuccess = attr('roll-result')
        const contestedRollDifficulty = num('roll-difficulty')
        const contestedAugmentation = attr('roll-augmentation')

        if (skill) {
          if (!contestedActor || !contestedSkill) {
            actorSheet.handleSkillRoll(skill)
          } else {
            actorSheet.handleSkillRoll(skill, {
              contestedSkill: contestedSkill as SkillMythras,
              contestedActor,
              contestedScore: contestedScore,
              contestedSuccess: contestedSuccess,
              contestedRollDifficulty: contestedRollDifficulty,
              contestedRollAugmentation: contestedAugmentation
            })
          }
        } else {
          return ui.notifications.warn(game.i18n.localize('MYTHRAS.MSG_No_selectable_skills_found'))
        }
      })
    })
  }
}
