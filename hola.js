'use strict';

console.log(1 + 2);

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');

    const heroTrigger = document.querySelector('.hero-title');
    const mainContent = document.getElementById('contenido');

    if (!heroTrigger) {
        return;
    }

    heroTrigger.addEventListener('click', () => {
        document.body.classList.add('content-visible');

        if (!mainContent) {
            return;
        }

        window.requestAnimationFrame(() => {
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
