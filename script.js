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

init();
