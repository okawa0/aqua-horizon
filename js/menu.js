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
