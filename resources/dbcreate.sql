CREATE SCHEMA public
AUTHORIZATION postgres;

COMMENT ON SCHEMA public
IS 'standard public schema';

GRANT ALL ON SCHEMA public TO postgres;

GRANT ALL ON SCHEMA public TO PUBLIC;

/* Sequences */

CREATE SEQUENCE public.agentidgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.agents_agent_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.entities_entity_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.entityidgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.expressionidgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.expressions_expression_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.intentidgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.intents_intent_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.actions_action_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.nlu_log_log_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.parse_log_parse_log_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.parameteridgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.parameters_parameter_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.responseidgen
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.responses_response_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.response_type_response_type_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.synonym_variant_synonym_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

CREATE SEQUENCE public.synonyms_synonym_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;


/*  Tables */

CREATE TABLE public.agents
(
  agent_id integer NOT NULL DEFAULT nextval('agents_agent_id_seq'::regclass),
  agent_name character varying COLLATE pg_catalog."default",
  endpoint_enabled boolean DEFAULT FALSE,
  endpoint_url character varying COLLATE pg_catalog."default",
  basic_auth_username character varying COLLATE pg_catalog."default",
  basic_auth_password character varying COLLATE pg_catalog."default",
  client_secret_key text NOT NULL default md5(random()::text),
  CONSTRAINT agent_pkey PRIMARY KEY (agent_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.entities
(
    entity_id integer NOT NULL DEFAULT nextval('entities_entity_id_seq'::regclass),
    entity_name character varying COLLATE pg_catalog."default",
    agent_id integer NOT NULL,
    slot_data_type character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'NOT_USED'::character varying,
    CONSTRAINT entities_pkey PRIMARY KEY (entity_id),
    CONSTRAINT agent_pk FOREIGN KEY (agent_id)
        REFERENCES public.agents (agent_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.synonyms
(
  synonym_id integer NOT NULL DEFAULT nextval('synonyms_synonym_id_seq'::regclass),
  entity_id integer NOT NULL,
  synonym_reference character varying COLLATE pg_catalog."default" NOT NULL,
  CONSTRAINT synonyms_pkey PRIMARY KEY (synonym_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.synonym_variant
(
  synonym_variant_id integer NOT NULL DEFAULT nextval('synonym_variant_synonym_id_seq'::regclass),
  synonym_value character varying COLLATE pg_catalog."default",
  synonym_id integer,
  CONSTRAINT synonym_variant_pkey PRIMARY KEY (synonym_variant_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.settings
(
  setting_name character varying COLLATE pg_catalog."default",
  setting_value character varying COLLATE pg_catalog."default"
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.response_type
(
  response_type_id integer NOT NULL DEFAULT nextval('response_type_response_type_id_seq'::regclass),
  response_type_text character varying COLLATE pg_catalog."default",
  CONSTRAINT response_type_id_pk PRIMARY KEY (response_type_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.responses
(
  response_id integer NOT NULL DEFAULT nextval('responses_response_id_seq'::regclass),
  intent_id integer,
  action_id integer,
  buttons_info jsonb,
  response_image_url character varying COLLATE pg_catalog."default",
  response_text character varying COLLATE pg_catalog."default",
  response_type integer REFERENCES response_type (response_type_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.parameters
(
  parameter_required boolean,
  parameter_value character varying COLLATE pg_catalog."default",
  expression_id integer NOT NULL,
  parameter_start integer NOT NULL,
  parameter_end integer NOT NULL,
  entity_id integer,
  parameter_id integer NOT NULL DEFAULT nextval('parameters_parameter_id_seq'::regclass)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.nlu_parse_log
(
  parse_log_id integer NOT NULL DEFAULT nextval('parse_log_parse_log_id_seq'::regclass),
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  agent_id integer,
  request_text character varying COLLATE pg_catalog."default",
  intent_name character varying COLLATE pg_catalog."default",
  entity_data jsonb,
  response_text character varying COLLATE pg_catalog."default",
  response_rich_data jsonb,
  intent_confidence_pct integer,
  user_id character varying COLLATE pg_catalog."default",
  user_name character varying COLLATE pg_catalog."default",
  user_response_time_ms integer,
  nlu_response_time_ms integer,
  CONSTRAINT parse_log_id_pkey PRIMARY KEY (parse_log_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.nlu_log
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

CREATE TABLE public.intents
(
  intent_name character varying COLLATE pg_catalog."default" NOT NULL,
  agent_id integer,
  endpoint_enabled boolean,
  intent_id integer NOT NULL DEFAULT nextval('intents_intent_id_seq'::regclass)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.actions
(
  action_name character varying COLLATE pg_catalog."default" NOT NULL,
  agent_id integer,
  action_id integer NOT NULL DEFAULT nextval('actions_action_id_seq'::regclass)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;


CREATE TABLE public.expressions
(
  intent_id integer NOT NULL,
  expression_text character varying COLLATE pg_catalog."default" NOT NULL,
  expression_id integer NOT NULL DEFAULT nextval('expressions_expression_id_seq'::regclass)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;


/* Views */
CREATE OR REPLACE VIEW public.intents_most_used AS
select intent_name, agents.agent_id, agents.agent_name, grouped_intents.grp_intent_count from intents
left outer join (select count(*) as grp_intent_count, intent_name as grp_intent,agent_id as grp_agent_id from nlu_parse_log
group by (intent_name,agent_id)) as grouped_intents
on intent_name = grouped_intents.grp_intent, agents where intents.agent_id=agents.agent_id  order by agents.agent_id;

CREATE OR REPLACE VIEW public.avg_nlu_response_times_30_days AS
select round(avg(nlu_response_time_ms)::integer,0),
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) desc
LIMIT 30;

CREATE OR REPLACE VIEW public.avg_user_response_times_30_days AS
select round(avg(user_response_time_ms)::integer,0),
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) desc
LIMIT 30;

CREATE OR REPLACE VIEW public.active_user_count_12_months AS
select count(distinct(user_id)) as count_users,
(to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) as month_year from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) desc
LIMIT 12;

CREATE OR REPLACE VIEW public.active_user_count_30_days AS
SELECT count(distinct(user_id)) as user_count,
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) desc
LIMIT 30;

CREATE OR REPLACE VIEW public.entity_synonym_variants AS
SELECT synonyms.entity_id,
synonyms.synonym_id,
synonym_variant.synonym_variant_id,
synonym_variant.synonym_value,
synonyms.synonym_reference
FROM synonym_variant
JOIN synonyms ON synonyms.synonym_id = synonym_variant.synonym_id;


CREATE OR REPLACE VIEW public.expression_parameters AS
SELECT parameters.expression_id,
parameters.parameter_required,
parameters.parameter_value,
parameters.parameter_start,
parameters.parameter_end,
parameters.entity_id,
parameters.parameter_id,
expressions.intent_id,
entities.entity_name
FROM parameters
JOIN expressions ON parameters.expression_id = expressions.expression_id
LEFT JOIN entities ON entities.entity_id = parameters.entity_id;


CREATE OR REPLACE VIEW public.intent_usage_total AS
SELECT count(*) AS count
FROM nlu_log
WHERE nlu_log.event_type::text = 'parse'::text;

CREATE OR REPLACE VIEW public.request_usage_total AS
SELECT count(*) AS count
FROM nlu_log;

CREATE OR REPLACE VIEW public.unique_intent_entities AS
SELECT DISTINCT intents.intent_id,
entities.entity_name
FROM entities
RIGHT JOIN parameters ON parameters.entity_id = entities.entity_id
RIGHT JOIN expressions ON expressions.expression_id = parameters.expression_id
JOIN intents ON intents.intent_id = expressions.intent_id;

CREATE OR REPLACE VIEW public.intent_usage_by_day AS
SELECT count(*) AS count,
to_char(nlu_log."timestamp", 'MM/DD'::text) AS to_char
FROM nlu_log
GROUP BY (to_char(nlu_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_log."timestamp", 'MM/DD'::text)) desc
LIMIT 30;

/* Static Data */
INSERT INTO response_type (response_type_text) VALUES ('DEFAULT'),('RICH TEXT');
