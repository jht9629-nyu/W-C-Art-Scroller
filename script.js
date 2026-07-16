// Update this list to match the files in images/
const IMAGES = [
  'WC-Art-Page-01.jpg',
  'WC-Art-Page-02.jpg',
  'WC-Art-Page-03.jpg',
  'WC-Art-Page-04.jpg',
  'WC-Art-Page-05.jpg',
  'WC-Art-Page-06.jpg',
];

const container = document.getElementById('scroll-container');

// Three copies of the sequence stacked back-to-back so the visible
// viewport always has real content above and below it. Scrolling into
// the top or bottom copy silently jumps back to the middle copy,
// producing an infinite loop with no visible seam.
const SET_COUNT = 3;

function buildImages() {
  for (let set = 0; set < SET_COUNT; set++) {
    for (const filename of IMAGES) {
      const img = document.createElement('img');
      img.className = 'art-image';
      img.src = `images/${filename}`;
      img.draggable = false;
      container.appendChild(img);
    }
  }
}

let setHeight = 0;

function measureSetHeight() {
  setHeight = container.scrollHeight / SET_COUNT;
}

function imagesReady() {
  return Promise.all(
    Array.from(container.querySelectorAll('img')).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }),
    ),
  );
}

function init() {
  buildImages();
  imagesReady().then(() => {
    measureSetHeight();
    container.scrollTop = setHeight;
    requestAnimationFrame(autoScrollTick);
  });
}

let ticking = false;

container.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    if (setHeight > 0) {
      if (container.scrollTop < setHeight * 0.5) {
        container.scrollTop += setHeight;
      } else if (container.scrollTop > setHeight * 1.5) {
        container.scrollTop -= setHeight;
      }
    }
    ticking = false;
  });
});

window.addEventListener('resize', () => {
  const ratio = container.scrollTop / setHeight;
  measureSetHeight();
  container.scrollTop = setHeight * ratio;
});

// Constant, slow autoplay. Pauses while the visitor is actively
// scrolling/touching/dragging and resumes a moment after they stop.
const AUTO_SCROLL_SPEED = 30; // pixels per second
const RESUME_DELAY = 1500; // ms of inactivity before autoplay resumes

let autoScrollEnabled = true;
let lastFrameTime = null;
let resumeTimer = null;
// container.scrollTop only stores whole pixels, so sub-pixel deltas
// (30px/s at 60fps is 0.5px/frame) would otherwise round away to zero
// every frame. Carry the lost fraction here instead of reading it back
// from scrollTop.
let scrollRemainder = 0;

function pauseAutoScroll() {
  autoScrollEnabled = false;
  lastFrameTime = null;
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => {
    autoScrollEnabled = true;
  }, RESUME_DELAY);
}

['wheel', 'touchstart', 'pointerdown'].forEach((eventName) =>
  container.addEventListener(eventName, pauseAutoScroll, { passive: true }),
);

function autoScrollTick(timestamp) {
  if (autoScrollEnabled && lastFrameTime !== null) {
    const deltaSeconds = (timestamp - lastFrameTime) / 1000;
    const distance = AUTO_SCROLL_SPEED * deltaSeconds + scrollRemainder;
    const wholePixels = Math.trunc(distance);
    scrollRemainder = distance - wholePixels;
    if (wholePixels !== 0) container.scrollTop += wholePixels;
  }
  lastFrameTime = autoScrollEnabled ? timestamp : null;
  requestAnimationFrame(autoScrollTick);
}

init();
