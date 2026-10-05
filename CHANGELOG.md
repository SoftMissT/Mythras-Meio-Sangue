# Changelog

## 3.0.0 (2026-10-05)

### Breaking

- Compatibilidade: `minimum: 13.350`, `verified: 14`, `maximum: 14` (antes: 11/13).
- Requer Foundry VTT v14 para Application V2 / DialogV2.

### Added

- Migração completa para Application V2: `ActorSheet`, `ItemSheet`, `EncounterGenerator` com `HandlebarsApplicationMixin`, `PARTS` e `foundry.applications.api.DialogV2`.
- Tipagens `DialogV2` (`types/foundry/client-esm/applications/api/dialog-v2.d.ts`).
- Camada base do redesign POWER-design: tokens de cor/foco, botões, tab navigator e sheet header (`_colors.scss`, `_buttons.scss`, `_sheet-tab-navigator.scss`, `_sheet-header.scss`).
- `readme` no `system.json`; `LICENSE` e `README.md` agora entram no pacote de build (CopyPlugin).

### Changed

- jQuery → DOM nativo em sheets, dialogs e hooks (`HTMLElement` no V14).
- `system.json`: título/descrição/autor do fork PT-BR, URLs do GitHub (antes GitLab), `grid` como objeto, `license: LICENSE` (arquivo real).
- Logo do Mythras Gateway no README: link externo com 404 → asset local `static/assets/sheet/mythras-gateway-logo-white.jpg`.

### Removed

- Código morto: `actor/data.ts`, `actor/sheet/base.ts`, `active-effect.ts`, `macros/encounterGenerator.js`, atributos `data-handler` das templates.
- `primaryTokenAttribute`/`secondaryTokenAttribute` apontando para campos inexistentes (`health`/`power`).
- `scripts: []` vazio do manifesto.
