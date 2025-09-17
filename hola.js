'use strict';

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');

    const postImage = document.querySelector('.post-media img');

    if (!postImage) {
        return;
    }

    let isZooming = false;
    let zoomAnimationFrame = null;
    const MIN_SCALE = 1;
    const MAX_SCALE = 1.8;
    const ZOOM_INCREMENT = 0.018;
    let currentScale = MIN_SCALE;

    const stepZoom = () => {
        if (!isZooming) {
            zoomAnimationFrame = null;
            return;
        }

        currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_INCREMENT);
        postImage.style.transform = `scale(${currentScale})`;

        if (isZooming && currentScale < MAX_SCALE) {
            zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
        } else {
            zoomAnimationFrame = null;
        }
    };

    const startZoom = () => {
        if (isZooming) {
            return;
        }

        isZooming = true;
        currentScale = MIN_SCALE;
        postImage.style.cursor = 'zoom-out';
        postImage.style.transition = 'none';
        postImage.style.transform = `scale(${currentScale})`;
        zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
    };

    const stopZoom = () => {
        if (!isZooming && currentScale === MIN_SCALE) {
            return;
        }

        isZooming = false;

        if (zoomAnimationFrame !== null) {
            window.cancelAnimationFrame(zoomAnimationFrame);
            zoomAnimationFrame = null;
        }

        currentScale = MIN_SCALE;
        postImage.style.transition = '';
        postImage.style.transform = `scale(${MIN_SCALE})`;
        postImage.style.cursor = 'zoom-in';
    };

    const handlePointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        startZoom();
    };

    const preventDrag = (event) => {
        event.preventDefault();
    };

    postImage.addEventListener('pointerenter', startZoom);
    postImage.addEventListener('pointerdown', handlePointerDown);
    postImage.addEventListener('pointerup', stopZoom);
    postImage.addEventListener('pointerleave', stopZoom);
    postImage.addEventListener('pointercancel', stopZoom);
    postImage.addEventListener('dragstart', preventDrag);

    postImage.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'transform' && !isZooming) {
            postImage.style.transition = '';
        }
    });
});
