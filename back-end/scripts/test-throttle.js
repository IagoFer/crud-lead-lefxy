const axios = require('axios');

async function testThrottle() {
  try {
    console.log('🔑 Realizando Login...');
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@lefxy.com',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✅ Token obtido!');

    // Pega o ID de algum lead existente
    const leadsRes = await axios.get('http://localhost:3001/leads?limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const leadId = leadsRes.data.data[0]._id;

    console.log(`\n🤖 Testando Endpoint de IA para o lead ${leadId}...`);
    
    // Request 1: Deve passar
    try {
      console.log('-> 1º Request (Deve passar)');
      await axios.post(`http://localhost:3001/leads/${leadId}/ai-summary`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Passou!');
    } catch (err) {
      console.error('❌ Falhou no primeiro:', err.response?.status, err.response?.statusText);
    }

    // Request 2: Deve ser bloqueado (pois o limite é 1)
    try {
      console.log('\n-> 2º Request instantâneo (Deve dar 429 Too Many Requests)');
      await axios.post(`http://localhost:3001/leads/${leadId}/ai-summary`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Passou! (Isso é ruim, o throttler não bloqueou)');
    } catch (err) {
      if (err.response?.status === 429) {
        console.log(`✅ Bloqueado com sucesso! Status: ${err.response.status} - ${err.response.statusText}`);
      } else {
        console.error('❌ Falhou com erro diferente:', err.response?.status, err.response?.statusText);
      }
    }

  } catch (error) {
    console.error('Erro geral no teste:', error.message);
  }
}

testThrottle();
