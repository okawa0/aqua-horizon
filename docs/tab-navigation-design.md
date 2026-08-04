# ナビゲーション切り替え 設計書

グローバルナビのクリックで、下部コンテンツ（`.main-content`）を切り替える機能の設計。

---

## 1. 方針

### 1-1. ARIAタブパターンを採用しない

| | ARIAタブ（`role="tablist"`） | **リンク + ハッシュ（採用）** |
|---|---|---|
| URL | 変わらない | `#courses` などで変わる |
| 直リンク・共有 | 不可 | 可能 |
| ブラウザバック | 効かない | 効く |
| JS無効時 | 何も表示されない | 全セクションが表示され、アンカーで移動 |
| 読み上げ | 「タブ」 | 「リンク」（利用者の期待と一致） |

7項目は本来ページ単位のグローバルナビであり、ウィジェット内のタブではない。
見た目はタブでも、**セマンティクスはナビゲーション**として実装する。

### 1-2. プログレッシブエンハンスメント

```
JS無効 : 7セクションすべて表示 → ナビはページ内アンカー
JS有効 : 初期化時に非対象セクションへ hidden を付与 → 1セクションのみ表示
```

`hidden` はHTMLに直接書かず、**JSが初期化時に付与する**。これによりJSが落ちてもコンテンツが消えない。
検索エンジンからは全セクションがDOM内に存在するため、クロール可能。

---

## 2. 切り替える範囲

```
┌──────────────────────────────────────┐
│ header（固定）                         │
├──────────────────────────────────────┤
│ hero スライダー（固定）                 │
├──────────────────────────────────────┤
│ ナビゲーション ← タブUI                 │
├────────────────────┬─────────────────┤
│ .main-content      │ .sidebar         │
│ ★ここだけ切り替え   │ 固定             │
│                    │ ・予約CTA         │
│                    │ ・体験動画        │
│                    │ ・店舗案内        │
│                    │ ・スタッフブログ   │
│                    │ ・バナー          │
├────────────────────┴─────────────────┤
│ footer（固定）                         │
└──────────────────────────────────────┘
```

サイドバーは全タブ共通の要素（CTA・ブログ・バナー）のため固定。

---

## 3. URL設計

| タブ | ハッシュ | パネルID |
|---|---|---|
| トップ | （なし） | `panel-top` |
| 店舗 | `#store` | `panel-store` |
| コース一覧 | `#courses` | `panel-courses` |
| スタッフ | `#staff` | `panel-staff` |
| お客様の声 | `#voice` | `panel-voice` |
| Q&A | `#faq` | `panel-faq` |
| お問合せ | `#contact` | `panel-contact` |

- トップはハッシュなし（`/`）。`#top` は使わず、トップへ戻る際は `history.pushState` で `location.pathname` に戻す
- 未知のハッシュ（`#hoge`）が来た場合はトップにフォールバック
- ハッシュとパネルIDを分けているのは、**ブラウザ標準のアンカー自動スクロールを避ける**ため
  （`#store` に対応する要素が存在しないので勝手にスクロールしない。スクロール位置はJSで制御する）

---

## 4. マークアップ

### 4-1. ナビゲーション

```html
<nav id="global-nav" class="global-nav" aria-label="メインナビゲーション">
  <ul class="header__menu-list">
    <li class="header__menu-item">
      <a href="./" class="nav-link" data-panel="top" aria-current="page">
        <img src="img/icon-arrow.png" alt="" class="visible-sp" />トップ
      </a>
    </li>
    <li class="header__menu-item">
      <a href="#store" class="nav-link" data-panel="store">
        <img src="img/icon-arrow.png" alt="" class="visible-sp" />店舗
      </a>
    </li>
    <!-- 以下同様 -->
  </ul>
</nav>
```

- 現在地は **`aria-current="page"`**（`aria-selected` はタブ専用のため使わない）
- `data-panel` でパネルと紐づけ
- 既存の `alt` なし `<img>` に `alt=""` を付与（装飾画像）

### 4-2. パネル

```html
<div class="main-content">
  <section id="panel-top" class="panel" data-panel="top" tabindex="-1">
    <!-- 現状の 新着情報 / 人気のコース / お客様の声 / main__contact -->
  </section>

  <section id="panel-store" class="panel" data-panel="store" tabindex="-1">
    <h2 class="heading-ttl">店舗案内</h2>
    ...
  </section>
  <!-- 以下同様 -->
</div>
```

