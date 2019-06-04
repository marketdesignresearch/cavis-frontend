FROM node:10

RUN mkdir /app
WORKDIR app

# install dependencies
RUN npm install -g node-static

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm ci

ENV NODE_ENV production
ENV PORT 8000

# copy src
COPY . /app/

# compile to check for errors
RUN npm run build

EXPOSE 80

CMD ["static", "-p", "80", "/app/dist"]