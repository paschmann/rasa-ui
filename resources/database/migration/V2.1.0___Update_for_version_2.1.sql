/*Alters after release 2.1 version*/
CREATE SEQUENCE public.messages_messages_id_seq
INCREMENT 1
START 1
MINVALUE 1
MAXVALUE 9223372036854775807
CACHE 1;

GRANT ALL ON SEQUENCE public.messages_messages_id_seq TO ${postgres_user};

CREATE TABLE public.messages
(
  messages_id integer NOT NULL DEFAULT nextval('messages_messages_id_seq'::regclass),
  "timestamp" timestamp without time zone DEFAULT timezone('utc'::text, now()),
  agent_id integer,
  user_id character varying COLLATE pg_catalog."default",
  user_name character varying COLLATE pg_catalog."default",
  message_text character varying COLLATE pg_catalog."default",
  message_rich jsonb,
  user_message_ind boolean,
  CONSTRAINT messages_id_pkey PRIMARY KEY (messages_id)
)
WITH (
  OIDS = FALSE
)
TABLESPACE pg_default;

GRANT ALL ON TABLE public.messages TO ${postgres_user};

DROP VIEW public.intents_most_used;
DROP VIEW public.active_user_count_12_months;
DROP VIEW public.active_user_count_30_days;

ALTER TABLE public.nlu_parse_log ADD COLUMN messages_id integer;
ALTER TABLE public.nlu_parse_log ADD CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES public.messages (messages_id) MATCH FULL;
ALTER TABLE public.nlu_parse_log DROP COLUMN agent_id RESTRICT;

ALTER TABLE public.nlu_parse_log DROP COLUMN request_text RESTRICT;
ALTER TABLE public.nlu_parse_log DROP COLUMN response_text RESTRICT;
ALTER TABLE public.nlu_parse_log DROP COLUMN response_rich_data RESTRICT;
ALTER TABLE public.nlu_parse_log DROP COLUMN user_id RESTRICT;
ALTER TABLE public.nlu_parse_log DROP COLUMN user_name RESTRICT;

ALTER TABLE public.core_parse_log ADD COLUMN messages_id integer;
ALTER TABLE public.core_parse_log ADD CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES public.messages (messages_id) MATCH FULL;
ALTER TABLE public.core_parse_log DROP COLUMN agent_id RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN request_text RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN response_text RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN response_rich_data RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN user_id RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN user_name RESTRICT;
ALTER TABLE public.core_parse_log DROP COLUMN tracker_data RESTRICT;
ALTER TABLE public.core_parse_log ADD COLUMN slots_data jsonb;
ALTER TABLE public.core_parse_log DROP COLUMN action_data;
ALTER TABLE public.core_parse_log ADD COLUMN action_name character varying COLLATE pg_catalog."default";

CREATE OR REPLACE VIEW public.intents_most_used AS
select intent_name, agents.agent_id, agents.agent_name, grouped_intents.grp_intent_count from intents
left outer join (select count(*) as grp_intent_count, nlu_parse_log.intent_name as grp_intent,messages.agent_id as grp_agent_id from nlu_parse_log, messages
where nlu_parse_log.messages_id=messages.messages_id group by nlu_parse_log.intent_name,grp_agent_id) as grouped_intents
on intent_name = grouped_intents.grp_intent, agents where intents.agent_id=agents.agent_id  order by agents.agent_id;

GRANT ALL ON TABLE public.intents_most_used TO ${postgres_user};

CREATE OR REPLACE VIEW public.active_user_count_12_months AS
select count(distinct(messages.user_id)) as count_users,
(to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) as month_year from nlu_parse_log, messages where nlu_parse_log.messages_id=messages.messages_id
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) asc LIMIT 12;

GRANT ALL ON TABLE public.active_user_count_12_months TO ${postgres_user};

CREATE OR REPLACE VIEW public.active_user_count_30_days AS
SELECT count(distinct(messages.user_id)) as user_count,
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log, messages where nlu_parse_log.messages_id=messages.messages_id
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) asc
LIMIT 30;

GRANT ALL ON TABLE public.active_user_count_30_days TO ${postgres_user};
