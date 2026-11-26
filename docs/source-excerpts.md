# Selected source excerpts — Bliżej Walencji

These are short, carefully reviewed excerpts from the actual private application, not the JavaScript simulation running on GitHub Pages. Only generic, non-secret application boundaries are shown. The repository's source remains private.

## backend/news/workflow.py

```python
def build_graph():
    graph = StateGraph(EditorialState)
    graph.add_node('classify', classify_topic)
    graph.add_node('source_check', evaluate_source)
    graph.add_node('draft', make_draft)
    graph.add_node('human_review', human_review)
    graph.add_edge(START, 'classify')
    graph.add_edge('classify', 'source_check')
    graph.add_edge('source_check', 'draft')
    graph.add_edge('draft', 'human_review')
    graph.add_edge('human_review', END)
    return graph
```

## Django public articles API

```python
@require_GET
def article_list(request):
    pages = published_articles_with_pins(30)
    return JsonResponse({
        'items': [serialize_article(page) for page in pages]
    })
```

**Disclosure:** The original snippets may have been formatted for legibility, and the background-loop example is shortened. No private prompt, credential, URL for a private service, database schema, user information, or full service implementation is disclosed.

The demo UI and its simulated state machine are independent, newly written code. They do not execute the server snippets above.
