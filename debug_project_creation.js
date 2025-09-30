/**
 * Debug Project Creation Response
 * 프로젝트 생성 응답 구조 분석
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function debugProjectCreation() {
    console.log('🔍 Debugging Project Creation Response');
    console.log('====================================');
    
    const projectData = {
        title: `Debug Test Project ${Date.now()}`,
        description: 'Response structure debugging',
        objective: 'ID 필드 확인',
        status: 'draft',
        evaluation_mode: 'practical',
        workflow_stage: 'creating'
    };
    
    console.log('📤 Sending project data:', JSON.stringify(projectData, null, 2));
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);
        console.log('Response Headers:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n📊 Response Data:');
            console.log('Raw response:', JSON.stringify(data, null, 2));
            console.log('\nAnalysis:');
            console.log('- Response type:', typeof data);
            console.log('- Is array:', Array.isArray(data));
            console.log('- Keys:', Object.keys(data));
            console.log('- Has id field:', 'id' in data);
            console.log('- Has uuid field:', 'uuid' in data);
            console.log('- Has pk field:', 'pk' in data);
            
            // Try different ID field names
            const possibleIds = ['id', 'uuid', 'pk', '_id', 'project_id'];
            console.log('\n🔍 Checking possible ID fields:');
            possibleIds.forEach(field => {
                if (field in data) {
                    console.log(`  ✅ ${field}: ${data[field]}`);
                } else {
                    console.log(`  ❌ ${field}: not found`);
                }
            });
            
            // If it's nested in another field
            if (data.data && typeof data.data === 'object') {
                console.log('\n📦 Nested data field found:');
                console.log('data.data keys:', Object.keys(data.data));
                possibleIds.forEach(field => {
                    if (field in data.data) {
                        console.log(`  ✅ data.${field}: ${data.data[field]}`);
                    }
                });
            }
            
            return data;
        } else {
            const errorText = await response.text();
            console.log(`\n❌ Error Response: ${errorText}`);
            return null;
        }
        
    } catch (error) {
        console.log(`\n❌ Network Error: ${error.message}`);
        return null;
    }
}

// Also test reading existing projects to see ID structure
async function debugExistingProjects() {
    console.log('\n\n🔍 Debugging Existing Projects Structure');
    console.log('======================================');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Projects list response structure:');
            console.log('- Type:', typeof data);
            console.log('- Is array:', Array.isArray(data));
            console.log('- Keys:', Object.keys(data));
            
            let projects = [];
            if (data.results) {
                projects = data.results;
                console.log('- Using data.results (pagination)');
            } else if (Array.isArray(data)) {
                projects = data;
                console.log('- Using direct array');
            }
            
            if (projects.length > 0) {
                const firstProject = projects[0];
                console.log('\n📊 First project structure:');
                console.log('Keys:', Object.keys(firstProject));
                console.log('ID field value:', firstProject.id);
                console.log('ID type:', typeof firstProject.id);
                
                // Test reading this project
                if (firstProject.id) {
                    console.log(`\n🧪 Testing read with ID: ${firstProject.id}`);
                    const readResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${firstProject.id}/`);
                    console.log(`Read response: ${readResponse.status} ${readResponse.statusText}`);
                    
                    if (readResponse.ok) {
                        const readData = await readResponse.json();
                        console.log('✅ Successfully read project:', readData.title);
                    } else {
                        const errorText = await readResponse.text();
                        console.log('❌ Read failed:', errorText.substring(0, 200));
                    }
                }
            }
        } else {
            console.log(`❌ Failed to get projects list: ${response.status}`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

async function runDebugTest() {
    await debugProjectCreation();
    await debugExistingProjects();
    
    console.log('\n🎯 Debug Summary:');
    console.log('================');
    console.log('이 결과를 바탕으로 프로젝트 ID 필드를 수정하세요.');
}

runDebugTest();