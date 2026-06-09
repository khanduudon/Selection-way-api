const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://backend.multistreaming.site/api";
const PORT = process.env.PORT || 3000;

// ─── ANTI-BOT HEADERS ────────────────────────────────────────────────────────
const BROWSER_HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://www.selectionway.com",
  "Referer": "https://www.selectionway.com/",
  "Accept": "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Fetch wrapper – throws on non-2xx */
async function externalFetch(url) {
  const res = await fetch(url, { headers: BROWSER_HEADERS });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Spidy API Error] External call failed:', res.status, errText);
    throw new Error(`External API failed: ${res.status}`);
  }

  return res.json();
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// GET /api/batches?user_id=3708939
app.get('/api/batches', async (req, res) => {
  const userId = req.query.user_id || "3708939";
  const url = `${BASE_URL}/courses?userId=${userId}&limit=1000`;

  try {
    const json = await externalFetch(url);
    const data = json.data || [];

    res.json({
      status: "success",
      total_batches: data.length,
      batches: data
    });

  } catch (e) {
    console.error('[Spidy API Error] /batches crash:', e.message);

    res.status(500).json({
      detail: e.message
    });
  }
});

// GET /api/subjects?batch_id=XXX&user_id=3708939
app.get('/api/subjects', async (req, res) => {
  const { batch_id, user_id = "3708939" } = req.query;

  if (!batch_id) {
    return res.status(400).json({
      detail: "batch_id is required"
    });
  }

  const url = `${BASE_URL}/subjects?batchId=${batch_id}&userId=${user_id}&limit=1000`;

  try {
    const json = await externalFetch(url);
    const data = json.data || [];

    res.json({
      status: "success",
      batch_id,
      total_subjects: data.length,
      subjects: data
    });

  } catch (e) {
    console.error('[Spidy API Error] /subjects crash:', e.message);

    res.status(500).json({
      detail: e.message
    });
  }
});

// GET /api/topics?subject_id=XXX&batch_id=YYY&user_id=3708939
app.get('/api/topics', async (req, res) => {
  const { subject_id, batch_id, user_id = "3708939" } = req.query;

  if (!subject_id) {
    return res.status(400).json({
      detail: "subject_id is required"
    });
  }

  const url = `${BASE_URL}/topics?subjectId=${subject_id}&batchId=${batch_id || ''}&userId=${user_id}&limit=1000`;

  try {
    const json = await externalFetch(url);
    const data = json.data || [];

    res.json({
      status: "success",
      subject_id,
      total_topics: data.length,
      topics: data
    });

  } catch (e) {
    console.error('[Spidy API Error] /topics crash:', e.message);

    res.status(500).json({
      detail: e.message
    });
  }
});

// GET /api/videos?topic_id=XXX&subject_id=YYY&batch_id=ZZZ&user_id=3708939
app.get('/api/videos', async (req, res) => {
  const {
    topic_id,
    subject_id,
    batch_id,
    user_id = "3708939"
  } = req.query;

  if (!topic_id) {
    return res.status(400).json({
      detail: "topic_id is required"
    });
  }

  const url =
    `${BASE_URL}/videos?topicId=${topic_id}` +
    `&subjectId=${subject_id || ''}` +
    `&batchId=${batch_id || ''}` +
    `&userId=${user_id}` +
    `&limit=1000`;

  try {
    const json = await externalFetch(url);
    const data = json.data || [];

    res.json({
      status: "success",
      topic_id,
      total_videos: data.length,
      videos: data
    });

  } catch (e) {
    console.error('[Spidy API Error] /videos crash:', e.message);

    res.status(500).json({
      detail: e.message
    });
  }
});

// GET /api/pdfs?topic_id=XXX&subject_id=YYY&batch_id=ZZZ&user_id=3708939
app.get('/api/pdfs', async (req, res) => {
  const {
    topic_id,
    subject_id,
    batch_id,
    user_id = "3708939"
  } = req.query;

  if (!topic_id) {
    return res.status(400).json({
      detail: "topic_id is required"
    });
  }

  const url =
    `${BASE_URL}/pdfs?topicId=${topic_id}` +
    `&subjectId=${subject_id || ''}` +
    `&batchId=${batch_id || ''}` +
    `&userId=${user_id}` +
    `&limit=1000`;

  try {
    const json = await externalFetch(url);
    const data = json.data || [];

    res.json({
      status: "success",
      topic_id,
      total_pdfs: data.length,
      pdfs: data
    });

  } catch (e) {
    console.error('[Spidy API Error] /pdfs crash:', e.message);

    res.status(500).json({
      detail: e.message
    });
  }
});

// ─── 404 FALLBACK ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    detail: "Route not found bhai 😅"
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Spidy API running on port ${PORT}`);
});

module.exports = app;
