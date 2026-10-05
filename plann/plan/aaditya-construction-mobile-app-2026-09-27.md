# Aaditya Construction — Mobile App

The web app stays untouched. The mobile app is a second front end in the same project. It uses the same brand, fonts, icons, status and revision labels, and the same example data and service layer, so both can later connect to the same FastAPI backend.

## Where it lives

- The mobile app opens at `/m`. On a phone it fills the screen. On a desktop browser it is shown inside a centred phone-sized frame (390 × 844) on the grey background, so it can be reviewed next to the web app.
- It has its own splash, sign-in and session check, using the same sign-in module as the web app. Signing in on one signs in on both.
- No Lovable Cloud, no new backend.

## Navigation

- Bottom bar: Home, Projects, Files, Photos, Search. It stays at the bottom, with icons and labels at least 44px tall.
- A profile button at the top right opens More: My Profile, Team, Activity, Settings, Help & Support, Trash, Sign Out.
- AI is not in the bottom bar. It opens from "Ask this project" on a project and from "Ask about this document" in the file viewer.
- Screens use a back arrow, pop-up panels from the bottom (sheets) and full-screen viewers. No sidebars, no hamburger menu, no tables.

## Phase 1 — the four core workflows

1. **Sign in → Project → Documents → Folder → File viewer**
   - Project page: photo, name, location, type, status, counts (documents, drawings, photos), large links to Documents, Drawings and Photos, smaller links to Activity and Team, recent documents, recent photos, and "Ask this project".
   - Documents: search box, folder list with large rows and file counts, then recent files (icon, file name, revision, status, date).
   - Folder: a list of files, with Uploading, Processing, Ready and Failed (with Retry) states.
   - File viewer: full screen with Back, file name and a menu. The page area has page controls and zoom. A details panel slides up from the bottom (Revision, Discipline, Size, Uploaded, Status), with Download, Copy link, Open externally and "Ask about this document".
2. **Project → Photos → Take photo or choose from library → Upload**
   - Photos grouped by site-visit date in a two-across grid, opening a full-screen photo viewer you can swipe through.
   - A yellow "Take photo" button, plus "Choose from library". Both use the phone camera or photo library. Then pick Project, Site visit or date, and add a Caption, then Upload. Progress shows as Uploading, Processing, Ready.
3. **Project → Ask this project → Question → Answer → Source document**
   - "Ask about Aaditya Residency", a question box, four suggested questions, then Answer and a numbered, tappable Sources list that opens the file viewer at that page. The document version works the same way, with document-specific questions.
4. **Search → Document → File viewer**
   - A large search box, filter chips (All, Projects, Documents, Drawings, Photos), recent and suggested searches, and results grouped by type. Tapping a result opens the right screen.

## Phase 2 — the other screens, in the same style

- Home: a short greeting, active projects, recent documents, recent activity and a quick "Ask" entry. No statistics dashboard.
- Projects: small status filters you can scroll sideways, with larger project rows below.
- Files (all projects): recent files across projects, grouped by project.
- Drawings: Current/All toggle, discipline filter in a bottom panel, drawing number as the main label, and the yellow edge on current revisions.
- Activity: timeline grouped by Today, Yesterday and dates, with a project filter.
- Team: member list with a yellow Add Member button. Tap a member to see details in a bottom panel.
- More, Settings (Company, My Profile, Preferences, yellow Save Changes bar at the bottom), Help, Trash (Restore, and permanent delete that needs "DELETE" typed).
- Every list has loading, empty and error states that match the web app.

## Prototype limits (same as web)

- Camera and library upload, restore and trash only last until you reload. Download, Open externally, New Folder and Add Member show the "Prototype" note.

## Technical details

- Routes: `src/routes/m.tsx` (mobile shell: phone frame, gate, bottom bar, `<Outlet />`), `m.index.tsx`, `m.login.tsx`, `m.projects.index.tsx`, `m.projects.$projectId.index.tsx`, `.../documents.tsx`, `.../documents.$folderId.tsx`, `.../drawings.tsx`, `.../photos.tsx`, `.../ask.tsx`, `m.files.tsx`, `m.photos.tsx`, `m.capture.tsx`, `m.search.tsx`, `m.file.$fileId.tsx` (viewer + ask sheet), `m.activity.tsx`, `m.team.tsx`, `m.more.tsx`, `m.settings.tsx`, `m.help.tsx`, `m.trash.tsx`. Every route has its own head().
- Components in `src/components/mobile/` (MobileHeader, BottomNav, Sheet, ListRow, FileRow, ProjectRecord, StateBlock). They reuse Badges, notify, useDialogFocus, the design tokens, and `src/lib/api.ts` / `auth.ts` without changing them.
- Capture uses `<input type="file" accept="image/*" capture="environment">` and the existing `uploadFiles` states.
- AGENTS.md: add a rule that the mobile client lives under `/m` and shares the auth and api layers.
- QA: Playwright at 390×844 and 360×780 for all four workflows, with no sideways scrolling, and a check that no web screens changed.
