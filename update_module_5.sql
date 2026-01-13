-- Update Module Name
UPDATE modules 
SET name = 'Auditory Word' 
WHERE id = 5;

-- Update Questions Instructions
-- Updating all questions for module 5 to have the same start/post text, as usually they share the same context or it's a single question flow
UPDATE questions 
SET 
    prompt_text = 'You will listen to 5 words on Audio, Remember the words, You will be asked to recall immediately and later in the test as Audio word recall.',
    post_game_text = 'Please recall the words you have just heard on audio. You may be able to speak or type the answers in the text box.'
WHERE module_id = 5;
