const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class SimpleRAG {
  constructor() {
    this.chunks = []; // Store fine-grained chunks rather than whole files
    this.initialized = false;
    this.storePath = path.join(process.cwd(), 'data', 'rag-store.json');
  }

  async init() {
    if (this.initialized) return;

    // 1. Load compiled chunks from cached vector file
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

    // 2. Read and dynamically chunk local financial rule files
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
      
      // Breakdown file content into contextual segments (~150 words / 800 chars)
      const segments = this.chunkText(text, 800, 150);
      let index = 0;

      for (const segmentText of segments) {
        // Generate a hyper-focused vector targeting only this chunk's explicit semantic meaning
        const embedding = await this.getEmbedding(segmentText);

        this.chunks.push({
          id: `${file.replace('.txt', '')}_chunk_${index}`,
          text: segmentText,
          metadata: { 
            source: file, 
            chunk_index: index,
            type: 'regulation_clause' 
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

  // Helper logic to prevent mixing unrelated tax or platform rules together
  chunkText(text, chunkSize = 800, overlap = 150) {
    const paragraphs = text.split(/\n+/);
    const chunks = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > chunkSize) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        // Create overlapping buffer to maintain conversational or legal context
        currentChunk = currentChunk.slice(-overlap) + "\n" + paragraph;
      } else {
        currentChunk += (currentChunk ? "\n" : "") + paragraph;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  }

  async getEmbedding(text) {
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding;
  }

  save() {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify({ chunks: this.chunks }));
  }

  async query(queryText, topK = 2) { // Increased default topK to 2 to get complete context splits
    if (!this.initialized) await this.init();
    
    const queryEmbedding = await this.getEmbedding(queryText);

    // Compute semantic match distances against small text chunks
    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort descending by highest geometric proximity match
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => s.chunk);
  }
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = a.length; // Micro-optimization: cache array boundary length
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { ragStore: new SimpleRAG() };
