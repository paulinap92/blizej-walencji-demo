'use strict';

// Public browser simulation: no network requests, credentials, LLM or CMS.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const timestamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

const leads = [
  { id: 'DEMO-001', title: 'Community science festival — Valencia', kind: 'Culture', category: 'culture', summary: 'A fictional community event showcasing interactive science workshops. No dates have been confirmed.', source: 'Example public notice', evidence: 'Limited public notice metadata', province: 'Valencia' },
  { id: 'DEMO-002', title: 'Outdoor market weekend — Alicante', kind: 'Events', category: 'events', summary: 'A fictional market announcement awaiting an organizer-confirmed schedule.', source: 'Example regional bulletin', evidence: 'Single short source excerpt', province: 'Alicante' },
  { id: 'DEMO-003', title: 'Regional public-transport update', kind: 'Transport', category: 'transport', summary: 'A fictional public transport service announcement; exact operational dates require verification.', source: 'Example municipal notice', evidence: 'Official-style announcement metadata', province: 'Valencia region' },
];
const nodeInfo = {
  source: 'Candidate discovery: collect metadata and source links. Ingestion does not imply factual verification.',
  classify: 'Classify topic using deterministic indicators before proposing any editorial category.',
  evidence: 'Flag missing context and ambiguous dates. This stage does not claim independent fact-checking.',
  draft: 'Cost-bounded LLM draft. If the source evidence is insufficient, the real implementation uses a manual drafting fallback.',
  review: 'LangGraph interrupt() yields control to a human editor. A persistent checkpoint can resume later with Command(resume=...).',
  reject: 'Explicit rejection terminates the workflow without publishing anything.',
  publish: 'A separate authenticated Django handler validates the approved candidate and publishes idempotently; graph alone never auto-publishes.',
  delivery: 'Only published content is exposed by the public Django API and consumed by the Next.js site or social-copy queue.',
};
const workflowSteps = ['source', 'classify', 'evidence', 'draft', 'review'];
let selectedLead = 0;
let step = -1;
let state = {};
let selectedNode = 'source';

function logTo(id, message, kind = '') {
  const box = $(id);
  if (box.dataset.empty !== 'false') { box.replaceChildren(); box.dataset.empty = 'false'; }
  const p = document.createElement('p');
  const time = document.createElement('span'); time.className = 'time'; time.textContent = `[${timestamp()}] `;
  const value = document.createElement('span'); value.className = kind; value.textContent = message;
  p.append(time, value); box.append(p); box.scrollTop = box.scrollHeight;
}
function showNode(node) {
  selectedNode = node;
  $$('#bw-graph .graph-node').forEach((el) => el.classList.toggle('active', el.dataset.node === node));
  $('#bw-stage-description').textContent = nodeInfo[node] || '';
}
function markNode(node, status = 'done') {
  const element = $(`#bw-graph [data-node="${node}"]`);
  if (element) element.classList.add(status);
}
$$('#bw-graph .graph-node').forEach((el) => {
  el.addEventListener('click', () => showNode(el.dataset.node));
  el.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showNode(el.dataset.node); } });
});
$('#bw-visit-node').addEventListener('click', () => showNode(selectedNode));

