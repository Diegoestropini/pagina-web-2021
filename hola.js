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

 codex/implement-image-slideshow-with-captions-cbh1i9
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
=======
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
 main

    images.forEach((image, index) => {
        if (index === currentIndex) {
            image.classList.add('is-active');
        } else {
 codex/implement-image-slideshow-with-captions-cbh1i9
            stopZoomAnimation();
=======
            image.classList.remove('is-active');
 main
        }
    });

    const updateCaption = () => {
        if (!caption) {
            return;
        }

 codex/implement-image-slideshow-with-captions-cbh1i9
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

=======
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

 main
    const stopRotation = () => {
        if (rotationTimer !== null) {
            window.clearInterval(rotationTimer);
            rotationTimer = null;
        }
    };

    const startRotation = () => {
 codex/implement-image-slideshow-with-captions-cbh1i9
        if (slides.length < 2) {
=======
        if (images.length < 2) {
 main
            return;
        }

        stopRotation();
 codex/implement-image-slideshow-with-captions-cbh1i9
        rotationTimer = window.setInterval(goToNextSlide, ROTATION_INTERVAL);
    };

    applySlide(currentIndex);
    startRotation();
=======
        rotationTimer = window.setInterval(goToNextImage, ROTATION_INTERVAL);
    };

    if (images.length >= 2) {
        startRotation();
    }
main

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
