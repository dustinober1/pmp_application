const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPIs() {
  console.log('🧪 Testing PMP Practice Test APIs...\n');

  try {
    // Test health endpoint
    console.log('1. Health Check:');
    const health = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', health.data);

    // Test domains
    console.log('\n2. Get Domains:');
    const domains = await axios.get(`${API_BASE}/questions/domains`);
    console.log('✅ Domains retrieved:', domains.data.length, 'domains');

    // Test questions
    console.log('\n3. Get Questions:');
    const questions = await axios.get(`${API_BASE}/questions?limit=5`);
    console.log('✅ Questions retrieved:', questions.data.questions.length, 'questions');

    // Test flashcards
    console.log('\n4. Get Flashcards:');
    const flashcards = await axios.get(`${API_BASE}/flashcards?limit=5`);
    console.log('✅ Flashcards retrieved:', flashcards.data.flashcards.length, 'flashcards');

    // Test practice tests
    console.log('\n5. Get Practice Tests:');
    const tests = await axios.get(`${API_BASE}/practice/tests`);
    console.log('✅ Practice tests retrieved:', tests.data.length, 'tests');

    // Test flashcard categories
    console.log('\n6. Get Flashcard Categories:');
    const categories = await axios.get(`${API_BASE}/flashcards/categories`);
    console.log('✅ Categories retrieved:', categories.data.length, 'categories');

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.response?.data || error.message);
  }
}

testAPIs();