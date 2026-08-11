# ⚕️ AETHER — Healthcare Navigation Platform

> **Informational Prototype Notice**: Developed strictly for educational, research, and technical demonstration purposes. Not a certified medical device.

AETHER is an AI-powered, zero-cost open-source healthcare navigation platform combining **OpenStreetMap emergency hospital discovery**, **Google AI Studio Gemini 1.5 Flash symptom triage**, **medical report OCR metric extraction**, and **prescription dose tracking**.

---

## 🚀 Quick Start with Docker (Recommended)

Run the entire application stack (Next.js 14 web app + PostgreSQL database container) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/your-username/aether-health.git
cd aether-health/aether-app

# 2. Build and launch Docker containers
docker-compose up --build
```

The application will be live at `http://localhost:3000`.

To push database schema to the PostgreSQL container:
```bash
docker exec -it aether-app npx prisma db push
```

---

## 🛠️ GitHub Setup & Hosting Guide

Follow these steps to host AETHER on your GitHub account:

### 1. Initialize Git Repository
```bash
cd aether-app
git init
git add .
git commit -m "feat: initial commit of AETHER healthcare platform"
```

### 2. Create GitHub Repository & Push Code
1. Go to [GitHub New Repository](https://github.com/new).
2. Name your repository `aether-health` (Public or Private).
3. Connect your local repository and push:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aether-health.git
git push -u origin main
```

---

## 📦 Local Manual Development

If running without Docker:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Start Next.js Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Production

### Option A: Vercel (1-Click Hosting)
1. Import your `aether-health` GitHub repository on [Vercel](https://vercel.com).
2. Add your environment variables (`GEMINI_API_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_ORS_KEY`).
3. Click **Deploy**.

### Option B: Docker Container Deployment (Render / Railway / AWS / DigitalOcean)
Use the included `Dockerfile` and `docker-compose.yml` to deploy on any cloud provider supporting Docker containers.

---

## 🔒 Environment Variables Reference

Create a `.env.local` file with the following keys:

```env
# Google AI Studio (Gemini 1.5 Flash)
GEMINI_API_KEY="your_gemini_api_key"

# Firebase Client Authentication
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"

# OpenRouteService (Directions & Routing)
NEXT_PUBLIC_ORS_KEY="your_openrouteservice_key"

# Supabase / PostgreSQL Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
DATABASE_URL="postgresql://user:password@localhost:5432/aether?schema=public"
```
