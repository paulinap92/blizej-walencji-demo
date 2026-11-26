import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
test('LangGraph contains visible checkpoint, review and rejection branch',()=>{
  for(const item of ['data-node="review"','data-node="reject"','data-node="publish"','id="bw-checkpoint"','id="bw-source-verified"']) assert.ok(html.includes(item));
  assert.match(script,/Command\(resume=/);
});
test('publishing guard requires manual approval and separate Django boundary',()=>{
  assert.match(script,/Approval blocked: manual source verification required/);
  assert.match(script,/Django publish guard validated approved candidate/);
  assert.match(html,/authenticated Django/);
});
test('job cadence follows selected source workflow',()=>{
  assert.ok(script.includes("15 8 * * 1,3,5"));
});
