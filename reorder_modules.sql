-- Update module sequence order to match user request
-- Mapping:
-- 1) Immediate Visual Picture Recall -> ID 1
-- 2) Auditory Word Recall Instructions -> ID 5
-- 3) Executive Questions -> ID 7
-- 4) Vacation Audio Story 1 -> ID 3
-- 5) Semantic Questions -> ID 8
-- 7) Trail Sequence Tracing Test -> ID 4
-- 8) Audio Number Recall -> ID 9
-- 9) Picture Drawing or Copying -> ID 10
-- 10) Image Display (Matching) -> ID 2

UPDATE modules 
SET order_index = CASE id
    WHEN 1 THEN 1
    WHEN 5 THEN 2
    WHEN 7 THEN 3
    WHEN 3 THEN 4
    WHEN 8 THEN 5
    WHEN 4 THEN 7
    WHEN 9 THEN 8
    WHEN 10 THEN 9
    WHEN 2 THEN 10
    ELSE order_index
END
WHERE id IN (1, 5, 7, 3, 8, 4, 9, 10, 2);
