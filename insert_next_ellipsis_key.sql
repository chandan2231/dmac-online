-- Insert the new UI text key
INSERT INTO dmac_webapp_ui_texts (code, status) VALUES ('game_next_ellipsis', 1);

-- Get the ID of the newly inserted key
SET @new_ui_text_id = LAST_INSERT_ID();

-- Insert translations
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text) VALUES
(@new_ui_text_id, 'en', 'NEXT...'),
(@new_ui_text_id, 'es', 'SIGUIENTE...'),
(@new_ui_text_id, 'ar', 'التالي...'),
(@new_ui_text_id, 'hi', 'आगे...');
