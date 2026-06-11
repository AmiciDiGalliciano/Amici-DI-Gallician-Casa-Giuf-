with open("camere.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace photo references
html = html.replace('src="assets/img/piano%20terra%20appendi%20abiti.png"', 'src="assets/img/armadietto%20piano%20terra%20aperto.png"')
html = html.replace('src="assets/img/camera-piano-terra-guardaroba-aperto.webp"', 'src="assets/img/armadietto%20piano%20terra%20aperto.png"')
html = html.replace('src="assets/img/camera-primo-piano-guardaroba-aperto.webp"', 'src="assets/img/armadietto%20primo%20piano%20aperto.png"')
html = html.replace('src="assets/img/camera-primo-piano-guardaroba-chiuso.webp"', 'src="assets/img/armadietto%20primo%20piano%20chiuso.png"')

with open("camere.html", "w", encoding="utf-8") as f:
    f.write(html)
print("images updated")
