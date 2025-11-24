# -------- Client build stage --------
FROM node:20-alpine AS client
WORKDIR /app/client

# Install client deps (cached by package*.json in /client)
COPY client/package*.json ./
RUN npm ci

# Copy client source and build
COPY client/ ./
RUN npm run build

# -------- Base build stage --------
FROM node:20-alpine AS base
WORKDIR /app

# Install server deps (cached by package*.json)
COPY package*.json ./
RUN npm ci

# -------- Final runtime image --------
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

# Copy server deps from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Copy server source
COPY . .

# Copy built React client into /app/client/dist
COPY --from=client /app/client/dist ./client/dist

# Drop privileges
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
