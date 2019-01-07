SET search_path TO rasa_ui;

-- nlu_parse_log correspondance table with entities table 
CREATE TABLE IF NOT EXISTS messages_entities
(
  message_id integer,
  entity_id integer,
  entity_start integer NOT NULL,
  entity_end integer NOT NULL,
  entity_value varchar,
  entity_confidence integer NOT NULL,
  CONSTRAINT message_entity_pkey PRIMARY KEY (message_id, entity_id, entity_start, entity_end),
  CONSTRAINT message_fkey FOREIGN KEY (message_id) REFERENCES messages (messages_id) ON DELETE CASCADE,
  CONSTRAINT entity_fkey FOREIGN KEY (entity_id) REFERENCES entities (entity_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;  

GRANT ALL ON TABLE messages_entities TO ${postgres_user};

ALTER TABLE IF EXISTS messages ADD COLUMN intent_id integer;
ALTER TABLE IF EXISTS messages ADD CONSTRAINT intent_fkey FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE SET NULL;

CREATE OR REPLACE VIEW messages_expressions AS 
SELECT agents.agent_id, agents.agent_name, 
msg.messages_id, msg.timestamp, msg.user_id, msg.user_name, msg.message_text, msg.message_rich, msg.user_message_ind, 
intents.intent_id, intents.intent_name,
expressions.expression_id
FROM messages AS msg
INNER JOIN agents ON msg.agent_id = agents.agent_id
LEFT OUTER JOIN intents ON msg.intent_id = intents.intent_id
LEFT JOIN expressions ON (intents.intent_id = expressions.intent_id) AND (msg.message_text = expressions.expression_text)
ORDER BY timestamp, user_id;

GRANT ALL ON TABLE messages_expressions TO ${postgres_user};

CREATE OR REPLACE VIEW entities_parameters AS 
SELECT
agents.agent_id, agents.agent_name,
msg.messages_id, msg.timestamp, msg.user_id, msg.user_name, msg.message_text, msg.user_message_ind, 
entities.entity_id, entities.entity_name, entities.slot_data_type,
msgEnt.entity_start, msgEnt.entity_end,
param.parameter_value, param.parameter_id
FROM messages AS msg
INNER JOIN agents ON msg.agent_id = agents.agent_id
LEFT OUTER JOIN messages_entities AS msgEnt ON msg.messages_id = msgEnt.message_id 
LEFT OUTER JOIN entities ON msgEnt.entity_id = entities.entity_id 
LEFT OUTER JOIN intents ON msg.intent_id = intents.intent_id
LEFT OUTER JOIN expressions ON (intents.intent_id = expressions.intent_id) AND (msg.message_text = expressions.expression_text)
LEFT OUTER JOIN parameters AS param ON (msgEnt.entity_id = param.entity_id) AND (msgEnt.entity_value = param.parameter_value) AND (param.expression_id = expressions.expression_id)
ORDER BY timestamp, user_id;

GRANT ALL ON TABLE entities_parameters TO ${postgres_user};
