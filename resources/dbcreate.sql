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

CREATE SEQUENCE public.nlu_log_log_id_seq
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
  CONSTRAINT agent_pkey PRIMARY KEY (agent_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public.entities
(
  entity_name character varying COLLATE pg_catalog."default",
  entity_id integer NOT NULL DEFAULT nextval('entities_entity_id_seq'::regclass)
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

CREATE TABLE public.responses
(
  intent_id integer NOT NULL,
  response_text character varying COLLATE pg_catalog."default",
  response_type integer,
  response_id integer NOT NULL DEFAULT nextval('responses_response_id_seq'::regclass)
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
  intent_id integer NOT NULL DEFAULT nextval('intents_intent_id_seq'::regclass)
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
  ORDER BY (to_char(nlu_log."timestamp", 'MM/DD'::text))
 LIMIT 30;
