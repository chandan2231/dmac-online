-- Update module name in the main modules table
UPDATE modules 
SET name = 'Visual Picture Recall' 
WHERE id = 1;

-- Update English translation
UPDATE modules_i18n 
SET name = 'Visual Picture Recall' 
WHERE module_id = 1 AND language_code = 'en';

-- Update Hindi translation
UPDATE modules_i18n 
SET name = 'दृश्य चित्र स्मरण' 
WHERE module_id = 1 AND language_code = 'hi';

-- Update Spanish translation
UPDATE modules_i18n 
SET name = 'Recuerdo de Imagen Visual' 
WHERE module_id = 1 AND language_code = 'es';

-- Update Arabic translation
UPDATE modules_i18n 
SET name = 'استرجاع الصور المرئية' 
WHERE module_id = 1 AND language_code = 'ar';
