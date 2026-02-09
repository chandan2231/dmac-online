import { db } from '../connect.js'

// export const getQuestionWithFollowUps = (req, res) => {
//   const { sequenceNo } = req.params;
//   const lang = req.query.lang || 'en';

//   // Query to get main + follow-ups
//   const questionQuery = `
//     SELECT
//       q.id AS question_id,
//       q.parent_question_id,
//       q.trigger_option,
//       q.sequence_no,
//       qt.text AS question_text,
//       o.code AS option_code,
//       ot.text AS option_text,
//       a.id AS alert_id,
//       at.text AS alert_text
//     FROM dmac_webapp_questions q
//     JOIN dmac_webapp_questions_translations qt
//       ON q.id = qt.question_id AND qt.language_code = ?
//     JOIN dmac_webapp_question_options o
//     JOIN dmac_webapp_question_option_translations ot
//       ON o.id = ot.option_id AND ot.language_code = ?
//     LEFT JOIN dmac_webapp_question_alerts a ON q.alert_id = a.id
//     LEFT JOIN dmac_webapp_question_alert_translations at
//       ON a.id = at.alert_id AND at.language_code = ?
//     WHERE q.sequence_no = ?
//     ORDER BY q.parent_question_id IS NULL DESC, q.id ASC
//   `;

//   db.query(questionQuery, [lang, lang, lang, sequenceNo], (err, rows) => {
//     if (err) return res.status(500).json(err);
//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: 'No question found for that sequence' });
//     }

//     // Build options list
//     const optionsMap = new Map();
//     rows.forEach(r => {
//       if (!optionsMap.has(r.option_code)) {
//         optionsMap.set(r.option_code, { code: r.option_code, text: r.option_text });
//       }
//     });
//     const options = Array.from(optionsMap.values());

//     // Find main question
//     const mainRow = rows.find(r => r.parent_question_id === null);
//     if (!mainRow) {
//       return res.status(500).json({ message: 'Main question missing for this sequence' });
//     }

//     // Build follow-ups
//     const followUpsById = {};
//     rows.filter(r => r.parent_question_id !== null).forEach(r => {
//       if (!followUpsById[r.question_id]) {
//         followUpsById[r.question_id] = {
//           id: r.question_id,
//           text: r.question_text,
//           trigger_option: r.trigger_option,
//           alert: r.alert_text || null,
//           options: []
//         };
//       }
//       const opts = followUpsById[r.question_id].options;
//       if (!opts.find(o => o.code === r.option_code)) {
//         opts.push({ code: r.option_code, text: r.option_text });
//       }
//     });
//     const follow_ups = Object.values(followUpsById);

//     // Get next sequence number
//     const nextSeqQuery = `
//       SELECT MIN(sequence_no) AS next_sequence
//       FROM dmac_webapp_questions
//       WHERE sequence_no > ?
//     `;
//     db.query(nextSeqQuery, [sequenceNo], (err2, nextRows) => {
//       if (err2) return res.status(500).json(err2);

//       const next_sequence = nextRows && nextRows[0] ? nextRows[0].next_sequence : null;

//       res.status(200).json({
//         sequence_no: Number(sequenceNo),
//         next_sequence: next_sequence ? Number(next_sequence) : null,
//         main_question: {
//           id: mainRow.question_id,
//           text: mainRow.question_text,
//           options,
//           alert: mainRow.alert_text || null
//         },
//         follow_ups
//       });
//     });
//   });
// };

