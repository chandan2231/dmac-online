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
    `SELECT q.id, q.module_id, q.code, q.question_type, q.order_index, q.correct_answer_text,
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
  const { moduleId } = req.params
  const { user_id, language_code } = req.body
  console.log(`[StartSession] starting for module ${moduleId}, user ${user_id}, lang ${language_code}`);

  if (!user_id || !language_code) {
    return res.status(400).json({ error: 'Missing user_id or language_code' })
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
    )
    if (modules.length === 0) {
      return res.status(404).json({ error: 'Module not found' })
    }
    const module = modules[0]

    // 2. Create Session
    const result = await query(
      'INSERT INTO sessions (user_id, module_id, score, status) VALUES (?, ?, 0, "in_progress")',
      [user_id, module.id]
    )
    const sessionId = result.insertId

    // 3. Fetch Questions
    const questions = await fetchQuestions(module.id, language_code)

    // 4. Construct Response Payload based on Data Availability
    // Instead of hardcoding "IF IMAGE_FLASH", "IF VISUAL_SPATIAL", we can look at the data structure.
    // However, frontend expects specific keys: "question", "rounds", "stories".
    // We can populate them all or use module.code to decide which one to send.
    // Using module.code is safer for API contract stability.

    let payload = {
      session_id: sessionId,
      module: {
        id: module.id,
        code: module.code,
        name: module.name,
        max_score: module.max_score
      },
      language_code,
      instructions: module.description
    }

    if (module.code === 'VISUAL_SPATIAL') {
      const rounds = []
      for (const q of questions) {
        const options = await fetchOptions(q.id)
        const target = options.find((o) => o.is_correct === 1)
        rounds.push({
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
      payload.rounds = rounds;

    } else if (module.code === 'AUDIO_STORY') {
      // Return 'stories' array
      const stories = []
      for (const q of questions) {
        const items = await fetchItems(q.id, language_code)
        if (items.length > 0) {
          stories.push({
            question_id: q.id,
            prompt_text: q.prompt_text,
            post_instruction_text: q.correct_answer_text, // Add this line
            item: {
              question_item_id: items[0].question_item_id,
              audio_url: items[0].audio_url,
              image_url: items[0].image_url
            }
          })
        }
      }
      payload.stories = stories;

    } else {
      // Default / IMAGE_FLASH (expects 'question' object with items)
      if (questions.length > 0) {
        const question = questions[0]
        const items = await fetchItems(question.id, language_code)

        payload.question = {
          question_id: question.id,
          prompt_text: question.prompt_text,
          items: items.map((i) => ({
            question_item_id: i.question_item_id,
            order: i.item_order,
            image_key: i.image_key,
            image_url: i.image_url,
            audio_url: i.audio_url
          }))
        }
      }
    }

    res.json(payload)

  } catch (err) {
    console.error('[StartSession] Error:', err);
    res.status(500).json({ error: err.message })
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
      } else {
        // Keyword matching (Image Flash & Audio Story)
        // Audio story has cap 5.0, Image flash cap 5 (count)
        // Also Audio story 10 keywords = 5.0

        const language_code = ans.language_code || body.language_code || 'en' // fallback
        const items = await fetchItems(ans.question_id, language_code)

        // Use improved scoring logic:
        // Simple split comparison might need to be smarter but let's replicate logic
        // Iterate user words vs accepted answers

        let correctCount = calculateKeywordScore(ans.answer_text, items)

        if (module.code === 'AUDIO_STORY') {
          // Special rule: >= 10 keywords = 5.0, else count * 0.5
          if (correctCount >= 10) itemScore = 5.0
          else itemScore = Math.min(correctCount * 0.5, 5.0)
          maxScore = 10 // 2 stories
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
