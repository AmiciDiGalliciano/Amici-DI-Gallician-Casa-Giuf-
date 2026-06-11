import os
import glob

html_files = glob.glob("*.html")

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the mobile menu button
    old_btn = '<button aria-label="Apri menu" class="mobile-menu-btn" id="mobile-menu-btn">☰</button>'
    new_btn = '''<div class="mobile-quick-links">
    <a href="index.html">Home</a>
    <a href="camere.html">Camere</a>
    <a href="https://wa.me/393463603118?text=Ciao%20Elisa%2C%20vorrei%20informazioni" target="_blank">Prenota</a>
    <a href="percorsi.html">Percorsi</a>
</div>
<button aria-label="Apri menu" class="mobile-menu-btn" id="mobile-menu-btn"><span class="menu-text">Menù</span> <span class="hamburger-icon">☰</span></button>'''
    
    if old_btn in content:
        content = content.replace(old_btn, new_btn)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Old button not found in {file}")

