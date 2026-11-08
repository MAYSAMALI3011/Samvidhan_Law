# Samvidhan frontend

Premium Indian LegalTech + EdTech frontend (React, Vite, TypeScript).

This milestone is **frontend only**. An abstraction layer in `src/api/` manages typed communication with runtime Zod validation and a mock/live switch (`VITE_USE_MOCKS`).

## Backend API Specification
The full backend API contract, authentication specifications, CSRF requirements, server-authoritative gamification rules, and SSE event streaming definitions are documented in:
- [API Contract & Specification](../../docs/API_CONTRACT.md)

## Run

```bash
cd Frontend/my-react-app
npm install
npm run dev
```

Production build:

```bash
npm run lint
npm run build
npm run preview
```

## Brand assets

`public/assets/brand/` contains reconstructed approximations of Concept A (primary constitutional mark) and Concept B (geometric book icon). They are not original vector exports from the presentation board.

## Theme

Light is the default. Dark is a full token set. Preference is stored in `localStorage` key `samvidhan-theme`.