- `tabindex="-1"` は切り替え後のフォーカス移動先にするため
- 各パネルの先頭は `<h2 class="heading-ttl">`（既存の見出しスタイルを流用）

---

## 5. ビジュアル設計

既存のカラーパレットを踏襲する。

| 用途 | 値 |
|---|---|
| プライマリ（ブルー） | `#00a0e9` |
| アクセント（オレンジ） | `#f39800` |
| 見出し背景 | `#e7ecd5` |
| ボーダー | `#ccc` / `#ddd` |
| ページ背景 | `#f5f5f5` |
| テキスト | `#333` / 補助 `#aaa` |

※ 実装時に `:root` のカスタムプロパティへ集約する（`.heading-ttl::before` の `#00a3e0` は `#00a0e9` のタイポと判断し統一）

### 5-1. タブの状態

```
通常      : 文字 #333 / 背景 透明
ホバー    : 文字 #00a0e9 / 下線が中央から伸びる（scaleX 0→1, 200ms）
現在地    : 文字 #00a0e9 / font-weight 700 / 下線 3px #00a0e9 / 背景 #f2fafe
フォーカス: outline 2px #00a0e9 / outline-offset -2px
```

下線はスライドする単一インジケーターではなく、**各タブの `::after` を `transform: scaleX()` で伸縮**させる。
ナビは狭い画面でラベルが折り返るため、絶対配置のインジケーターだと位置がずれるのを避ける。

```css
.nav-link { position: relative; }
.nav-link::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -0.5em;
  height: 3px;
  background-color: var(--color-primary);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}
.nav-link:hover::after { transform: scaleX(0.6); }
.nav-link[aria-current="page"]::after { transform: scaleX(1); }
```

SP（ハンバーガー内）は下線ではなく、**左端に4pxのブルーバー + 背景 `#f2fafe`** で現在地を示す。

### 5-2. パネル切り替えアニメーション

```
1. 現パネルを opacity 1→0（120ms ease-out）
2. hidden の付け替え
3. 新パネルを opacity 0→1 + translateY(8px)→0（220ms ease-out）
```

高さのアニメーションは行わない（コンテンツ量の差が大きく、実装コストの割にジャンクが出やすい）。
代わりに、**切り替え直後にナビ上端が画面外にある場合のみ** `scrollIntoView` でナビ位置まで戻す。

```css
@media (prefers-reduced-motion: reduce) {
  .panel, .nav-link::after { transition: none; animation: none; }
}
```

---

## 6. JavaScript 設計

`js/tab-nav.js` として分離（`menu.js` はハンバーガー + スライダーのまま）。

```
init()
  ├ パネル一覧を収集
  ├ location.hash から初期パネルを決定（未知なら top）
  └ activate(初期パネル, { pushState: false, focus: false })

ナビリンク click
  ├ preventDefault()
  ├ history.pushState(null, "", hash)
  ├ activate(panel)
  └ SPならハンバーガーメニューを閉じる

popstate（戻る／進む）
  └ activate(location.hash から解決したパネル, { pushState: false })

activate(name, opts)
  ├ 全ナビリンクの aria-current を更新（ヘッダー + フッター両方）
  ├ 旧パネル: フェードアウト → hidden 付与
  ├ 新パネル: hidden 解除 → フェードイン
  ├ opts.focus !== false なら新パネルへ focus()（見出しが読み上げられる）
  └ ナビが画面外なら scrollIntoView
```

### ポイント

- **ヘッダーとフッターの2つのナビを同期**する。既存のハンバーガー実装と同じく、`data-panel` を基準に両方まとめて更新
- `focus()` によりスクリーンリーダーへ切り替えが伝わるため、`aria-live` は不要
- 初回表示時（`opts.focus: false`）はフォーカスを動かさない（ページ読み込み直後の不自然なジャンプを避ける）
- **View Transitions API**（`document.startViewTransition`）が使える環境ではそちらでクロスフェードさせ、非対応環境は上記CSSトランジションにフォールバック（任意・実装コスト小）

---

## 7. 各タブのコンテンツ設計

### トップ `#`
現状のまま（新着情報 / 人気のコース / お客様の声 / お問い合わせバー）。

### 店舗 `#store`
- 店舗写真（`img/shop 1.webp` ※ファイル名のスペースはリネームする）
- 店舗情報を `<dl>` で（住所・TEL・営業時間・定休日・駐車場・アクセス）
- Googleマップ埋め込み（`loading="lazy"` + `title` 必須）
- 設備一覧（更衣室・温水シャワー・器材レンタル など）

