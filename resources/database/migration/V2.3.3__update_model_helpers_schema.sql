/* Multiple Alter to entities, regex and agents */
SET search_path TO rasa_ui;

DROP VIEW IF EXISTS entity_synonym_variants;

ALTER TABLE IF EXISTS synonyms DROP CONSTRAINT entity_fkey;
ALTER TABLE IF EXISTS synonyms DROP COLUMN entity_id;
ALTER TABLE IF EXISTS synonyms ADD COLUMN agent_id INTEGER;
ALTER TABLE IF EXISTS synonyms ADD CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS regex ADD COLUMN agent_id INTEGER;
ALTER TABLE IF EXISTS regex ADD CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE;

-- Alter Agent Table
ALTER TABLE agents ADD COLUMN rasa_nlu_pipeline character varying COLLATE pg_catalog."default" DEFAULT 'spacy_sklearn';
ALTER TABLE agents ADD COLUMN rasa_nlu_fixed_model_name character varying COLLATE pg_catalog."default";
ALTER TABLE agents ADD COLUMN rasa_nlu_language character varying COLLATE pg_catalog."default" DEFAULT 'en';