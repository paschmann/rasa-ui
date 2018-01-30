const process = require("process");

// Default config is loaded from package.json
// npm_package_config cannot be overridden by env variables
const config = {
    rasaserver: process.env.npm_package_config_rasaserver,
    jwtsecret: process.env.npm_package_config_jwtsecret,
    postgresConnectionString: process.env.npm_package_config_postgresConnectionString
};

// ENV key to config key mapping
const envKeyToConfigKey = {
    RASA_UI_RASASERVER : "rasaserver",
    RASA_UI_JWTSECRET : "jwtsecret",
    RASA_UI_POSTGRESCONNECTION : "postgresConnectionString"
};

// Override config by ENV variables
Object.keys(envKeyToConfigKey).forEach(function(envKey){
    const configKey = envKeyToConfigKey[envKey];
    const configValue = process.env[envKey];
    if(configValue){
        config[configKey] = configValue;
    }
});

module.exports = config;
