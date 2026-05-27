import os, re

dirs = ['src/components', 'nutrity-nextjs/src/components', 'nutrity-nextjs/src/app']

for d in dirs:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx'):
                p = os.path.join(root, f)
                with open(p, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Replace colors
                new_content = re.sub(r'(?i)magenta', 'teal', content)
                new_content = re.sub(r'(?i)purple', 'teal', new_content)
                new_content = re.sub(r'from-pink-500', 'from-teal-500', new_content)
                new_content = re.sub(r'rgba\(219,39,119', 'rgba(20,184,166', new_content)
                new_content = re.sub(r'#db2777', '#0d9488', new_content)
                
                # Replace img without alt
                new_content = re.sub(r'(<img(?![^>]*\balt=)[^>]*?)(/?>)', r'\1 alt="Image"\2', new_content)
                
                if new_content != content:
                    with open(p, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f"Fixed {p}")
