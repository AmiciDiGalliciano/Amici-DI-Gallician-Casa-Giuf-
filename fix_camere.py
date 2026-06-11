with open("camere.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace headers
html = html.replace(">Camera 1 / Piano terra</h3>", ">Piano Terra: Camera matrimoniale, camera con letto a una piazza, bagno (con bidet, lavandino a specchio e doccia)</h3>")
html = html.replace(">Camera 2 / Primo piano</h3>", ">Primo Piano: Camera matrimoniale, camera con letto a una piazza, bagno (con bidet, lavandino a specchio e doccia)</h3>")

# Replace terminology in captions
html = html.replace("Appendiabiti in legno", "Portabiti in legno")
html = html.replace("appendiabiti in legno", "portabiti in legno")
html = html.replace("Armadio e specchio", "Portabiti e specchio")
html = html.replace("Armadio, specchio e appendiabiti", "Portabiti e specchio")
html = html.replace("Guardaroba della camera", "Portabiti della camera")
html = html.replace("Guardaroba chiuso", "Portabiti chiuso")
html = html.replace("Guardaroba attrezzato", "Portabiti attrezzato")
html = html.replace("Guardaroba aperto con appendiabiti", "Portabiti aperto")

with open("camere.html", "w", encoding="utf-8") as f:
    f.write(html)
print("camere.html updated")
