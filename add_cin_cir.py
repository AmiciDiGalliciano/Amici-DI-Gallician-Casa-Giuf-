import os
import re

dir_path = '/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the footer-bottom div
    # It might look like: <div class="footer-bottom">...</div>
    # We want to insert the CIN/CIR just before the closing </div>
    # Let's use a regex that finds the <div class="footer-bottom">...</div>
    # Note: dotall is important to match multiline content.
    
    if 'CIN: IT080029C2DRU7Q6WM' in content:
        return False
        
    pattern = re.compile(r'(<div class="footer-bottom">)(.*?)(</div>)', re.DOTALL)
    
    def replacer(match):
        inner_content = match.group(2)
        # Avoid double insertion
        if 'CIN: IT080029C2DRU7Q6WM' not in inner_content:
            return f'{match.group(1)}{inner_content}<br>\n                CIN: IT080029C2DRU7Q6WM | CIR: 080029-AAT-0016\n            {match.group(3)}'
        return match.group(0)

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for root, dirs, files in os.walk(dir_path):
    for filename in files:
        if filename.endswith('.html'):
            if process_file(os.path.join(root, filename)):
                modified_count += 1
                print(f"Modified {filename}")

print(f"Total files modified: {modified_count}")
