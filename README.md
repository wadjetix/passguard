<div dir="rtl">

# فاحص قوة كلمات المرور

أداة تقدّر قوة كلمة المرور وتكشف الأنماط التي يستغلها المهاجم (كلمات شائعة، تسلسل لوحة المفاتيح، سنوات، استبدال الحروف)، وتولّد عبارة مرور عشوائية بإنتروبي معلومة.

**العرض المباشر:** https://wadjetix.github.io/passguard/

## المزايا

- تقدير الإنتروبي وزمن التخمين لمهاجم يجرّب 10^11 محاولة في الثانية
- كشف الكلمات الشائعة والاستبدالات (a إلى @) وتسلسل لوحة المفاتيح والسنوات والتكرار
- مولّد عبارات مرور يعتمد على crypto.getRandomValues مع أخذ عيّنة بلا انحياز
- لا شبكة، لا تخزين، لا مكتبات خارجية

## الخصوصية

كل المعالجة تتم داخل المتصفح. لا يُرسَل شيء إلى أي خادم، ولا توجد تحليلات أو ملفات تعريف ارتباط. سياسة المحتوى (CSP) تمنع أي اتصال خارجي.

## التشغيل محليًا

صفحة ثابتة بلا بناء: افتح `index.html` أو شغّل `python3 -m http.server`.

## المساهمة

افتح Issue بوصف واضح أو أرسل Pull Request صغيرًا. راجع `ROADMAP.md` للخطوات القادمة و`SECURITY.md` للإبلاغ عن الثغرات.

</div>

---

# Password Strength Checker

A browser-only tool that estimates password strength, flags patterns attackers exploit (common words, keyboard walks, years, leetspeak) and generates a random passphrase with known entropy.

**Live demo:** https://wadjetix.github.io/passguard/

- Runs 100% in the browser, no network calls, no dependencies, no tracking.
- Strict Content-Security-Policy (`default-src 'none'`).
- Static files only: `index.html`, `style.css`, `app.js`.
- Licensed under MIT. By [WADJETIX](https://wadjetix.github.io/).