function updateCheckpoint() {
  $('#bw-checkpoint').textContent = JSON.stringify(state, null, 2);
  $('#bw-checkpoint-status').textContent = step < 0 ? 'UNINITIALIZED' : (state.decision === 'reject' ? 'REJECTED' : state.published ? 'PUBLISHED' : state.interrupted ? 'PAUSED · HITL' : 'IN PROGRESS');
  $('#bw-checkpoint-status').className = 'status ' + (state.decision === 'reject' ? 'error' : state.published ? 'done' : '');
  $('#bw-graph-status').textContent = step < 0 ? 'READY' : state.published ? 'PUBLISHED' : state.decision === 'reject' ? 'REJECTED' : state.interrupted ? 'INTERRUPTED' : 'RUNNING';
}
function resetWorkflow() {
  step = -1;
  state = {};
  $$('#bw-graph .graph-node').forEach((el) => el.classList.remove('done', 'reject', 'active'));
  showNode('source');
  $('#bw-review-actions').hidden = true;
  $('#bw-source-verified').checked = false;
  $('#bw-next-step').textContent = 'Start workflow';
  $('#bw-next-step').disabled = false;
  $('#bw-execution-label').textContent = 'Awaiting start';
  $('#bw-controller-stage').textContent = 'STATE / IDLE';
  $('#bw-trace').textContent = '[ready] No workflow has started.';
  $('#bw-trace').dataset.empty = 'true';
  updateCheckpoint();
}
$('#bw-reset').addEventListener('click', resetWorkflow);
function advance() {
  if (state.interrupted || state.published || state.decision === 'reject') return;
  step += 1;
  const node = workflowSteps[step];
  if (!node) return;
  showNode(node); markNode(node);
  $('#bw-controller-stage').textContent = `STATE / ${node.toUpperCase()}`;
  $('#bw-execution-label').textContent = `${String(step + 1).padStart(2, '0')} / 05 · ${node.toUpperCase()}`;
  if (step === 0) {
    const lead = leads[selectedLead];
    state = { thread_id: 'demo-thread-001', candidate_id: lead.id, source_title: lead.title, source_name: lead.source, province: lead.province, decision: null, published: false };
    logTo('#bw-trace', 'Candidate selected · ' + lead.id, 'ok');
  } else if (node === 'classify') {
    state.category = leads[selectedLead].category;
    logTo('#bw-trace', 'Classified topic · ' + state.category, 'ok');
  } else if (node === 'evidence') {
    state.evidence_flags = ['Single source only', 'Event dates require organizer confirmation'];
    state.source_checked = false;
    logTo('#bw-trace', 'Evidence warnings attached to editorial state', 'warn');
  } else if (node === 'draft') {
    state.draft_title = leads[selectedLead].title;
    state.draft_summary = leads[selectedLead].summary;
    state.ai_note = 'Local prepared text fixture; no model inference';
    logTo('#bw-trace', 'Draft prepared from test fixture (no LLM call)', 'ok');
  } else if (node === 'review') {
    state.interrupted = true;
    state.next = 'await Command(resume=...)';
    $('#bw-review-actions').hidden = false;
    $('#bw-draft-summary').value = state.draft_summary;
    $('#bw-next-step').disabled = true;
    $('#bw-execution-label').textContent = 'PAUSED · HUMAN REVIEW REQUIRED';
    logTo('#bw-trace', 'interrupt() · checkpoint saved (simulated)', 'warn');
  }
  if (step < 4) $('#bw-next-step').textContent = 'Advance to next node →';
  updateCheckpoint();
}
$('#bw-next-step').addEventListener('click', advance);
$('#bw-approve').addEventListener('click', async () => {
  if (!state.interrupted) return;
  if (!$('#bw-source-verified').checked) { logTo('#bw-trace', 'Approval blocked: manual source verification required', 'bad'); $('#bw-source-verified').focus(); return; }
  state.draft_summary = $('#bw-draft-summary').value.trim();
  if (!state.draft_summary) { logTo('#bw-trace', 'Approval blocked: summary is empty', 'bad'); return; }
  state.source_checked = true;
  state.decision = 'approve';
  state.interrupted = false;
  delete state.next;
  state.published = false;
  $('#bw-review-actions').hidden = true;
  logTo('#bw-trace', 'Command(resume={decision: approve}) · graph completed', 'ok');
  await wait(180);
  showNode('publish'); markNode('publish');
  logTo('#bw-trace', 'Django publish guard validated approved candidate', 'ok');
  await wait(200);
  state.published = true;
  showNode('delivery'); markNode('delivery');
  logTo('#bw-trace', 'Public API / social queue updated (simulated only)', 'ok');
  $('#bw-execution-label').textContent = 'APPROVED · PUBLISHED IN LOCAL MODEL';
  $('#bw-controller-stage').textContent = 'STATE / COMPLETE';
  updateCheckpoint();
});
$('#bw-reject').addEventListener('click', () => {
  if (!state.interrupted) return;
  state.decision = 'reject';
  state.interrupted = false;
  state.published = false;
  delete state.next;
  $('#bw-review-actions').hidden = true;
  showNode('reject'); markNode('reject', 'reject');
  $('#bw-execution-label').textContent = 'REJECTED · NOTHING PUBLISHED';
  $('#bw-controller-stage').textContent = 'STATE / REJECTED';
  logTo('#bw-trace', 'Command(resume={decision: reject}) · no publication', 'bad');
  updateCheckpoint();
});

function selectLead(index) {
  selectedLead = index;
  $$('#bw-leads [data-lead]').forEach((button) => button.classList.toggle('active', Number(button.dataset.lead) === index));
  resetWorkflow();
  $('#bw-stage-description').textContent = `Selected: ${leads[index].title}. Run the workflow to inspect state transitions.`;
}
$$('#bw-leads [data-lead]').forEach((button) => button.addEventListener('click', () => selectLead(Number(button.dataset.lead))));
$('#bw-discover').addEventListener('click', async () => {
  const box = $('#bw-discovery-trace'); box.dataset.empty = 'true';
  const messages = [
    ['Starting candidate scan · fixture only', ''],
    ['Source URLs: validate host/scheme and preserve attribution', 'ok'],
    ['Check normalized title and candidate status', 'ok'],
    [`Selected ${leads[selectedLead].id} · ${leads[selectedLead].province}`, 'ok'],
    ['Flag missing dates and any uncertain claims for human review', 'warn'],
    ['Store as unpublished candidate; no automatic drafting/publishing', 'ok'],
  ];
  for (const [message, kind] of messages) { await wait(130); logTo('#bw-discovery-trace', message, kind); }
});
$('#bw-duplicate').addEventListener('click', () => {
  const box = $('#bw-discovery-trace'); box.dataset.empty = 'true';
  logTo('#bw-discovery-trace', 'Potential duplicate title detected across sample feeds', 'warn');
  logTo('#bw-discovery-trace', 'Kept candidate for manual disambiguation; no automatic deletion', 'ok');
});
$('#bw-test-unreviewed').addEventListener('click', () => {
  $('#bw-boundary-status').textContent = 'BLOCKED'; $('#bw-boundary-status').className = 'status error';
  $('#bw-boundary-result').textContent = JSON.stringify({ accepted: false, error: 'Candidate not approved by an authenticated editor', published: false, fixture: true }, null, 2);
});
$('#bw-test-approved').addEventListener('click', () => {
  const published = Boolean(state.published);
  $('#bw-boundary-status').textContent = published ? 'HTTP 200' : 'EXAMPLE ONLY';
  $('#bw-boundary-status').className = 'status ' + (published ? 'done' : '');
  $('#bw-boundary-result').textContent = JSON.stringify({ items: [{ title: published ? state.draft_title : 'Approved fixture: community science festival', category: published ? state.category : 'culture', published: true }], fixture: true, note: published ? 'From the current approved browser simulation' : 'Sample approved public response; current workflow not yet approved' }, null, 2);
});

