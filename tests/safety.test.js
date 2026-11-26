import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {events,jobs} from '../data.js';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('fictional event records contain safe basic metadata',()=>{
  assert.equal(events.length,9);assert.equal(new Set(events.map(e=>e.id)).size,events.length);
  assert.ok(events.every(e=>e.source.startsWith('Demo')&&e.title&&e.date&&e.city));
});
test('job simulations have no real URLs',()=>{assert.equal(jobs.length,4);assert.ok(jobs.every(j=>j.sample&&j.name))});
test('HITL controls and disclaimer exist',()=>{
  const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.ok(html.includes('approve-draft')&&html.includes('reject-draft'));
  assert.ok(js.includes('No LLM call performed'));
  assert.ok(!js.includes('fetch('));
  assert.ok(!/sk-[a-zA-Z0-9]{20,}/.test(js));
});
