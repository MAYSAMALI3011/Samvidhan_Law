import json

with open(r'C:\Users\MAYSAMALI MASU\Projects\samvidhan-ui\qa\live-before\diagnosis_results.json', encoding='utf-8') as f:
    data = json.load(f)

print('Total pages checked:', len(data['pages']))
for p in data['pages']:
    print(f"=== {p['route']} ({p['viewport']}) ===")
    if p['logs']:
        print('  Logs:', len(p['logs']))
        for l in p['logs']:
            print('   [log]', l['type'], l['text'][:120])
    if p['failedRequests']:
        print('  Failed reqs:', len(p['failedRequests']))
        for fr in p['failedRequests']:
            print('   [fail]', fr)
    layout = p['layoutAudit']
    print('  Doc scroll height vs window height:', layout.get('docScrollHeight'), 'vs', layout.get('windowHeight'))
    print('  Body scroll height vs window height:', layout.get('bodyScrollHeight'), 'vs', layout.get('windowHeight'))
    print('  html overflowY:', layout.get('htmlOverflowY'), 'body overflowY:', layout.get('bodyOverflowY'))
    if layout.get('hasHorizontalOverflow'):
        print('  Horizontal overflow detected! Elements:', len(layout.get('overflowingElements', [])))
        for el in layout.get('overflowingElements', [])[:3]:
            print('   ->', el['tag'], el['className'], el['rect'])
    containers = layout.get('verticalScrollContainers', [])
    if containers:
        print(f"  Vertical scroll containers ({len(containers)}):")
        for c in containers:
            print('   ->', c['tag'], c['className'], 'scrollHeight:', c['scrollHeight'], 'clientHeight:', c['clientHeight'], 'overflowY:', c['overflowY'])
