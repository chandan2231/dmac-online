-- =====================================================================
-- Update Instructions for Module 6 (Audio Story Recall)
-- Based on User Request: "both audio starting instruction" and "both audio ending instruction"
-- =====================================================================

SET @lang = 'en';

-- =====================================================================
-- Story 1 Instructions
-- =====================================================================

-- 1. Update Start Instruction (Stored in prompt_text)
-- "Please increase your device volume, a short story 1 audio will play..."
UPDATE questions_i18n qi
JOIN questions q ON qi.question_id = q.id
SET qi.prompt_text = 'Please increase your device volume, a short story 1 audio will play. Please remember, you will be asked to recall in same words, immediately after and later.'
WHERE q.code = 'AUDIO_S1' AND qi.language_code = @lang;

-- Also update base table just in case
UPDATE questions 
SET prompt_text = 'Please increase your device volume, a short story 1 audio will play. Please remember, you will be asked to recall in same words, immediately after and later.'
WHERE code = 'AUDIO_S1';


-- 2. Update End/Recall Instruction (Storing in correct_answer_text as a placeholder for secondary prompt)
-- "Please try to recall story 1 in the same words as much as possible..."
-- Note: Using correct_answer_text column to store this instructional text for the recall phase.
UPDATE questions
SET correct_answer_text = 'Please try to recall story 1 in the same words as much as possible. You may also speak or type Story 1 in words.'
WHERE code = 'AUDIO_S1';


-- =====================================================================
-- Story 2 Instructions
-- =====================================================================

-- 1. Update Start Instruction
-- "Please increase your device volumes, a short story 2 audio will play..."
UPDATE questions_i18n qi
JOIN questions q ON qi.question_id = q.id
SET qi.prompt_text = 'Please increase your device volumes, a short story 2 audio will play. Please remember, you will be asked to recall in same words, immediate after and later.'
WHERE q.code = 'AUDIO_S2' AND qi.language_code = @lang;

UPDATE questions 
SET prompt_text = 'Please increase your device volumes, a short story 2 audio will play. Please remember, you will be asked to recall in same words, immediate after and later.'
WHERE code = 'AUDIO_S2';

-- 2. Update End/Recall Instruction
-- "Please try to recall story 2 in the same words as much as possible..."
UPDATE questions
SET correct_answer_text = 'Please try to recall story 2 in the same words as much as possible. You may also speak or type Story 2 in words.'
WHERE code = 'AUDIO_S2';
