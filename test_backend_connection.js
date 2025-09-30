/**
 * Backend Connection Test Script
 * Django 백엔드와 PostgreSQL 연동 테스트
 */

const API_BASE_URL = 'http://localhost:8000';

async function testBackendConnection() {
    console.log('🔍 AHP Backend Connection Test');
    console.log('================================');
    
    const tests = [
        {
            name: 'Health Check',
            url: `${API_BASE_URL}/health/`,
            description: '백엔드 서버 상태 확인'
        },
        {
            name: 'Database Status',
            url: `${API_BASE_URL}/db-status/`,
            description: 'PostgreSQL 데이터베이스 연결 상태'
        },
        {
            name: 'API Root',
            url: `${API_BASE_URL}/api/`,
            description: 'API 엔드포인트 목록'
        },
        {
            name: 'Service API Root',
            url: `${API_BASE_URL}/api/service/`,
            description: '프론트엔드용 API 엔드포인트'
        },
        {
            name: 'Projects List',
            url: `${API_BASE_URL}/api/service/projects/projects/`,
            description: '프로젝트 목록 API'
        },
        {
            name: 'Criteria List',
            url: `${API_BASE_URL}/api/service/projects/criteria/`,
            description: '기준 목록 API'
        },
        {
            name: 'Test Projects Access',
            url: `${API_BASE_URL}/test-projects/`,
            description: '인증 없이 프로젝트 접근 테스트'
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n📋 ${test.name}`);
            console.log(`   ${test.description}`);
            console.log(`   URL: ${test.url}`);
            
            const response = await fetch(test.url);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
                
                // 특별한 정보 표시
                if (test.name === 'Database Status' && data.connection) {
                    console.log(`   📊 DB Connection: ${data.connection}`);
                    console.log(`   📊 DB Engine: ${data.database_engine}`);
                    console.log(`   📊 Tables: ${data.tables_count || 'unknown'} tables`);
                    if (data.tables && data.tables.length > 0) {
                        console.log(`   📊 Key Tables: ${data.tables.filter(t => t.includes('project') || t.includes('criteria')).join(', ')}`);
                    }
                }
                
                if (test.name === 'Projects List' && data.results) {
                    console.log(`   📊 Projects Found: ${data.results.length}`);
                }
                
                if (test.name === 'Test Projects Access') {
                    console.log(`   📊 Test Status: ${data.status}`);
                    if (data.project_count !== undefined) {
                        console.log(`   📊 Project Count: ${data.project_count}`);
                    }
                }
                
            } else {
                console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
                console.log(`   Error: ${data.error || data.message || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Connection Error: ${error.message}`);
            if (error.message.includes('fetch')) {
                console.log(`   💡 Hint: Django 서버가 실행 중인지 확인하세요 (python manage.py runserver)`);
            }
        }
    }
    
    console.log('\n🎯 Connection Test Complete');
    console.log('================================');
    console.log('');
    console.log('다음 단계:');
    console.log('1. 모든 테스트가 성공하면 프론트엔드에서 기준 추가 시도');
    console.log('2. 실패한 테스트가 있으면 Django 서버 설정 확인');
    console.log('3. 데이터베이스 연결 실패 시 .env 파일의 DATABASE_URL 확인');
}

// Test project creation
async function testProjectCreation() {
    console.log('\n🚀 Testing Project Creation...');
    
    const projectData = {
        title: 'Test Project via API',
        description: 'API 연동 테스트를 위한 프로젝트',
        objective: 'PostgreSQL 연동 및 CRUD 테스트',
        status: 'draft',
        evaluation_mode: 'practical',
        workflow_stage: 'creating'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Project Created: ${data.title} (ID: ${data.id})`);
            return data.id;
        } else {
            console.log(`❌ Project Creation Failed: ${response.status}`);
            console.log('Error:', data);
            return null;
        }
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
        return null;
    }
}

// Test criteria creation
async function testCriteriaCreation(projectId) {
    if (!projectId) {
        console.log('⏭️ Skipping criteria test - no project ID');
        return;
    }
    
    console.log('\n📋 Testing Criteria Creation...');
    
    const criteriaData = {
        project_id: projectId,
        name: 'Test Criteria',
        description: 'API 테스트용 기준',
        type: 'criteria',
        level: 1,
        order: 1
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(criteriaData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Criteria Created: ${data.name} (ID: ${data.id})`);
        } else {
            console.log(`❌ Criteria Creation Failed: ${response.status}`);
            console.log('Error:', data);
        }
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
    }
}

// Run all tests
async function runFullTest() {
    await testBackendConnection();
    const projectId = await testProjectCreation();
    await testCriteriaCreation(projectId);
}

// Run the test
runFullTest();