import re
import json

routes_file = '/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/assets/js/routes.js'
html_file = '/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/percorsi.html'

with open(routes_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

json_match = re.search(r'window\.GALLICIANO_ROUTES\s*=\s*(\[.*?\]);?\s*$', js_content, re.DOTALL)
if json_match:
    routes = json.loads(json_match.group(1))
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    for route in routes:
        route_id = route['id']
        walk_url = route['maps_walk_url']
        
        pattern = f'(<div class="card route-card" data-route="{re.escape(route_id)}">.*?<a class="btn btn-gold" href=")[^"]+(" target="_blank" rel="noopener noreferrer">Apri in Google Maps</a>)'
        html_content = re.sub(pattern, r'\g<1>' + walk_url.replace('&', '&amp;') + r'\g<2>', html_content, flags=re.DOTALL)
        
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Successfully updated percorsi.html with walk URLs")
