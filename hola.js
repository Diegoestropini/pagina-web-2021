'use strict';

const MIN_SCALE = 1;
const MAX_SCALE = 1.8;
const ZOOM_INCREMENT = 0.018;
const ROTATION_INTERVAL = 5000;

const sanitizeSlide = (rawSlide) => {
    if (!rawSlide || typeof rawSlide !== 'object') {
        return null;
    }

    const src = typeof rawSlide.src === 'string' ? rawSlide.src.trim() : '';

    if (!src) {
        return null;
    }

    const alt = typeof rawSlide.alt === 'string' ? rawSlide.alt : '';
    const description = typeof rawSlide.description === 'string' ? rawSlide.description : '';

    return { src, alt, description };
};

const parseSlidesFromData = (dataScript) => {
    if (!dataScript || !dataScript.textContent) {
        return [];
    }

    try {
        const parsed = JSON.parse(dataScript.textContent);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map(sanitizeSlide).filter(Boolean);
    } catch (error) {
        return [];
    }
};

const collectSlides = (mediaContainer, imageElement, captionElement) => {
    const dataScript = mediaContainer.querySelector('.post-media-data');
    const slidesFromData = parseSlidesFromData(dataScript);

    const fallbackSlide = sanitizeSlide({
        src: imageElement.getAttribute('src') || '',
        alt: imageElement.getAttribute('alt') || '',
        description:
            imageElement.dataset.description ||
            (captionElement ? captionElement.textContent.trim() : ''),
    });

    if (slidesFromData.length > 0) {
        return { slides: slidesFromData, fallbackSlide };
    }

    const slides = fallbackSlide ? [fallbackSlide] : [];
    return { slides, fallbackSlide };
};

const initializeMediaRotation = (mediaContainer) => {
    const imageElement = mediaContainer.querySelector('.post-media-image');

    if (!imageElement) {
        return;
    }

    const captionElement = mediaContainer.querySelector('.post-media-caption');

    const { slides, fallbackSlide } = collectSlides(mediaContainer, imageElement, captionElement);

    if (slides.length === 0) {
        return;
    }

    const fallbackAlt =
        (fallbackSlide && fallbackSlide.alt) || imageElement.getAttribute('alt') || '';
    const fallbackCaption =
        (fallbackSlide && fallbackSlide.description) ||
        (captionElement ? captionElement.textContent.trim() : '');

    let currentIndex = 0;
    let rotationTimer = null;
    let isZooming = false;
    let zoomAnimationFrame = null;
    let currentScale = MIN_SCALE;

    const stopZoomAnimation = () => {
        if (zoomAnimationFrame !== null) {
            window.cancelAnimationFrame(zoomAnimationFrame);
            zoomAnimationFrame = null;
        }
    };

    const resetZoomState = () => {
        stopZoomAnimation();
        isZooming = false;
        currentScale = MIN_SCALE;
        imageElement.style.transition = '';
        imageElement.style.transform = `scale(${MIN_SCALE})`;
        imageElement.style.cursor = 'zoom-in';
    };

    const applySlide = (index) => {
        const slide = slides[index];

        if (!slide) {
            return;
        }

        imageElement.setAttribute('src', slide.src);
        imageElement.setAttribute('alt', slide.alt || fallbackAlt);
        imageElement.dataset.description = slide.description || '';

        if (captionElement) {
            captionElement.textContent = slide.description || fallbackCaption || '';
        }

        resetZoomState();
    };

    const stepZoom = () => {
        if (!isZooming) {
            stopZoomAnimation();
            return;
        }

        currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_INCREMENT);
        imageElement.style.transform = `scale(${currentScale})`;

        if (isZooming && currentScale < MAX_SCALE) {
            zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
        } else {
            stopZoomAnimation();
        }
    };

    const startZoom = () => {
        if (isZooming) {
            return;
        }

        isZooming = true;
        currentScale = MIN_SCALE;
        imageElement.style.transition = 'none';
        imageElement.style.cursor = 'zoom-out';
        imageElement.style.transform = `scale(${currentScale})`;
        zoomAnimationFrame = window.requestAnimationFrame(stepZoom);
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

    imageElement.addEventListener('pointerenter', startZoom);
    imageElement.addEventListener('pointerdown', handlePointerDown);
    imageElement.addEventListener('pointerup', resetZoomState);
    imageElement.addEventListener('pointerleave', resetZoomState);
    imageElement.addEventListener('pointercancel', resetZoomState);
    imageElement.addEventListener('dragstart', preventDrag);

    const showSlide = (index) => {
        if (index === currentIndex || !slides[index]) {
            return;
        }

        currentIndex = index;
        applySlide(currentIndex);
    };

    const goToNextSlide = () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
    };

    const stopRotation = () => {
        if (rotationTimer !== null) {
            window.clearInterval(rotationTimer);
            rotationTimer = null;
        }
    };

    const startRotation = () => {
        if (slides.length < 2) {
            return;
        }

        stopRotation();
        rotationTimer = window.setInterval(goToNextSlide, ROTATION_INTERVAL);
    };

    applySlide(currentIndex);
    startRotation();

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
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');

    const mediaContainers = Array.from(document.querySelectorAll('.post-media'));
    mediaContainers.forEach(initializeMediaRotation);
});
