// Cross-platform script to run both backend and frontend
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('🚀 Starting AquaMap Development Servers...\n');

// Check if backend venv exists
const venvPath = path.join(backendDir, isWindows ? 'venv\\Scripts\\python.exe' : 'venv/bin/python');
if (!fs.existsSync(venvPath)) {
  console.log('⚠️  Backend virtual environment not found.');
  console.log('   Please run: cd backend && python -m venv venv && pip install -r requirements.txt\n');
  process.exit(1);
}

// Start backend
console.log('🔧 Starting backend server...');
const backendCommand = isWindows 
  ? path.join(backendDir, 'venv\\Scripts\\python.exe')
  : path.join(backendDir, 'venv/bin/python');
const backendArgs = [path.join(backendDir, 'main.py')];

const backend = spawn(backendCommand, backendArgs, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWindows,
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

// Start frontend
console.log('⚛️  Starting frontend server...\n');
const frontend = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: isWindows,
});

frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ Servers started!');
console.log('   Backend:  http://localhost:8000');
console.log('   Frontend: http://localhost:3000');
console.log('\n   Press Ctrl+C to stop both servers\n');
