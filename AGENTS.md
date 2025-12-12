# AGENTS.md

This repository is a full‑stack monorepo using **FastAPI (backend)** and **Nuxt 4 (frontend)**.

## Repository layout
- `backend/`: FastAPI application.
- `frontend/`: Nuxt 4 application.
- `docs/`: Architecture and workflow documentation.
- `.claude/`: Project‑specific rules referenced below.

## General coding rules
1. Prefer editing existing files over creating new ones.
2. Do not create new documentation files (`*.md`) unless explicitly requested.
3. Follow the local style and conventions of adjacent files.
4. Keep solutions simple (KISS); avoid unnecessary abstractions.

## Backend rules
- Backend conventions live in `.claude/backend-rules.md` and `backend/CONTRIBUTING.md`.
- Use `uv` for dependency management and Alembic for migrations.
- Keep modules domain‑oriented (`auth/`, `rbac/`, `users/`, etc.) with standard files (`router.py`, `schemas.py`, `models.py`, `service.py`, `dependencies.py`).

## Frontend rules
- Frontend conventions live in `.claude/frontend-rules.md` and `frontend/CONTRIBUTING.md`.
- Use Nuxt 4 `app/` directory plus Nuxt Layers (`frontend/layers/*`) for DDD.
- When adding a new business layer, register it in `frontend/nuxt.config.ts` `extends`.

## Workflow rules
- Development workflow conventions live in `.claude/workflow-rules.md` and `docs/WORKFLOW.md`.
- Root `pnpm` scripts are the source of truth for dev/prod orchestration.

## Validation (before finalizing)
Suggest or run these checks after code changes:

### Backend
- `pnpm be:lint`
- `pnpm be:test`

### Frontend
- `pnpm fe:typecheck`
- `pnpm fe:lint`

