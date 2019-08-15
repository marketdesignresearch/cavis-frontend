FROM node:10 as build

RUN mkdir /app
WORKDIR /app

# install dependencies
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm ci

ENV NODE_ENV production

# copy src
COPY . /app/

# compile to check for errors
RUN npm run build

######

FROM nginx:1-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN printf "presenter:\$apr1\$rmlaxwj8\$FSmjA1lvIXWqp1brFyn4d1\n" >> /etc/nginx/.htpasswd
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]