import re

with open("assets/css/style.css", "r", encoding="utf-8") as f:
    css = f.read()

# Remove the display:none that breaks the mobile menu
css = css.replace(".nav-links li:nth-child(n+4):not(.nav-cta) { display:none; }", "/* removed display:none */")

# Add styles for mobile-quick-links and menu-text
new_styles = """
/* === NEW MOBILE HEADER LINKS === */
.mobile-quick-links {
    display: none;
}
@media (max-width: 768px) {
    .mobile-quick-links {
        display: flex;
        gap: 0.6rem;
        align-items: center;
        justify-content: center;
        background: var(--color-verde-scuro, #1F3328);
        border-radius: 999px;
        padding: 0.4rem 0.8rem;
    }
    .mobile-quick-links a {
        color: #FFFDF8;
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border-right: 1px solid rgba(255,255,255,0.2);
        padding-right: 0.6rem;
    }
    .mobile-quick-links a:last-child {
        border-right: none;
        padding-right: 0;
    }
    .mobile-menu-btn {
        display: inline-flex !important;
        align-items: center;
        gap: 0.4rem;
        background: var(--color-verde-scuro, #1F3328);
        color: #FFFDF8;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        font-size: 0.9rem;
    }
    .menu-text {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .hamburger-icon {
        font-size: 1.1rem;
        line-height: 1;
    }
    .nav-container {
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;
    }
    /* Move quick links to its own line if needed, or inline */
    .mobile-quick-links {
        order: 3;
        width: 100%;
        margin-top: 0.5rem;
    }
}
"""

if "=== NEW MOBILE HEADER LINKS ===" not in css:
    css += new_styles

with open("assets/css/style.css", "w", encoding="utf-8") as f:
    f.write(css)
print("CSS updated")