const snippets = {
  graph: { title: 'PYTHON / LANGGRAPH', note: 'Structure matches the real editorial graph; function internals and prompts are not included.', code: `from langgraph.graph import StateGraph, START, END\n\ndef build_graph():\n    graph = StateGraph(EditorialState)\n    graph.add_node('classify', classify_topic)\n    graph.add_node('source_check', evaluate_source)\n    graph.add_node('draft', make_draft)\n    graph.add_node('human_review', human_review)\n    graph.add_edge(START, 'classify')\n    graph.add_edge('classify', 'source_check')\n    graph.add_edge('source_check', 'draft')\n    graph.add_edge('draft', 'human_review')\n    graph.add_edge('human_review', END)\n    return graph` },
  interrupt: { title: 'PYTHON / HUMAN REVIEW', note: 'Adapted excerpt from the real resumable checkpoint flow; protected details removed.', code: `from langgraph.types import Command, interrupt\n\ndef human_review(state: EditorialState) -> dict:\n    response = interrupt({\n        'candidate_id': state['candidate_id'],\n        'title': state['draft_title'],\n        'question': 'Approve or reject?',\n    })\n    if response['decision'] not in ('approve', 'reject'):\n        raise ValueError('Unsupported decision')\n    return {'decision': response['decision']}\n\n# Later, after authenticated Django editor review:\nresult = graph.invoke(\n    Command(resume={'decision': 'approve'}),\n    config={'configurable': {'thread_id': thread_id}},\n)` },
  django: { title: 'PYTHON / DJANGO API', note: 'Simplified selection from the public-article API. Private image-storage logic and models omitted.', code: `from django.http import JsonResponse\nfrom django.views.decorators.http import require_GET\n\n@require_GET\ndef article_list(request):\n    pages = published_articles_with_pins(limit=30)\n    payload = [serialize_article(page) for page in pages]\n    return JsonResponse({'items': payload})\n\n# published_articles_with_pins() queries only live,\n# public Wagtail article pages.` },
  jobs: { title: 'YAML / GITHUB ACTIONS', note: 'Schedule fact comes from the source workflow; the full deployment workflow and secret names are omitted.', code: `name: Editorial event discovery\non:\n  schedule:\n    # Monday, Wednesday, Friday at 08:15 UTC\n    - cron: '15 8 * * 1,3,5'\n  workflow_dispatch:\n\njobs:\n  discover:\n    if: vars.DISCOVERY_ENABLED == 'true'\n    runs-on: ubuntu-latest\n    steps:\n      # Install dependencies, run discovery and\n      # store unpublished event candidates only.\n      - name: Discover candidates\n        run: python manage.py discover_events --limit 25` },
  javascript: { title: 'JAVASCRIPT / BROWSER STATE MACHINE', note: 'Real logic used by this public demo; does not execute Python or LLM calls.', code: `function canPublish(state) {\n  return state.source_checked === true\n    && state.decision === 'approve'\n    && Boolean(state.draft_summary?.trim());\n}\n\n// The production system has a separate authenticated\n// Django publishing handler. This public model only\n// illustrates the review guard.` },
};
function showCode(which) {
  const snippet = snippets[which]; if (!snippet) return;
  $$('#bw-code-tabs button').forEach((button) => { const active = button.dataset.code === which; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  $('#bw-code-title').textContent = snippet.title;
  $('#bw-code-note').textContent = snippet.note;
  $('#bw-code').textContent = snippet.code;
}
$$('#bw-code-tabs button').forEach((button) => button.addEventListener('click', () => showCode(button.dataset.code)));
showCode('graph');
$('#bw-copy-code').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#bw-code').textContent); $('#bw-copy-code').textContent = 'Copied'; setTimeout(() => { $('#bw-copy-code').textContent = 'Copy excerpt'; }, 1200); }
  catch { $('#bw-copy-code').textContent = 'Select text to copy'; }
});
resetWorkflow();
