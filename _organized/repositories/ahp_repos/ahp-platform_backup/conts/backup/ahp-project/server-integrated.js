const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// 백엔드 서버 프로세스 시작
console.log('🚀 백엔드 서버 시작 중...');
const backendProcess = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  env: { ...process.env, PORT: 5000 }
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[Backend] ${data}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data}`);
});

// 프론트엔드 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'build')));

// API 요청은 백엔드로 프록시
app.use('/api', (req, res) => {
  const apiUrl = `http://localhost:5000${req.originalUrl}`;
  res.redirect(apiUrl);
});

// SPA 라우팅 지원
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ 통합 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`   - 프론트엔드: http://localhost:${PORT}`);
  console.log(`   - 백엔드 API: http://localhost:5000`);
});

// 프로세스 종료 시 백엔드도 종료
process.on('SIGINT', () => {
  console.log('🛑 서버 종료 중...');
  backendProcess.kill();
  process.exit();
});