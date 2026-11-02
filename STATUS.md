# Status: CareHearted-Route-Analyzer

Last updated: 2 Nov 2026 (from repo history; owner to confirm anything marked unknown)

## What this is
A fork of marshall-j/postcode-to-route. The original is a PHP Laravel web app that takes a list of postcodes, orders them closest first, and gives directions between each. In July 2025 a second app was added in the route-planner folder: a Next.js route planning and workforce tool. The top-level README is still the default Laravel one.

## Current state
**Dormant.** Last commit 5 Jul 2025: "Build route planning and workforce tool (#1)" (merged PR by Terry). Earlier history is from the original authors in April to May 2022.

## Recent activity
- 2025-07-05 - Merged PR #1: added the route-planner Next.js app (jobs, route optimisation, team recommendations, CSV and PDF export, demo mode)
- 2022-05-09 - Restyling, help page with instructions (original authors)
- 2022-05-06 - Distance calculation between coordinates added (original authors)
- 2022-05-04 - Route start point carried over from previous route; miles and minutes shown (original authors)
- 2022-05-01 - Added multiple destination inputs (original authors)
- 2022-04-30 - Added import of a list of locations (original authors)

## Open work
- Open PRs: none. Issues are disabled on this repo.
- Non-default branches (last commit date):
  - cursor/build-route-planning-and-workforce-tool-73dd - 2025-07-05 (demo mode; likely the source of merged PR #1)
  - cursor/analyze-code-for-tech-stack-transition-5643 - 2025-07-05 (tech stack analysis for an invoice application)
  - calculateRoutes - 2022-05-22
  - justTheBackup - 2022-05-13
  - working-version-dont-delete - 2022-05-09

## Stack and how to run
- Original app: PHP 8, Laravel 9, Vue (Laravel UI), Mix. Run with composer install, npm install, a .env from .env.example, then php artisan serve. Needs a Mapbox access token (key name mapbox_access_token in .env.example).
- route-planner app: Next.js 14, React, TypeScript, Tailwind, Supabase, Google Maps loader, OpenAI SDK. Run from the route-planner folder with npm install and npm run dev. See route-planner/README.md, DEMO_SETUP.md and LOCAL_REVIEW_GUIDE.md. Database schema is in route-planner/schema.sql.
- No deploy config found.

## Known gaps and next steps
- Top-level README does not describe either app.
- It is unclear whether the Laravel app or the Next.js app is the one to keep. Unknown - owner to confirm.
- Hosting: unknown.

## Owner

Terry Enigbonjaiye (terryeni).
