/**
 * グローバルナビによるコンテンツ切り替え
 *
 * ARIAのタブパターン（role="tablist"）ではなく、リンク + URLハッシュで実装している。
 * 7項目は本来ページ単位のグローバルナビであり、URLの共有・ブラウザバックが
 * 成立することを優先したため。現在地は aria-current="page" で示す。
 *
 * hidden はHTMLに書かずJS側で付与するため、JSが動かない場合は
 * 全パネルが表示され、ページ内アンカーとして機能する（プログレッシブエンハンスメント）。
 */
(() => {
  const DEFAULT_PANEL = "top";

  const panels = document.querySelectorAll(".panel");
  const navLinks = document.querySelectorAll(".nav-link");
  const navArea = document.getElementById("global-nav");

  if (!panels.length || !navLinks.length) return;

  const panelNames = [...panels].map((panel) => panel.dataset.panel);

  /** ハッシュからパネル名を解決する。未知の値はトップにフォールバック */
  const resolvePanelName = () => {
    const name = location.hash.replace("#", "");
    return panelNames.includes(name) ? name : DEFAULT_PANEL;
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /** 切り替え後、ナビが画面から見切れている場合だけスクロールで戻す */
  const scrollToNavIfNeeded = () => {
    if (!navArea) return;
    if (navArea.getBoundingClientRect().top >= 0) return;

    navArea.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  /** パネル内の最初の見出しへフォールバックなしでフォーカスを移す */
  const focusPanelHeading = (panel) => {
    const heading = panel.querySelector("h2");
    if (!heading) return;

    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  };

  /**
   * @param {string} name           表示するパネル名
   * @param {boolean} [opts.focus]  見出しへフォーカスを移すか（初回表示時は false）
   */
  const activate = (name, { focus = true } = {}) => {
    panels.forEach((panel) => {
      const isCurrent = panel.dataset.panel === name;

      panel.hidden = !isCurrent;
      panel.classList.toggle("is-active", isCurrent);
    });

    // ヘッダーとフッター、2つのナビをまとめて更新する
    navLinks.forEach((link) => {
      if (link.dataset.panel === name) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const current = document.querySelector(`.panel[data-panel="${name}"]`);
    if (!current) return;

    if (focus) {
      scrollToNavIfNeeded();
      focusPanelHeading(current);
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const name = link.dataset.panel;
      if (!name) return;

      event.preventDefault();

      // トップはハッシュなしのURLに戻す
      const url = name === DEFAULT_PANEL ? location.pathname : `#${name}`;
      history.pushState({ panel: name }, "", url);

      activate(name);

      // SPではメニューを開いたまま切り替わると内容が見えないため閉じる
      document.querySelectorAll(".hamburger-btn.is-active").forEach((btn) => {
        btn.click();
      });
    });
  });

  // 戻る／進むへの追従
  window.addEventListener("popstate", () => {
    activate(resolvePanelName(), { focus: false });
  });

  activate(resolvePanelName(), { focus: false });
})();
