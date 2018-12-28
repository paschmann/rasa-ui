SET search_path TO rasa_ui;

-- Add On delete CASCADE when a message is deleted from the messages table

ALTER TABLE nlu_parse_log 
DROP CONSTRAINT messages_id_pk,
ADD CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES messages (messages_id) MATCH FULL ON DELETE CASCADE;

ALTER TABLE core_parse_log 
DROP CONSTRAINT messages_id_pk, 
ADD CONSTRAINT messages_id_pk FOREIGN KEY (messages_id) REFERENCES messages (messages_id) MATCH FULL ON DELETE CASCADE;
