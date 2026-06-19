# CaseVault

CaseVault is a secure, immersive web platform designed for archiving and showcasing case competition slide decks from top universities and business schools worldwide. 

## 🚀 Tech Stack

This project is structured as a **monorepo** using `pnpm` workspaces.

- **Frontend (`apps/web`)**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion (for UI animations), and React Three Fiber (for WebGL background effects).
- **Backend (`apps/api`)**: Node.js, Express, better-sqlite3 (SQLite database), JWT authentication, Multer for file uploads.
- **Shared (`packages/types`)**: Shared TypeScript interfaces utilized by both frontend and backend.

## 📦 Project Structure

```
casevault/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── api/              # Express backend & SQLite DB
├── packages/
│   └── types/            # Shared TypeScript types
├── package.json          # Root workspace config
└── pnpm-workspace.yaml   # pnpm workspaces definition
```

## 🛠️ Installation & Setup

1. **Install dependencies:**
   Ensure you have `pnpm` installed. Run the following command from the project root:
   ```bash
   pnpm install
   ```

2. **Seed the Database (Optional but recommended for testing):**
   This will populate the SQLite database with 28 dummy slide decks across 7 categories and create a demo user account.
   ```bash
   pnpm --filter @casevault/api seed
   ```
   *Demo Account Credentials:*
   - **Email:** `demo@casevault.io`
   - **Password:** `password123`

3. **Run the Development Server:**
   The root `package.json` contains a `dev` script that concurrently starts both the frontend and the backend.
   ```bash
   pnpm run dev
   ```

   - The **Frontend** will be accessible at: `http://localhost:3000`
   - The **Backend API** will be running at: `http://localhost:4000`

## ✨ Features

- **Immersive UI**: Custom GLSL WebGL background shaders and fluid Framer Motion animations.
- **3D Tilt Cards**: Slide gallery features 3D hover effects with metallic sheen overlays.
- **Secure Authentication**: JWT-based auth with `httpOnly` refresh tokens and memory-resident access tokens.
- **Slide Uploads**: Authenticated users can upload PDF slide decks with metadata tagging.
- **Gallery Filtering**: Search, sort, and filter slides by category, year, and upload date.
