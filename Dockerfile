FROM node:10

## Install base environment
RUN apt-get update \
    && apt-get install -y postgresql postgresql-contrib

## Postgres Configuration
RUN mkdir /opt/pgsql && chown postgres -R /opt/pgsql
WORKDIR /opt/postgresql
ADD resources/dbcreate.sql dbcreate.sql
RUN service postgresql start && su postgres -c "createuser rasaui && echo \"create database rasaui; \c rasaui; \i dbcreate.sql\" | psql && echo \"grant all on database rasaui to rasaui; grant all privileges on all tables in schema public to rasaui; grant all privileges on all sequences in schema public to rasaui \"|psql rasaui" && service postgresql stop

## RasaUI Installation
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
