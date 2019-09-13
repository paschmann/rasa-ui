FROM mhart/alpine-node:10 as builder

RUN apk add --no-cache make gcc g++ python
COPY ./package*.json ./
RUN npm install --production

FROM mhart/alpine-node:10

RUN apk add --no-cache make gcc g++ python

ENV http_port=5001
ENV rasa_endpoint "http://localhost:5005"
ENV jwtsecret "mysecret"
ENV loglevel "info"
ENV admin_username "admin"
ENV admin_password "admin"
ENV db_schema "3.0.1"

WORKDIR /opt/rasaui

COPY --from=builder /node_modules ./node_modules

COPY ./package*.json ./
COPY ./server ./server
COPY ./web ./web

EXPOSE ${http_port}

ENTRYPOINT sh -c "hostname -i; npm start"
