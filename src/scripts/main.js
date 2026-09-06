const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// Typewriter for the "Powerful search" card: type a word, pause, delete, type the next.
function startTypewriter() {
  const textEl = document.querySelector('.search-text');
  if (!textEl || textEl.dataset.typing === 'on') return;
  const words = ['cars', 'sneakers', 'typography', 'recipes', 'interiors'];

  if (motionPreference.matches) {
    textEl.textContent = words[0];
    return;
  }

  textEl.dataset.typing = 'on';
  let wordIndex = 0;

  const typeWord = () => {
    const word = words[wordIndex % words.length];
    let i = 0;
    const type = () => {
      textEl.textContent = word.slice(0, i);
      if (i < word.length) {
        i += 1;
        setTimeout(type, 95 + Math.random() * 65);
      } else {
        setTimeout(erase, 1500);
      }
    };
    const erase = () => {
      textEl.textContent = word.slice(0, i);
      if (i > 0) {
        i -= 1;
        setTimeout(erase, 45);
      } else {
        wordIndex += 1;
        setTimeout(typeWord, 420);
      }
    };
    type();
  };

  typeWord();
}

// Reveal Why Stash cards as they scroll into view. Gated by .anim-ready so the
// page still shows all content if JS or IntersectionObserver is unavailable.
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('anim-ready');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      if (entry.target.classList.contains('powerful-search')) startTypewriter();
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });

  document
    .querySelectorAll('.image-analysis, .moodboards, .powerful-search, .device-sync')
    .forEach((card) => revealObserver.observe(card));
}

document.querySelectorAll('.tag-options button, .color-options button').forEach((option) => {
  option.addEventListener('click', () => {
    option.classList.toggle('selected');
    option.setAttribute('aria-pressed', String(option.classList.contains('selected')));
  });
});

const hero = document.querySelector('.hero');
const demoWrap = document.querySelector('.demo-wrap');
const phone = document.querySelector('.phone');
const closingSection = document.querySelector('.join');
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

let scrollFrame;
function updateScrollEffects() {
  scrollFrame = undefined;
  const scrollY = window.scrollY;
  const reducedMotion = motionPreference.matches;

  // The bottom scrim is a home-state treatment, not a scrolling obstruction.
  document.body.classList.toggle('is-scrolled', scrollY > 8);

  if (reducedMotion) {
    demoWrap?.style.setProperty('--hero-desktop-depth', '0px');
    phone?.style.setProperty('--hero-phone-depth', '0px');
    closingSection?.style.setProperty('--closing-copy-depth', '0px');
    closingSection?.style.setProperty('--closing-word-depth', '0px');
    return;
  }

  if (window.matchMedia('(min-width: 761px)').matches && hero) {
    const heroProgress = clamp(scrollY / Math.max(hero.offsetHeight * .88, 1), 0, 1);
    demoWrap?.style.setProperty('--hero-desktop-depth', `${heroProgress * 28}px`);
    phone?.style.setProperty('--hero-phone-depth', `${heroProgress * -38}px`);
  } else {
    demoWrap?.style.setProperty('--hero-desktop-depth', '0px');
    phone?.style.setProperty('--hero-phone-depth', '0px');
  }

  if (closingSection) {
    const sectionBounds = closingSection.getBoundingClientRect();
    const sectionProgress = clamp(
      (window.innerHeight - sectionBounds.top) / (window.innerHeight + sectionBounds.height),
      0,
      1,
    );
    const parallaxOffset = (sectionProgress - .5) * 36;
    closingSection.style.setProperty('--closing-copy-depth', `${parallaxOffset * .45}px`);
    closingSection.style.setProperty('--closing-word-depth', `${parallaxOffset * 1.25}px`);
  }
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
motionPreference.addEventListener?.('change', requestScrollUpdate);
updateScrollEffects();
