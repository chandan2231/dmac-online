-- Update English translation for Module 5
UPDATE modules_i18n 
SET name = 'Auditory Word' 
WHERE module_id = 5 AND language_code = 'en';

-- Update English translation for Module 5 Questions
-- Helper to target correct questions
UPDATE questions_i18n qi
JOIN questions q ON q.id = qi.question_id
SET 
    qi.prompt_text = 'You will listen to 5 words on Audio, Remember the words, You will be asked to recall immediately and later in the test as Audio word recall.',
    qi.post_game_text = 'Please recall the words you have just heard on audio. You may be able to speak or type the answers in the text box.'
WHERE q.module_id = 5 AND qi.language_code = 'en';
