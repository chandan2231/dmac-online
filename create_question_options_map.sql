-- 1. Create the mapping table
CREATE TABLE IF NOT EXISTS dmac_webapp_question_options_map (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_id INT NOT NULL
);

-- 2. Populate mappings for Yes/No questions (Q1-Q6, and Q8)
-- Assuming Q1-Q6 IDs are 1-6 (based on sequence NO usually, but we need correct IDs).
-- We know sequence_no match IDs for 1-6 usually.
-- Q8 is the new one we added. Q7 is the new multiple choice.

-- Helper to insert map for a question to YES(1) and NO(2)
-- We need to find IDs. Since this is SQL script, we rely on assumptions or subqueries.

-- Map Q1-Q6 to Yes (1) and No (2)
INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT id, 1 FROM dmac_webapp_questions WHERE sequence_no IN (1, 2, 3, 4, 5, 6);

INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT id, 2 FROM dmac_webapp_questions WHERE sequence_no IN (1, 2, 3, 4, 5, 6);

-- Map Q8 to Yes (1) and No (2)
INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT id, 1 FROM dmac_webapp_questions WHERE sequence_no = 8;

INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT id, 2 FROM dmac_webapp_questions WHERE sequence_no = 8;


-- 3. Populate mappings for Q7 to 'status' and 'concerns'
-- We need option IDs for 'status' and 'concerns'.
-- We can find them by code.

INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT q.id, o.id
FROM dmac_webapp_questions q
JOIN dmac_webapp_question_options o ON o.code = 'status'
WHERE q.sequence_no = 7;

INSERT INTO dmac_webapp_question_options_map (question_id, option_id)
SELECT q.id, o.id
FROM dmac_webapp_questions q
JOIN dmac_webapp_question_options o ON o.code = 'concerns'
WHERE q.sequence_no = 7;
