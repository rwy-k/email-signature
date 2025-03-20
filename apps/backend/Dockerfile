FROM node:18

WORKDIR /app/backend

COPY package*.json ./

RUN npm install -g typescript
RUN npm install
RUN npm install reflect-metadata

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
