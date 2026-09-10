/* Deterministic, offline FAQ matcher. No API calls, storage, eval, or user HTML. */
(function (root) {
  'use strict';
  function normalize(text) {
    return String(text ?? '').normalize('NFKC').toLowerCase()
      .replace(/[’'`]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  }
  const DEFAULT = 'I do not have a scripted answer for that yet. Try “menu,” “delivery fee,” “cancel my order,” or “chatbot pricing.” Please ask one topic at a time and do not share personal details.';
  function createBot(topics) {
    const exact = new Map();
    const ids = new Set();
    const lowPriority = new Set(['greeting', 'thanks', 'help']);
    // Broad buying/price words must not steal a cancellation, fee, or product question.
    const generic = new Set(['price', 'prices', 'pila', 'tagpila', 'presyo', 'cost', 'how much',
      'order', 'buy', 'palit', 'pa order', 'order ko', 'delivery', 'deliver', 'shipping', 'ship']);
    const rules = topics.map(topic => {
      if (!topic.id || ids.has(topic.id) || !topic.reply || !topic.label) throw new Error('Invalid or duplicate topic');
      ids.add(topic.id);
      for (const question of topic.questions) {
        const key = normalize(question);
        if (!key || exact.has(key)) throw new Error(`Duplicate/empty scripted input: ${question}`);
        exact.set(key, topic);
      }
      const phrases = [...new Set([...topic.questions, ...topic.keys].map(normalize))].filter(Boolean);
      return { topic, phrases };
    });
    function match(text) {
      const message = normalize(text);
      if (exact.has(message)) {
        const topic = exact.get(message);
        return { id: topic.id, reply: topic.reply, method: 'exact' };
      }
      if (!message) return { id: null, reply: DEFAULT, method: 'fallback' };
      const padded = ` ${message} `;
      const candidates = [];
      for (const { topic, phrases } of rules) {
        // Token boundaries for ALL phrases: "hi" != "shipping", "ice" != "service".
        const hits = phrases.filter(phrase => padded.includes(` ${phrase} `));
        if (!hits.length) continue;
        // A longer phrase beats its generic component. Greetings never override a question.
        const strength = lowPriority.has(topic.id) ? 0 : Math.max(...hits.map(hit =>
          generic.has(hit) ? 0.5 : hit.split(' ').length));
        candidates.push({ topic, strength });
      }
      if (!candidates.length) return { id: null, reply: DEFAULT, method: 'fallback' };
      const strength = Math.max(...candidates.map(candidate => candidate.strength));
      const best = candidates.filter(candidate => candidate.strength === strength);
      if (best.length > 1) {
        const labels = best.map(candidate => candidate.topic.label).join(' / ');
        return { id: null, reply: `I found more than one topic: ${labels}. Please ask about one at a time so I can give the right scripted answer.`, method: 'clarify' };
      }
      return { id: best[0].topic.id, reply: best[0].topic.reply, method: 'phrase' };
    }
    return { match, answer: text => match(text).reply, questionCount: exact.size };
  }
  const api = { normalize, createBot };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScriptedChatbot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
