import json

with open(r'C:\Users\MAYSAMALI MASU\Projects\samvidhan-ui\qa\live-before\diagnosis_results.json', encoding='utf-8') as f:
    data = json.load(f)

for p in data['pages']:
    containers = p['layoutAudit'].get('verticalScrollContainers', [])
    if containers:
        print(f"{p['route']} ({p['viewport']}): {len(containers)} scroll containers")
        for c in containers:
            print('  ', c['tag'], c['className'], 'scrollHeight:', c['scrollHeight'], 'clientHeight:', c['clientHeight'], 'overflowY:', c['overflowY'])
