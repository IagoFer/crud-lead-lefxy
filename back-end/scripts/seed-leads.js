const mongoose = require('mongoose');

// URI de conexão (Ajuste se o docker estiver rodando em outra porta ou host)
const MONGO_URI = 'mongodb://localhost:27017/lefxy';

// Schema simplificado para o Seed
const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  channel: { type: String, enum: ['WHATSAPP', 'INSTAGRAM', 'SITE'] },
  stage: { type: String, enum: ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'] },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

const Lead = mongoose.model('Lead', LeadSchema);

const names = [
  'João Silva', 'Maria Garcia', 'Pedro Santos', 'Ana Oliveira', 'Lucas Souza',
  'Julia Lima', 'Carlos Ferreira', 'Beatriz Costa', 'Marcos Pereira', 'Fernanda Rodrigues',
  'Roberto Almeida', 'Camila Cavalcante', 'Ricardo Mendes', 'Patrícia Rocha', 'Gabriel Nunes',
  'Aline Carvalho', 'Fábio Ramos', 'Letícia Moraes', 'Bruno Teixeira', 'Isabela Machado'
];

const channels = ['WHATSAPP', 'INSTAGRAM', 'SITE'];
const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

async function seed() {
  try {
    console.log('🚀 Iniciando conexão com o MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado com sucesso!');

    const count = 1000;
    const leads = [];

    console.log(`📦 Gerando ${count} leads fictícios...`);

    for (let i = 1; i <= count; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        const randomPhone = `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`;

        leads.push({
            name: `${randomName} #${i}`,
            phone: randomPhone,
            channel: randomChannel,
            stage: randomStage,
            deletedAt: null
        });

        // Feedback visual a cada 200
        if (i % 200 === 0) console.log(`...processando ${i}/1000`);
    }

    console.log('💾 Inserindo no banco de dados...');
    await Lead.insertMany(leads);

    console.log('✨ Seed finalizado com sucesso!');
    console.log(`📊 Foram inseridos ${count} novos leads.`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada.');
    process.exit();
  }
}

seed();
