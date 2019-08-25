# Rasa UI

Rasa UI is a web application built on top of, and for [Rasa] (https://github.com/RasaHQ/rasa). Rasa UI provides a web application to quickly and easily be able to create agents, define intents and entities. It also provides some convenience features for Rasa, like training and loading your models, monitoring usage or viewing logs.

## Features

- UI for creating and managing training data - Examples, Intents, Entities, Synonyms, Regex
- Log requests for usage tracking, history, improvements
- Easily execute intent parsing using different models
- Manage Multiple Agents in one place

## Getting Started

Rasa UI can run on your Rasa instance, or on a separate machine. Technically Rasa is not required, you could just use the UI for managing training data.


### Prerequisites

[Node.js/npm](https://nodejs.org/en/) - Serves Rasa UI - Required
[Rasa](https://github.com/RasaHQ/rasa) - Developed against Version 1.2+ - Optional

### Installing

Clone/download the Rasa UI repository
Install npm packages.
Set Rasa Server variable in package.json

```
git clone https://github.com/paschmann/rasaui.git
cd rasaui && npm install
```

Please see the [wiki](https://github.com/paschmann/rasa-ui/wiki/Rasa-UI-Install-Guide) for more detailed instructions.

## Running
Run npm start from the server folder (rasa-ui)

```
npm start
```
Your web application should be available on http://localhost:5001

## Logging

Since Rasa UI can be used to log events/intent parsing/training etc. we would suggest changing your endpoints for your API calls to "pass through" Rasa UI. All API requests are simply logged, forwarded to Rasa and then returned.

e.g. Instead of POST'ing to your Rasa instance (e.g. http://localhost:5005/model/parse?q=hello) you can POST to Rasa UI (e.g. http://localhost:5001/api/v2/rasa/model/parse?q=hello)

## Contributing

Please read [contributing.md](contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Contributers

Rasa UI is possible thanks to all the awesome contributers, thank you!

* **Pradeep Mamillapalli**
* **elvay1**
* **huberrom**
* **ClaasBrueggemann**
* **btran10**
* **btotharye**
* **beevelop**

## License

This project is licensed under the MIT License - see the [license](license) file for details
