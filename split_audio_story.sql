-- 1. Rename existing Module 3 to "Vacation Audio Story 1" and set order
UPDATE modules 
SET name = 'Vacation Audio Story 1', order_index = 4 
WHERE id = 3;

-- 2. Create new module "Antique Audio Story 2" (ID 11 presumed safe, checking later)
-- Using Code 'AUDIO_STORY_2'
INSERT INTO modules (id, code, name, description, order_index, max_score, is_active)
VALUES (11, 'AUDIO_STORY_2', 'Antique Audio Story 2', 'Please check device volume, a story audio 2 audio will play. You will be asked to recall in the same words, or all the relevant words immediately after and later.', 6, 5, 1);

-- 3. Update Semantic Questions Order (ID 8) to 5 (between Story 1 and Story 2)
UPDATE modules SET order_index = 5 WHERE id = 8;

-- 4. Move Question 8 (Story 2) to New Module 11
UPDATE questions
SET module_id = 11, order_index = 1
WHERE id = 8;

-- 5. Update Question 7 (Story 1) Texts
UPDATE questions
SET 
    prompt_text = 'Please check device volume, a short story audio 1 audio will play about vacation. You will be asked to recall in the same words, or all the relevant words immediately after and later.',
    post_game_text = 'Please try to recall the short story 1 about vacation in the same words as much as possible or all the relevant words. Please speak or type in the text box.'
WHERE id = 7;

-- 6. Update Question 8 (Story 2) Texts
UPDATE questions
SET 
    prompt_text = 'Please check device volume, a story audio 2 audio will play. You will be asked to recall in the same words, or all the relevant words immediately after and later.',
    post_game_text = 'Please try to recall the story 2 in the same words as much as possible or all the relevant words. Please speak or type in the text box.'
WHERE id = 8;

-- 7. Ensure Translations exist for new module (Copy from ID 3 or generic)
-- For now, inserting basic entries for multi-lang to avoid invisible name issues
INSERT INTO modules_i18n (module_id, language_code, name, description)
SELECT 11, language_code, name, description FROM modules_i18n WHERE module_id = 3;

-- Update specific names for translations if needed, but keeping simple for now as per "Dont change antthing as of now" regarding semantic content, but ensuring structure exists.
-- User asked "Start instruction will be..." - this applied to English.
-- I updated English text in main tables. I should also update 'en' in i18n tables if they exist to prevent override.

UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'Please check device volume, a short story audio 1 audio will play about vacation. You will be asked to recall in the same words, or all the relevant words immediately after and later.',
    qi.post_game_text = 'Please try to recall the short story 1 about vacation in the same words as much as possible or all the relevant words. Please speak or type in the text box.'
WHERE q.id = 7 AND qi.language_code = 'en';

UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'Please check device volume, a story audio 2 audio will play. You will be asked to recall in the same words, or all the relevant words immediately after and later.',
    qi.post_game_text = 'Please try to recall the story 2 in the same words as much as possible or all the relevant words. Please speak or type in the text box.'
WHERE q.id = 8 AND qi.language_code = 'en';
