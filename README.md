# 🚀 High-Performance URL Shortener

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

Um sistema distribuído de encurtamento de URLs focado em **alta performance, baixa latência e escalabilidade**. 

Mais do que um simples CRUD, este projeto foi desenhado para suportar picos de tráfego (como campanhas de marketing em massa) utilizando padrões avançados de arquitetura de software, como **Cache-Aside** e **Processamento Assíncrono Baseado em Eventos (Filas)**.

## ✨ Principais Funcionalidades

- **Encurtamento Rápido:** Geração de identificadores únicos para URLs longas.
- **Redirecionamento de Baixa Latência:** Uso de cache em memória para garantir respostas em poucos milissegundos.
- **Analytics Assíncrono:** Coleta de dados de clique (IP, User-Agent, Data/Hora) sem impactar o tempo de redirecionamento do usuário final.
- **Soberania de Dados:** Arquitetura *in-house* para ter controle total sobre as métricas de tráfego.

## 🏗️ Arquitetura e Decisões Técnicas

Para resolver o gargalo clássico de bancos de dados relacionais sob alto tráfego de leitura e escrita simultânea, o sistema foi dividido da seguinte forma:

1. **API (Express):** Recebe as requisições e orquestra o fluxo.
2. **Camada de Cache (Redis):** Implementa o padrão *Cache-Aside*. Na leitura, a API busca primeiro no Redis. Em caso de *Cache Miss*, busca no banco, retorna ao usuário e "reidrata" o cache para as próximas chamadas.
3. **Persistência (PostgreSQL + Prisma ORM):** A fonte da verdade (*Source of Truth*). Garante a integridade relacional entre as URLs criadas e os logs de analytics.
4. **Fila de Mensagens & Worker (BullMQ):** Ao redirecionar um usuário, a API apenas publica um evento `register-click` na fila do Redis. Um processo paralelo (Worker) consome essa fila e realiza a inserção pesada no PostgreSQL em *background*. Isso reduz o bloqueio de I/O da API principal.

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express
- **Banco de Dados Relacional:** PostgreSQL
- **Banco de Dados em Memória / Filas:** Redis
- **Message Broker:** BullMQ
- **ORM:** Prisma
- **Infraestrutura:** Docker & Docker Compose

---

## 🚀 Como Executar Localmente

O projeto é containerizado. Certifique-se de ter o **Node.js**, **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Clone o repositório
```bash
git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)
cd SEU_REPOSITORIO
