-- Rename Module 3 to "Vacation Audio Story 1"

-- 1. Update the main modules table (Default English)
UPDATE modules 
SET name = 'Vacation Audio Story 1' 
WHERE id = 3;

-- 2. Update existing translations (Native Translations)
-- English
UPDATE modules_i18n 
SET name = 'Vacation Audio Story 1' 
WHERE module_id = 3 AND language_code = 'en';

-- Spanish: Historia de Audio de Vacaciones 1
UPDATE modules_i18n 
SET name = 'Historia de Audio de Vacaciones 1' 
WHERE module_id = 3 AND language_code = 'es';

-- Hindi: वेकेशन ऑडियो स्टोरी 1 (Transliterated/Translated)
UPDATE modules_i18n 
SET name = 'वेकेशन ऑडियो स्टोरी 1' 
WHERE module_id = 3 AND language_code = 'hi';

-- Arabic: قصة عطلة صوتية 1
UPDATE modules_i18n 
SET name = 'قصة عطلة صوتية 1' 
WHERE module_id = 3 AND language_code = 'ar';
