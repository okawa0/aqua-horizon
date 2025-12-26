// // ハンバーガーメニュー
// // ハンバーガーボタンの要素取得
// const btn = document.querySelector('.hamburger-btn');
// // メニューの要素取得
// const menu = document.querySelector('.global-nav');

// // クリックイベントの開始
// btn.addEventListener('click', () => {
// 	// メニューが開いているかを取得
// 	const isOpen = btn.classList.toggle('is-active');
// 	menu.classList.toggle('is-open',isOpen);
// });

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
