-- Insert the new UI text key
INSERT INTO dmac_webapp_ui_texts (code, status) 
SELECT 'game_instructions_for_answer', 1 
WHERE NOT EXISTS (SELECT 1 FROM dmac_webapp_ui_texts WHERE code = 'game_instructions_for_answer');

-- Get the ID (whether inserted or existing)
SET @ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_instructions_for_answer');

-- Delete existing translations for this key to avoid duplicates
DELETE FROM dmac_webapp_ui_text_translations WHERE ui_text_id = @ui_text_id AND language_code IN ('en', 'es', 'ar', 'hi');

-- Insert translations
INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text) VALUES 
(@ui_text_id, 'en', 'Instructions For Answer'),
(@ui_text_id, 'es', 'Instrucciones para la respuesta'),
(@ui_text_id, 'ar', 'تعليمات للإجابة'),
(@ui_text_id, 'hi', 'उत्तर के लिए निर्देश');
