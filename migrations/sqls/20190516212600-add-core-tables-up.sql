CREATE TABLE agents
(
  agent_id integer NOT NULL DEFAULT nextval('agents_agent_id_seq'::regclass),
  agent_name character varying COLLATE pg_catalog."default",
  endpoint_enabled boolean DEFAULT FALSE,
  rasa_core_enabled boolean DEFAULT FALSE,
  endpoint_url character varying COLLATE pg_catalog."default",
  basic_auth_username character varying COLLATE pg_catalog."default",
  basic_auth_password character varying COLLATE pg_catalog."default",
  client_secret_key text NOT NULL default md5(random()::text),
  story_details text COLLATE pg_catalog."default",
  rasa_nlu_pipeline character varying COLLATE pg_catalog."default" DEFAULT 'spacy_sklearn',
  rasa_nlu_language character varying COLLATE pg_catalog."default" DEFAULT 'en',
  rasa_nlu_fixed_model_name character varying COLLATE pg_catalog."default",
  CONSTRAINT agent_pkey PRIMARY KEY (agent_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE intents
(
  intent_name character varying COLLATE pg_catalog."default" NOT NULL,
  agent_id integer,
  endpoint_enabled boolean,
  intent_id integer NOT NULL DEFAULT nextval('intents_intent_id_seq'::regclass),
  CONSTRAINT intent_pkey PRIMARY KEY (intent_id),
  CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE entities
(
    entity_id integer NOT NULL DEFAULT nextval('entities_entity_id_seq'::regclass),
    entity_name character varying COLLATE pg_catalog."default",
    agent_id integer NOT NULL,
    slot_data_type character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'NOT_USED'::character varying,
    CONSTRAINT entity_pkey PRIMARY KEY (entity_id),
    CONSTRAINT agent_fkey FOREIGN KEY (agent_id)
        REFERENCES agents (agent_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE synonyms
(
  synonym_id integer NOT NULL DEFAULT nextval('synonyms_synonym_id_seq'::regclass),
  agent_id integer NOT NULL,
  synonym_reference character varying COLLATE pg_catalog."default" NOT NULL,
  CONSTRAINT synonyms_pkey PRIMARY KEY (synonym_id),
  CONSTRAINT agent_fkey FOREIGN KEY (agent_id) 
      REFERENCES agents (agent_id) 
      ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE synonym_variant
(
  synonym_variant_id integer NOT NULL DEFAULT nextval('synonym_variant_synonym_id_seq'::regclass),
  synonym_value character varying COLLATE pg_catalog."default",
  synonym_id integer,
  CONSTRAINT synonym_variant_pkey PRIMARY KEY (synonym_variant_id),
  CONSTRAINT synonym_fkey FOREIGN KEY (synonym_id) 
      REFERENCES synonyms (synonym_id) 
      ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE settings
(
  setting_name character varying COLLATE pg_catalog."default",
  setting_value character varying COLLATE pg_catalog."default"
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE regex
(
  regex_id integer NOT NULL DEFAULT nextval('regex_id_seq'::regclass),
  regex_name character varying COLLATE pg_catalog."default",
  regex_pattern character varying COLLATE pg_catalog."default",
  agent_id integer NOT NULL,
  CONSTRAINT regex_id_pk PRIMARY KEY (regex_id),
  CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE response_type
(
  response_type_id integer NOT NULL DEFAULT nextval('response_type_response_type_id_seq'::regclass),
  response_type_text character varying COLLATE pg_catalog."default",
  CONSTRAINT response_type_id_pk PRIMARY KEY (response_type_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE actions
(
  action_name character varying COLLATE pg_catalog."default" NOT NULL,
  agent_id integer,
  action_id integer NOT NULL DEFAULT nextval('actions_action_id_seq'::regclass),
  CONSTRAINT action_pkey PRIMARY KEY (action_id),
  CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE responses
(
  response_id integer NOT NULL DEFAULT nextval('responses_response_id_seq'::regclass),
  intent_id integer,
  action_id integer,
  buttons_info jsonb,
  response_image_url character varying COLLATE pg_catalog."default",
  response_text character varying COLLATE pg_catalog."default",
  response_type integer,
  CONSTRAINT response_pkey PRIMARY KEY (response_id),
  CONSTRAINT intent_fkey FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE CASCADE,
  CONSTRAINT action_fkey FOREIGN KEY (action_id) REFERENCES actions (action_id) ON DELETE CASCADE,
  CONSTRAINT responses_response_type_fkey FOREIGN KEY (response_type) REFERENCES response_type (response_type_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE expressions
(
  intent_id integer NOT NULL,
  expression_text character varying COLLATE pg_catalog."default" NOT NULL,
  expression_id integer NOT NULL DEFAULT nextval('expressions_expression_id_seq'::regclass),
  CONSTRAINT expression_pkey PRIMARY KEY (expression_id),
  CONSTRAINT intent_fkey FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE parameters
(
  parameter_required boolean,
  parameter_value character varying COLLATE pg_catalog."default",
  expression_id integer NOT NULL,
  parameter_start integer NOT NULL,
  parameter_end integer NOT NULL,
  entity_id integer,
  parameter_id integer NOT NULL DEFAULT nextval('parameters_parameter_id_seq'::regclass),
  CONSTRAINT parameter_pkey PRIMARY KEY (parameter_id),
  CONSTRAINT expression_fkey FOREIGN KEY (expression_id) REFERENCES expressions (expression_id) ON DELETE CASCADE,
  CONSTRAINT entity_fkey FOREIGN KEY (entity_id) REFERENCES entities (entity_id) ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;


CREATE TABLE messages
(
  messages_id integer NOT NULL DEFAULT nextval('messages_messages_id_seq'::regclass),
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  agent_id integer,
  user_id character varying COLLATE pg_catalog."default",
  user_name character varying COLLATE pg_catalog."default",
  message_text character varying COLLATE pg_catalog."default",
  message_rich jsonb,
  user_message_ind boolean,
  intent_id integer,
  CONSTRAINT messages_id_pkey PRIMARY KEY (messages_id),
  CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE,
  CONSTRAINT intent_fkey FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE SET NULL
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;


CREATE TABLE nlu_parse_log
(
  parse_log_id integer NOT NULL DEFAULT nextval('parse_log_parse_log_id_seq'::regclass),
  messages_id integer NOT NULL,
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  intent_name character varying COLLATE pg_catalog."default",
  entity_data jsonb,
  intent_confidence_pct integer,
  user_response_time_ms integer,
  nlu_response_time_ms integer,
  CONSTRAINT parse_log_id_pkey PRIMARY KEY (parse_log_id),
  CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES messages (messages_id) MATCH FULL ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE core_parse_log
(
  core_parse_log_id integer NOT NULL DEFAULT nextval('core_parse_log_core_parse_log_id_seq'::regclass),
  messages_id integer NOT NULL,
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  action_name character varying COLLATE pg_catalog."default",
  slots_data jsonb,
  user_response_time_ms integer,
  core_response_time_ms integer,
  CONSTRAINT core_parse_log_id PRIMARY KEY (core_parse_log_id),
  CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES messages (messages_id) MATCH FULL ON DELETE CASCADE
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE nlu_log
(
  log_id integer NOT NULL DEFAULT nextval('nlu_log_log_id_seq'::regclass),
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  ip_address character varying COLLATE pg_catalog."default",
  query character varying COLLATE pg_catalog."default",
  event_data character varying COLLATE pg_catalog."default",
  event_type character varying COLLATE pg_catalog."default",
  CONSTRAINT nlu_log_pkey PRIMARY KEY (log_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

-- nlu_parse_log correspondance table with entities table 
CREATE TABLE messages_entities
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

/* Static Data */
INSERT INTO response_type (response_type_text) VALUES ('DEFAULT'),('RICH TEXT');
INSERT INTO settings (setting_name,setting_value) VALUES ('refresh_time',60000);