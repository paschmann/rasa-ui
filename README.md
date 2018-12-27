[![Docker Automated build](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)](https://hub.docker.com/r/paschmann/rasa-ui/)

# Rasa UI

Rasa UI is a web application built on top of, and for, [Rasa NLU](https://github.com/RasaHQ/rasa_nlu). Rasa UI provides a web application to quickly and easily be able to create agents, define intents and entities. It also provides some convenience features for Rasa NLU, like training your models, monitoring usage or viewing logs. Our goal is to replace api.ai/Dialogflow with Rasa, so a lot of the terminology and usage concepts are similar.

## Features in 1.0
- Webhook option for Agents
- Authentication module can be extended to a different IDP and session is handled by JWT token
- Webhooks also receive User information part of JWT Token in the Bearer Authorization Header
- User level Tracking of conversations
- New Insights to show the frequently used intents and more drill down details on utterances to be added
- Import Agents in rasa format
- Docker container capabilities
- Existing apps can migrate to this version after running the db-alters.sql under resources and updating their codebase to master.(Although a backup of the data is recommended as rasa-uui is still in Beta version)
- Adapted to rasa_nlu 0.10.x Projects Structure. Each Agent in UI translates to a Project on the NLU.

![Screenshot1](https://github.com/paschmann/rasa-ui/blob/master/resources/insights.png)


## Features
- Training data stored in DB
- UI for managing training data
- Initiate training from UI
- Review Rasa configuration and component pipelines
- Log requests for usage tracking, history, improvements
- Usage dashboard
- Easily execute intent parsing using different models

![Screenshot1](https://github.com/paschmann/rasa-ui/blob/master/resources/rasa_ui_1.png)

## Getting Started

Rasa UI can run directly on your Rasa NLU instance, or on a separate machine. Technically Rasa NLU is not required, you could just use the UI for managing training data.


### Prerequisites

[Rasa NLU](https://github.com/golastmile/rasa_nlu) - Version 8.2.?+

[PostgreSQL](https://www.postgresql.org/) - Used for storing training data (entities, intents, synonyms, etc.)

[Node.js/npm](https://nodejs.org/en/) - Serves Rasa UI and acts as a middleware server for logging (to the PostgreSQL DB)


### Installing

Please ensure prerequisites are fulfilled

Clone/download the Rasa UI repository. Install npm packages for both Server and Web.

```
git clone https://github.com/paschmann/rasaui.git
cd rasaui && npm install
```

Please see the [wiki](https://github.com/paschmann/rasa-ui/wiki/Rasa-UI-Install-Guide) for more detailed instructions.

#### Docker Setup
The Docker file uses Multi Stage Build feature, ensure that your docker version is greater or equals to 17.05.
In order to run this setup in docker you need to run the following command to build out the image:

`docker build -t rasa-ui .` - Make sure to perform this from the location where the Dockerfile is.

Now we can spin up our docker instance with the following command:

**Use Your External Rasa Server**
In this command we are setting the env variables rasanluendpoint and rasacoreendpoint to our own specific values, you can supply only 1 or both of these depending on if you want to use NLU or Core or both externally.

`docker run -e "rasanluendpoint=http://youripaddress:5000" -e "rasacoreendpoint=http://youripaddress:5005" -e "postgresserver=postgres://login:password@serveraddress:5432/rasa" -itd -p 5001:5001 rasa-ui` 

It's possible to fix the nlu model name for the training by passing "rasanlufixedmodelname" as an argument :

`docker run -e "rasanluendpoint=http://youripaddress:5000" -e "rasacoreendpoint=http://youripaddress:5005" -e "postgresserver=postgres://login:password@serveraddress:5432/rasa" -e "rasanlufixedmodelname=nlu" -itd -p 5001:5001 rasa-ui` 

## Docker compose
If you want to quickly load all the stack locally you can use the docker-compose file

`docker-compose up`

On the first launch, you have to add add your rasa configurations and training files in this filetree:

```
rasa-app-data
├── actions
│   ├── __pycache__
│   │   └── actions.cpython-36.pyc
│   └── actions.py
├── config
│   └── endpoints.yml
├── logs
├── models
│   └── current
│       └── dialogue
│           ├── domain.json
│           ├── domain.yml
└── project
    ├── domain.yml
    └── stories.md
```

Then launch the model training if it's not already done:

`docker-compose run rasa_core train`

And setup SQL database schema.

## DB Setup
**If the rasa UI Postgres user is different from the postgres database admin used for database creation, ensure it is created before the execution of the script `CREATE USER <RASA_UI_DATABASE_USER> WITH PASSWORD '<RASA_UI_DATABASE_PWD>'`**

### Flyway install
You can install the RASA UI database using Flyway - simply run a docker container with these options.
```
docker run --rm --mount type=bind,source=<PATH_TO_MIGRATION_FOLDER>,target=/flyway/sql \
 boxfuse/flyway -url=jdbc:postgresql://<POSTGRES_SERVER_URL>/<RASA_UI_DB> -user=<POSTGRES_ADMIN_USER> -password=<POSTGRES_ADMIN_PASSWORD> -schemas=rasa_ui,public -placeholders.postgres_user=<RASA_UI_DATABASE_USER>  migrate
```
This will create a `flyway_schema_history` table which will track the database state, and allow you to simplify database model migrations.

### Manual install
Please specify the value of the `postgres_user` parameter with your Rasa Postgres User, using psql : `psql -v postgres_user=<RASA_UI_DATABASE_USER> -h <POSTGRES_SERVER_URL> -U <POSTGRES_ADMIN_USER> -d <RASA_UI_DB> -a -f dbcreate.sql`.
If this is a clean install, simply execute `dbcreate.sql` on postgreSQL. If you are upgrading from a previous version, please execute the migration scripts sequentially to bring your DB model up to date.

## RasaNLU Setup
- Update your package.json file to include the IP Addresses of your rasa_nlu server and the connection string of your postgres instance.
- Optional: Update your web/src/app.js file to include the IP Addresses of your local middleware server (no need to change this if they are running on the same instance)

## Running
Run npm start from the server folder (rasa-ui)

```
npm start
```
Your web application should be available on http://localhost:5001

## Logging

Since Rasa UI can be used to log events/intent parsing/training etc. we would suggest changing your endpoints for your API calls to "pass through" the Rasa UI middleware layer. All API requests are simply forwarded, logged and then returned.

e.g. Instead of calling: http://localhost:5000/parse?q=hello%20there rather call: http://localhost:5001/api/v2/rasa/parse?q=hello%20there

## Contributing

Please read [contributing.md](contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Contributers

* **Paul Aschmann**
* **Pradeep Mamillapalli**

## License

This project is licensed under the MIT License - see the [license](license) file for details
