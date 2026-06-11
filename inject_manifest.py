import glob
import os

html_files = glob.glob('/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/*.html')
manifest_link = '<link rel="manifest" href="manifest.json">'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if manifest_link not in content:
        # Find </head> or <meta charset="utf-8"/> and inject it
        if '<meta charset="utf-8"/>' in content:
            content = content.replace('<meta charset="utf-8"/>', f'<meta charset="utf-8"/>\n{manifest_link}')
        elif '<head>' in content:
            content = content.replace('<head>', f'<head>\n{manifest_link}')
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected manifest into {os.path.basename(file_path)}")
    else:
        print(f"Manifest already in {os.path.basename(file_path)}")
