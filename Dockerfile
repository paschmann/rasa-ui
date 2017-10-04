FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install

# Bundle app source
COPY . .

#Install webapp dependencies
WORKDIR /usr/src/app/web/src/
RUN cd /usr/src/app/web/src/
RUN npm install

WORKDIR /usr/src/app
RUN ls -ltr
EXPOSE 5001
CMD [ "npm", "start" ]
