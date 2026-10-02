import './sectionContent.css';

// One shared layer over the canvas that holds every section's HTML.
const overlayRoot = document.createElement('div');
overlayRoot.id = 'section-overlay';
document.body.appendChild(overlayRoot);

/**
 * Creates the HTML that lives "inside" a 3D box.
 * main.js moves/resizes it every frame so it lines up with the box.
 */
function createSectionContent(title, bodyHTML, onClose) {
    const el = document.createElement('section');
    el.className = 'section-content';
    el.innerHTML = `
        <header>
            <h2>${title}</h2>
            <button class="close" aria-label="Back">Back</button>
        </header>
        <div class="section-body">${bodyHTML}</div>
    `;

    el.querySelector('.close').addEventListener('click', onClose);

    // Contact form (if this section has one) opens the visitor's mail app.
    const form = el.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
            const body = encodeURIComponent(`${data.get('message')}\n\nReply to: ${data.get('email')}`);
            window.location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${body}`;
        });
    }

    overlayRoot.appendChild(el);
    return el;
}

export { createSectionContent };