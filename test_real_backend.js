/**
 * Real GitHub Backend Connection Test
 * 실제 배포된 ahp-django-service 백엔드 테스트
 */

const API_BASE_URL = 'https://ahp-django-service.onrender.com';

async function testRealBackend() {
    console.log('🔍 Real AHP Django Service Backend Test');
    console.log('=========================================');
    console.log(`Backend URL: ${API_BASE_URL}`);
    
    const tests = [
        {
            name: 'Health Check',
            url: `${API_BASE_URL}/health/`,
            description: '백엔드 서버 상태 확인'
        },
        {
            name: 'API Root',
            url: `${API_BASE_URL}/api/`,
            description: 'API 엔드포인트 목록'
        },
        {
            name: 'API v1 Root',
            url: `${API_BASE_URL}/api/v1/`,
            description: 'v1 API 엔드포인트'
        },
        {
            name: 'Projects List',
            url: `${API_BASE_URL}/api/v1/projects/`,
            description: '프로젝트 목록 API'
        },
        {
            name: 'Criteria API',
            url: `${API_BASE_URL}/api/v1/criteria/`,
            description: '기준 목록 API'
        },
        {
            name: 'Templates API',
            url: `${API_BASE_URL}/api/v1/templates/`,
            description: '템플릿 API'
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n📋 ${test.name}`);
            console.log(`   ${test.description}`);
            console.log(`   URL: ${test.url}`);
            
            const response = await fetch(test.url);
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                try {
                    const data = await response.json();
                    console.log(`   ✅ Response: JSON (${Object.keys(data).length} keys)`);
                    
                    // 특별한 정보 표시
                    if (test.name === 'Projects List' && data.results) {
                        console.log(`   📊 Projects Found: ${data.results.length}`);
                        if (data.results.length > 0) {
                            console.log(`   📋 Sample Project: "${data.results[0].title}"`);
                        }
                    }
                    
                    if (test.name === 'API Root' || test.name === 'API v1 Root') {
                        console.log(`   📊 Available endpoints:`, Object.keys(data.endpoints || data).slice(0, 3).join(', '));
                    }
                    
                } catch (jsonError) {
                    const text = await response.text();
                    console.log(`   ✅ Response: Text (${text.length} chars)`);
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Network Error: ${error.message}`);
        }
    }
}

// Test project creation with real backend
async function testRealProjectCreation() {
    console.log('\n🚀 Testing Project Creation on Real Backend...');
    
    const projectData = {
        title: 'Frontend Integration Test Project',
        description: 'React 프론트엔드에서 실제 백엔드 연동 테스트',
        objective: 'GitHub ahp-django-service 백엔드와의 CRUD 연동 확인',
        status: 'draft',
        evaluation_mode: 'practical',
        workflow_stage: 'creating'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Project Created Successfully!`);
            console.log(`   ID: ${data.id}`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Status: ${data.status}`);
            return data.id;
        } else {
            const errorData = await response.json();
            console.log(`❌ Project Creation Failed: ${response.status}`);
            console.log('Error Details:', errorData);
            return null;
        }
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
        return null;
    }
}

// Test criteria creation with real backend
async function testRealCriteriaCreation(projectId) {
    if (!projectId) {
        console.log('⏭️ Skipping criteria test - no project ID');
        return;
    }
    
    console.log('\n📋 Testing Criteria Creation on Real Backend...');
    
    const criteriaData = {
        project: projectId,
        name: 'Frontend Test Criteria',
        description: '프론트엔드 연동 테스트용 기준',
        type: 'criteria',
        level: 1,
        order: 1
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/criteria/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(criteriaData)
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Criteria Created Successfully!`);
            console.log(`   ID: ${data.id}`);
            console.log(`   Name: ${data.name}`);
            console.log(`   Project: ${data.project}`);
        } else {
            const errorData = await response.json();
            console.log(`❌ Criteria Creation Failed: ${response.status}`);
            console.log('Error Details:', errorData);
        }
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
    }
}

// Run all tests
async function runRealBackendTest() {
    await testRealBackend();
    const projectId = await testRealProjectCreation();
    await testRealCriteriaCreation(projectId);
    
    console.log('\n🎯 Real Backend Test Complete');
    console.log('=============================');
    console.log('');
    console.log('프론트엔드 설정 상태:');
    console.log(`- API Base URL: ${API_BASE_URL}`);
    console.log('- Projects API: /api/v1/projects/');
    console.log('- Criteria API: /api/v1/criteria/');
    console.log('');
    console.log('다음 단계: 프론트엔드에서 실제 기능 테스트');
}

// Run the test
runRealBackendTest();