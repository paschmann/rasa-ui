const sqlite3 = require('sqlite3').verbose();
const logger = require('../util/logger');

var db_file_path = "";

if (process.env.npm_lifecycle_event == 'test:server') {
  db_file_path = "server/test/db/test_db.sqlite3";
  try {
    fs.unlinkSync(db_file_path);
    //file removed
  } catch(err) {
    //console.error(err)
  }
} else {
  db_file_path = "server/data/db.sqlite3";
}

let db = new sqlite3.Database(db_file_path, (err) => { 
  if (err) { 
    logger.winston.error('Error when connecting to the Database.', err) 
  } else { 
    logger.winston.info('Database connected!');
    checkDBSchema();
  } 
})

function checkDBSchema() {
  //Get version of DB Schema from version table, if != to version, suggest upgrade
  db.all("SELECT * from version", function(err, rows) {
    if (err && err.errno == 1) {
      createDBSchema();
    } else {
      if (rows.length > 0 && rows[0].version == global.db_schema) {
        logger.winston.info("Schema version v" + rows[0].version + " matches package.json schema version v" + global.db_schema); 
      } else {
        var current_version = "?";
        if (rows.length > 0) {
          current_version = rows[0].version;
        }
        logger.winston.warn("Schema version v" + current_version + " DOES NOT match package.json schema version v" + global.db_schema);
        if (global.db_autoupdate == "true") {
          createDBSchema();
        } else {
          logger.winston.error("Please upgrade your schema");
        }
      }
    }
  });
}

async function createDBSchema() { 
  try {
    logger.winston.info("------------------------- Starting to create/update DB schema -------------------------");
    await Promise.all([
      db.run("CREATE TABLE  bots (bot_id INTEGER PRIMARY KEY AUTOINCREMENT, bot_name TEXT, bot_config TEXT, output_folder TEXT)", function(error) { sqlOutput(error, "bots"); }),
      db.run("CREATE TABLE  intents (intent_id INTEGER PRIMARY KEY AUTOINCREMENT, intent_name TEXT, bot_id INTEGER)", function(error) { sqlOutput(error, "intents"); }),
      db.run("CREATE TABLE  synonyms (synonym_id INTEGER PRIMARY KEY AUTOINCREMENT, synonym_reference TEXT, regex_pattern TEXT, bot_id INTEGER)", function(error) { sqlOutput(error, "synonyms"); }),
      db.run("CREATE TABLE  entities (entity_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_name TEXT, slot_data_type TEXT, bot_id INTEGER)", function(error) { sqlOutput(error, "entities"); }),
      db.run("CREATE TABLE  expressions (expression_id INTEGER PRIMARY KEY AUTOINCREMENT, expression_text TEXT, intent_id INTEGER)", function(error) { sqlOutput(error, "expressions"); }),
      db.run("CREATE TABLE  expression_parameters (parameter_id INTEGER PRIMARY KEY AUTOINCREMENT, parameter_start INTEGER, parameter_end INTEGER, parameter_value TEXT, expression_id INTEGER, intent_id INTEGER, entity_id INTEGER)", function(error) { sqlOutput(error, "expression_parameters"); }),
      db.run("CREATE TABLE  regex (regex_id INTEGER PRIMARY KEY AUTOINCREMENT, regex_name TEXT, regex_pattern TEXT, bot_id INTEGER)", function(error) { sqlOutput(error, "regex"); }),
      db.run("CREATE TABLE  responses (response_id INTEGER PRIMARY KEY AUTOINCREMENT, response_text TEXT, response_type TEXT, action_id INTEGER)", function(error) { sqlOutput(error, "responses"); }),
      db.run("CREATE TABLE  synonym_variants (synonym_variant_id INTEGER PRIMARY KEY AUTOINCREMENT, synonym_value TEXT, synonym_id INTEGER)", function(error) { sqlOutput(error, "synonym_variants"); }),
      db.run("CREATE TABLE  nlu_log (log_id INTEGER PRIMARY KEY AUTOINCREMENT, ip_address TEXT, query TEXT, event_type TEXT, event_data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)", function(error) { sqlOutput(error, "nlu_log"); }),
      db.run("CREATE TABLE  models (model_id INTEGER PRIMARY KEY AUTOINCREMENT, model_name TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, comment TEXT, bot_id INTEGER, local_path TEXT, server_path TEXT, server_response TEXT)", function(error) { sqlOutput(error, "models"); }),
      db.run("CREATE TABLE  actions (action_id INTEGER PRIMARY KEY AUTOINCREMENT, action_name TEXT, bot_id INTEGER)", function(error) { sqlOutput(error, "actions"); }),
      db.run("CREATE TABLE  stories (story_id INTEGER PRIMARY KEY AUTOINCREMENT, story_name TEXT, story TEXT, bot_id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)", function(error) { sqlOutput(error, "stories"); }),
      
      db.run("CREATE TABLE  settings (setting_name TEXT, setting_value TEXT)", function(error) {
        sqlOutput(error, "settings");
        db.run("INSERT into settings (setting_name, setting_value) values ('refresh_time', '60000')"); 
      }),

      //New table part of Version 3.0.1
      db.run("CREATE TABLE  conversations (conversation_id INTEGER PRIMARY KEY AUTOINCREMENT, ip_address TEXT, conversation TEXT, story TEXT, bot_id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)", function(error) { sqlOutput(error, "conversations"); }),    

      db.run("CREATE TABLE  version(version)", function(error) { setDBSchemaVersion(error); })
    ]);
  } catch (err) {
    logger.winston.error(err);
  }
}

function sqlOutput(error, table_name) {
  if (!error) {
    logger.winston.info("Table: " + table_name + " created");
  }
}

function setDBSchemaVersion(error) {
  if (error) {
    db.run("UPDATE version set version = ?", global.db_schema);
    logger.winston.info("Database Schema updated to v" + global.db_schema + " "); 
  } else {
    db.run("INSERT into version (version) values (?)", global.db_schema);
    logger.winston.info("Database Schema v" + global.db_schema + " created"); 
  }
}

module.exports = db; 