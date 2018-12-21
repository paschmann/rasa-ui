FROM mhart/alpine-node:10

RUN apk add --no-cache make gcc g++ python

ENV http_port=5001
ARG HEALTHCHECK_CMD="curl --silent http://localhost:${http_port}/api/v2/health 2>&1 | grep '\"Rasa UI is running\"'"

ENV rasanluendpoint "http://localhost:5000"
ENV rasacoreendpoint "http://localhost:5005"
ENV postgresserver "postgres://postgres:rasaui@localhost:5432/rasa"
ENV rasacorerequestpath=/conversations/{id}/parse

WORKDIR /opt/rasaui
COPY ./package*.json ./
RUN npm install --production
COPY ./resources ./resources
COPY ./server ./server
COPY ./web ./web


RUN addgroup -S rasaui \
    && adduser -G rasaui -S rasaui \
    && chown -R rasaui:rasaui .

HEALTHCHECK CMD ${HEALTHCHECK_CMD}

EXPOSE ${http_port}
USER rasaui

ENTRYPOINT sh -c "hostname -i; npm start"
