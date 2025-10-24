# Usa uma imagem oficial do Node.js como base.
# A versão slim é menor e contém apenas o necessário para rodar o Node.
FROM node:20-slim

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de dependências primeiro.
# Isso aproveita o cache de camadas do Docker: se esses arquivos não mudarem,
# a camada não será reconstruída, acelerando builds futuros.
COPY package*.json ./

# Instala as dependências de produção.
RUN npm install --only=production

# Copia o restante dos arquivos do projeto para o diretório de trabalho.
COPY . .

# Faz o build da aplicação Next.js para produção.
RUN npm run build

# Expõe a porta em que a aplicação Next.js será executada.
# O padrão para `next start` é 3000.
EXPOSE 3003

# Define o comando para iniciar a aplicação em modo de produção.
# `next start` inicia o servidor otimizado.
CMD ["npm", "start"]
