# -------- Node.js server build & runtime --------
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

# Install server dependencies
COPY package*.json ./
RUN npm ci

# Copy server source
COPY . .

# Drop privileges
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
