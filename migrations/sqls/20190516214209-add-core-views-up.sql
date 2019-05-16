/* Views */
CREATE OR REPLACE VIEW intents_most_used AS
select intent_name, agents.agent_id, agents.agent_name, grouped_intents.grp_intent_count from intents
left outer join (select count(*) as grp_intent_count, nlu_parse_log.intent_name as grp_intent,messages.agent_id as grp_agent_id from nlu_parse_log, messages
where nlu_parse_log.messages_id=messages.messages_id group by nlu_parse_log.intent_name,grp_agent_id) as grouped_intents
on intent_name = grouped_intents.grp_intent, agents where intents.agent_id=agents.agent_id  order by agents.agent_id;

CREATE OR REPLACE VIEW avg_nlu_response_times_30_days AS
select round(avg(nlu_response_time_ms)::integer,0),
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) asc
LIMIT 30;

CREATE OR REPLACE VIEW avg_user_response_times_30_days AS
select round(avg(user_response_time_ms)::integer,0),
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) asc
LIMIT 30;

CREATE OR REPLACE VIEW active_user_count_12_months AS
select count(distinct(messages.user_id)) as count_users,
(to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) as month_year from nlu_parse_log, messages where nlu_parse_log.messages_id=messages.messages_id
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/YYYY'::text)) asc LIMIT 12;

CREATE OR REPLACE VIEW active_user_count_30_days AS
SELECT count(distinct(messages.user_id)) as user_count,
(to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) as month_date from nlu_parse_log, messages where nlu_parse_log.messages_id=messages.messages_id
GROUP BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_parse_log."timestamp", 'MM/DD'::text)) asc
LIMIT 30;

CREATE OR REPLACE VIEW expression_parameters AS
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

CREATE OR REPLACE VIEW intent_usage_total AS
SELECT count(*) AS count
FROM nlu_log
WHERE nlu_log.event_type::text = 'parse'::text;

CREATE OR REPLACE VIEW request_usage_total AS
SELECT count(*) AS count
FROM nlu_log;

CREATE OR REPLACE VIEW unique_intent_entities AS
SELECT DISTINCT intents.intent_id,
entities.entity_name
FROM entities
RIGHT JOIN parameters ON parameters.entity_id = entities.entity_id
RIGHT JOIN expressions ON expressions.expression_id = parameters.expression_id
JOIN intents ON intents.intent_id = expressions.intent_id;

CREATE OR REPLACE VIEW intent_usage_by_day AS
SELECT count(*) AS count,
to_char(nlu_log."timestamp", 'MM/DD'::text) AS to_char
FROM nlu_log
GROUP BY (to_char(nlu_log."timestamp", 'MM/DD'::text))
ORDER BY (to_char(nlu_log."timestamp", 'MM/DD'::text)) asc
LIMIT 30;

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

/*
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA rasa_ui TO :postgres_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA rasa_ui TO :postgres_user;
*/