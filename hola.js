'use strict';

const MIN_SCALE = 1;
const MAX_SCALE = 1.8;
const ZOOM_INCREMENT = 0.018;
const ROTATION_INTERVAL = 5000;

const createZoomController = (image) => {
  let animationFrame = null;
  let isZooming = false;
  let currentScale = MIN_SCALE;

  const cancelAnimation = () => {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  const reset = () => {
    cancelAnimation();
    isZooming = false;
    currentScale = MIN_SCALE;
    image.style.transform = `scale(${MIN_SCALE})`;
    image.style.cursor = 'zoom-in';
  };

  const stepZoom = () => {
    if (!isZooming) {
      animationFrame = null;
      return;
    }

    currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_INCREMENT);
    image.style.transform = `scale(${currentScale})`;

    if (currentScale >= MAX_SCALE) {
      isZooming = false;
      animationFrame = null;
      return;
    }

    animationFrame = window.requestAnimationFrame(stepZoom);
  };

  const startZoom = () => {
    if (isZooming) {
      return;
    }

    isZooming = true;
    image.style.cursor = 'zoom-out';
    animationFrame = window.requestAnimationFrame(stepZoom);
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
  image.addEventListener('pointerup', reset);
  image.addEventListener('pointerleave', reset);
  image.addEventListener('pointercancel', reset);
  image.addEventListener('dragstart', preventDrag);

  reset();

  return { reset };
};

const initializeMediaRotation = (mediaContainer) => {
  const images = Array.from(mediaContainer.querySelectorAll('.post-media-image'));
  const caption = mediaContainer.querySelector('.post-media-caption');
  const prevButton = mediaContainer.querySelector('.post-media-control--prev');
  const nextButton = mediaContainer.querySelector('.post-media-control--next');

  if (images.length === 0) {
    return;
  }

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

  const controllers = images.map((image) => createZoomController(image));

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
    if (nextIndex === currentIndex || !images[nextIndex]) {
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

  const goToPreviousImage = () => {
    const previousIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(previousIndex);
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

  const handleManualNavigation = (navigateFn) => {
    if (typeof navigateFn !== 'function') {
      return;
    }

    stopRotation();
    navigateFn();
    startRotation();
  };

  if (images.length >= 2) {
    startRotation();
  }

  const focusHandlers = [prevButton, nextButton].filter(Boolean);

  focusHandlers.forEach((control) => {
    control.addEventListener('focus', stopRotation);
    control.addEventListener('blur', () => {
      if (!mediaContainer.matches(':hover')) {
        startRotation();
      }
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', (event) => {
      event.preventDefault();
      handleManualNavigation(goToPreviousImage);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (event) => {
      event.preventDefault();
      handleManualNavigation(goToNextImage);
    });
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
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-enabled');

  const mediaContainers = Array.from(document.querySelectorAll('.post-media'));
  mediaContainers.forEach(initializeMediaRotation);
});
