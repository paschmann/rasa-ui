[![Docker Automated build](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)](https://hub.docker.com/r/paschmann/rasa-ui/)

# Rasa UI

Rasa UI is a web application built on top of, and for [Rasa] (https://github.com/RasaHQ/rasa). Rasa UI provides a web application to quickly and easily be able to create agents, define intents and entities. It also provides some convenience features for Rasa NLU, like training your models, monitoring usage or viewing logs.

## Features

- UI for feeding training data - Intents, Entities, Synonyms, Regex, Actions, Stories to DB and Testing endpoints.
- Log requests for usage tracking, history, improvements
- Easily execute intent parsing using different models
- Manage Multiple Agents in one place with shared NLU instances.
- Webhook option for Agents to fetch response text and send back to bots.
- Authentication module can be extended to a different IDP and session is handled by JWT token
- Webhooks also receive User information part of JWT Token in the Bearer Authorization Header
- User level Tracking of conversations
- Insights to show the frequently used intents and their confidence %
- Import Agents in rasa_nlu format
- Docker container capabilities

## Getting Started

Rasa UI can run on your Rasa instance, or on a separate machine. Technically Rasa NLU is not required, you could just use the UI for managing training data.


### Prerequisites

[Rasa NLU](https://github.com/golastmile/rasa_nlu) - Version 1.2+

[Node.js/npm](https://nodejs.org/en/) - Serves Rasa UI and acts as a middleware server for logging (to the PostgreSQL DB)


### Installing

Please ensure prerequisites are fulfilled

Clone/download the Rasa UI repository. 
Install npm packages.
Set Rasa Server variable in package.json

```
git clone https://github.com/paschmann/rasaui.git
cd rasaui && npm install
```

Please see the [wiki](https://github.com/paschmann/rasa-ui/wiki/Rasa-UI-Install-Guide) for more detailed instructions.

#### Docker Setup
##### Quick start
`docker pull paschmann/rasa-ui` and browse to localhost:5001

## Running
Run npm start from the server folder (rasa-ui)

```
npm start
```
Your web application should be available on http://localhost:5001

## Logging

Since Rasa UI can be used to log events/intent parsing/training etc. we would suggest changing your endpoints for your API calls to "pass through" Rasa UI. All API requests are simply logged, forwarded to Rasa and then returned.

e.g. Instead of calling: http://localhost:5005/model/parse?q=hello%20there rather call: http://localhost:5001/api/v2/rasa/parse?q=hello%20there

## Contributing

Please read [contributing.md](contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Contributers

* **Paul Aschmann**
* **Pradeep Mamillapalli**

## License

This project is licensed under the MIT License - see the [license](license) file for details
