import { db } from '../connect.js'

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
     FROM questions q
     LEFT JOIN questions_i18n qi ON q.id = qi.question_id AND qi.language_code = ?
     WHERE q.module_id = ?
     ORDER BY q.order_index`,
    [languageCode, moduleId]
  )
}

const fetchItems = async (questionId, languageCode) => {
  return query(
    `SELECT qi.id as question_item_id, qi.item_order, qi.image_key, qi.image_url, 
            t.audio_url, t.accepted_answers
     FROM question_items qi
     JOIN question_item_i18n t ON qi.id = t.question_item_id
     WHERE qi.question_id = ? AND t.language_code = ?
     ORDER BY qi.item_order`,
    [questionId, languageCode]
  )
}

const fetchOptions = async (questionId) => {
  return query(
    'SELECT option_key, image_url, is_correct FROM question_options WHERE question_id = ?',
    [questionId]
  )
}

const calculateKeywordScore = (userText, items) => {
  const userWords = (userText || '').toLowerCase().split(/[\s,]+/).filter(Boolean)
  let correctCount = 0
  const matchedItems = new Set()

  // Flatten all synonyms into a list of { text, itemId } for easier checking?
  // Or iterate words against items.
  // Logic matches original: iterate user words, check against synonyms.
  for (const word of userWords) {
    for (const item of items) {
      if (matchedItems.has(item.question_item_id)) continue

      const synonyms = (item.accepted_answers || '')
        .toLowerCase()
        .split(',')
        .map((s) => s.trim().replace(/\.$/, '')) // remove trailing dots if any

      // Also check normalized (no space) version as per AudioStory logic
      const normalizedWord = word.replace(/\s+/g, '')

      // Check exact word match or normalized containment
      const isMatch = synonyms.some(syn => {
        const normalizedSyn = syn.replace(/\s+/g, '')
        return syn === word || (normalizedSyn.length > 3 && normalizedWord.includes(normalizedSyn))
      })

      if (isMatch) {
        correctCount++
        matchedItems.add(item.question_item_id)
        break // Move to next user word
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
  'IMAGE_FLASH': handleDefault,
  'EXECUTIVE': handleExecutive,
  'SEMANTIC': handleSemantic,
  'NUMBER_RECALL': handleExecutive, // Reuse handleExecutive as it returns checks for all items which fits
  'REVERSE_NUMBER_RECALL': handleExecutive,
  'COLOR_RECALL': handleExecutive,
  'GROUP_MATCHING': handleSemantic,
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
       FROM modules m
       LEFT JOIN modules_i18n mi ON m.id = mi.module_id AND mi.language_code = ?
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
       FROM modules m
       LEFT JOIN modules_i18n mi ON m.id = mi.module_id AND mi.language_code = ?
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
        'SELECT id FROM sessions WHERE user_id = ? AND module_id = ? AND status = "in_progress" ORDER BY created_at DESC LIMIT 1',
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
        'INSERT INTO sessions (user_id, module_id, score, status) VALUES (?, ?, 0, "in_progress")',
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
    // Count sessions for Module 1 (Visual Picture Recall)
    const result = await query(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND module_id = 1',
      [user_id]
    );
    const count = result[0].count;
    const max_attempts = 3;

    res.json({
      count,
      max_attempts,
      allowed: count < max_attempts
    });
  } catch (err) {
    console.error('[GetAttemptStatus] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

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

  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: 'No answers provided' })
  }

  try {
    const modules = await query('SELECT * FROM modules WHERE id = ?', [moduleId])
    if (modules.length === 0) return res.status(404).json({ error: 'Module not found' })
    const module = modules[0]

    let totalScore = 0
    let maxScore = module.max_score || 5

    // Process each answer
    for (const ans of answers) {
      let itemScore = 0

      if (module.code === 'VISUAL_SPATIAL') {
        const options = await query(
          'SELECT is_correct FROM question_options WHERE question_id = ? AND option_key = ?',
          [ans.question_id, ans.selected_option_key]
        )
        itemScore = (options.length > 0 && options[0].is_correct === 1) ? 1 : 0
      } else if (module.code === 'CONNECT_DOTS') {
        const items = await fetchItems(ans.question_id, 'en')
        // Assume answer_text is comma separated sequence e.g. "L,5,M..."
        const userSequence = (ans.answer_text || '').split(',')
        const correctSequence = items.map(i => i.image_key)

        let correctConnections = 0
        // Check pairs
        for (let i = 0; i < Math.min(userSequence.length, correctSequence.length) - 1; i++) {
          if (userSequence[i] === correctSequence[i] && userSequence[i + 1] === correctSequence[i + 1]) {
            correctConnections++
          }
        }

        const totalConnections = Math.max(1, correctSequence.length - 1)
        const sequenceScore = (correctConnections / totalConnections) * 4.0

        // Time Bonus
        let timeBonus = 0
        const timeTaken = parseFloat(ans.time_taken || 0)
        if (timeTaken > 0) {
          if (timeTaken <= 30) timeBonus = 1.0
          else if (timeTaken <= 45) timeBonus = 0.5
        }

        itemScore = Math.min(5, sequenceScore + timeBonus)
      } else if (module.code === 'NUMBER_RECALL') {
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
      } else {

        // Keyword matching (Image Flash & Audio Story & others)

        const language_code = ans.language_code || body.language_code || 'en' // fallback
        const items = await fetchItems(ans.question_id, language_code)

        let correctCount = calculateKeywordScore(ans.answer_text, items)

        if (module.code === 'AUDIO_STORY' || module.code === 'AUDIO_STORY_2') {
          // Special rule: >= 10 keywords = 5.0, else count * 0.5
          // Since we split the module, each module now has 1 story.
          // Max score for one story is presumably 5.0. 
          if (correctCount >= 10) itemScore = 5.0
          else itemScore = Math.min(correctCount * 0.5, 5.0)
          maxScore = 5 // 1 story per module now
        } else if (module.code === 'AUDIO_WORDS') {
          // 0.5 points per word, max 10 words possible
          if (correctCount >= 10) {
            itemScore = 5.0
          } else {
            itemScore = Math.min(correctCount * 0.5, 5.0)
          }
          maxScore = 5
        } else if (module.code === 'EXECUTIVE' || module.code === 'SEMANTIC') {
          const language_code = ans.language_code || body.language_code || 'en'
          const items = await fetchItems(ans.question_id, language_code)

          if (items.length > 0) {
            const acceptedStr = items[0].accepted_answers || ''
            const userAns = (ans.answer_text || '').trim().toLowerCase().replace(/\s+/g, ' ')

            if (acceptedStr === 'DYNAMIC_DATE_BEFORE_YESTERDAY') {
              const date = new Date()
              date.setDate(date.getDate() - 2)
              const locales = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', ar: 'ar-SA' }
              const locale = locales[language_code] || 'en-US'
              const correctDay = date.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase()
              if (userAns === correctDay) itemScore = 1
            } else if (acceptedStr === 'DYNAMIC_DATE_TOMORROW') {
              const date = new Date()
              date.setDate(date.getDate() + 1)
              const correctDate = date.getDate().toString()
              if (userAns === correctDate) itemScore = 1
            } else if (acceptedStr === 'DYNAMIC_YEAR_LAST_NYE') {
              const currentYear = new Date().getFullYear();
              const lastNYE = (currentYear - 1).toString();
              // Flexible: Current year - 1 is ideal, but allow current year if early in year? User logic says:
              // 2024 -> 1, 2023 -> 1 (recent), 2025 -> 0.5
              if (userAns === lastNYE) {
                itemScore = 1;
              } else if (userAns === (currentYear - 2).toString()) {
                itemScore = 1; // Recent acceptable
              } else if (userAns === currentYear.toString()) {
                itemScore = 0.5;
              }
            } else if (acceptedStr === 'RANGE_55_75') {
              // Extract number from input string like "65 mph"
              const match = userAns.match(/\d+/);
              if (match) {
                const speed = parseInt(match[0], 10);
                if (speed >= 55 && speed <= 75) {
                  itemScore = 1;
                }
              }
            } else {
              const allowed = acceptedStr.toLowerCase().split(',').map(s => s.trim())
              if (allowed.includes(userAns)) itemScore = 1
            }
          }
          // Set Max Score based on module
          maxScore = (module.code === 'EXECUTIVE') ? 10 : 5;
        } else {
          itemScore = Math.min(correctCount, 5)
        }
      }

      totalScore += itemScore

      // Save Response
      await query(
        'INSERT INTO responses (session_id, question_id, answer_text, selected_option_key, is_correct) VALUES (?, ?, ?, ?, ?)',
        [sessionId, ans.question_id, ans.answer_text || null, ans.selected_option_key || null, itemScore > 0 ? 1 : 0]
      )
    }

    // Update Session
    await query(
      'UPDATE sessions SET score = ?, status = "completed" WHERE id = ?',
      [totalScore, sessionId]
    )

    // Get Next Module
    const nextModules = await query(
      'SELECT id FROM modules WHERE is_active = 1 AND order_index > ? ORDER BY order_index LIMIT 1',
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
