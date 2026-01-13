-- Rename Module 3 to "Vacation Audio Story 1"

-- Update the main modules table
UPDATE modules 
SET name = 'Vacation Audio Story 1' 
WHERE id = 3;

-- Update the translation in modules_i18n for ALL languages
UPDATE modules_i18n 
SET name = 'Vacation Audio Story 1' 
WHERE module_id = 3;
