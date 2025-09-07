// Render용 백엔드 서버 시작 스크립트
// 실제 백엔드 서버를 시작합니다.

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AHP Backend Server...');

// backend 폴더의 서버 시작
const backendPath = path.join(__dirname, '..', 'backend');
const serverProcess = spawn('node', ['dist/index.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// 정상 종료 처리
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});