import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { CAKE_DATABASE } from '../../src/data/cakeDatabase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_PATH = resolve(__dirname, '../../data/embeddings.json');
const EMBEDDING_MODEL = 'text-embedding-3-small';
const SIMILARITY_THRESHOLD = 0.55;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function formatPrice(price) {
  if (!price || typeof price !== 'number') return '';
  return price.toLocaleString('vi-VN') + 'đ';
}

export function productToText(p) {
  return [p.name, p.categoryLabel, p.flavorLabel, ...(p.keywords || [])]
    .filter(Boolean)
    .join(' ');
}

export function productToContextLine(p) {
  const safe = (s) => (s || '').replace(/[\r\n]+/g, ' ').trim();
  let line = `- ${safe(p.name)} (${safe(p.categoryLabel)}): ${formatPrice(p.price)}`;
  if (p.flavorLabel) line += ` | ${safe(p.flavorLabel)}`;
  if (p.availability) line += ` | ${safe(p.availability)}`;
  if (p.note) line += ` | ghi chú: ${safe(p.note)}`;
  if (p.imageUrl) line += ` | ảnh: ${safe(p.imageUrl)}`;
  return line;
}

async function buildIndex() {
  // Load pre-computed embeddings from disk first — avoids API call on cold start
  try {
    const raw = await readFile(EMBEDDINGS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // File missing (dev/CI) — compute via API
    if (!process.env.OPENAI_API_KEY) return null;
  }

  const texts = CAKE_DATABASE.map(productToText);
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
  return res.data.map((e, i) => ({ product: CAKE_DATABASE[i], vector: e.embedding }));
}

// Singleton promise — prevents race condition on concurrent cold-start requests
let _indexPromise = null;
export function resetIndexForTesting() {
  _indexPromise = null;
}

function ensureIndex() {
  if (!_indexPromise) _indexPromise = buildIndex();
  return _indexPromise;
}

export async function embed(text) {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: [text] });
  return res.data[0].embedding;
}

export async function searchSimilar(query, topK = 3) {
  try {
    const [index, queryVec] = await Promise.all([ensureIndex(), embed(query)]);
    if (!index) return [];

    return index
      .map(({ product, vector }) => ({ product, score: cosineSimilarity(queryVec, vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(({ score }) => score >= SIMILARITY_THRESHOLD)
      .map(({ product }) => product);
  } catch {
    return [];
  }
}
