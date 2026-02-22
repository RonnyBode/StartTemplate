# Product Requirements Document

## Vision
Eine persönliche Web-App, mit der Einzelpersonen ihre Projekte und Aufgaben effizient verwalten können. Nutzer erstellen Projekte als Container, befüllen sie mit Aufgaben, und behalten den Überblick über ihren Fortschritt via Dashboard und Listen-Ansichten.

## Target Users
**Primäre Zielgruppe:** Einzelpersonen (Solo-Nutzer)
- Entwickler, Freelancer und Studierende, die ihre persönlichen Projekte strukturieren möchten
- Nutzer, die einfache To-Do-Apps zu unflexibel, aber komplexe PM-Tools wie Jira zu überladen finden
- Pain Points: fehlende Projektstruktur, unklare Prioritäten, verlorene Aufgaben

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | User Authentication (Register, Login, Profil) | Planned |
| P0 (MVP) | Project Management (CRUD für Projekte) | Planned |
| P0 (MVP) | Task Management (CRUD, Status-Workflow) | Planned |
| P1 | Dashboard & Overview (Statistiken, Übersicht) | Planned |

## Success Metrics
- Nutzer kann sich registrieren und einloggen
- Nutzer kann mindestens 3 Projekte erstellen und verwalten
- Aufgaben können erstellt, bearbeitet und auf "Done" gesetzt werden
- Dashboard zeigt korrekte Statistiken (Aufgaben pro Status)

## Constraints
- Solo-Entwickler (eine Person)
- Hobby-Projekt ohne feste Deadline
- Tech-Stack: Next.js 16, Supabase, Tailwind CSS, shadcn/ui
- Kostenlos bleiben (Supabase Free Tier, Vercel Hobby)

## Non-Goals
- Keine Team-Kollaboration oder Multi-User-Features
- Keine Datei-Anhänge oder Uploads
- Keine E-Mail-Benachrichtigungen
- Keine native Mobile App (iOS/Android)
- Kein Kanban-Board (nur Listen-Ansicht + Dashboard)

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
