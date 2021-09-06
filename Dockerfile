FROM node:16

# Create app directory
WORKDIR /usr/src/backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

# Bundle app source
COPY . .

# Heroku assigns ports itself and uses the process.env.PORT 
# variable for that. That is why we don't EXPOSE a port here
# EXPOSE 3000

CMD [ "npm", "run", "start" ]