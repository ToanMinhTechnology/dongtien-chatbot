// Pre-compute OpenAI embeddings for all CAKE_DATABASE products.
// Run once before deploy: npm run build:embeddings
// Output: data/embeddings.json — commit this file to include in Vercel bundle.
//
// Why pre-compute: avoids cold-start API latency on Vercel serverless.
// Each Vercel Lambda reads the JSON file on startup (~50ms) instead of
// calling OpenAI for 22 products (~800ms).

import 'dotenv/config';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { CAKE_DATABASE } from '../src/data/cakeDatabase.js';
import { productToText } from '../server/services/embeddingService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../data/embeddings.json');

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY not set. Run: node --env-file=.env scripts/build-embedding-index.js');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`Computing embeddings for ${CAKE_DATABASE.length} products via text-embedding-3-small...`);

  const texts = CAKE_DATABASE.map(productToText);
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  const index = res.data.map((e, i) => ({
    product: CAKE_DATABASE[i],
    vector: e.embedding,
  }));

  await mkdir(resolve(__dirname, '../data'), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(index), 'utf-8');

  const kb = (JSON.stringify(index).length / 1024).toFixed(1);
  console.log(`✓ Saved ${index.length} embeddings → data/embeddings.json (${kb} KB)`);
  console.log('  Commit this file to include it in the Vercel deploy bundle.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
