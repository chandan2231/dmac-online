INSERT INTO modules (id, code, name, description, order_index, max_score, is_active) 
VALUES (16, 'AUDIO_WORDS_RECALL', 'Audio Words Recall', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.', 15, 5, 1)
ON DUPLICATE KEY UPDATE code=code, order_index=15;

-- Translations
INSERT INTO modules_i18n (module_id, language_code, name, description) VALUES 
(16, 'en', 'Audio Words Recall', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.'),
(16, 'ar', 'Audio Words Recall', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.'),
(16, 'es', 'Audio Words Recall', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.'),
(16, 'hi', 'Audio Words Recall', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.')
ON DUPLICATE KEY UPDATE description=description;

-- Question
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, post_game_text) 
VALUES (16, 'AUDIO_WORDS_RECALL_Q1', 'audio_words', 1, 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.', 'Please recall 5 audio words you have heard in the beginning of the test, speak or type in the text box.');
