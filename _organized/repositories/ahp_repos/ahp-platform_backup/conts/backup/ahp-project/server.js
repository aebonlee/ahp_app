// Redirect script for Render.com deployment
// This file exists because Render.com is ignoring render.yaml
// and defaulting to 'node server.js'

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Render.com이 render.yaml을 무시하고 있습니다.');
console.log('📂 백엔드 디렉토리로 리디렉션 중...');

// Change to backend directory
process.chdir(path.join(__dirname, 'backend'));

// Always install dependencies first to ensure all modules are available
console.log('📦 의존성 설치 중...');
const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit'
});

installProcess.on('close', (installCode) => {
    if (installCode !== 0) {
        console.log('❌ 의존성 설치 실패:', installCode);
        process.exit(1);
    }
    
    console.log('✅ 의존성 설치 완료.');
    
    // Check if dist directory exists
    if (!fs.existsSync('dist')) {
        console.log('❌ dist 디렉토리가 없습니다. 빌드를 실행합니다.');
        
        // Run build
        const buildProcess = spawn('npm', ['run', 'build'], {
            stdio: 'inherit'
        });
        
        buildProcess.on('close', (buildCode) => {
            if (buildCode === 0) {
                console.log('✅ 빌드 완료. 서버를 시작합니다.');
                startServer();
            } else {
                console.log('❌ 빌드 실패:', buildCode);
                process.exit(1);
            }
        });
    } else {
        console.log('📁 기존 빌드 파일 발견. 서버를 시작합니다.');
        startServer();
    }
});

function startServer() {
    console.log('🚀 백엔드 서버 시작 중...');
    const serverProcess = spawn('node', ['dist/index.js'], {
        stdio: 'inherit'
    });
    
    serverProcess.on('close', (code) => {
        console.log(`서버가 종료되었습니다. 코드: ${code}`);
        process.exit(code);
    });
}