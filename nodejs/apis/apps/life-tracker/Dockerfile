# Dockerfile para o Life Tracker API
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências globais
RUN npm install -g pnpm

# Copiar arquivos de configuração
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig*.json ./

# Instalar dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Compilar o projeto
RUN pnpm run build

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["pnpm", "start:prod"] 