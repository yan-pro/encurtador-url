const express = require('express');
const { createClient } = require('redis');
const { nanoid } = require('nanoid');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq'); // <--- Import novo
const IORedis = require('ioredis');  // <--- Import novo

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Conexão Redis padrão para Cache
const redisCache = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisCache.on('error', err => console.error('Redis Cache Error', err));

// Conexão IORedis específica para a Fila (BullMQ)
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// Criamos a fila
const clickQueue = new Queue('click-queue', { connection });

(async () => {
    await redisCache.connect();
    console.log('🔌 Redis Cache Conectado');

    app.post('/shorten', async (req, res) => {
        const { originalUrl } = req.body;
        if (!originalUrl) return res.status(400).json({ error: 'URL required' });
        const shortCode = nanoid(6);

        try {
            const newLink = await prisma.link.create({
                data: { original: originalUrl, shortCode }
            });
            await redisCache.set(shortCode, originalUrl, { EX: 86400 });
            res.json(newLink);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar' });
        }
    });

    app.get('/:code', async (req, res) => {
        const { code } = req.params;

        try {
            // 1. Tenta Cache
            let originalUrl = await redisCache.get(code);

            // 2. Se não tem no cache, busca no banco
            if (!originalUrl) {
                const link = await prisma.link.findUnique({ where: { shortCode: code } });
                if (link) {
                    originalUrl = link.original;
                    await redisCache.set(code, originalUrl, { EX: 86400 });
                }
            }

            if (originalUrl) {
                // --- A MÁGICA ACONTECE AQUI ---
                // Em vez de esperar salvar no banco, jogamos na fila e damos "tchau" pro usuário.
                // Isso leva milissegundos.
                clickQueue.add('register-click', {
                    shortCode: code,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                return res.redirect(originalUrl);
            } else { 
                return res.status(404).json({ error: 'Not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal error' });
        }
    });

    app.listen(3000, () => {
        console.log('🚀 Server running on port 3000');
    });
})();