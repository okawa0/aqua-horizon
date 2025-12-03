// ハンバーガーメニュー
// ハンバーガーボタンの要素取得
const btn = document.querySelector('.header-nav__toggle');
// メニューの要素取得
const menu = document.querySelector('.header-nav__menu');

//スクロール位置の保存
let scrollPosition = 0;

// クリックイベントの開始
btn.addEventListener('click', () => {
	// メニューが開いているかを取得
	const isOpen = btn.classList.toggle('is-active');
	menu.classList.toggle('is-open',isOpen);
	// スクロールロック
	if (isOpen){
		// 現在位置の保存
		scrollPosition = window.pageYOffset;
		// bodyを固定してスクロールを止める
    	document.body.style.position = 'fixed';
		// 位置補正
//     	document.body.style.top = `-${scrollPosition}px`;
		// safari左右ずれ対策
    	document.body.style.left = 0;
    	document.body.style.right = 0;
		//メニューを閉じたら元の位置に戻す
	} else {
		// bodyの固定解除
		document.body.style.position = '';
        document.body.style.top = '';
		// 保存した位置へ戻す
        window.scrollTo(0, scrollPosition);
	}
})

