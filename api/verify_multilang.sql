-- =====================================================================
-- VERIFICATION QUERIES FOR MULTILINGUAL GAME MODULES
-- Run these queries after loading db.sql to verify all translations
-- =====================================================================

-- 1. Check all module translations (should return 8 rows: 2 modules × 4 languages)
SELECT 
    m.code AS module_code,
    mi.language_code,
    mi.name,
    mi.description
FROM modules m
LEFT JOIN modules_i18n mi ON m.id = mi.module_id
ORDER BY m.order_index, mi.language_code;

-- 2. Check all question prompts (should return 24 rows: 6 questions × 4 languages)
SELECT 
    q.code AS question_code,
    qi.language_code,
    qi.prompt_text
FROM questions q
LEFT JOIN questions_i18n qi ON q.id = qi.question_id
ORDER BY q.order_index, qi.language_code;

-- 3. Check all image item translations (should return 20 rows: 5 items × 4 languages)
SELECT 
    qi.image_key,
    i18n.language_code,
    i18n.display_text,
    i18n.accepted_answers,
    i18n.audio_url
FROM question_items qi
LEFT JOIN question_item_i18n i18n ON qi.id = i18n.question_item_id
ORDER BY qi.item_order, i18n.language_code;

-- 4. Verify language coverage - all items should have 4 translations
SELECT 
    qi.image_key,
    COUNT(i18n.id) AS translation_count,
    GROUP_CONCAT(i18n.language_code ORDER BY i18n.language_code) AS languages
FROM question_items qi
LEFT JOIN question_item_i18n i18n ON qi.id = i18n.question_item_id
GROUP BY qi.image_key
HAVING translation_count = 4;

-- 5. Get complete Module 1 content in Spanish
SELECT 
    m.code,
    mi.name AS module_name,
    mi.description AS module_description,
    qi18n.prompt_text AS question_prompt
FROM modules m
JOIN modules_i18n mi ON m.id = mi.module_id
JOIN questions q ON q.module_id = m.id
JOIN questions_i18n qi18n ON q.id = qi18n.question_id
WHERE m.code = 'IMAGE_FLASH'
  AND mi.language_code = 'es'
  AND qi18n.language_code = 'es';

-- 6. Get all images with Arabic translations for Module 1
SELECT 
    qi.item_order,
    qi.image_key,
    qi.image_url,
    i18n.display_text AS arabic_name,
    i18n.accepted_answers AS arabic_accepted_answers,
    i18n.audio_url AS arabic_audio
FROM question_items qi
JOIN question_item_i18n i18n ON qi.id = i18n.question_item_id
WHERE i18n.language_code = 'ar'
ORDER BY qi.item_order;

-- =====================================================================
-- EXPECTED RESULTS SUMMARY
-- =====================================================================
-- Query 1: 8 rows (all module translations)
-- Query 2: 24 rows (all question translations)
-- Query 3: 20 rows (all image item translations)
-- Query 4: 5 rows (verifying each image has 4 language versions)
-- Query 5: 1 row (complete Spanish content for Module 1)
-- Query 6: 5 rows (all Arabic image translations)
-- =====================================================================
