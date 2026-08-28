const fs = require('fs');
const path = require('path');

class SimpleRAG {
  constructor() {
    this.chunks = [];
    this.initialized = false;
    this.storePath = path.join(process.cwd(), 'data', 'rag-store.json');
  }

  async init() {
    if (this.initialized) return;

    if (fs.existsSync(this.storePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'));
        this.chunks = data.chunks || [];
        this.initialized = true;
        console.log(`📚 Loaded ${this.chunks.length} granular text chunks from cache`);
        return;
      } catch (e) {
        console.log('⚠️ Could not load vector cache, re-building index...');
      }
    }

    const rulesDir = path.join(process.cwd(), 'public', 'financial-rules');
    if (!fs.existsSync(rulesDir)) {
      console.log(`⚠️ Source directory missing: ${rulesDir}`);
      this.initialized = true;
      return;
    }

    const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.txt'));
    console.log(`🔨 Processing text chunk vectors for ${files.length} policy files...`);

    for (const file of files) {
      const text = fs.readFileSync(path.join(rulesDir, file), 'utf-8');
      const segments = this.chunkText(text, 800, 150);
      let index = 0;

      for (const segmentText of segments) {
        const embedding = await this.getEmbedding(segmentText);

        this.chunks.push({
          id: `${file.replace('.txt', '')}_chunk_${index}`,
          text: segmentText,
          metadata: {
            source: file,
            chunk_index: index,
            type: 'regulation_clause',
          },
          embedding,
        });
        index++;
      }
      console.log(`  ✅ Embedded and indexed: ${file} (${index} chunks created)`);
    }

    this.save();
    this.initialized = true;
    console.log('📚 RAG vector store successfully compiled');
  }

  chunkText(text, chunkSize = 800, overlap = 150) {
    const paragraphs = text.split(/\n+/);
    const chunks = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > chunkSize) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = currentChunk.slice(-overlap) + "\n" + paragraph;
      } else {
        currentChunk += (currentChunk ? "\n" : "") + paragraph;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  }

  // ---- HuggingFace Inference API embeddings (replaces Gemini) ----
  async getEmbedding(text, retries = 3) {
    const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
   // const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;
 const url = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      });

      if (response.status === 503) {
        // Model is cold-starting on HF's servers — wait and retry
        console.log('⏳ HuggingFace model loading, retrying in 5s...');
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace embedding failed (${response.status}): ${errText}`);
      }

      const result = await response.json();
      return this.normalizeEmbedding(result);
    }

    throw new Error('HuggingFace embedding failed after retries — model did not become ready.');
  }

  // sentence-transformers models on HF sometimes return a flat vector,
  // sometimes token-level vectors — normalize to a single flat vector via mean pooling.
  normalizeEmbedding(result) {
    if (Array.isArray(result) && typeof result[0] === 'number') {
      return result; // already a flat sentence embedding
    }
    if (Array.isArray(result) && Array.isArray(result[0])) {
      // token-level embeddings — mean pool across tokens
      const tokenCount = result.length;
      const dim = result[0].length;
      const pooled = new Array(dim).fill(0);
      for (const tokenVec of result) {
        for (let i = 0; i < dim; i++) pooled[i] += tokenVec[i];
      }
      return pooled.map((v) => v / tokenCount);
    }
    throw new Error('Unexpected embedding response shape from HuggingFace');
  }

  save() {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify({ chunks: this.chunks }));
  }

  async query(queryText, topK = 2) {
    if (!this.initialized) await this.init();

    const queryEmbedding = await this.getEmbedding(queryText);

    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => s.chunk);
  }
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = a.length;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { ragStore: new SimpleRAG() };