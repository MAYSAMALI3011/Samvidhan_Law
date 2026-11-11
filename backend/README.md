# Samvidhan Backend (FastAPI + Supabase + Free AI Fallback)

Welcome! This is the official backend for the Samvidhan legal education web platform. It is designed to run entirely on **100% free-tier services** without any credit card requirement.

---

## 1. Quick Setup Guide for Beginners

### Step 1: Create your free Supabase project
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a project name (e.g. `samvidhan-backend`), set a database password, and select region **South Asia (Mumbai) [ap-south-1]**.
3. Once the project is ready, click on **Project Settings** (gear icon) -> **API**.
4. You will see:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role / secret key** (Keep this private! Never share it or commit it).

### Step 2: Run Database Migrations in Supabase
1. In your Supabase project dashboard, open the **SQL Editor** from the left sidebar.
2. Click **New query**.
3. Open `backend/sql/001_schema.sql`, copy all text, paste it into the editor, and click **Run**.
4. Open `backend/sql/002_rls.sql`, copy all text, paste, and click **Run**. (This locks all tables with Row Level Security so only the backend server can access them).
5. Open `backend/sql/003_functions.sql`, copy all text, paste, and click **Run**. (This sets up automatic profile creation on signup).
6. Verify: Click **Table Editor** on the left menu. You should see `profiles`, `user_settings`, `user_progress`, `subscriptions`, `conversations`, `messages`, etc.

### Step 3: Configure your local `.env` file
1. In the `backend/` folder, copy `.env.example` to `.env`:
   - On Windows PowerShell: `Copy-Item .env.example .env`
   - On macOS/Linux: `cp .env.example .env`
2. Open `backend/.env` in any text editor and fill:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. (Optional) Add free AI keys:
   - **Gemini**: [aistudio.google.com](https://aistudio.google.com) -> Get API key -> paste in `GEMINI_API_KEY`.
   - **Groq**: [console.groq.com](https://console.groq.com) -> API Keys -> Create API key -> paste in `GROQ_API_KEY`.
   - *Note: If no AI keys are added, the chatbot will still work safely by returning the friendly busy message without failing.*

### Step 4: Run the Backend Locally
1. Open your terminal in the `backend/` folder.
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the local server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Open your browser to `http://localhost:8000/docs` to see the interactive Swagger API documentation.

### Step 5: Run the Test Suite
From the `backend/` folder:
```bash
pytest -v
```

---

## 2. Superadmin Bootstrap Command
To grant superadmin access to your personal account after signing up:
1. Open Supabase **SQL Editor**.
2. Run:
   ```sql
   UPDATE public.profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
   ```

---

## 3. Free Deployment on Render
1. Push this repository to GitHub.
2. Go to [render.com](https://render.com) and create a free account.
3. Click **New +** -> **Blueprint**, and connect your GitHub repository.
4. Render will read `backend/render.yaml` automatically.
5. In the Render Dashboard under **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Any AI keys you wish to use (`GEMINI_API_KEY`, etc.)
6. Free Render instances spin down after inactivity. To keep it warm, use a free service like [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://your-service.onrender.com/health` every 10 minutes.
