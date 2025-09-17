'use strict';

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');

    const mediaContainer = document.querySelector('.post-media');

    if (!mediaContainer) {
        return;
    }

    const images = Array.from(mediaContainer.querySelectorAll('.post-media-image'));

    if (images.length === 0) {
        return;
    }

    const caption = mediaContainer.querySelector('.post-media-caption');

    const MIN_SCALE = 1;
    const MAX_SCALE = 1.8;
    const ZOOM_INCREMENT = 0.018;
    const ROTATION_INTERVAL = 5000;

    const controllers = images.map((image) => {
        let isZooming = false;
        let zoomAnimationFrame = null;
        let currentScale = MIN_SCALE;

        const stepZoom = () => {
            if (!isZooming) {
                zoomAnimationFrame = null;
                return;
            }

            currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_INCREMENT);
            image.style.transform = `scale(${currentScale})`;

            if (isZooming && currentScale < MAX_SCALE) {
                zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
            } else {
                zoomAnimationFrame = null;
            }
        };

        const startZoom = () => {
            if (isZooming || !image.classList.contains('is-active')) {
                return;
            }

            isZooming = true;
            currentScale = MIN_SCALE;
            image.style.cursor = 'zoom-out';
            image.style.transition = 'none';
            image.style.transform = `scale(${currentScale})`;
            zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
        };

        const finishZoom = () => {
            if (zoomAnimationFrame !== null) {
                window.cancelAnimationFrame(zoomAnimationFrame);
                zoomAnimationFrame = null;
            }

            isZooming = false;
            currentScale = MIN_SCALE;
            image.style.transition = '';
            image.style.transform = `scale(${MIN_SCALE})`;
            image.style.cursor = 'zoom-in';
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

        image.addEventListener('pointerenter', startZoom);
        image.addEventListener('pointerdown', handlePointerDown);
        image.addEventListener('pointerup', finishZoom);
        image.addEventListener('pointerleave', finishZoom);
        image.addEventListener('pointercancel', finishZoom);
        image.addEventListener('dragstart', preventDrag);
        image.addEventListener('transitionend', (event) => {
            if (event.propertyName === 'transform' && !isZooming) {
                image.style.transition = '';
            }
        });

        return {
            reset: finishZoom,
        };
    });

    let currentIndex = images.findIndex((image) => image.classList.contains('is-active'));

    if (currentIndex < 0) {
        currentIndex = 0;
    }

    images.forEach((image, index) => {
        if (index === currentIndex) {
            image.classList.add('is-active');
        } else {
            image.classList.remove('is-active');
        }
    });

    const updateCaption = () => {
        if (!caption) {
            return;
        }

        const activeImage = images[currentIndex];
        const description = activeImage.dataset.description || '';
        caption.textContent = description;
    };

    controllers.forEach((controller) => {
        controller.reset();
    });

    updateCaption();

    const showImage = (nextIndex) => {
        if (nextIndex === currentIndex) {
            return;
        }

        controllers[currentIndex].reset();
        images[currentIndex].classList.remove('is-active');

        currentIndex = nextIndex;

        images[currentIndex].classList.add('is-active');
        controllers[currentIndex].reset();
        updateCaption();
    };

    const goToNextImage = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        showImage(nextIndex);
    };

    let rotationTimer = null;

    const stopRotation = () => {
        if (rotationTimer !== null) {
            window.clearInterval(rotationTimer);
            rotationTimer = null;
        }
    };

    const startRotation = () => {
        if (images.length < 2) {
            return;
        }

        stopRotation();
        rotationTimer = window.setInterval(goToNextImage, ROTATION_INTERVAL);
    };

    if (images.length >= 2) {
        startRotation();
    }

    mediaContainer.addEventListener('pointerenter', stopRotation);
    mediaContainer.addEventListener('pointerleave', startRotation);
    mediaContainer.addEventListener('pointercancel', startRotation);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRotation();
        } else {
            startRotation();
        }
    });
});
