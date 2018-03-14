FROM ubuntu:16.04

RUN apt-get update \
## Install base environment
    && apt-get install -y wget postgresql postgresql-contrib

## Nodejs
# Prepare
WORKDIR /opt/
# Download
RUN wget https://nodejs.org/dist/v6.11.1/node-v6.11.1-linux-x64.tar.xz \
# Unpack
    && tar xf node-v6.11.1-linux-x64.tar.xz \
    && rm node-v6.11.1-linux-x64.tar.xz \
    && mv node-v6.11.1-linux-x64 node
# Install
WORKDIR /opt/node
RUN mv bin/* /usr/bin/ \
    && mv include/* /usr/include/ \
    && mv lib/* /usr/lib/ \
    && mv share/doc/* /usr/share/doc/ \
    && mv share/man/man1/* /usr/share/man/man1/ \
    && mv share/systemtap/* /usr/share/systemtap/

## Postgres
# Configuration
RUN mkdir /opt/pgsql \
    && chown postgres -R /opt/pgsql
WORKDIR /opt/postgresql

ADD resources/dbcreate.sql dbcreate.sql
RUN service postgresql start && su postgres -c "createuser rasaui && echo \"create database rasaui; \c rasaui; \i dbcreate.sql\" | psql && echo \"grant all on database rasaui to rasaui; grant all privileges on all tables in schema public to rasaui; grant all privileges on all sequences in schema public to rasaui \"|psql rasaui" && service postgresql stop

## RasaUI
# Installation
ADD . /opt/rasaui
WORKDIR /opt/rasaui

# Install server packages
RUN npm install \
# Setup user
    && useradd rasaui \
    && chown rasaui -R .

# Setup RasaUI configuration
RUN sed -r 's/("postgresserver": )"[^"]*"(.*)/\1"\/var\/run\/postgresql"\2/' -i package.json
ENV rasanluendpoint=http://localhost:5000
ENV rasacoreendpoint=http://localhost:5005

EXPOSE 5001

ENTRYPOINT bash -c 'hostname -I; service postgresql start && su rasaui -c "npm start"'