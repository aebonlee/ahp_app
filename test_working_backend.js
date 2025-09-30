/**
 * Working Backend API Structure Test
 * 실제 작동하는 백엔드의 API 구조 파악
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testApiStructure() {
    console.log('🔍 Working Backend API Structure Test');
    console.log('====================================');
    console.log(`Backend URL: ${API_BASE_URL}`);
    
    // 1. API 루트 확인
    try {
        console.log('\n📋 API Root Structure:');
        const response = await fetch(`${API_BASE_URL}/api/`);
        const data = await response.json();
        
        console.log('Available endpoints:');
        if (data.endpoints) {
            Object.keys(data.endpoints).forEach(key => {
                console.log(`  - ${key}: ${JSON.stringify(data.endpoints[key])}`);
            });
        }
        
        if (data.service_endpoints) {
            console.log('\nService endpoints:');
            Object.keys(data.service_endpoints).forEach(key => {
                console.log(`  - ${key}: ${JSON.stringify(data.service_endpoints[key])}`);
            });
        }
    } catch (error) {
        console.log('❌ API Root Error:', error.message);
    }
    
    // 2. Projects API 테스트
    console.log('\n📋 Testing Projects API:');
    const projectEndpoints = [
        '/api/v1/projects/',
        '/api/service/projects/',
        '/api/service/projects/projects/'
    ];
    
    for (const endpoint of projectEndpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log(`${endpoint}: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.results) {
                    console.log(`  ✅ Found ${data.results.length} projects`);
                    if (data.results.length > 0) {
                        const project = data.results[0];
                        console.log(`  📋 Sample project fields:`, Object.keys(project).join(', '));
                        console.log(`  📋 Project has settings field:`, !!project.settings);
                    }
                } else if (Array.isArray(data)) {
                    console.log(`  ✅ Found ${data.length} projects (direct array)`);
                } else {
                    console.log(`  📊 Response keys:`, Object.keys(data).join(', '));
                }
            }
        } catch (error) {
            console.log(`${endpoint}: ❌ ${error.message}`);
        }
    }
    
    // 3. Criteria API 테스트
    console.log('\n📋 Testing Criteria API:');
    const criteriaEndpoints = [
        '/api/v1/criteria/',
        '/api/service/criteria/',
        '/api/service/projects/criteria/'
    ];
    
    for (const endpoint of criteriaEndpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log(`${endpoint}: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.results) {
                    console.log(`  ✅ Found ${data.results.length} criteria`);
                } else if (Array.isArray(data)) {
                    console.log(`  ✅ Found ${data.length} criteria (direct array)`);
                } else {
                    console.log(`  📊 Response keys:`, Object.keys(data).join(', '));
                }
            }
        } catch (error) {
            console.log(`${endpoint}: ❌ ${error.message}`);
        }
    }
    
    return;
}

// 프로젝트 생성 테스트
async function testProjectCreation() {
    console.log('\n🚀 Testing Project Creation:');
    
    const projectData = {
        title: 'API Structure Test Project',
        description: '백엔드 API 구조 파악을 위한 테스트 프로젝트',
        objective: '실제 데이터 구조 확인',
        status: 'draft'
    };
    
    const endpoints = [
        '/api/v1/projects/',
        '/api/service/projects/',
        '/api/service/projects/projects/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint}:`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Project created with ID: ${data.id}`);
                console.log(`📊 Response fields:`, Object.keys(data).join(', '));
                return { endpoint, projectId: data.id };
            } else {
                const errorData = await response.json();
                console.log(`❌ Error:`, errorData);
            }
        } catch (error) {
            console.log(`❌ Network Error: ${error.message}`);
        }
    }
    
    return null;
}

// Criteria 생성 테스트
async function testCriteriaCreation(projectInfo) {
    if (!projectInfo) {
        console.log('\n⏭️ Skipping criteria test - no project created');
        return;
    }
    
    console.log('\n📋 Testing Criteria Creation:');
    
    // 다양한 데이터 형식 시도
    const criteriaFormats = [
        {
            name: 'Test 1 - Basic Format',
            data: {
                project: projectInfo.projectId,
                name: 'Test Criteria 1',
                description: 'Basic format test',
                type: 'criteria'
            }
        },
        {
            name: 'Test 2 - Project ID Format',
            data: {
                project_id: projectInfo.projectId,
                name: 'Test Criteria 2',
                description: 'Project ID format test',
                level: 1,
                order: 1
            }
        },
        {
            name: 'Test 3 - Extended Format',
            data: {
                project_id: projectInfo.projectId,
                name: 'Test Criteria 3',
                description: 'Extended format test',
                type: 'criteria',
                level: 1,
                order: 2,
                weight: 0,
                is_active: true
            }
        }
    ];
    
    const endpoints = [
        '/api/v1/criteria/',
        '/api/service/criteria/',
        '/api/service/projects/criteria/'
    ];
    
    for (const format of criteriaFormats) {
        console.log(`\n${format.name}:`);
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(format.data)
                });
                
                console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`    ✅ Success! Created criteria: ${data.name}`);
                    console.log(`    📊 Response fields:`, Object.keys(data).join(', '));
                    return { endpoint, criteriaId: data.id };
                } else {
                    const errorData = await response.json();
                    console.log(`    ❌ Error:`, JSON.stringify(errorData).substring(0, 100));
                }
            } catch (error) {
                console.log(`    ❌ Network Error: ${error.message}`);
            }
        }
    }
    
    return null;
}

// 전체 테스트 실행
async function runCompleteTest() {
    await testApiStructure();
    const projectInfo = await testProjectCreation();
    await testCriteriaCreation(projectInfo);
    
    console.log('\n🎯 API Structure Analysis Complete');
    console.log('=================================');
    console.log('');
    console.log('이 결과를 바탕으로 프론트엔드 API 설정을 수정하세요.');
}

runCompleteTest();