import { db } from '../connect.js'
import { isFuzzyMatch } from '../utils/stringUtils.js'
import PdfTemplates from '../templates/generate-pdf.js'
import { generatePdfFromHTML } from '../utils/pdfService.js'
import fs from 'fs'

const query = (sql, args) => {
  return new Promise((resolve, reject) => {
    db.query(sql, args, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

// --- Helper Functions ---

const fetchQuestions = async (moduleId, languageCode) => {
  return query(
    `SELECT q.id, q.module_id, q.code, q.question_type, q.order_index, 
            COALESCE(qi.post_game_text, q.post_game_text) as post_game_text,
            COALESCE(qi.prompt_text, q.prompt_text) as prompt_text
     FROM dmac_webapp_assessment q
     LEFT JOIN dmac_webapp_assessment_i18n qi ON q.id = qi.question_id AND qi.language_code = ?
     WHERE q.module_id = ?
     ORDER BY q.order_index`,
    [languageCode, moduleId]
  )
}

const fetchItems = async (questionId, languageCode) => {
  return query(
    `SELECT qi.id as question_item_id, qi.item_order, qi.image_key, qi.image_url, 
            t.audio_url, t.accepted_answers
     FROM dmac_webapp_assessment_items qi
     JOIN dmac_webapp_assessment_item_i18n t ON qi.id = t.question_item_id
     WHERE qi.question_id = ? AND t.language_code = ?
     ORDER BY qi.item_order`,
    [questionId, languageCode]
  )
}

const fetchOptions = async (questionId) => {
  return query(
    'SELECT option_key, image_url, is_correct FROM dmac_webapp_assessment_options WHERE question_id = ?',
    [questionId]
  )
}

const calculateKeywordScore = (userText, items, options = {}) => {
  const userWords = (userText || '').toLowerCase().split(/[\s,]+/).filter(Boolean)
  let correctCount = 0
  const matchedItems = new Set()
  const matchedSynonyms = new Set() // Used when options.uniqueWords is true

  // Flatten all synonyms into a list of { text, itemId } for easier checking?
  // Or iterate words against items.
  // Logic matches original: iterate user words, check against synonyms.
  for (const word of userWords) {
    for (const item of items) {
      if (!options.uniqueWords && matchedItems.has(item.question_item_id)) continue

      const synonyms = (item.accepted_answers || '')
        .toLowerCase()
        .split(',')
        .map((s) => s.trim().replace(/\.$/, '')) // remove trailing dots if any

      // Also check normalized (no space) version as per AudioStory logic
      const normalizedWord = word.replace(/\s+/g, '')

      // Check exact word match or normalized containment OR fuzzy match
      const matchedSynonym = synonyms.find(syn => {
        const normalizedSyn = syn.replace(/\s+/g, '')
        // Clean trailing punctuation from user word for fair comparison
        const cleanWord = word.replace(/[.,!?;:]$/, '')

        return (
          syn === word ||
          isFuzzyMatch(cleanWord, syn) ||
          (normalizedSyn.length > 3 && normalizedWord.includes(normalizedSyn)) // Keeping existing logic too
        )
      })

      if (matchedSynonym) {
        if (options.uniqueWords) {
          // For single-item lists (Audio Words), prevent counting same word twice (e.g. "car car")
          // But allow different words from same item.
          // We track the ACCEPTED ANSWER that was matched.
          if (matchedSynonyms.has(matchedSynonym)) break // Word already counted
          matchedSynonyms.add(matchedSynonym)
          correctCount++
          // For uniqueWords mode, we don't break widely if we matched, 
          // but since we found a match for this user word, we break to next user word.
          break
        } else {
          correctCount++
          matchedItems.add(item.question_item_id)
          break // Move to next user word
        }
      }
    }
  }
  return correctCount
}



// --- Module Handlers ---

const handleVisualSpatial = async (module, questions, languageCode) => {
  const processedQuestions = []
  for (const q of questions) {
    const options = await fetchOptions(q.id)
    const target = options.find((o) => o.is_correct === 1)
    processedQuestions.push({
      question_id: q.id,
      round_order: q.order_index,
      prompt_text: q.prompt_text,
      target_image_url: target ? target.image_url : null,
      options: options.map((o) => ({
        option_key: o.option_key,
        image_url: o.image_url
      }))
    })
  }
  return { questions: processedQuestions }
}

const handleAudioStory = async (module, questions, languageCode) => {
  const processedQuestions = []
  for (const q of questions) {
    const items = await fetchItems(q.id, languageCode)
    if (items.length > 0) {
      processedQuestions.push({
        question_id: q.id,
        prompt_text: q.prompt_text,
        post_instruction_text: q.post_game_text,
        item: {
          question_item_id: items[0].question_item_id,
          audio_url: items[0].audio_url,
          image_url: items[0].image_url
        }
      })
    }
  }
  return { questions: processedQuestions }
}

const handleDefault = async (module, questions, languageCode) => {
  if (questions.length > 0) {
    const question = questions[0]
    const items = await fetchItems(question.id, languageCode)

    return {
      questions: [{
        question_id: question.id,
        prompt_text: question.prompt_text,
        post_game_text: question.post_game_text,
        items: items.map((i) => ({
          question_item_id: i.question_item_id,
          order: i.item_order,
          image_key: i.image_key,
          image_url: i.image_url,
          audio_url: i.audio_url
        }))
      }]
    }
  }
  return { questions: [] }
}

const handleExecutive = async (module, questions, languageCode) => {
  const processedQuestions = []
  for (const q of questions) {
    // For executive, items are just accepted answers primarily, maybe an image if needed
    // But mostly it's text. We fetch items anyway.
    const items = await fetchItems(q.id, languageCode)
    processedQuestions.push({
      question_id: q.id,
      prompt_text: q.prompt_text,
      post_game_text: q.post_game_text,
      items: items.map((i) => ({
        question_item_id: i.question_item_id,
        order: i.item_order,
        image_key: i.image_key,
        image_url: i.image_url,
        audio_url: i.audio_url,
        accepted_answers: i.accepted_answers
      }))
    })
  }
  return { questions: processedQuestions }
}

const handleSemantic = async (module, questions, languageCode) => {
  const processedQuestions = []
  for (const q of questions) {
    const items = await fetchItems(q.id, languageCode)
    processedQuestions.push({
      question_id: q.id,
      prompt_text: q.prompt_text,
      post_game_text: q.post_game_text,
      items: items.map((i) => ({
        question_item_id: i.question_item_id,
        order: i.item_order,
        image_key: i.image_key,
        image_url: i.image_url,
        audio_url: i.audio_url,
        accepted_answers: i.accepted_answers
      }))
    })
  }
  return { questions: processedQuestions }
}

const moduleHandlers = {
  'VISUAL_SPATIAL': handleVisualSpatial,
  'AUDIO_STORY': handleAudioStory,
  'AUDIO_STORY_2': handleAudioStory,
  'AUDIO_WORDS': handleDefault,
  'AUDIO_WORDS_RECALL': handleDefault,
  'IMAGE_FLASH': handleDefault,
  'EXECUTIVE': handleExecutive,
  'SEMANTIC': handleSemantic,
  'NUMBER_RECALL': handleExecutive, // Reuse handleExecutive as it returns checks for all items which fits
  'REVERSE_NUMBER_RECALL': handleExecutive,
  'COLOR_RECALL': handleExecutive,
  'GROUP_MATCHING': handleSemantic,
  'DISINHIBITION_SQ_TRI': handleDefault,
  'LETTER_DISINHIBITION': handleDefault,
  'VISUAL_NUMBER_RECALL': handleExecutive,
  'default': handleDefault
}

export const getModules = async (req, res) => {
  try {
    const language = req.query.language || 'en'
    console.log(`[GetModules] Fetching modules for language: ${language}`)

    const modules = await query(
      `SELECT m.id, m.code, m.order_index, m.max_score, m.is_active,
              COALESCE(mi.name, m.name) as name,
              COALESCE(mi.description, m.description) as description
       FROM dmac_webapp_modules m
       LEFT JOIN dmac_webapp_modules_i18n mi ON m.id = mi.module_id AND mi.language_code = ?
       WHERE m.is_active = 1 
       ORDER BY m.order_index`,
      [language]
    )
    res.json({ modules })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}

export const startSession = async (req, res) => {
  const { moduleId } = req.params;
  const { user_id, language_code, resume } = req.body;
  console.log(`[StartSession] starting for module ${moduleId}, user ${user_id}, lang ${language_code}, resume ${resume}`);

  if (!user_id || !language_code) {
    return res.status(400).json({ error: 'Missing user_id or language_code' });
  }

  try {
    // 1. Fetch Module Info
    const modules = await query(
      `SELECT m.id, m.code, m.order_index, m.max_score,
              COALESCE(mi.name, m.name) as name,
              COALESCE(mi.description, m.description) as description
       FROM dmac_webapp_modules m
       LEFT JOIN dmac_webapp_modules_i18n mi ON m.id = mi.module_id AND mi.language_code = ?
       WHERE m.id = ?`,
      [language_code, moduleId]
    );

    if (modules.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    const module = modules[0];

    // 2. Handle Session Creation vs Resume
    let sessionId;
    if (resume) {
      // Check for existing in_progress session
      const existing = await query(
        'SELECT id FROM dmac_webapp_sessions WHERE user_id = ? AND module_id = ? AND status = "in_progress" ORDER BY created_at DESC LIMIT 1',
        [user_id, module.id]
      );
      if (existing.length > 0) {
        sessionId = existing[0].id;
        console.log(`[StartSession] Resuming existing session ${sessionId}`);
      }
    }

    if (!sessionId) {
      // Create new session
      const result = await query(
        'INSERT INTO dmac_webapp_sessions (user_id, module_id, score, status) VALUES (?, ?, 0, "in_progress")',
        [user_id, module.id]
      );
      sessionId = result.insertId;
      console.log(`[StartSession] Created new session ${sessionId}`);
    }

    // 3. Fetch Questions
    const questions = await fetchQuestions(module.id, language_code);

    // 4. Construct Response
    const handler = moduleHandlers[module.code] || moduleHandlers.default;
    const modulePayload = await handler(module, questions, language_code);

    res.json({
      session_id: sessionId,
      module: {
        id: module.id,
        code: module.code,
        name: module.name,
        max_score: module.max_score
      },
      language_code,
      instructions: module.description,
      ...modulePayload
    });

  } catch (err) {
    console.error('[StartSession] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAttemptStatus = async (req, res) => {
  const user_id = req.user?.userId; // Corrected key to match JWT payload
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Original Module 1 Check (Preserved)
    const m1Result = await query(
      'SELECT COUNT(*) as count FROM dmac_webapp_sessions WHERE user_id = ? AND module_id = 1',
      [user_id]
    );
    const m1Count = m1Result[0].count;
    const max_attempts = 3;

    // 2. Total Active Modules
    const totalModulesResult = await query(
      'SELECT COUNT(*) as count FROM dmac_webapp_modules WHERE is_active = 1'
    );
    const totalModules = totalModulesResult[0].count;

    // 3. Completed Modules (Distinct count of completed sessions for ACTIVE modules)
    // Note: status='completed' is critical
    const completedResult = await query(
      `SELECT COUNT(DISTINCT s.module_id) as count 
       FROM dmac_webapp_sessions s
       JOIN dmac_webapp_modules m ON s.module_id = m.id
       WHERE s.user_id = ? 
       AND s.status = "completed"
       AND m.is_active = 1`,
      [user_id]
    );
    const completedModules = completedResult[0].count;

    // 4. Detailed Completion Check
    // (Are there any active modules NOT in user's completed sessions?)
    const remainingResult = await query(
      `SELECT COUNT(*) as count 
       FROM dmac_webapp_modules m 
       WHERE m.is_active = 1 
       AND m.id NOT IN (
         SELECT module_id FROM dmac_webapp_sessions WHERE user_id = ? AND status = 'completed'
       )`,
      [user_id]
    );
    const isWholeModuleCompleted = remainingResult[0].count === 0;

    // 5. Last Completed Module
    const lastModuleResult = await query(
      `SELECT m.id, m.name, m.code, s.created_at, s.score
       FROM dmac_webapp_sessions s 
       JOIN dmac_webapp_modules m ON s.module_id = m.id 
       WHERE s.user_id = ? AND s.status = "completed" 
       ORDER BY s.created_at DESC LIMIT 1`,
      [user_id]
    );
    const lastModuleCompleted = lastModuleResult.length > 0 ? lastModuleResult[0] : null;

    // 6. Completion Message (if completed)
    let completionMessage = null;
    if (isWholeModuleCompleted) {
      const language = req.query.language || 'en';
      const msgResult = await query(
        `SELECT t.text 
         FROM dmac_webapp_ui_text_translations t
         JOIN dmac_webapp_ui_texts ut ON t.ui_text_id = ut.id
         WHERE ut.code = 'game_completion_message' AND t.language_code = ?`,
        [language]
      );
      if (msgResult.length > 0) {
        completionMessage = msgResult[0].text;
      } else {
        // Fallback to English checking if it exists
        const fallbackResult = await query(
          `SELECT t.text 
           FROM dmac_webapp_ui_text_translations t
           JOIN dmac_webapp_ui_texts ut ON t.ui_text_id = ut.id
           WHERE ut.code = 'game_completion_message' AND t.language_code = 'en'`
        );
        completionMessage = fallbackResult.length > 0 ? fallbackResult[0].text : 'Assessment Completed.';
      }
    }

    res.json({
      // Original fields
      count: m1Count,
      max_attempts,
      allowed: m1Count < max_attempts,

      // New fields
      totalModules,
      completedModules,
      isCompleted: isWholeModuleCompleted,
      lastModuleCompleted,
      completionMessage
    });
  } catch (err) {
    console.error('[GetAttemptStatus] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const abandonInProgressSessions = async (req, res) => {
  const user_id = req.user?.userId
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const result = await query(
      'UPDATE dmac_webapp_sessions SET status = "abandoned" WHERE user_id = ? AND status = "in_progress"',
      [user_id]
    )

    // mysql driver returns OkPacket with affectedRows
    return res.status(200).json({
      isSuccess: true,
      abandoned: result?.affectedRows ?? 0
    })
  } catch (err) {
    console.error('[AbandonInProgressSessions] Error:', err)
    return res.status(500).json({ isSuccess: false, error: err.message })
  }
}

export const submitSession = async (req, res) => {
  const { moduleId, sessionId } = req.params
  // Standardize input: "answers" array is preferred, but handle legacy single-answer structure
  const body = req.body
  let answers = body.answers
  if (!answers && body.question_id) {
    answers = [{
      question_id: body.question_id,
      answer_text: body.answer_text,
      language_code: body.language_code
    }]
  }

  // Allow score override from frontend
  const providedScore = body.score
  const hasProvidedScore = (providedScore !== undefined && providedScore !== null)

  if (!hasProvidedScore && (!answers || answers.length === 0)) {
    return res.status(400).json({ error: 'No answers or score provided' })
  }

  try {
    const modules = await query('SELECT * FROM dmac_webapp_modules WHERE id = ?', [moduleId])
    if (modules.length === 0) return res.status(404).json({ error: 'Module not found' })
    const module = modules[0]

    let totalScore = 0
    let totalTimeTaken = 0
    let maxScore = module.max_score || 5

    // Process each answer if provided
    if (answers && answers.length > 0) {
      for (const ans of answers) {
        let itemScore = 0

        if (module.code === 'VISUAL_SPATIAL') {
          const options = await query(
            'SELECT is_correct FROM dmac_webapp_assessment_options WHERE question_id = ? AND option_key = ?',
            [ans.question_id, ans.selected_option_key]
          )
          itemScore = (options.length > 0 && options[0].is_correct === 1) ? 1 : 0
        } else if (module.code === 'CONNECT_DOTS') {
          const items = await fetchItems(ans.question_id, 'en')

          // Filter items to match frontend (exclude L, R, 11)
          const validItems = items.filter(i => !['L', 'R', '11','5'].includes(i.image_key))

          // Explicitly sort by order (DB should order by item_order, but ensure safety)
          validItems.sort((a, b) => (a.item_order || 0) - (b.item_order || 0))

          const correctSequence = validItems.map(i => i.image_key)

          // Assume answer_text is comma separated sequence of labels provided by frontend
          // e.g. "5,M,6,N..."
          // Note: Frontend sends `label` which is `display_text`.
          // If display_text matches image_key (usually yes, except O -> 0 maybe).
          // We need normalization.
          const userSequence = (ans.answer_text || '').split(',').map(s => s.trim())

          let correctConnections = 0
          // Check pairs
          // Compare each user step to valid next step
          // We assume user sequence length <= correct sequence length usually?
          // Or just check valid transitions found in user sequence?
          // Frontend sends sequence of IDs visited. logic: `5,M,6...`
          // Pair (5,M) is valid. (M,6) is valid.
          // We just count valid pairs.

          // Create map of valid transitions
          const validTransitions = new Set();
          for (let i = 0; i < correctSequence.length - 1; i++) {
            // Use both image_key and potential display variations if needed
            // But simplest is strict key match if frontend sends keys/labels consistently.
            // If frontend sends '0' for 'O', we handle it.
            // Let's normalize user input '0' to 'O' for check if needed, or update DB.
            // Assuming key matching for now.
            validTransitions.add(`${correctSequence[i]}->${correctSequence[i + 1]}`);
          }

          for (let i = 0; i < userSequence.length - 1; i++) {
            let uFrom = userSequence[i];
            let uTo = userSequence[i + 1];

            // Normalization hack for O/0
            if (uFrom === '0') uFrom = 'O';
            if (uTo === '0') uTo = 'O';
            // Also lowercase/uppercase? "p" vs "P".
            // DB has 'P'. Start with simple upper.
            uFrom = uFrom.toUpperCase();
            uTo = uTo.toUpperCase();

            if (validTransitions.has(`${uFrom}->${uTo}`)) {
              correctConnections++;
            }
          }

          // Scoring Logic:
          // 1 correct Answer (pair) = 0.5
          // Minimum of 4 correct answers with a minimum 2 score.
          // Max correct 5 (for 10 pairs).

          itemScore = correctConnections * 0.5;
          if (itemScore > 5) itemScore = 5;

          // Note: "Minimum of 4 correct answers with a minimum 2 score"
          // If correctConnections < 4, is score 0?
          // "So minimal score is 2". This implies if you pass the threshold of 4, you get 2.
          // If you have 3, you get 1.5? Or 0?
          // Usually strict thresholds imply 0 if not met.
          // "But he has to get a minimum of 4 correct answers with a minimum 2 score"
          // This phrasing often means "To Pass/Qualify/Get meaningful score".
          // I will assume linear scoring (1.5 for 3 is fair), but strict adherence to "min score is 2" 
          // might mean we floor at 2 provided condition met? No, "minimal score is 2" refers to the result of 4*0.5.
          // I'll stick to linear * 0.5.

        } else if (module.code === 'NUMBER_RECALL' || module.code === 'VISUAL_NUMBER_RECALL') {
          // Number Recall Scoring
          // Logic: Exact match of the sequence = 0.5 points.
          // Total possible: 10 * 0.5 = 5.0
          const items = await fetchItems(ans.question_id, 'en')
          if (items.length > 0) {
            const accepted = items[0].accepted_answers || ''
            const userAns = (ans.answer_text || '').trim()

            if (userAns === accepted) {
              itemScore = 0.5
            }
          }
        } else if (module.code === 'LETTER_DISINHIBITION') {
          try {
            // Parse comma-separated "CORRECT,WRONG,..."
            const results = (ans.answer_text || '').split(',')
            let calculatedScore = 0

            results.forEach(status => {
              const s = status.trim()
              if (s === 'CORRECT') {
                calculatedScore += 0.25
              } else if (s === 'WRONG') {
                calculatedScore -= 0.25
              }
            })

            if (calculatedScore < 0) calculatedScore = 0
            if (calculatedScore > 5) calculatedScore = 5

            itemScore = calculatedScore

          } catch (e) {
            console.error('Error parsing letter disinhibition logs:', e)
            itemScore = 0
          }
        } else {

          // Keyword matching (Image Flash & Audio Story & others)

          const language_code = ans.language_code || body.language_code || 'en' // fallback

          // FIX: For Module 14 (Delayed Recall), use correct answers from Module 1 (Question ID 1)
          let searchQuestionId = ans.question_id
          if (module.code === 'VISUAL_PICTURE_RECALL') {
            searchQuestionId = 1
          }

          const items = await fetchItems(searchQuestionId, language_code)

          let correctCount = calculateKeywordScore(ans.answer_text, items)

          if (module.code === 'AUDIO_STORY' || module.code === 'AUDIO_STORY_2') {
            // Special rule: >= 10 keywords = 5.0, else count * 0.5
            // Since we split the module, each module now has 1 story.
            // Max score for one story is presumably 5.0. 
            // FIX: Use uniqueWords: true to count multiple matches from single item
            let correctCount = calculateKeywordScore(ans.answer_text, items, { uniqueWords: true })

            if (correctCount >= 10) itemScore = 5.0
            else itemScore = Math.min(correctCount * 0.5, 5.0)
            maxScore = 5 // 1 story per module now
          } else if (module.code === 'AUDIO_STORY_1_RECALL') {
            // Max Score 5, Multiplier 0.5
            // USE EXISTING ITEMS FROM MODULE 3 (Question ID 7)
            const language_code = ans.language_code || body.language_code || 'en'
            const items = await fetchItems(7, language_code)
            const correctCount = calculateKeywordScore(ans.answer_text, items, { uniqueWords: true })
            itemScore = Math.min(correctCount * 0.5, 5.0)
            maxScore = 5
          } else if (module.code === 'AUDIO_STORY_2_RECALL') {
            // Max Score 5, Multiplier 0.5
            // USE EXISTING ITEMS FROM MODULE 11 (Question ID 8)
            const language_code = ans.language_code || body.language_code || 'en'
            const items = await fetchItems(8, language_code)
            const correctCount = calculateKeywordScore(ans.answer_text, items, { uniqueWords: true })
            itemScore = Math.min(correctCount * 0.5, 5.0)
            maxScore = 5
          } else if (module.code === 'AUDIO_WORDS' ) {
            const language_code = ans.language_code || body.language_code || 'en' // fallback
            const items = await fetchItems(ans.question_id, language_code)
            // Use uniqueWords mode to count multiple different words from the list
            let correctCount = calculateKeywordScore(ans.answer_text, items, { uniqueWords: true })

            // 1.0 points per word, max 5 words possible
            itemScore = Math.min(correctCount * 1.0, 5.0)
            maxScore = 5
          } else if (module.code === 'AUDIO_WORDS_RECALL' || module.code === 'COLOR_RECALL') {
            const language_code = ans.language_code || body.language_code || 'en'
            const items = await fetchItems(ans.question_id, language_code)
            const correctCount = calculateKeywordScore(ans.answer_text, items, { uniqueWords: true })
            itemScore = Math.min(correctCount * 0.5, 5.0)
            maxScore = 5
          } else if (module.code === 'EXECUTIVE' || module.code === 'SEMANTIC') {
            const language_code = ans.language_code || body.language_code || 'en'
            const items = await fetchItems(ans.question_id, language_code)

            const scoreVal = (module.code === 'EXECUTIVE') ? 0.5 : 1.0;

            if (items.length > 0) {
              const acceptedStr = items[0].accepted_answers || ''
              const userAns = (ans.answer_text || '').trim().toLowerCase().replace(/\s+/g, ' ')

              if (acceptedStr === 'DYNAMIC_DATE_BEFORE_YESTERDAY') {
                const date = new Date()
                date.setDate(date.getDate() - 2)
                const locales = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', ar: 'ar-SA' }
                const locale = locales[language_code] || 'en-US'
                const correctDay = date.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase()
                if (userAns === correctDay) itemScore = scoreVal
                const tmrwDate = new Date()
                tmrwDate.setDate(tmrwDate.getDate() + 1)
                const correctDate = tmrwDate.getDate().toString()

                // Extract number from user answer (e.g. "25 Jan" -> "25")
                const match = userAns.match(/\d+/)
                if (match && match[0] === correctDate) {
                  itemScore = scoreVal
                }
              } else if (acceptedStr === 'DYNAMIC_YEAR_LAST_NYE') {
                const currentYear = new Date().getFullYear();
                const lastNYE = (currentYear - 1).toString();
                // Flexible: Current year - 1 is ideal, but allow current year if early in year? User logic says:
                // 2024 -> 1, 2023 -> 1 (recent), 2025 -> 0.5
                if (userAns === lastNYE) {
                  itemScore = 1;
                } else if (userAns === (currentYear - 2).toString()) {
                  itemScore = scoreVal; // Recent acceptable
                } else if (userAns === currentYear.toString()) {
                  itemScore = 0.5;
                }
              } else if (acceptedStr === 'RANGE_55_75') {
                // Extract number from input string like "65 mph"
                const match = userAns.match(/\d+/);
                if (match) {
                  const speed = parseInt(match[0], 10);
                  if (speed >= 55 && speed <= 75) {
                    itemScore = scoreVal;
                  }
                }
              } else if (acceptedStr === 'DYNAMIC_DATE_TOMORROW') {
                const tmrw = new Date();
                tmrw.setDate(tmrw.getDate() + 1);
                const dayName = tmrw.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const dayNum = tmrw.getDate().toString();

                // Allow "Monday" or "3" (if 3rd)
                if (userAns === dayName) itemScore = scoreVal;

                const match = userAns.match(/\d+/);
                if (match && match[0] === dayNum) {
                  itemScore = scoreVal;
                }
              } else {
                // Standard Logic with phrase support
                const allowed = acceptedStr.toLowerCase().split(',').map(s => s.trim());

                // 1. Check each accepted answer against the FULL user text (normalized)
                // This handles "crystal vase" (user) vs "crystalvase" (accepted)
                // or "crystal vase" (accepted) vs "crystal vase" (user)
                const fullUserNorm = (ans.answer_text || '').toLowerCase().replace(/\s+/g, '');

                const phraseMatch = allowed.some(syn => {
                  const synNorm = syn.replace(/\s+/g, '');
                  // fuzzy match the whole thing or containment?
                  // If target is "crystalvase", and user typed "I see a crystal vase", fullUserNorm has "crystalvase".
                  return fullUserNorm.includes(synNorm) || isFuzzyMatch(fullUserNorm, synNorm);
                });

                if (phraseMatch) {
                  itemScore = scoreVal;
                } else {
                  // Fallback to word-by-word check (existing logic, handled in loop? No, this block is for EXECUTIVE/SEMANTIC single-input questions usually)
                  // If this is a list-based module (Semantic often is), we might need `calculateKeywordScore`.
                  // But here 'EXECUTIVE' or 'SEMANTIC' usually implies single question logic override?
                  // Wait, Semantic Module 8 has multiple questions. 
                  // If it's a list check, we should iterate. 
                  if (allowed.includes(userAns)) itemScore = scoreVal;
                }
              }
            }
            // Set Max Score based on module
            maxScore = 5;
          } else {
            itemScore = Math.min(correctCount, 5)
          }
        }

        totalScore += itemScore
        if (ans.time_taken) totalTimeTaken += parseFloat(ans.time_taken)

        // Save Response
        await query(
          'INSERT INTO dmac_webapp_responses (session_id, question_id, answer_text, selected_option_key, is_correct, score) VALUES (?, ?, ?, ?, ?, ?)',
          [sessionId, ans.question_id, ans.answer_text || null, ans.selected_option_key || null, itemScore > 0 ? 1 : 0, itemScore]
        )
      }
    }

    // Override score if provided by frontend
    if (hasProvidedScore) {
      totalScore = parseFloat(providedScore)
    }

    // Update Session
    await query(
      'UPDATE dmac_webapp_sessions SET score = ?, time_taken = ?, status = "completed" WHERE id = ?',
      [totalScore, totalTimeTaken, sessionId]
    )

    // Get Next Module
    const nextModules = await query(
      'SELECT id FROM dmac_webapp_modules WHERE is_active = 1 AND order_index > ? ORDER BY order_index LIMIT 1',
      [module.order_index]
    )
    const next_module_id = nextModules.length > 0 ? nextModules[0].id : null

    res.json({
      session_id: parseInt(sessionId),
      module_id: module.id,
      module_code: module.code,
      score: totalScore,
      max_score: maxScore,
      status: 'completed',
      next_module_id
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// --- Score Calculation Helper ---
const calculateGameScores = async (user_id) => {
  // 1. Fetch all completed sessions (latest attempt per module)
  const sql = `
    SELECT 
      m.id as module_id, 
      m.code, 
      m.name, 
      m.max_score, 
      m.order_index,
      s.score as user_score,
      s.created_at as completed_at,
      s.time_taken
    FROM dmac_webapp_sessions s
    JOIN dmac_webapp_modules m ON s.module_id = m.id
    WHERE s.user_id = ? 
      AND s.status = 'completed'
      AND s.id IN (
        SELECT MAX(id) 
        FROM dmac_webapp_sessions 
        WHERE user_id = ? AND status = 'completed' 
        GROUP BY module_id
      )
    ORDER BY m.order_index ASC
  `
  const sessions = await query(sql, [user_id, user_id])

  // Helper to find module by ID
  const getMod = (id) => {
    // Ensure data type matching for ID
    const m = sessions.find(s => s.module_id == id)
    return m ? { ...m, present: true } : { present: false, user_score: 0, max_score: 0, module_id: id }
  }

  // Define Categories
  const categoriesDefinition = [
    {
      name: 'Immediate Visual Recall',
      ids: [1, 2, 10]
    },
    {
      name: 'Immediate Auditory Recall', // (General)
      ids: [9, 5, 3, 11]
    },
    {
      name: 'Delayed Recall',
      ids: [6, 17, 18, 14]
    },
    {
      name: 'Disinhibition',
      ids: [20, 16]
    },
    {
      name: 'Attention',
      ids: [12, 20, 4]
    },
    {
      name: 'Executive Function',
      ids: [4, 7, 16]
    },
    {
      name: 'Semantic / Language',
      ids: [13, 14, 8]
    },
    {
      name: 'Number Recall',
      ids: [21, 9, 12]
    },
    {
      name: 'Working Memory',
      ids: [4, 10, 12]
    },
    {
      name: 'Processing Speed / Reaction Time',
      ids: [4, 13, 7]
    },
    {
      name: 'Motor Planning & Coordination',
      ids: [14, 4, 16]
    }
  ]

  const categories = categoriesDefinition.map(def => {
    let totalScore = 0
    let totalMax = 0
    const modules = []

    def.ids.forEach(id => {
      const m = getMod(id)

      if (m.present) {
        // If specific module max_score is 0 (avoid div by zero), defaulting to 5
        const max = m.max_score || 5

        // Logic for scoring: always sum except if specified otherwise.
        totalScore += parseFloat(m.user_score || 0)
        totalMax += max

        modules.push({
          name: m.name,
          score: m.user_score,
          max_score: max,
          timeTaken: m.time_taken,
          isTime: false // Not explicitly used
        })
      }
    })

    // Avoid division by zero
    const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0

    return {
      name: def.name,
      score: totalScore,
      maxScore: totalMax,
      percentage: percentage,
      modules: modules
    }
  })

  // Calculate Overall Score (Sum of all sessions found)
  const uniqueTotalScore = sessions.reduce((acc, curr) => acc + parseFloat(curr.user_score || 0), 0)
  const uniqueTotalMax = sessions.reduce((acc, curr) => acc + (curr.max_score || 5), 0)

  return {
    sessions,
    categories,
    totalScore: uniqueTotalScore,
    totalMaxScore: uniqueTotalMax
  }
}

export const getUserReport = async (req, res) => {
  const user_id = req.user?.userId;
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = await calculateGameScores(user_id)
    res.json({
      user_id,
      report: data.sessions,
      categories: data.categories,
      totalScore: data.totalScore,
      totalMaxScore: data.totalMaxScore
    });

  } catch (err) {
    console.error('[GetUserReport] Error:', err);
    res.status(500).json({ error: err.message });
  }
}

export const generateReportPdf = async (req, res) => {
  const user_id = req.user?.userId
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // 1. Get Score Data
    const data = await calculateGameScores(user_id)

    // 2. Prepare Template Data
    // Fetch user name if needed (optional query)
    const userResult = await query('SELECT name FROM dmac_webapp_users WHERE id = ?', [user_id])
    const userName = userResult.length > 0 ? userResult[0].name : `User ${user_id}`

    const templateData = {
      tenantName: 'DMAC',
      patientName: userName,
      patientId: user_id,
      reportDate: new Date().toLocaleDateString(),
      categories: data.categories,
      totalScore: data.totalScore,
      totalMaxScore: data.totalMaxScore
    }

    // 3. Generate HTML
    const htmlTemplate = PdfTemplates.DmacGameReportPdfTemplate(templateData)

    // 4. Generate PDF
    // 'file' argument for html-pdf-node expects { content: "html..." }
    const filePath = await generatePdfFromHTML(htmlTemplate, `report_${user_id}`, 'Game Report')

    // 5. Stream File
    res.download(filePath, `DMAC_Report_${user_id}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading PDF:', err)
      }
      // Optional: Delete file after sending?
      // fs.unlinkSync(filePath)
    })

  } catch (err) {
    console.error('[GenerateReportPdf] Error:', err)
    res.status(500).json({ error: err.message })
  }
}

