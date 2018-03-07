##### Beta - Please keep in mind that this application is under heavy development

# Rasa UI

Rasa UI is a web application built on top of, and for, [Rasa NLU](https://github.com/RasaHQ/rasa_nlu). Rasa UI provides a web application to quickly and easily be able to create agents, define intents and entities. It also provides some convenience features for Rasa NLU, like training your models, monitoring usage or viewing logs. Our goal is to replace API.ai with Rasa, so a lot of the terminology and usage concepts are similar.

## New Features in 1.0 (Master)
- Webhook option for Agents
- Authentication module can be extended to a different IDP and session is handled by JWT token
- Webhooks also recieve User information part of JWT Token in the Bearer Authorization Header
- User level Tracking of conversations
- New Insights to show the frequently used intents and more drill down details on utterences to be added
- Import Agents in rasa format
- Docker container capabilities
- Existing apps can migrate to this version after running the db-alters.sql under resources and updating their codebase to master.(Although a back up of the data is recommended as rasa-uui is still in Beta version)
- Adapted to rasa_nlu 0.10.x Projects Structure. Each Agent in UI translates to a Project on the NLU.

![Screenshot1](https://github.com/paschmann/rasa-ui/blob/1.0/resources/insights.png)


## Features
- Training data stored in DB
- UI for managing training data
- Initiate training from UI
- Review Rasa configuration and component pipelines
- Log requests for usage tracking, history, improvements
- Usage dashboard
- Easily execute intent parsing using different models

![Screenshot1](https://github.com/paschmann/rasaui/blob/master/resources/rasa_ui_1.png)

## Getting Started

Rasa UI can run directly on your Rasa NLU instance, or on a separate machine. Technically Rasa NLU is not required, you could just use the UI for managing training data.


### Prerequisites

[Rasa NLU](https://github.com/golastmile/rasa_nlu) - Version 8.2.?+

[PostgreSQL](https://www.postgresql.org/) - Used for storing training data (entities, intents, synonyms, etc.)

[Node.js/npm](https://nodejs.org/en/) - Serves Rasa UI and acts as a middleware server for logging (to the PostgreSQL DB)


### Installing

Please ensure prerequisites are fulfilled

Clone/download the Rasa UI repository. Install npm packages foe both Server and Web.

```
git clone https://github.com/paschmann/rasaui.git
cd rasaui && npm install

cd web/src
npm install
```

Please see the [wiki](https://github.com/paschmann/rasa-ui/wiki/Rasa-UI-Install-Guide) for more detailed instructions.

## DB Setup
- Execute `dbcreate.sql` on postgreSQL. (If migrating from an older version of rasa-ui, execute `db-alters.sql`)
- All the Tables and views should be setup

## RasaNLU Setup
- Update your package.json file to include the IP Addresses of your rasa_nlu server and the connection string of your postgres instance.
- Update your web/src/app.js file to include the IP Addresses of your local middleware server (no need to change this if they are running on the same instance)

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

Please read [contributing.md](https://github.com/paschmann/rasaui/contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Paul Aschmann**

See also the list of [contributors](https://github.com/paschmann/rasaui/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [license.md](license.md) file for details
