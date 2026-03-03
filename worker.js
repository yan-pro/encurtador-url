const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const IORedis = require('ioredis');

const prisma = new PrismaClient();

// Configuração da conexão Redis para o Worker
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

console.log("👷 Worker de Analytics iniciado e aguardando tarefas...");

// O Worker fica ouvindo a fila 'clicks'
const worker = new Worker('click-queue', async (job) => {
    // Aqui dentro acontece a mágica pesada
    const { shortCode, ip, userAgent } = job.data;
    
    console.log(`[Worker] Processando clique para: ${shortCode}`);

    try {
        // 1. Acha o ID do link pelo código
        const link = await prisma.link.findUnique({
            where: { shortCode: shortCode }
        });

        if (link) {
            // 2. Salva o registro de analytics
            await prisma.analytics.create({
                data: {
                    linkId: link.id,
                    ip: ip,
                    userAgent: userAgent
                }
            });
            console.log(`[Worker] ✅ Analytics salvo para o link ID ${link.id}`);
        }
    } catch (err) {
        console.error(`[Worker] ❌ Erro ao salvar analytics:`, err);
    }

}, { connection });

// Tratamento de erros do worker
worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} falhou: ${err.message}`);
});