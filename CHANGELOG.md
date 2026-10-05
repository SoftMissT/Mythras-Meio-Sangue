# Changelog

## 3.0.0 (2026-10-05)

### Breaking

- Compatibilidade: `minimum: 13.350`, `verified: 14`, `maximum: 14` (antes: 11/13).
- Requer Foundry VTT v14 para Application V2 / DialogV2.

### Added

- Migração completa para Application V2: `ActorSheet`, `ItemSheet`, `EncounterGenerator` com `HandlebarsApplicationMixin`, `PARTS` e `foundry.applications.api.DialogV2`.
- Tipagens `DialogV2` (`types/foundry/client-esm/applications/api/dialog-v2.d.ts`).
- Camada base do redesign POWER-design: tokens de cor/foco, botões, tab navigator e sheet header (`_colors.scss`, `_buttons.scss`, `_sheet-tab-navigator.scss`, `_sheet-header.scss`).
- Passo 8b: anel de foco visível (`$sheet-focus-ring`) em inputs, selects e filtros das fichas de actor/item e dialog de rolagem (antes: `box-shadow: none` sem indicador de teclado).
- `readme` no `system.json`; `LICENSE` e `README.md` agora entram no pacote de build (CopyPlugin).
- README: banner SVG (`static/assets/banner-meio-sangue.svg`), badges de versão/Foundry/licença/idioma, links quebrados `mythras/*` corrigidos para a raiz e copy reescrita.

### Fixed

- Hooks `renderChatMessage` migrados para `renderChatMessageHTML` (V14 passa `HTMLElement` no hook novo; antes: `html.querySelectorAll is not a function` em todo render de chat).
- `TextEditor.enrichHTML` → `foundry.applications.ux.TextEditor.implementation.enrichHTML` (elimina deprecation warning do global).
- Stub de tipos: namespace `foundry.applications.ux` (`types/foundry/client-esm/applications/ux/module.d.ts`).

### Changed

- jQuery → DOM nativo em sheets, dialogs e hooks (`HTMLElement` no V14).
- SCSS das fichas tokenizado: hover/zebrada de tabela e tinta de título agora usam `$sheet-row-hover`, `$sheet-row-alt` e `$sheet-ink`; link do sheet header usa `$sheet-focus` (valores inalterados, só nome).
- `system.json`: título/descrição/autor do fork PT-BR, URLs do GitHub (antes GitLab), `grid` como objeto, `license: LICENSE` (arquivo real).
- Logo do Mythras Gateway no README: link externo com 404 → asset local `static/assets/sheet/mythras-gateway-logo-white.jpg`.

### Removed

- Código morto: `actor/data.ts`, `actor/sheet/base.ts`, `active-effect.ts`, `macros/encounterGenerator.js`, atributos `data-handler` das templates.
- `primaryTokenAttribute`/`secondaryTokenAttribute` apontando para campos inexistentes (`health`/`power`).
- `scripts: []` vazio do manifesto.
