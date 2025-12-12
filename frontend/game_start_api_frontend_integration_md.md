# Game Start: API & Frontend Integration

> Deliverable: single markdown document you can save as `GAME_START_API_FRONTEND.md` and share with the frontend team. It explains which APIs to call, payloads, responses, how to wire components, UI flow, and example snippets.

---

## Table of contents

1. Purpose
2. High level flow (from screenshot start page)
3. APIs (full list) with request/response examples
4. Frontend components & responsibilities
5. Component architecture (React/React Native) + props/state
6. Integration flow (exact ordering of API calls + UI behavior)
7. Sample request/response code (fetch/axios)
8. Scoring & submit logic (backend contract)
9. i18n / audio handling
10. Error handling and retry rules
11. Testing checklist
12. Appendix: SQL queries used by APIs

---

## 1. Purpose

This document defines the API contract and front-end integration for starting the game from your dashboard (the screen in the screenshot). It covers Module 1 (Image Flash) and Module 2 (Visual Spatial) with multilingual audio support and simple session/response flow. The design uses `module_id` (DB primary key) in APIs so the backend is the single source of truth.

## 2. High-level flow

1. User logs in and lands on the dashboard (screenshot).
2. User presses **Start** (or Done) to begin the game flow.
3. Frontend loads modules list, then starts Module 1 (Image Flash) using `POST /api/modules/{module_id}/session/start`.
4. Frontend shows instructions, plays sequence (images + language-specific audio), then captures free-text answers and submits.
5. Backend returns score + next module id. Frontend starts next module similarly.
6. For Module 2, frontend receives rounds with target image and 4 options; user selects, then frontend submits results.

## 3. APIs (full list)

> Base: `/api`

### 3.1 GET `/api/game/instructions?language_code={lang}`
**Purpose:** fetch global instructions shown before start.

**Response (200):**
```json
{
  "language_code":"hi",
  "title":"...",
  "instructions":["..."]
}
```

---

### 3.2 GET `/api/modules`
**Purpose:** get ordered list of active modules.

**Response:**
```json
{
  "modules": [
    {"id":1,"code":"IMAGE_FLASH","name":"Image Flash Memory","order_index":1,"max_score":5},
    {"id":2,"code":"VISUAL_SPATIAL","name":"Visual Spatial Selection","order_index":2,"max_score":5}
  ]
}
```

---

### 3.3 POST `/api/modules/{module_id}/session/start`
**Purpose:** start module session, returns session id and all content required by frontend to run the module.

**Request body:**
```json
{
  "user_id": 123,
  "language_code": "hi"
}
```

**Behavior:** backend creates a `sessions` row and returns session_id. It returns either an ordered items list (for `flash_recall`) or rounds array (for `visual_spatial`).

**Response (Image Flash example):**
```json
{
  "session_id":1001,
  "module": {"id":1,"code":"IMAGE_FLASH","max_score":5},
  "question": {
    "question_id":1,
    "prompt_text":"Please name as many images as you can remember",
    "items":[
      {"question_item_id":1,"order":1,"image_key":"car","image_url":"https://.../car.png","audio_url":"https://.../hi/gaadi.mp3"},
      ... (5 items)
    ]
  },
  "instructions":"..."
}
```

**Response (Visual Spatial example):**
```json
{
  "session_id":2001,
  "module":{"id":2,"code":"VISUAL_SPATIAL","max_score":5},
  "rounds":[
    {
      "question_id":2,
      "round_order":1,
      "prompt_text":"Select the same cube as shown.",
      "target_image_url":"https://.../cube3.png",
      "options":[
        {"option_key":"cube1","image_url":"..."},
        {"option_key":"cube2","image_url":"..."},
        {"option_key":"cube3","image_url":"..."},
        {"option_key":"cube4","image_url":"..."}
      ]
    },
    ... (4 more rounds)
  ]
}
```

---

### 3.4 POST `/api/modules/{module_id}/session/{session_id}/submit`
**Purpose:** submit answers for a module and receive score & next_module_id.

**Payload (Image Flash):**
```json
{
  "question_id":1,
  "language_code":"hi",
  "answer_text":"car bird bus pen"
}
```

**Payload (Visual Spatial):**
```json
{
  "answers":[
    {"question_id":2,"selected_option_key":"cube3"},
    {"question_id":3,"selected_option_key":"bee1"},
    ...
  ]
}
```

**Return (example):**
```json
{
  "session_id":2001,
  "module_code":"VISUAL_SPATIAL",
  "score":3,
  "max_score":5,
  "status":"completed",
  "next_module_id": null
}
```

---

## 4. Frontend components & responsibilities

Create small, single-purpose components. Use this folder structure suggestion:

```
/components
  /GameStart
    - GameStartPage.jsx   <-- screenshot page, global instructions, Start button
  /ModuleRunner
    - ModuleRunner.jsx    <-- orchestrates module start/submit
    - ImageFlash.jsx      <-- UI for module 1 (sequence + text input)
    - VisualSpatial.jsx   <-- UI for module 2 (target + options grid)
  /Shared
    - AudioPlayer.jsx
    - Countdown.jsx
    - ModalInstructions.jsx
    - Toast.jsx
/services
  - api.js                <-- axios/fetch wrappers
/pages
  - Dashboard.jsx         <-- shows GameStartPage
```

### Component responsibilities (short)

- **GameStartPage**: shows global instructions and `Start` button. On click call `GET /api/modules` and start first module.
- **ModuleRunner**: receives `moduleId`, handles `POST /session/start`, picks component to render (ImageFlash or VisualSpatial) based on `module_code`.
- **ImageFlash**: plays the items sequentially (use `items` array from API). Provide Repeat button. Collect `answer_text` and call submit.
- **VisualSpatial**: loop through `rounds` array: show target for 3s, then show options. Collect choices locally and submit at end.
- **AudioPlayer**: simple wrapper to load and play an audio URL and return Promise when finished.

