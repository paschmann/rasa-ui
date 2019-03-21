SET search_path TO rasa_ui;

-- Alter Agent Table
ALTER TABLE agents ADD COLUMN rasa_nlu_threshold REAL DEFAULT 0.3;