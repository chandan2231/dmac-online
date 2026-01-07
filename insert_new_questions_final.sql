-- ==========================================
-- FINAL SCRIPT: Adding Questions 7 and 8
-- ==========================================

-- ------------------------------------------
-- 1. Insert New Options for Question 7
-- ------------------------------------------
-- Option: "To check my current cognitive status"
INSERT INTO dmac_webapp_question_options (code) VALUES ('status');
SET @opt_status_id = LAST_INSERT_ID();

INSERT INTO dmac_webapp_question_option_translations (option_id, language_code, text) VALUES
(@opt_status_id, 'en', 'To check my current cognitive status'),
(@opt_status_id, 'hi', 'To check my current cognitive status'), -- Placeholder
(@opt_status_id, 'es', 'To check my current cognitive status'), -- Placeholder
(@opt_status_id, 'ar', 'To check my current cognitive status'), -- Placeholder
(@opt_status_id, 'zh', 'To check my current cognitive status'); -- Placeholder

-- Option: "Due to memory-related concerns"
INSERT INTO dmac_webapp_question_options (code) VALUES ('concerns');
SET @opt_concerns_id = LAST_INSERT_ID();

INSERT INTO dmac_webapp_question_option_translations (option_id, language_code, text) VALUES
(@opt_concerns_id, 'en', 'Due to memory-related concerns'),
(@opt_concerns_id, 'hi', 'Due to memory-related concerns'), -- Placeholder
(@opt_concerns_id, 'es', 'Due to memory-related concerns'), -- Placeholder
(@opt_concerns_id, 'ar', 'Due to memory-related concerns'), -- Placeholder
(@opt_concerns_id, 'zh', 'Due to memory-related concerns'); -- Placeholder


-- ------------------------------------------
-- 2. Insert Question 7
-- "What is the reason you are taking the SDMAC test?"
-- ------------------------------------------
INSERT INTO dmac_webapp_questions (sequence_no, parent_question_id, trigger_option, alert_id)
VALUES (7, NULL, NULL, NULL);

SET @q7_id = LAST_INSERT_ID();

INSERT INTO dmac_webapp_questions_translations (question_id, language_code, text) VALUES 
(@q7_id, 'en', 'What is the reason you are taking the SDMAC test?'),
(@q7_id, 'hi', 'What is the reason you are taking the SDMAC test?'), -- Placeholder
(@q7_id, 'es', 'What is the reason you are taking the SDMAC test?'), -- Placeholder
(@q7_id, 'ar', 'What is the reason you are taking the SDMAC test?'), -- Placeholder
(@q7_id, 'zh', 'What is the reason you are taking the SDMAC test?'); -- Placeholder


-- ------------------------------------------
-- 3. Insert Question 8
-- "Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?"
-- ------------------------------------------
INSERT INTO dmac_webapp_questions (sequence_no, parent_question_id, trigger_option, alert_id)
VALUES (8, NULL, NULL, NULL);

SET @q8_id = LAST_INSERT_ID();

INSERT INTO dmac_webapp_questions_translations (question_id, language_code, text) VALUES 
(@q8_id, 'en', 'Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?'),
(@q8_id, 'hi', 'Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?'), -- Placeholder
(@q8_id, 'es', 'Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?'), -- Placeholder
(@q8_id, 'ar', 'Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?'), -- Placeholder
(@q8_id, 'zh', 'Have you ever had a Traumatic Brain Injury (TBI) or Acquired Brain Injury (ABI)?'); -- Placeholder

-- Note: Q8 options (Yes/No) are automatically picked up by the system since they already exist.
-- Q7 options (status/concerns) were inserted above and will also be picked up automatically.
