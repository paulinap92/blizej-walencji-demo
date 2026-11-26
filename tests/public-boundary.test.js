import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const code = ['index.html', 'app.js', 'data.js', 'styles.css']
  .map(name => readFileSync(new URL(name, root), 'utf8'))
  .join('\n');

test('editorial simulation cannot contact a CMS, LLM or production endpoint', () => {
  assert.doesNotMatch(code, /fetch\s*\(/);
  assert.doesNotMatch(code, /https?:\/\/[^\s"']*blizejwalencji\.es\/api\//);
  assert.doesNotMatch(code, /\b(?:postgres(?:ql)?:\/\/|mongodb(?:\+srv)?:\/\/)/i);
  assert.doesNotMatch(code, /(?:OPENAI_API_KEY|TAVILY_API_KEY|DATABASE_URL|PRIVATE_KEY)\s*=/);
});

test('public site ships no environment secrets or credential files', () => {
  const names = readdirSync(root);
  assert.ok(!names.some(name => /^\.env(?:\.|$)|^id_rsa$|\.pem$|\.key$/i.test(name)));
});
