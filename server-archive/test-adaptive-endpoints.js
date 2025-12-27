const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

// Test user credentials (using seeded admin user)
const TEST_USER = {
  email: 'admin@pmp.com',
  password: 'admin123'
};

let authToken = null;

async function authenticate() {
  try {
    console.log('🔐 Authenticating with admin user...');
    
    // Login to get token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAdaptiveEndpoints() {
  console.log('🧪 Testing Adaptive Learning API Endpoints...\n');

  if (!await authenticate()) {
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: GET /api/v1/adaptive/profile
    console.log('1. Testing GET /api/v1/adaptive/profile');
    const profileResponse = await axios.get(`${API_BASE}/adaptive/profile`, { headers });
    console.log('✅ Profile endpoint successful');
    console.log('   - User ID:', profileResponse.data.userId);
    console.log('   - Domain masteries:', profileResponse.data.domainMasteries?.length || 0);
    console.log('   - Knowledge gaps:', profileResponse.data.knowledgeGaps?.length || 0);
    console.log('   - Recent insights:', profileResponse.data.recentInsights?.length || 0);

    // Test 2: GET /api/v1/adaptive/questions
    console.log('\n2. Testing GET /api/v1/adaptive/questions');
    const questionsResponse = await axios.get(`${API_BASE}/adaptive/questions?count=5`, { headers });
    console.log('✅ Questions endpoint successful');
    console.log('   - Questions returned:', questionsResponse.data.questions?.length || 0);
    console.log('   - Requested count:', questionsResponse.data.metadata?.requestedCount);
    console.log('   - Total selected:', questionsResponse.data.metadata?.totalSelected);

    // Test 3: GET /api/v1/adaptive/questions with filters
    console.log('\n3. Testing GET /api/v1/adaptive/questions with filters');
    const filteredQuestionsResponse = await axios.get(
      `${API_BASE}/adaptive/questions?count=3&difficultyMin=EASY&difficultyMax=MEDIUM&excludeRecentDays=14`, 
      { headers }
    );
    console.log('✅ Filtered questions endpoint successful');
    console.log('   - Questions returned:', filteredQuestionsResponse.data.questions?.length || 0);
    console.log('   - Selection criteria:', JSON.stringify(filteredQuestionsResponse.data.metadata?.selectionCriteria, null, 2));

    // Test 4: GET /api/v1/adaptive/gaps
    console.log('\n4. Testing GET /api/v1/adaptive/gaps');
    const gapsResponse = await axios.get(`${API_BASE}/adaptive/gaps?limit=5`, { headers });
    console.log('✅ Knowledge gaps endpoint successful');
    console.log('   - Gaps returned:', gapsResponse.data.knowledgeGaps?.length || 0);
    console.log('   - Requested limit:', gapsResponse.data.metadata?.requestedLimit);

    // Test 5: GET /api/v1/adaptive/insights
    console.log('\n5. Testing GET /api/v1/adaptive/insights');
    const insightsResponse = await axios.get(`${API_BASE}/adaptive/insights?limit=10`, { headers });
    console.log('✅ Insights endpoint successful');
    console.log('   - Insights returned:', insightsResponse.data.insights?.length || 0);
    console.log('   - Requested limit:', insightsResponse.data.metadata?.requestedLimit);

    // Test 6: Test validation errors
    console.log('\n6. Testing validation errors');
    try {
      await axios.get(`${API_BASE}/adaptive/questions?count=100`, { headers }); // Should fail - count too high
      console.log('❌ Validation should have failed for count=100');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected count=100');
      } else {
        console.log('❌ Unexpected error for validation test:', error.response?.status);
      }
    }

    // Test 7: Test difficulty range validation
    console.log('\n7. Testing difficulty range validation');
    try {
      await axios.get(`${API_BASE}/adaptive/questions?difficultyMin=HARD&difficultyMax=EASY`, { headers }); // Should fail
      console.log('❌ Validation should have failed for invalid difficulty range');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected invalid difficulty range');
      } else {
        console.log('❌ Unexpected error for difficulty range test:', error.response?.status);
      }
    }

    console.log('\n🎉 All Adaptive API endpoint tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Adaptive API Test Failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   This might be an authentication issue. Check if the user exists and credentials are correct.');
    }
  }
}

// Test unauthorized access
async function testUnauthorizedAccess() {
  console.log('\n8. Testing unauthorized access');
  try {
    await axios.get(`${API_BASE}/adaptive/profile`); // No auth header
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthorized request');
    } else {
      console.log('❌ Unexpected error for unauthorized test:', error.response?.status);
    }
  }
}

async function runAllTests() {
  await testAdaptiveEndpoints();
  await testUnauthorizedAccess();
}

runAllTests();