/**
 * お問合せフォームのバリデーション
 *
 * form に novalidate を付けてブラウザ標準のバリデーションを止め、
 * エラー文言・表示位置・フォーカス制御を自前で行う。
 * required / type="email" などの属性は支援技術への情報として残している。
 *
 * ※バックエンドは無いため、送信は完了メッセージを出すだけのモック。
 */
(() => {
  const form = document.getElementById("contact-form");
  const success = document.getElementById("contact-success");

  if (!form || !success) return;

  /** 入力値に対する検証ルール。エラーがなければ空文字を返す */
  const rules = {
    name: (value) => {
      if (!value) return "お名前を入力してください。";
      if (value.length > 50) return "お名前は50文字以内で入力してください。";
      return "";
    },
    email: (value) => {
      if (!value) return "メールアドレスを入力してください。";
      // 厳密なRFC準拠ではなく、明らかな誤りを弾く目的の簡易チェック
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "メールアドレスの形式が正しくありません。";
      }
      return "";
    },
    tel: (value) => {
      if (!value) return ""; // 任意項目
      if (!/^[0-9+\-() ]{10,20}$/.test(value)) {
        return "電話番号は数字とハイフンで入力してください。";
      }
      return "";
    },
    date: (value) => {
      if (!value) return ""; // 任意項目
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(value) < today) {
        return "希望日は本日以降の日付を選択してください。";
      }
      return "";
    },
    message: (value) => {
      if (!value) return "お問い合わせ内容を入力してください。";
      if (value.length > 1000) {
        return "お問い合わせ内容は1000文字以内で入力してください。";
      }
      return "";
    },
  };

  const fields = Object.keys(rules).map((name) => ({
    name,
    input: form.elements[name],
    error: document.getElementById(`cf-${name}-error`),
  }));

  /** エラー文言の表示・非表示と、入力欄との関連付けを更新する */
  const render = (field, message) => {
    const { input, error } = field;
    if (!input || !error) return;

    error.textContent = message;
    error.hidden = !message;

    if (message) {
      input.setAttribute("aria-invalid", "true");
      // エラー文をフォーカス時に読み上げさせる
      input.setAttribute("aria-describedby", error.id);
      input.classList.add("is-invalid");
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      input.classList.remove("is-invalid");
    }
  };

  const validate = (field) => {
    if (!field.input) return "";

    const message = rules[field.name](field.input.value.trim());
    render(field, message);
    return message;
  };

  // 一度エラーになった項目のみ、入力のたびに再検証する
  // （入力途中でいきなりエラーを出さないため）
  fields.forEach((field) => {
    if (!field.input) return;

    field.input.addEventListener("blur", () => validate(field));
    field.input.addEventListener("input", () => {
      if (field.input.classList.contains("is-invalid")) validate(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalid = fields.filter((field) => validate(field));

    if (invalid.length > 0) {
      // 最初のエラー項目へフォーカスを移す
      invalid[0].input.focus();
      return;
    }

    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
})();
