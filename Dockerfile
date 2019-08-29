FROM mhart/alpine-node:10 as builder

RUN apk add --no-cache make gcc g++ python
COPY ./package*.json ./
RUN npm install --production

FROM mhart/alpine-node:10

RUN apk add --no-cache make gcc g++ python

ENV http_port=5001
ENV rasa_endpoint "http://10.211.55.8:5005"
ENV jwtsecret "mysecret"
ENV loglevel "info"
ENV admin_username "admin"
ENV admin_password "admin"
ENV db_schema "3.0.0"

WORKDIR /opt/rasaui

COPY --from=builder /node_modules ./node_modules

COPY ./package*.json ./
COPY ./server ./server
COPY ./web ./web


#RUN addgroup -S rasaui \
#    && adduser -G rasaui -S rasaui \
#    && chown -R rasaui:rasaui .

EXPOSE ${http_port}
#USER rasaui

ENTRYPOINT sh -c "hostname -i; npm start"
