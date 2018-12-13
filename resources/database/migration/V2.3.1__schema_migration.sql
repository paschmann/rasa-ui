-- Create schema
CREATE SCHEMA IF NOT EXISTS "rasa_ui";
COMMENT ON SCHEMA "rasa_ui" IS 'Standard rasa UI schema';
GRANT ALL ON SCHEMA "rasa_ui" TO ${postgres_user};


-- Migrate tables views and sequences to rasa_ui schema.
ALTER SEQUENCE IF EXISTS agentidgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS agents_agent_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS entities_entity_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS entityidgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS expressionidgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS expressions_expression_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS intentidgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS intents_intent_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS actions_action_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS nlu_log_log_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS parse_log_parse_log_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS core_parse_log_core_parse_log_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS messages_messages_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS parameteridgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS parameters_parameter_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS responseidgen SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS responses_response_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS response_type_response_type_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS synonym_variant_synonym_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS synonyms_synonym_id_seq SET SCHEMA rasa_ui;
ALTER SEQUENCE IF EXISTS regex_id_seq SET SCHEMA rasa_ui;

ALTER TABLE IF EXISTS agents SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS entities SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS synonyms SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS synonym_variant SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS settings SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS regex SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS response_type SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS responses SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS parameters SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS messages SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS nlu_parse_log SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS core_parse_log SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS nlu_log SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS intents SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS actions SET SCHEMA rasa_ui;
ALTER TABLE IF EXISTS expressions SET SCHEMA rasa_ui;

ALTER VIEW IF EXISTS intents_most_used SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS avg_nlu_response_times_30_days SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS avg_user_response_times_30_days SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS active_user_count_12_months SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS active_user_count_30_days SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS entity_synonym_variants SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS expression_parameters SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS intent_usage_total SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS request_usage_total SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS unique_intent_entities SET SCHEMA rasa_ui;
ALTER VIEW IF EXISTS intent_usage_by_day SET SCHEMA rasa_ui;


DO $$
BEGIN
  EXECUTE 'ALTER DATABASE '|| current_database()||' set search_path TO rasa_ui,''$user'',public';
END $$
