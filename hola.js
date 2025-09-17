'use strict';

console.log(1 + 2);

function setupProgressiveZoom(image) {
    const MIN_SCALE = 1;
    const MAX_SCALE = 1.85;
    const ZOOM_INCREMENT = 0.022;

    let isZooming = false;
    let currentScale = MIN_SCALE;
    let animationFrameId = null;

    const applyScale = () => {
        image.style.transform = `scale(${currentScale})`;
    };

    const cancelAnimation = () => {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    const stepZoom = () => {
        if (!isZooming) {
            animationFrameId = null;
            return;
        }

        currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_INCREMENT);
        applyScale();

        if (currentScale < MAX_SCALE) {
            animationFrameId = window.requestAnimationFrame(stepZoom);
        } else {
            animationFrameId = null;
        }
    };

    const startZoom = () => {
        if (isZooming) {
            return;
        }

        isZooming = true;
        currentScale = MIN_SCALE;
        image.style.transition = 'none';
        image.style.cursor = 'zoom-out';
        applyScale();
        animationFrameId = window.requestAnimationFrame(stepZoom);
    };

    const stopZoom = () => {
        if (!isZooming && currentScale === MIN_SCALE) {
            return;
        }

        isZooming = false;
        cancelAnimation();
        currentScale = MIN_SCALE;
        image.style.transition = '';
        image.style.cursor = 'zoom-in';
        applyScale();
    };

    const preventDrag = (event) => {
        event.preventDefault();
    };

    const handlePointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        if (image.setPointerCapture && event.pointerId !== undefined) {
            image.setPointerCapture(event.pointerId);
        }

        startZoom();
    };

    const handlePointerUp = (event) => {
        if (
            image.releasePointerCapture &&
            image.hasPointerCapture &&
            event.pointerId !== undefined &&
            image.hasPointerCapture(event.pointerId)
        ) {
            image.releasePointerCapture(event.pointerId);
        }

        stopZoom();
    };

    const handleMouseDown = (event) => {
        if (event.button !== 0) {
            return;
        }

        startZoom();
    };

    const handleTouchStart = (event) => {
        if (event.touches && event.touches.length > 1) {
            return;
        }

        startZoom();
    };

    const supportsPointer = window.PointerEvent !== undefined;

    if (supportsPointer) {
        image.addEventListener('pointerenter', startZoom);
        image.addEventListener('pointerdown', handlePointerDown);
        image.addEventListener('pointerup', handlePointerUp);
        image.addEventListener('pointerleave', stopZoom);
        image.addEventListener('pointercancel', stopZoom);
        document.addEventListener('mouseup', stopZoom);
    } else {
        image.addEventListener('mouseenter', startZoom);
        image.addEventListener('mouseleave', stopZoom);
        image.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', stopZoom);
        image.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', stopZoom);
        document.addEventListener('touchcancel', stopZoom);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopZoom();
        }
    });

    window.addEventListener('blur', stopZoom);

    image.addEventListener('dragstart', preventDrag);
}

function setupHeroReveal(heroTrigger, mainContent) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const heroTrigger = document.querySelector('.hero-title');
    const mainContent = document.getElementById('contenido');
    const postImage = document.querySelector('.post-media img');

    setupHeroReveal(heroTrigger, mainContent);

    if (postImage) {
        setupProgressiveZoom(postImage);
    }
});
