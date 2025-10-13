// public/js/slider.js
(function () {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  const track = slider.querySelector(".slider__img");
  const slides = Array.from(track.querySelectorAll("img"));
  const prevBtn = slider.querySelector(".slider__arrow .left");
  const nextBtn = slider.querySelector(".slider__arrow .right");
  const dotsWrap = slider.querySelector(".slider__dot");
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];

  let index = 0;
  let autoTimer = null;
  const INTERVAL = 4000;

  function update() {
    const w = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(${-index * w}px)`;
    dots.forEach(d => d.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
  }
  function go(n) { index = (n + slides.length) % slides.length; update(); }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }
  function autoStart() { clearInterval(autoTimer); autoTimer = setInterval(next, INTERVAL); }

  prevBtn?.addEventListener("click", e => { e.preventDefault(); prev(); autoStart(); });
  nextBtn?.addEventListener("click", e => { e.preventDefault(); next(); autoStart(); });
  dots.forEach((dot, i) => dot.addEventListener("click", e => { e.preventDefault(); go(i); autoStart(); }));

  window.addEventListener("resize", () => requestAnimationFrame(update));
  update();
  autoStart();
})();
