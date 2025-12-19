-- =====================================================================
-- MODULE 6: Audio Story Recall
-- Purpose: Test narrative memory by recalling story details.
-- Order Index: 3
-- =====================================================================

-- 1. Schema Update: Add 'audio_story' to question_type ENUM
-- WARNING: This alters the table schema. Ensure no other processes are writing to the table.
ALTER TABLE questions MODIFY COLUMN question_type ENUM('flash_recall','visual_spatial','audio_story') NOT NULL;

-- Variable for Language
SET @lang = 'en';

-- =====================================================================
-- 2. Insert Module: Audio Story Recall
-- =====================================================================
INSERT INTO modules (code, name, description, order_index, max_score, is_active)
VALUES ('AUDIO_STORY', 'Audio Story Recall', 'Listen to the story and recall the details.', 3, 10, 1);

SET @module_id = LAST_INSERT_ID();

-- Module Translation
INSERT INTO modules_i18n (module_id, language_code, name, description)
VALUES (@module_id, @lang, 'Audio Story Recall', 'Listen to the story and recall the details.');


-- =====================================================================
-- 3. Story 1: John Hampton
-- =====================================================================

-- Question (Story 1)
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES (@module_id, 'AUDIO_S1', 'audio_story', 1, 'Listen to the story about John Hampton and recall the details.', NULL);

SET @q1_id = LAST_INSERT_ID();

-- Question Prompt Translation
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES (@q1_id, @lang, 'Listen to the story about John Hampton and recall the details.');

-- Question Item (Story 1 Audio & Scoring)
-- Note: image_url is required by schema, using a placeholder.
INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (@q1_id, 1, 'story1_john_hampton', 'https://cdn.example.com/images/audio_placeholder.png');

SET @item1_id = LAST_INSERT_ID();

-- Item Translation + Audio + Keywords
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES (
    @item1_id, 
    @lang, 
    'https://cdn.example.com/audio/stories/john_hapton_vacation_story.m4a', 
    'John Hampton Story', 
    'johnhampton,newyork,greece,6days,friends,christmasvacation,4pairofcloth,camera,blackjacket,pairofgloves,airport,bought'
);


-- =====================================================================
-- 4. Story 2: Mary Nottingham
-- =====================================================================

-- Question (Story 2)
INSERT INTO questions (module_id, code, question_type, order_index, prompt_text, correct_answer_text)
VALUES (@module_id, 'AUDIO_S2', 'audio_story', 2, 'Listen to the story about Mary Nottingham and recall the details.', NULL);

SET @q2_id = LAST_INSERT_ID();

-- Question Prompt Translation
INSERT INTO questions_i18n (question_id, language_code, prompt_text)
VALUES (@q2_id, @lang, 'Listen to the story about Mary Nottingham and recall the details.');

-- Question Item (Story 2 Audio & Scoring)
INSERT INTO question_items (question_id, item_order, image_key, image_url)
VALUES (@q2_id, 1, 'story2_mary_nottingham', 'https://cdn.example.com/images/audio_placeholder.png');

SET @item2_id = LAST_INSERT_ID();

-- Item Translation + Audio + Keywords
INSERT INTO question_item_i18n (question_item_id, language_code, audio_url, display_text, accepted_answers)
VALUES (
    @item2_id, 
    @lang, 
    'https://cdn.example.com/audio/stories/marynotingham_hidentreassure_story.m4a', 
    'Mary Nottingham Story', 
    'marynottingham,cleaning,house,thrilled,crystalvase,492dollars,oldjewelry,painting,renaissance,period,annual,antiqueshow'
);


-- =====================================================================
-- Verification (Optional - Commented Out)
-- =====================================================================
-- SELECT * FROM modules WHERE id = @module_id;
-- SELECT * FROM questions WHERE module_id = @module_id;
-- SELECT * FROM question_items WHERE question_id IN (@q1_id, @q2_id);
-- SELECT * FROM question_item_i18n WHERE question_item_id IN (@item1_id, @item2_id);
