import os
import re

directories = {'en': 'EN', 'el': 'EL'}

for dir_name, active_lang in directories.items():
    if not os.path.isdir(dir_name): continue
    for filename in os.listdir(dir_name):
        if not filename.endswith('.html'): continue
        filepath = os.path.join(dir_name, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # The agent wrote the switcher with filenames varying depending on the file
        # We need to find the lang-switcher div and replace its contents.
        # We know it starts with <div class="lang-switcher"...> and ends with </div>
        
        pattern = re.compile(r'(<div class="lang-switcher"[^>]*>)(.*?)(</div>)', re.DOTALL)
        
        def replacer(match):
            div_start = match.group(1)
            
            # Construct the new inner HTML based on the directory
            if dir_name == 'en':
                inner = f"""
    <a href="../{filename}" style="text-decoration:none; color:inherit;">IT</a>
    <span style="opacity:0.5;">|</span>
    <a href="{filename}" style="text-decoration:none; color:inherit; border-bottom:2px solid var(--color-oro);">EN</a>
    <span style="opacity:0.5;">|</span>
    <a href="../el/{filename}" style="text-decoration:none; color:inherit;">EL</a>
"""
            else:
                inner = f"""
    <a href="../{filename}" style="text-decoration:none; color:inherit;">IT</a>
    <span style="opacity:0.5;">|</span>
    <a href="../en/{filename}" style="text-decoration:none; color:inherit;">EN</a>
    <span style="opacity:0.5;">|</span>
    <a href="{filename}" style="text-decoration:none; color:inherit; border-bottom:2px solid var(--color-oro);">EL</a>
"""
            return div_start + inner + match.group(3)
            
        new_content = pattern.sub(replacer, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("Language switchers fixed.")
