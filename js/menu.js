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
// defer 読み込みのため DOM は構築済み。load を待つと画像の読み込み完了まで初期化が遅れる
document.querySelectorAll('[data-js="swiper"]').forEach((el) => {
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