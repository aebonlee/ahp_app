/**
 * Backend URL Discovery Script
 * 실제 작동하는 백엔드 URL 찾기
 */

const possibleUrls = [
    'https://ahp-django-service.onrender.com',
    'https://ahp-django-backend.onrender.com', 
    'https://ahp-backend.onrender.com',
    'https://ahp-service.onrender.com',
    'https://django-ahp-service.onrender.com',
    'https://ahp-platform-backend.onrender.com',
    'https://ahp-django-service-latest.onrender.com'
];

async function findWorkingBackend() {
    console.log('🔍 Finding Working Backend URL...');
    console.log('================================');
    
    for (const url of possibleUrls) {
        try {
            console.log(`\n📋 Testing: ${url}`);
            
            const response = await fetch(url, { method: 'GET' });
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                try {
                    const data = await response.json();
                    console.log(`   ✅ Working! Response type: JSON`);
                    console.log(`   📊 Response keys:`, Object.keys(data).slice(0, 5).join(', '));
                    
                    // Test API endpoints
                    await testApiEndpoints(url);
                    return url;
                } catch (e) {
                    const text = await response.text();
                    console.log(`   ✅ Working! Response type: HTML/Text (${text.length} chars)`);
                    
                    // Test API endpoints even for HTML responses
                    await testApiEndpoints(url);
                    return url;
                }
            } else {
                console.log(`   ❌ Failed: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Network Error: ${error.message}`);
        }
    }
    
    console.log('\n❌ No working backend URL found');
    return null;
}

async function testApiEndpoints(baseUrl) {
    console.log(`\n   🧪 Testing API endpoints for ${baseUrl}:`);
    
    const endpoints = [
        '/api/',
        '/api/v1/',
        '/api/service/',
        '/api/v1/projects/',
        '/health/',
        '/admin/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(baseUrl + endpoint);
            if (response.ok) {
                console.log(`      ✅ ${endpoint} (${response.status})`);
            } else {
                console.log(`      ❌ ${endpoint} (${response.status})`);
            }
        } catch (e) {
            console.log(`      ❌ ${endpoint} (Network Error)`);
        }
    }
}

// Run the discovery
findWorkingBackend().then(workingUrl => {
    if (workingUrl) {
        console.log('\n🎯 Result:');
        console.log(`Working Backend URL: ${workingUrl}`);
        console.log('\n📝 Update your config/api.ts:');
        console.log(`export const API_BASE_URL = '${workingUrl}';`);
    } else {
        console.log('\n💡 Suggestions:');
        console.log('1. Check if the backend service is running on Render');
        console.log('2. Verify the service name in render.yaml');
        console.log('3. Check deployment logs on Render dashboard');
        console.log('4. Use local backend development instead');
    }
});