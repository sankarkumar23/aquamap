# Running the Application

There are multiple ways to run both the backend and frontend servers simultaneously:

## Option 1: Node.js Script (Recommended - Cross-platform)

```bash
npm run dev
```

This uses `run-dev.js` which works on Windows, macOS, and Linux.

## Option 2: Concurrently (Alternative)

```bash
npm run dev:concurrent
```

This uses the `concurrently` package to run both servers in the same terminal with colored output.

## Option 3: PowerShell Script (Windows)

```powershell
.\run-dev.ps1
```

Opens separate PowerShell windows for backend and frontend.

## Option 4: Batch File (Windows)

```cmd
run-dev.bat
```

Opens separate command prompt windows for backend and frontend.

## Manual Start

You can also start them manually in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## URLs

- Backend API: http://localhost:8000
- Frontend App: http://localhost:3000
- API Docs: http://localhost:8000/docs
