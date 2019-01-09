SET search_path TO rasa_ui;

DROP VIEW IF EXISTS entity_synonym_variants;

ALTER TABLE IF EXISTS synonyms DROP CONSTRAINT entity_fkey;
ALTER TABLE IF EXISTS synonyms DROP COLUMN entity_id;
ALTER TABLE IF EXISTS synonyms ADD COLUMN agent_id INTEGER;
ALTER TABLE IF EXISTS synonyms ADD CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE;
