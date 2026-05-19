# MM05 — Agent & project rules

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind, Radix UI, Framer Motion, Zustand, React Router
- **Backend:** Express 5, Prisma, PostgreSQL (`backend/`)
- **Deploy:** Vercel (frontend) — see `DEPLOY.md`

This is **not** Next.js. Do not use Next.js APIs unless migrating.

## Agency agents (`.kiro/skills/`)

Specialized agents from [agency-agents](https://github.com/msitarzewski/agency-agents) are available as Kiro/Cursor skills. **Read the matching skill file before acting in that role.**

| Task | Skill file |
|------|------------|
| React UI, performance, a11y | `.kiro/skills/engineering-frontend-developer.md` |
| API, auth, Prisma | `.kiro/skills/engineering-backend-architect.md` |
| Security review | `.kiro/skills/engineering-security-engineer.md` |
| Full pipeline (spec → ship) | `.kiro/skills/agents-orchestrator.md` |
| SEO / meta | `.kiro/skills/marketing-seo-specialist.md` |
| UX / flows | `.kiro/skills/design-ux-researcher.md` |
| UI polish | `.kiro/skills/design-ui-designer.md` |
| Pre-release QA | `.kiro/skills/testing-reality-checker.md` |
| Lighthouse / perf | `.kiro/skills/testing-performance-benchmarker.md` |
| a11y audit | `.kiro/skills/testing-accessibility-auditor.md` |
| DevOps / CI | `.kiro/skills/engineering-devops-automator.md` |

Orchestration: for large changes, follow `agents-orchestrator` phases (plan → implement → QA).

## Performance & Safari (mandatory)

- No Lovable branding or assets.
- Hero/LCP images: `loading="eager"`, `fetchPriority="high"`, fixed `aspect-ratio`, no opacity fade on priority images.
- Avoid `backdrop-filter` on fixed/sticky nav and scroll overlays (use solid/semi-opaque backgrounds).
- No `background-attachment: fixed`.
- Prefer opacity-only transitions; avoid transform-heavy scroll animations.
- Minimize `will-change` (hero/banner only).
- Target CLS ≈ 0: always set `width`/`height` or `aspect-ratio` on images.

## Code hygiene

- One product configurator path: `ProductConfiguratorV2` + `ProductConfiguratorCollapsible` on `ProductPage`.
- Do not add root-level session/summary markdown files; update `README.md` or `DEPLOY.md` instead.
- Keep `.kiro/skills/` — do not delete agent definitions.
