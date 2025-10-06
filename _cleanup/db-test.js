// Database Connection Test Script
const API_BASE = 'https://ahp-django-backend.onrender.com';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  console.log('='.repeat(50));
  
  const tests = [
    {
      name: 'API Root',
      url: `${API_BASE}/api/`,
      expectedStatus: 200
    },
    {
      name: 'Database Status',
      url: `${API_BASE}/db-status/`,
      expectedStatus: 200
    },
    {
      name: 'Health Check',
      url: `${API_BASE}/health/`,
      expectedStatus: 200
    },
    {
      name: 'Projects Endpoint',
      url: `${API_BASE}/api/projects/`,
      expectedStatus: [200, 401, 403] // May require auth
    },
    {
      name: 'Users Endpoint',
      url: `${API_BASE}/api/accounts/users/`,
      expectedStatus: [200, 401, 403] // May require auth
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n📍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const startTime = Date.now();
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const responseTime = Date.now() - startTime;
      
      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];
      
      const statusOk = expectedStatuses.includes(response.status);
      
      console.log(`   Status: ${response.status} ${statusOk ? '✅' : '❌'}`);
      console.log(`   Response Time: ${responseTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Special handling for different endpoints
        if (test.name === 'Database Status') {
          console.log(`   Database Engine: ${data.database_engine}`);
          console.log(`   Tables Count: ${data.tables_count}`);
          console.log(`   Connection: ${data.connection}`);
        } else if (test.name === 'API Root') {
          console.log(`   API Version: ${data.version}`);
          console.log(`   Status: ${data.status}`);
        } else if (test.name === 'Health Check') {
          console.log(`   Database: ${data.database}`);
          console.log(`   Server Time: ${data.time}`);
        }
      }
      
      results.push({
        test: test.name,
        status: response.status,
        success: statusOk,
        responseTime: responseTime
      });
      
    } catch (error) {
      console.log(`   Error: ${error.message} ❌`);
      results.push({
        test: test.name,
        error: error.message,
        success: false
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  // Database connection test with actual operation
  console.log('\n' + '='.repeat(50));
  console.log('🗄️ DATABASE OPERATION TEST');
  console.log('='.repeat(50));
  
  try {
    // Try to fetch users count
    const dbTestResponse = await fetch(`${API_BASE}/db-status/`);
    const dbData = await dbTestResponse.json();
    
    if (dbData.connection === 'OK') {
      console.log('✅ Database Connection: SUCCESSFUL');
      console.log(`   - Engine: ${dbData.database_engine}`);
      console.log(`   - Tables: ${dbData.tables_count}`);
      console.log(`   - PostgreSQL Status: Connected`);
      
      // Check specific tables
      const criticalTables = ['users', 'ahp_projects', 'evaluations', 'criteria'];
      const existingTables = criticalTables.filter(table => 
        dbData.tables && dbData.tables.includes(table)
      );
      
      console.log(`\n📋 Critical Tables Check:`);
      criticalTables.forEach(table => {
        const exists = dbData.tables && dbData.tables.includes(table);
        console.log(`   - ${table}: ${exists ? '✅ Exists' : '❌ Missing'}`);
      });
      
    } else {
      console.log('❌ Database Connection: FAILED');
    }
  } catch (error) {
    console.log('❌ Database Test Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Test Complete!');
  console.log('='.repeat(50));
}

// Run the test
testDatabaseConnection().catch(console.error);