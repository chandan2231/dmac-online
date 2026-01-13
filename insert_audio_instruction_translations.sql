-- Insert the new UI text key
INSERT INTO dmac_webapp_ui_texts (code, status) 
SELECT 'game_audio_instruction', 1 
WHERE NOT EXISTS (SELECT 1 FROM dmac_webapp_ui_texts WHERE code = 'game_audio_instruction');

-- Get the ID (whether inserted or existing)
SET @ui_text_id = (SELECT id FROM dmac_webapp_ui_texts WHERE code = 'game_audio_instruction');

-- Insert or Update translations (using REPLACE or ON DUPLICATE KEY UPDATE might be safer, but let's stick to INSERT for now taking care of duplicates if I can)
-- For simplicity in this environment, I'll delete existing translations for this key first to avoid duplicates if re-run
DELETE FROM dmac_webapp_ui_text_translations WHERE ui_text_id = @ui_text_id AND language_code IN ('en', 'es', 'ar', 'hi');

INSERT INTO dmac_webapp_ui_text_translations (ui_text_id, language_code, text) VALUES 
(@ui_text_id, 'en', 'Audio Instruction'),
(@ui_text_id, 'es', 'Instrucción de audio'),
(@ui_text_id, 'ar', 'تعليمات صوتية'),
(@ui_text_id, 'hi', 'ऑडियो निर्देश');
