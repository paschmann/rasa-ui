FROM mhart/alpine-node:10 as builder

RUN apk add --no-cache make gcc g++ python
COPY ./package*.json ./
RUN npm install --production

FROM mhart/alpine-node:10

ENV rasanluendpoint "http://localhost:5000"
ENV rasacoreendpoint "http://localhost:5005"
ENV postgresserver "postgres://postgres:rasaui@localhost:5432/rasa"

WORKDIR /opt/rasaui
COPY --from=builder /node_modules ./node_modules
COPY ./package*.json ./
COPY ./resources ./resources
COPY ./server ./server
COPY ./web ./web


RUN addgroup -S rasaui \
    && adduser -G rasaui -S rasaui \
    && chown -R rasaui:rasaui .

EXPOSE 5001
USER rasaui

ENTRYPOINT sh -c "hostname -i; npm start"
