import { db } from '../connect.js'

const query = (sql, args) => {
  return new Promise((resolve, reject) => {
    db.query(sql, args, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

export const getModules = async (req, res) => {
  try {
    const modules = await query(
      'SELECT * FROM modules WHERE is_active = 1 ORDER BY order_index'
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

  if (!user_id || !language_code) {
    return res.status(400).json({ error: 'Missing user_id or language_code' })
  }

  try {
    const modules = await query('SELECT * FROM modules WHERE id = ?', [
      moduleId
    ])
    if (modules.length === 0)
      return res.status(404).json({ error: 'Module not found' })
    const module = modules[0]

    const result = await query(
      'INSERT INTO sessions (user_id, module_id, score, status) VALUES (?, ?, 0, "in_progress")',
      [user_id, module.id]
    )
    const sessionId = result.insertId

    if (module.code === 'IMAGE_FLASH') {
      const questions = await query(
        'SELECT * FROM questions WHERE module_id = ? AND question_type = "flash_recall"',
        [module.id]
      )
      if (questions.length === 0)
        return res
          .status(500)
          .json({ error: 'No questions found for module' })
      const question = questions[0]

      const items = await query(
        `SELECT qi.id as question_item_id, qi.item_order, qi.image_key, qi.image_url, 
                t.audio_url 
         FROM question_items qi
         JOIN question_item_i18n t ON qi.id = t.question_item_id
         WHERE qi.question_id = ? AND t.language_code = ?
         ORDER BY qi.item_order`,
        [question.id, language_code]
      )

      res.json({
        session_id: sessionId,
        module: {
          id: module.id,
          code: module.code,
          name: module.name,
          max_score: module.max_score
        },
        language_code,
        question: {
          question_id: question.id,
          prompt_text: question.prompt_text,
          items: items.map((i) => ({
            question_item_id: i.question_item_id,
            order: i.item_order,
            image_key: i.image_key,
            image_url: i.image_url,
            audio_url: i.audio_url
          }))
        },
        instructions:
          'You will see 5 images displayed one at a time for 5 seconds each. Then you will be asked to recall them.'
      })
    } else if (module.code === 'VISUAL_SPATIAL') {
      const questions = await query(
        'SELECT * FROM questions WHERE module_id = ? ORDER BY order_index',
        [module.id]
      )

      const rounds = []
      for (const q of questions) {
        const options = await query(
          'SELECT option_key, image_url, is_correct FROM question_options WHERE question_id = ?',
          [q.id]
        )
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

      res.json({
        session_id: sessionId,
        module: {
          id: module.id,
          code: module.code,
          name: module.name,
          max_score: module.max_score
        },
        language_code,
        rounds,
        instructions:
          'You will be shown an image. Then select the same image from 4 choices.'
      })
    } else {
      res.status(400).json({ error: 'Unknown module code' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const submitSession = async (req, res) => {
  const { moduleId, sessionId } = req.params
  
  // We should verify the module ID exists and maybe check if session matches module
  // But for now we rely on module.code retrieved from ID to decide logic
  
  try {
    const modules = await query('SELECT * FROM modules WHERE id = ?', [moduleId])
    if (modules.length === 0) return res.status(404).json({ error: 'Module not found' })
    const module = modules[0]

    if (module.code === 'IMAGE_FLASH') {
        const { question_id, language_code, answer_text } = req.body
        
        // 1. Get items and acceptable answers
        const items = await query(
            `SELECT qi.id, t.accepted_answers 
             FROM question_items qi
             JOIN question_item_i18n t ON qi.id = t.question_item_id
             WHERE qi.question_id = ? AND t.language_code = ?`,
            [question_id, language_code]
        )

        // 2. Process user answers
        const userWords = (answer_text || '').toLowerCase().split(/[\s,]+/).filter(Boolean)
        
        let correctCount = 0
        const matchedItems = new Set()

        for (const word of userWords) {
            for (const item of items) {
                if (matchedItems.has(item.id)) continue; 

                const synonyms = (item.accepted_answers || '').toLowerCase().split(',').map(s => s.trim().replace(/\.$/, ''))
                if (synonyms.includes(word)) {
                    correctCount++
                    matchedItems.add(item.id)
                    break 
                }
            }
            if (correctCount >= 5) break 
        }

        const score = Math.min(correctCount, 5) 

        // 3. Update session
        await query(
            'UPDATE sessions SET score = ?, status = "completed" WHERE id = ?',
            [score, sessionId]
        )

        // 4. Save response
        await query(
            'INSERT INTO responses (session_id, question_id, answer_text, is_correct) VALUES (?, ?, ?, ?)',
            [sessionId, question_id, answer_text, score > 0 ? 1 : 0] 
        )

        res.json({
            session_id: parseInt(sessionId),
            module_id: module.id,
            module_code: module.code,
            language_code,
            score,
            max_score: 5,
            correct_count: correctCount,
            total_items: items.length,
            status: 'completed',
            next_module_code: 'VISUAL_SPATIAL' // This logic might need to be dynamic later
        })

    } else if (module.code === 'VISUAL_SPATIAL') {
        const { answers } = req.body 

        let score = 0
        
        for (const ans of answers) {
            const options = await query(
                'SELECT is_correct FROM question_options WHERE question_id = ? AND option_key = ?',
                [ans.question_id, ans.selected_option_key]
            )
            
            const isCorrect = (options.length > 0 && options[0].is_correct === 1) ? 1 : 0
            score += isCorrect

            await query(
                'INSERT INTO responses (session_id, question_id, selected_option_key, is_correct) VALUES (?, ?, ?, ?)',
                [sessionId, ans.question_id, ans.selected_option_key, isCorrect]
            )
        }

        await query(
            'UPDATE sessions SET score = ?, status = "completed" WHERE id = ?',
            [score, sessionId]
        )

        res.json({
            session_id: parseInt(sessionId),
            module_id: module.id,
            module_code: module.code,
            score,
            max_score: 5, 
            status: 'completed',
            next_module_code: null
        })
    } else {
        res.status(400).json({ error: 'Unknown module code' })
    }
  } catch (err) {
      console.error(err)
      res.status(500).json({ error: err.message })
  }
}
