import json

with open('eslint_report.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

total_warnings = 0
file_warnings = []

for file in data:
    if file['warningCount'] > 0:
        total_warnings += file['warningCount']
        warnings = []
        for msg in file['messages']:
            if msg['severity'] == 1: # 1 is warning
                warnings.append({
                    'ruleId': msg.get('ruleId'),
                    'line': msg.get('line'),
                    'message': msg.get('message')
                })
        file_warnings.append({
            'filePath': file['filePath'],
            'warningCount': file['warningCount'],
            'warnings': warnings
        })

print(f"Total Warnings: {total_warnings}")
for fw in file_warnings:
    print(f"\nFile: {fw['filePath']}")
    print(f"Count: {fw['warningCount']}")
    for w in fw['warnings']:
        print(f"  Line {w['line']}: [{w['ruleId']}] {w['message']}")
