-- ==========================================
-- TEMPLATE: Adding New Questions (Sequence 7 & 8)
-- ==========================================

-- 1. Insert Question 7
-- Replace 'Do you have any history of stroke?' with your actual 7th question text.
INSERT INTO dmac_webapp_questions (sequence_no, parent_question_id, trigger_option, alert_id)
VALUES (7, NULL, NULL, NULL);

-- Get ID of Q7 (If running manual script, you might need to check the ID manually or use variables)
SET @q7_id = LAST_INSERT_ID(); 

-- Insert Translations for Q7
INSERT INTO dmac_webapp_questions_translations (question_id, language_code, text) VALUES 
(@q7_id, 'en', 'Do you have any history of stroke?'),        -- English
(@q7_id, 'hi', 'क्या आपको स्ट्रोक का कोई इतिहास है?'),           -- Hindi
(@q7_id, 'es', '¿Tiene antecedentes de accidente cerebrovascular?'), -- Spanish
(@q7_id, 'ar', 'هل لديك أي تاريخ للإصابة بالسكتة الدماغية؟'),   -- Arabic
(@q7_id, 'zh', '您有中风病史吗？');                           -- Chinese


-- 2. Insert Question 8
-- Replace 'Do you have any history of head injury?' with your actual 8th question text.
INSERT INTO dmac_webapp_questions (sequence_no, parent_question_id, trigger_option, alert_id)
VALUES (8, NULL, NULL, NULL);

-- Get ID of Q8
SET @q8_id = LAST_INSERT_ID();

-- Insert Translations for Q8
INSERT INTO dmac_webapp_questions_translations (question_id, language_code, text) VALUES 
(@q8_id, 'en', 'Do you have any history of head injury?'),      -- English
(@q8_id, 'hi', 'क्या आपको सिर में चोट लगने का कोई इतिहास है?'),   -- Hindi
(@q8_id, 'es', '¿Tiene antecedentes de lesión en la cabeza?'),  -- Spanish
(@q8_id, 'ar', 'هل لديك أي تاريخ لإصابة الرأس؟'),               -- Arabic
(@q8_id, 'zh', '您有头部受伤史吗？');                           -- Chinese

-- NOTE: 
-- The system automatically provides "Yes" / "No" options for all questions 
-- because it fetches all available options. You do not need to link them explicitly.
