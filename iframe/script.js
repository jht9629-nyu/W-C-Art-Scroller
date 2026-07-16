//
//
//

const SRC = 'https://wcartiprc.com/';
const container = document.getElementById('scroll-container');
const sentinel = document.getElementById('sentinel');

function addFrame() {
  const iframe = document.createElement('iframe');
  iframe.className = 'embed-frame';
  iframe.src = SRC;
  iframe.loading = 'lazy';
  container.appendChild(iframe);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        addFrame();
      }
    });
  },
  { rootMargin: '800px' },
);

observer.observe(sentinel);

addFrame();