export const getQuestionWithFollowUps = (req, res) => {
  const { sequenceNo } = req.params
  const lang = req.query.lang || 'en'

  const questionQuery = `
    SELECT
      q.id AS question_id,
      q.parent_question_id,
      q.trigger_option,
      q.sequence_no,
      qt.text AS question_text,
      o.code AS option_code,
      ot.text AS option_text,
      a.id AS alert_id,
      COALESCE(at.text, at_en.text) AS alert_text
    FROM dmac_webapp_questions q
    JOIN dmac_webapp_questions_translations qt
      ON q.id = qt.question_id AND qt.language_code = ?
    JOIN dmac_webapp_question_options_map om
      ON q.id = om.question_id
    JOIN dmac_webapp_question_options o
      ON om.option_id = o.id
    JOIN dmac_webapp_question_option_translations ot
      ON o.id = ot.option_id AND ot.language_code = ?
    LEFT JOIN dmac_webapp_question_alerts a ON q.alert_id = a.id
    LEFT JOIN dmac_webapp_question_alert_translations at
      ON a.id = at.alert_id AND at.language_code = ?
    LEFT JOIN dmac_webapp_question_alert_translations at_en
      ON a.id = at_en.alert_id AND at_en.language_code = 'en'
    WHERE q.sequence_no = ?
    ORDER BY q.parent_question_id IS NULL DESC, q.id ASC
  `

  db.query(questionQuery, [lang, lang, lang, sequenceNo], (err, rows) => {
    if (err) return res.status(500).json(err)
    if (!rows || rows.length === 0)
      return res
        .status(404)
        .json({ message: 'No question found for that sequence' })

    // Build options list
    const optionsMap = new Map()
    rows.forEach((r) => {
      if (!optionsMap.has(r.option_code)) {
        optionsMap.set(r.option_code, {
          code: r.option_code,
          text: r.option_text
        })
      }
    })
    const options = Array.from(optionsMap.values())

    // Main question
    const mainRow = rows.find((r) => r.parent_question_id === null)
    if (!mainRow)
      return res
        .status(500)
        .json({ message: 'Main question missing for this sequence' })

    // Follow-ups
    const followUpsById = {}
    rows
      .filter((r) => r.parent_question_id !== null)
      .forEach((r) => {
        if (!followUpsById[r.question_id]) {
          followUpsById[r.question_id] = {
            id: r.question_id,
            text: r.question_text,
            trigger_option: r.trigger_option,
            alert: r.alert_text || null,
            options: []
          }
        }
        const opts = followUpsById[r.question_id].options
        if (!opts.find((o) => o.code === r.option_code)) {
          opts.push({ code: r.option_code, text: r.option_text })
        }
      })
    const follow_ups = Object.values(followUpsById)

    // Next sequence
    const nextSeqQuery = `SELECT MIN(sequence_no) AS next_sequence FROM dmac_webapp_questions WHERE sequence_no > ?`
    db.query(nextSeqQuery, [sequenceNo], (err2, nextRows) => {
      if (err2) return res.status(500).json(err2)

      const next_sequence =
        nextRows && nextRows[0] ? nextRows[0].next_sequence : null

      res.status(200).json({
        sequence_no: Number(sequenceNo),
        next_sequence: next_sequence ? Number(next_sequence) : null,
        main_question: {
          id: mainRow.question_id,
          text: mainRow.question_text,
          options,
          trigger_option: mainRow.trigger_option, // <-- added here
          alert: mainRow.alert_text || null
        },
        follow_ups
      })
    })
  })
}

export const saveQuestionnaireAnswer = (req, res) => {
  const { userId, questionId, mainAnswer, followUpAnswer } = req.body

  if (!userId || !questionId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const query = `
    INSERT INTO dmac_webapp_questionnaire_answers 
    (user_id, question_id, main_answer, follow_up_answer) 
    VALUES (?, ?, ?, ?)
  `

  db.query(
    query,
    [userId, questionId, mainAnswer, followUpAnswer || null],
    (err, result) => {
      if (err) {
        console.error('Error saving answer:', err)
        return res.status(500).json({ message: 'Error saving answer' })
      }
      res.status(200).json({ message: 'Answer saved successfully' })
    }
  )
}


export const getPageContent = (req, res) => {
  const { pageKey } = req.params
  const { lang } = req.query
  if (!lang) {
    return res.status(400).json({ error: 'Language code (lang) is required' })
  }

  const query = `
    SELECT t.title, t.content, t.doctor_info, t.link_text, t.button_text, t.secondary_button_text
    FROM dmac_webapp_page p
    JOIN dmac_webapp_page_translations t ON p.id = t.page_id
    WHERE p.page_key = ? AND t.language_code = ?
  `

  db.query(query, [pageKey, lang], (err, results) => {
    if (err) {
      console.error('Query error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'Content not found for this language' })
    }
    res.json(results[0])
  })
}

export const getUiTexts = (req, res) => {
  const lang = req.query.lang || 'en'

  const sql = `
    SELECT ut.code, utt.text
    FROM dmac_webapp_ui_texts ut
    JOIN dmac_webapp_ui_text_translations utt
      ON ut.id = utt.ui_text_id
    WHERE utt.language_code = ? AND ut.status = 1
  `

  db.query(sql, [lang], (err, rows) => {
    if (err) return res.status(500).json(err)

    const response = {}
    rows.forEach((r) => {
      response[r.code] = r.text // { cancel: "Cancel", start: "Start", ... }
    })

    return res.status(200).json(response)
  })
}

export const getUserQuestionnaireAnswers = (req, res) => {
  const userId = req.user?.userId || req.query.userId; // Prefer authenticated user, allow query param for admin scenarios if needed later
  const lang = req.query.lang || 'en'

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID required' });
  }

  const query = `
    SELECT 
      qa.id,
      qa.question_id,
      qa.main_answer,
      qa.follow_up_answer,
      qa.created_at,
      qt.text as question_text,
      q.sequence_no
    FROM dmac_webapp_questionnaire_answers qa
    JOIN dmac_webapp_questions q ON qa.question_id = q.id
    LEFT JOIN dmac_webapp_questions_translations qt ON q.id = qt.question_id AND qt.language_code = ?
    WHERE qa.user_id = ?
    ORDER BY q.sequence_no ASC, qa.created_at DESC
  `

  db.query(query, [lang, userId], (err, rows) => {
    if (err) {
      console.error('Error fetching user answers:', err);
      return res.status(500).json({ error: 'Database error fetching answers' });
    }

    // Group by question_id to get only the latest answer per question if multiple exist? 
    // Or just return all history. The requirement "get the answers" usually implies the current state.
    // The query orders by created_at DESC, so we can filter in JS if unique per question needed.
    // For now, returning full list.

    res.json(rows);
  });
} 
