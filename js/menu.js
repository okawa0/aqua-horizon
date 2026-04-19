// ハンバーガーメニュー
document.querySelectorAll('.hamburger-btn').forEach(btn => {
  const menuId = btn.getAttribute('aria-controls');
  const menu = document.getElementById(menuId);

  if (!menu) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('is-active');

    btn.setAttribute('aria-expanded', isOpen);
    menu.classList.toggle('is-open', isOpen);
  });
});

// ヒーロースワイパー
window.addEventListener("load", () => {
  const el = document.querySelector('[data-js="swiper"]');
  if (!el) return;

  new Swiper(el, {
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    speed: 1000,
    slidesPerView: 1,
  });
});