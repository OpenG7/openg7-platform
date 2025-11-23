**Languages:** [English](#english) | [Français](#francais)

<a id="english"></a>
# OpenG7

Open-source platform to explore and analyze **interprovincial economic flows** (Angular front-end + Strapi CMS).  
This monorepo contains the front-end app, the CMS, and the API contracts.

## Getting Started

1. Install dependencies: `yarn install`
2. Start Strapi: `yarn dev:cms` (local API on http://localhost:1337)
3. Start the Angular front-end: `yarn dev:web` (UI on http://localhost:4200)
4. Need a Strapi admin account? Set `STRAPI_ADMIN_EMAIL` / `STRAPI_ADMIN_PASSWORD` in your local `.env`, then create it from the admin screen.

> On Windows, `Run-Installer-pwsh.cmd` executes `install-dev-basics_robuste.ps1` to prepare the environment (PowerShell 5 in administrator mode, install/validation of Node.js LTS, Yarn, Git, UTF-8 encoding), then offers a menu to launch the main `yarn` commands.

Detailed guides live in `docs/`:
- `docs/getting-started.md`: quick onboarding and useful scripts  
- `docs/frontend/`: Angular signal-first architecture, `[data-og7]` selectors  
- `docs/strapi/`: CMS conventions and idempotent seeds  
- `docs/first-contribution.md`: checklist for your first PR  
- `docs/roadmap.md`: public roadmap and priorities  

## Contributing

Read `CONTRIBUTING.md` to understand the development flow, the checks to run before opening a PR, and the secrets management policy.  
The `CODE_OF_CONDUCT.md` applies to all community spaces.  
A “first contribution” guide is available in `docs/first-contribution.md`.

### Public Channels & Support

- **GitHub Issues**: bugs, feature requests, docs (templates provided, `needs-triage` label by default).  
- **GitHub Discussions**: general questions or exploratory ideas.  
- **Support & governance**: see `SUPPORT.md` for response times, escalation paths, and the decisio
