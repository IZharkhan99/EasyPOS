---
description: EasyPOS project details, Supabase config, and development rules
---

# EasyPOS Project Details

## Supabase
- **Project ID**: `nrhjiksfjnafnbxpmlnd`
- **Project Name**: EasyPOS
- **Region**: ap-northeast-1
- **Dashboard URL**: https://supabase.com/dashboard/project/nrhjiksfjnafnbxpmlnd
- **API URL**: `https://nrhjiksfjnafnbxpmlnd.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaGppa3Nmam5hZm5ieHBtbG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjE3MDYsImV4cCI6MjA5MDA5NzcwNn0.JwLzGPorKPYGDuTD4mbRFrxihDCkIMzLAmYcd5y9Aas`
- **Publishable Key**: `sb_publishable_cKHG5XgC8KmbiUA1Fh_2ZA_mOaSzVlP`
- **Database Host**: `db.nrhjiksfjnafnbxpmlnd.supabase.co`
- **PostgreSQL Version**: 17.6
- **Organization ID**: `oonfytkodpbryhdvpydd`

## Project Path
- `c:\Users\MyProjects\EasyPOS-React`

## Architecture
- **Online Mode**: React + Supabase (PostgreSQL)
- **Offline Mode**: React + Electron + SQLite (planned — Phase 5)
- **Multi-Tenant**: Single DB with `business_id` on all tables + RLS isolation
- **Pattern**: Data Access Layer (DAL) — abstract interface, swappable providers

## Strict Rules
1. **DO NOT change the existing UI** — only improve if necessary
2. **Keep all existing themes** (dark, light, ocean, violet, forest)
3. **Keep all existing page layouts, colors, and components**
4. **Keep Tailwind CSS + DM Sans font**
5. Backend changes must not break any frontend visuals

## Tech Stack
- React 18, Vite 5, Tailwind CSS 3, react-router-dom 6
- Chart.js 4, @supabase/supabase-js (to add)
- @tanstack/react-query (to add), zod (to add)

## Build Plan
See `task.md` in the artifacts directory for the full 6-phase, 89-task checklist.