### コース一覧 `#courses`
**現在のコースカードは画像に文字が焼き込まれている**ため、この一覧では
「写真 + HTMLテキスト」で組み直す。トップの3枚（画像）と対比でき、コーディング力の証明になる。

- カード: 写真 / コース名 / キャッチ / 料金 / 所要時間 / 対象レベル / 詳細ボタン
- CSS Grid（`repeat(auto-fit, minmax(240px, 1fr))`）で自動段組み
- 6コース程度に増やす

### スタッフ `#staff`
- プロフィールカード 3〜4名（写真・名前・役職・保有資格・一言）
- ⚠️ **スタッフ写真の素材がない**。Nano Banana Proでの生成、またはイニシャルアバターでの代替が必要

### お客様の声 `#voice`
- 既存3件 + 追加で6件程度
- **コース別の絞り込みUI**を追加（入門 / 青の洞窟 / 1日フリー / すべて）
  → JSのフィルタリング実装をもう1つ見せられる

### Q&A `#faq`
- `<details>` / `<summary>` によるアコーディオン 6〜8問
- `<details name="faq">` で排他開閉（ネイティブ機能、JS不要）
- 開閉アニメーションは `interpolate-size: allow-keywords` + `::details-content` を試し、
  **対応状況を実機で確認してから採否を決める**。非対応環境では即時開閉（アニメーションなし）に自然にフォールバックするため、
  無理にJSで高さアニメーションを書かない方針
- 質問内容: 泳げなくても参加できるか / 持ち物 / 予約変更 / 雨天時 / 年齢制限 / 送迎 など

### お問合せ `#contact`
- 項目: お名前（必須）/ メールアドレス（必須）/ 電話番号 / 希望コース（select）/ 希望日（date）/ お問い合わせ内容（必須, textarea）
- `novalidate` + JSでカスタムバリデーション
  - `aria-invalid` / `aria-describedby` でエラーを紐づけ
  - 送信時、エラーがあれば**最初のエラー項目へフォーカス**
  - エラーメッセージは色だけでなくテキストとアイコンでも示す（色覚多様性への配慮）
- ⚠️ **バックエンドなし**。送信時はモックの完了メッセージを表示し、READMEにその旨を明記する

---

## 8. 実装順序

1. ✅ パネル分割 + JS切り替え（トップのみ中身あり、他は見出しだけ）→ 動作確認
2. ✅ タブのビジュアル（`aria-current` スタイル、フォーカスリング）
3. ✅ 各パネルのコンテンツ実装（店舗 / コース一覧 / スタッフ / お客様の声）
4. Q&Aアコーディオン
5. お問合せフォーム + バリデーション
6. `prefers-reduced-motion` / キーボード操作の総点検

> ⚠️ Q&A・お問合せの2タブはまだ「準備中」のプレースホルダー。
> **この状態で公開すると未完成に見えるため、ステップ5完了までデプロイしない。**

### ステップ3で追加した画像

既存素材から切り出して生成（`cwebp -q 82`）。

| ファイル | 生成元 | 用途 |
|---|---|---|
| `course-photo-1〜3.webp` | `course-1〜3.webp` の**波より上の写真部分のみ** | コースカード（焼き込み文字を除外） |
| `course-photo-4〜6.webp` | `hero-pc1〜3.webp` | コースカード |
| `voice-4〜6.webp` | `hero-pc1〜3.webp` の正方形切り出し | お客様の声 |
| `staff-1〜4.webp` | 自動生成のシルエット | **スタッフ写真の仮置き。同名で上書きすればHTML修正不要** |

- `hero-pc2/3` 由来の切り出しは、右下のAI生成ウォーターマークを除く範囲でトリミング済み
- `shop 1.webp` → `shop.webp` にリネーム（ファイル名のスペース解消）

---

## 9. 未決事項

- ~~スタッフ写真の素材をどうするか~~ → **Nano Banana Pro で生成**（バナーと同じ手法）
  ※ 生成画像の右下に入るウォーターマーク（✦）は除去してから使用する
- ~~コース一覧を6コースに増やすか~~ → **6コースで実装**
- お客様の声のフィルタリングを入れるか（**未実装**。現状は6件をそのまま並べている）
- View Transitions API を使うか（**未実装**。現状はCSSアニメーションのみ）
