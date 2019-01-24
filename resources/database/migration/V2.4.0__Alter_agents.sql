SET search_path TO rasa_ui;

-- Alter Agent Table
ALTER TABLE agents ADD COLUMN rasa_nlu_pipeline character varying COLLATE pg_catalog."default";
ALTER TABLE agents ADD COLUMN rasa_nlu_Fixed_model_name character varying COLLATE pg_catalog."default";