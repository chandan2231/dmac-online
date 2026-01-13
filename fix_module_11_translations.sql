-- Fix Module 11 Translations
-- Use English name for all languages temporarily or generic translated name if possible. 
-- For now, explicitly set English and update others to match the intent.

-- Update English
UPDATE modules_i18n 
SET name = 'Antique Audio Story 2', description = 'Please check device volume, a story audio 2 audio will play. You will be asked to recall in the same words, or all the relevant words immediately after and later.'
WHERE module_id = 11 AND language_code = 'en';

-- Update Spanish (Approximate or keep same as English if no translation provided)
UPDATE modules_i18n 
SET name = 'Historia de Audio Antigua 2'
WHERE module_id = 11 AND language_code = 'es';

-- Update Arabic
UPDATE modules_i18n 
SET name = 'قصة صوتية عتيقة 2'
WHERE module_id = 11 AND language_code = 'ar';

-- Update Hindi
UPDATE modules_i18n 
SET name = 'प्राचीन ऑडियो कहानी 2'
WHERE module_id = 11 AND language_code = 'hi';
