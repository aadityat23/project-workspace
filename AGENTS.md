<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Entry flow: EntryGate (src/components/app/EntryGate.tsx) shows the splash, checks the session from src/lib/auth.ts, then routes to /login or the workspace — swap auth.ts for real auth without touching screens or mock data.
- Uploads and processing states go through uploadFiles/retryProcessing in src/lib/api.ts (Uploading → Processing → Ready/Failed) so a real processing service can drive the same UI.
- Actions not yet backed by a service call notify.prototype (src/lib/notify.ts) so they are clearly marked, never silently dead.
- Mobile client lives under /m (src/routes/m, src/components/mobile) with its own shell and entry gate, sharing src/lib/auth.ts and src/lib/api.ts — two clients of one future API.
