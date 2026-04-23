const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/lefxy';

// Schemas simplificados
const InteractionSchema = new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ['MESSAGE', 'CALL', 'NOTE'] },
  from: { type: String, enum: ['LEAD', 'USER'] },
  content: String
}, { timestamps: true });

const FollowUpSchema = new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  interactionId: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['PENDING', 'COMPLETED'] },
  dueAt: Date,
  completedAt: Date
}, { timestamps: true });

const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
const Interaction = mongoose.model('Interaction', InteractionSchema);
const FollowUp = mongoose.model('FollowUp', FollowUpSchema);

const messages = [
  "Olá, gostaria de saber mais sobre o processo de sucessão.",
  "Dúvida sobre os honorários advocatícios.",
  "Enviei os documentos via e-mail.",
  "Podemos agendar uma reunião para amanhã?",
  "Obrigado pelo retorno agilizado.",
  "Quais são os prazos médios para esse tipo de causa?",
  "Ainda não recebi o contrato para assinatura.",
  "Vou consultar minha esposa e retorno em breve.",
  "O caso parece ser mais complexo do que imaginei.",
  "Certo, vamos prosseguir com a abertura do processo."
];

async function seed() {
  try {
    console.log('🚀 Conectando ao MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    console.log('🔍 Buscando leads existentes...');
    const leads = await Lead.find({ deletedAt: null });
    console.log(`✅ Encontrados ${leads.length} leads.`);

    const interactionsToInsert = [];
    const followupsToInsert = [];

    console.log('📦 Gerando histórico e tarefas para cada lead...');

    for (const lead of leads) {
        // 1. Criar 3 interações por lead
        for (let j = 0; j < 3; j++) {
            const isLast = j === 2;
            const type = isLast ? 'MESSAGE' : (Math.random() > 0.5 ? 'CALL' : 'NOTE');
            const from = Math.random() > 0.3 ? 'USER' : 'LEAD';
            const content = messages[Math.floor(Math.random() * messages.length)];

            const interaction = new Interaction({
                _id: new mongoose.Types.ObjectId(),
                leadId: lead._id,
                type,
                from,
                content: `${content} (Teste automático)`
            });

            interactionsToInsert.push(interaction);

            // 2. Se for a última (MESSAGE), criar um Follow-up pendente
            if (isLast) {
                const dueAt = new Date();
                dueAt.setHours(dueAt.getHours() + 24); // Daqui a 24h

                followupsToInsert.push({
                    leadId: lead._id,
                    interactionId: interaction._id,
                    status: 'PENDING',
                    dueAt
                });
            }
        }
        
        if (interactionsToInsert.length % 300 === 0) {
            console.log(`...processado histórico de ${interactionsToInsert.length / 3} leads`);
        }
    }

    console.log('💾 Salvando interações no banco (isso pode levar uns segundos)...');
    await Interaction.insertMany(interactionsToInsert);

    console.log('💾 Salvando follow-ups no banco...');
    await FollowUp.insertMany(followupsToInsert);

    console.log('✨ Seed de histórico finalizado!');
    console.log(`📊 Inseridas ${interactionsToInsert.length} interações e ${followupsToInsert.length} follow-ups.`);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

seed();
