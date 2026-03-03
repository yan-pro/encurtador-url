# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define a pasta de trabalho
WORKDIR /app

# --- A CORREÇÃO ESTÁ AQUI ---
# Instala o OpenSSL que o P risma precisa
RUN apk update && apk add --no-cache openssl

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências (agora com o OpenSSL já no sistema)
RUN npm install

# Copia todo o resto do código
COPY . .

# Gera o cliente do Prisma explicitamente para o Linux Alpine
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "server.js"]