/*Alters after release 1.0 version*/

CREATE SEQUENCE public.actions_action_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

GRANT ALL ON SEQUENCE public.actions_action_id_seq TO ${postgres_user};

CREATE SEQUENCE public.core_parse_log_core_parse_log_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

GRANT ALL ON SEQUENCE public.core_parse_log_core_parse_log_id_seq TO ${postgres_user};

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

GRANT ALL ON TABLE public.actions TO ${postgres_user};

CREATE TABLE public.core_parse_log
(
  core_parse_log_id integer NOT NULL DEFAULT nextval('core_parse_log_core_parse_log_id_seq'::regclass),
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  agent_id integer,
  request_text character varying COLLATE pg_catalog."default",
  action_data jsonb[],
  tracker_data jsonb[],
  response_text jsonb[],
  response_rich_data jsonb[],
  user_id character varying COLLATE pg_catalog."default",
  user_name character varying COLLATE pg_catalog."default",
  user_response_time_ms integer,
  core_response_time_ms integer,
  CONSTRAINT core_parse_log_id PRIMARY KEY (core_parse_log_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

GRANT ALL ON TABLE public.core_parse_log TO ${postgres_user};

ALTER TABLE public.responses ADD COLUMN action_id integer;
ALTER TABLE public.responses ADD COLUMN buttons_info jsonb;
ALTER TABLE public.responses ADD COLUMN response_image_url character varying COLLATE pg_catalog."default";
ALTER TABLE public.responses ALTER COLUMN intent_id DROP NOT NULL;

ALTER TABLE public.agents ADD COLUMN story_details text COLLATE pg_catalog."default";
ALTER TABLE public.agents ADD COLUMN rasa_core_enabled boolean DEFAULT FALSE;

ALTER TABLE public.entities ADD COLUMN slot_data_type character varying COLLATE pg_catalog."default" NOT NULL default 'NOT_USED';
ALTER TABLE public.entities ADD COLUMN agent_id integer;
