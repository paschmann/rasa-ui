SET search_path TO rasa_ui;

ALTER TABLE IF EXISTS regex ADD COLUMN agent_id INTEGER;
ALTER TABLE IF EXISTS regex ADD CONSTRAINT agent_fkey FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE CASCADE;
