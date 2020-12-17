FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/monotone

# Copy the package and lock file
COPY package*.json ./

# Install dependencies
RUN apk update &&\
  apk add --no-cache git npm &&\
  npm install --production

# Bundle app source
COPY . .

# If you want to use remote mongo then use the mongo url here 
# if you want to use localhost mongo then use environment in docker compose
ENV TOKEN=\
  MONGO_URL=

# Run the bot
CMD [ "npm", "start" ]
