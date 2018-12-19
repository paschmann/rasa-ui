SET search_path TO rasa_ui;

-- nlu_parse_log correspondance table with entities table 
CREATE TABLE messages_entities
(
  message_id integer,
  entity_id integer,
  entity_start integer NOT NULL,
  entity_end integer NOT NULL,
  entity_confidence integer NOT NULL,
  CONSTRAINT message_entity_pkey PRIMARY KEY (message_id, entity_id, entity_start, entity_end),
  CONSTRAINT message_fkey FOREIGN KEY (message_id) REFERENCES messages (messages_id) ON DELETE CASCADE,
  CONSTRAINT entity_fkey FOREIGN KEY (entity_id) REFERENCES entities (entity_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;  

-- messages correspondance with intents table 
CREATE TABLE messages_intents
(
  message_id integer,
  intent_id integer,
  intent_confidence integer NOT NULL,
  CONSTRAINT message_intent_pkey PRIMARY KEY (message_id, intent_id),
  CONSTRAINT message_fkey FOREIGN KEY (message_id) REFERENCES messages (messages_id) ON DELETE CASCADE,
  CONSTRAINT intent_fkey FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;  
