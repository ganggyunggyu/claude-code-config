# AGENT

## Project Overview

- Claude Code configuration workspace with guidelines and command definitions
- Custom command specs in `commands/`
- Auto-loaded rules in `rules/`

## Core Workflow

- Do not start servers unless explicitly requested
- Keep comments minimal and task-relevant only

## Frontend (TypeScript + React/Vue/NestJS)

- FSD architecture: `src/app`, `pages`, `widgets`, `features`, `entities`, `shared`, `assets`
- Absolute imports only (`@/shared`, `@/entities`)
- `className` must use `cn(...)`, `React.Fragment` required (no shorthand)
- Tailwind CSS v4
- Axios for HTTP (never `fetch`)
- TanStack Query required for server state
- React/Next.js → Jotai | Vue/Nuxt → Pinia
- Barrel exports (`index.ts`) in all module folders
- Destructuring and arrow functions required

## Python (3.8+)

- FastAPI with layered architecture: routers → services → repositories
- Absolute imports, type hints on every function
- Pydantic models for all data structures
- Naming: `snake_case` (vars/functions), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants)
- Service/repository layers, centralized exceptions

## Reference

- Rules (auto-loaded): `rules/*.md`, `rules/libraries/*.md`
- Commands: `commands/*.md`