## 5. Component architecture (React sample)

### ModuleRunner (pseudocode)

```jsx
function ModuleRunner({moduleId, userId, language}){
  const [session, setSession] = useState(null);
  useEffect(()=>{ startSession(); },[moduleId]);
  async function startSession(){
    const res = await api.post(`/modules/${moduleId}/session/start`,{user_id:userId,language_code:language});
    setSession(res.data);
  }
  if(!session) return <Loader />;
  const moduleCode = session.module.code;
  if(moduleCode === 'IMAGE_FLASH') return <ImageFlash session={session} onComplete={...} />;
  if(moduleCode === 'VISUAL_SPATIAL') return <VisualSpatial session={session} onComplete={...} />;
}
```

### ImageFlash (overview)

- Props: `session` (contains `question.items`), `onComplete(sessionResult)`
- UI flow:
  1. Show instructions modal
  2. On play: for each item: display image, play audio_url, wait configured seconds
  3. Allow Repeat (replays same items)
  4. After sequence, show `TextArea` or voice input
  5. On submit call `/modules/{id}/session/{session_id}/submit` with `answer_text`

### VisualSpatial (overview)

- Props: `session` (contains `rounds` array), `onComplete`
- Internal state `answers[]`
- For each `round`:
  1. Show `target_image_url` full screen / centered for 3s
  2. Hide target and show 2x2 grid of `options` (image buttons)
  3. On tap store `{question_id, selected_option_key}`
- After final round call submit API with `answers[]`

## 6. Integration flow (exact ordering)

1. On Dashboard 'Start' button -> `GET /api/game/instructions?language_code=xx` (optional to display)
2. `GET /api/modules` -> pick first moduleId from response
3. `POST /api/modules/{module_id}/session/start` -> receives `session_id` and content
4. Render module component, play items/rounds as described
5. After user submits -> `POST /api/modules/{module_id}/session/{session_id}/submit`
6. On success read `next_module_id` from response; if present repeat step 3 for that module id; else finish and show summary

Notes:
- Keep `session_id` in memory for each module run to attach responses.
- If user navigates away during session, store progress locally and resume by calling a `resume` endpoint (not yet defined) or re-create session.

## 7. Sample code (fetch / axios)

### axios wrapper (services/api.js)
```js
import axios from 'axios';
const api = axios.create({ baseURL: '/api', timeout: 15000 });
export default api;
```

### Start session (example)
```js
const res = await api.post(`/modules/${moduleId}/session/start`,{ user_id, language_code });
const session = res.data; // store and pass to component
```

### Submit ImageFlash
```js
const payload = { question_id: session.question.question_id, language_code: lang, answer_text: userText };
const r = await api.post(`/modules/${session.module.id}/session/${session.session_id}/submit`, payload);
```

### Submit VisualSpatial
```js
const payload = { answers: answersArray };
const r = await api.post(`/modules/${session.module.id}/session/${session.session_id}/submit`, payload);
```

## 8. Scoring & submit logic (backend contract)

- ImageFlash scoring: backend compares user tokens to accepted_answers in `question_item_i18n` for the given language. Return `score` and `correct_count`.
- VisualSpatial scoring: backend returns `is_correct` per submitted option via `responses` entries and returns session total.

Frontend trusts backend result for final scoring display.

## 9. i18n / audio handling

- Frontend passes `language_code` in `session/start`. Backend returns language-specific `audio_url` and `display_text` in `question_item_i18n`.
- Audio playback: use `Audio` (web) or react-native-sound. Provide `AudioPlayer` that returns a Promise for `await play(audioUrl)`.
- Fallback: if `question_item_i18n` row missing for requested language, backend should return EN fallback; FE should also handle null audio gracefully.

## 10. Error handling & retry rules

- Network errors: retry start/endpoints up to 2 times with exponential backoff (500ms -> 1500ms).
- Session start fails: show toast + retry button.
- Submit fails: store answers locally and retry submit automatically once network returns.
- If session expired: backend returns 410, frontend should inform user and ask to restart module.

## 11. Testing checklist

- [ ] GET /api/modules returns right ordering and codes
- [ ] POST /modules/{id}/session/start returns session_id and correct items for `language_code`
- [ ] ImageFlash flow: images show, audio plays, repeat works
- [ ] Voice input -> submit -> correct scoring in English & Hindi
- [ ] VisualSpatial: target shown 3s, options selectable, final submit works
- [ ] Offline behavior: submit queued + retried
- [ ] Edge cases: empty answer -> prompt to confirm skip

## 12. Appendix: Helpful SQL snippets (for backend)

- Pull ImageFlash items for language `hi`:
```sql
SELECT qi.id AS question_item_id, qi.item_order, qi.image_key, qi.image_url,
       i18n.audio_url, i18n.display_text
FROM question_items qi
JOIN question_item_i18n i18n ON i18n.question_item_id = qi.id AND i18n.language_code = 'hi'
WHERE qi.question_id = 1
ORDER BY qi.item_order;
```

- Pull VisualSpatial rounds with options:
```sql
SELECT q.id AS question_id, q.prompt_text, qo.option_key, qo.image_url, qo.is_correct
FROM questions q
JOIN question_options qo ON qo.question_id = q.id
WHERE q.module_id = 2
ORDER BY q.order_index, qo.id;
```

---

### Final notes
- This document is intentionally pragmatic: minimal tables, minimal endpoints, clear frontend flow.
- If you want, I can also generate a NestJS controller skeleton and React components (ready-to-use) next.

---

*End of document.*

