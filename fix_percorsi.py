import re

with open('percorsi.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change hero image
content = content.replace('assets/img/Treking Gallicianò.png', 'assets/img/panoramica gallcianò.JPG')

# 2. Simplify hero actions
hero_actions = '''<div class="routes-hero-actions"><a class="btn btn-gold btn-large" href="https://it.wikiloc.com/percorsi/escursionismo/italia/calabria/galliciano" target="_blank">Cerca su Wikiloc</a></div>'''
content = re.sub(r'<div class="routes-hero-actions">.*?</div></div>', hero_actions + '</div>', content, flags=re.DOTALL)

# 3. Simplify route cards
def simplify_card_actions(match):
    # Extract the Google Maps link
    gmaps_match = re.search(r'href="(https://www.google.com/maps/dir/\?api=1&amp;origin=Current\+Location&amp;destination=[^"]+)"', match.group(0))
    if gmaps_match:
        gmaps_link = gmaps_match.group(1)
        return f'''<div class="card-actions route-card-actions">
    <a class="btn btn-gold" href="{gmaps_link}" target="_blank" rel="noopener noreferrer">Apri in Google Maps</a>
  </div>'''
    return match.group(0)

content = re.sub(r'<div class="card-actions route-card-actions">.*?</div>', simplify_card_actions, content, flags=re.DOTALL)

# 4. Remove routes-download-panel and other confusing map options
content = re.sub(r'<div class="routes-download-panel">.*?</div>\s*<div class="card-grid', '<div class="card-grid', content, flags=re.DOTALL)
content = re.sub(r'<div class="map-action-row">.*?</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div class="routes-map-note route-disclaimer".*?</div>', '<div class="routes-map-note route-disclaimer" style="margin-bottom:1.4rem;"><strong>Nota:</strong> In caso di problemi di orientamento o perdita di segnale, consigliamo vivamente di consultare l\'app <strong>Wikiloc</strong> per trovare le tracce locali di Gallicianò.</div>', content, flags=re.DOTALL)
content = re.sub(r'<p class="map-status-message".*?</p>', '', content, flags=re.DOTALL)

with open('percorsi.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("percorsi.html updated successfully.")
