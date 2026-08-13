/* ============================================================
   IWAD — Main JS v4.1
   تشغيلية: درج/بحث/هيدر · رصدية: أطلس/معجم/ترشيح/سباي
   حركية: نظام موحّد — كل قسم يدخل بجملة واحدة:
   «المسطرة تُرسم ← الوحدات تُسجَّل ← العلامة تُرصَد»
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Drawer ---------- */
  var drawer = document.getElementById('drawer');
  var backdrop = document.getElementById('backdrop');
  var burger = document.getElementById('burger');
  var drawerClose = document.getElementById('drawer-close');
  var lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = drawer.querySelector('a, button');
    if (first) first.focus();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && burger) {
    burger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
  }

  /* ---------- Search ---------- */
  var searchOverlay = document.getElementById('search-overlay');
  var searchToggles = document.querySelectorAll('[data-search-toggle]');
  var searchClose = document.getElementById('search-close');
  var searchInput = document.getElementById('search-input');

  function openSearch() {
    lastFocus = document.activeElement;
    searchOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (searchInput) searchInput.focus();
  }
  function closeSearch() {
    searchOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  if (searchOverlay) {
    searchToggles.forEach(function (btn) { btn.addEventListener('click', openSearch); });
    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchOverlay && searchOverlay.classList.contains('is-open')) closeSearch();
    if (drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* ---------- السنة + التاريخ ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var todayEl = document.getElementById('today');
  if (todayEl) {
    var now = new Date();
    todayEl.dateTime = now.toISOString().slice(0, 10);
    todayEl.textContent = now.toLocaleDateString('ar-EG-u-nu-latn', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /* ============================================================
     الطبقة الرصدية
     ============================================================ */

  /* عين القسم: علامة الكيكر تكتمل عندما يكون القسم مرئياً */
  var spySections = document.querySelectorAll('.spy');
  if (spySections.length && 'IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('live', en.isIntersecting);
      });
    }, { rootMargin: '-20% 0px -55% 0px' });
    spySections.forEach(function (s) { spyIO.observe(s); });
  }

  /* ---------- صفحة المادة: مؤشر القراءة + جدول محتويات حي + نسخ الرابط ---------- */
  var progress = document.getElementById('read-progress');
  if (progress) {
    var onRead = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onRead, { passive: true });
    onRead();
  }

  /* جدول المحتويات الحي — حساب مباشر بالمستطيلات (لا يعتمد على IO) */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length) {
    var tocPairs = [];
    tocLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) tocPairs.push({ t: t, a: a });
    });
    var tocTick = false;
    var tocUpdate = function () {
      tocTick = false;
      var line = window.innerHeight * 0.32;
      var current = null;
      tocPairs.forEach(function (p) {
        if (p.t.getBoundingClientRect().top <= line) current = p.a;
      });
      tocPairs.forEach(function (p) { p.a.classList.toggle('on', p.a === current); });
    };
    window.addEventListener('scroll', function () {
      if (tocTick) return;
      tocTick = true;
      setTimeout(tocUpdate, 120);
    }, { passive: true });
    tocUpdate();
  }

  var copyBtn = document.getElementById('copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { document.getElementById('share').classList.add('did'); })
        .catch(function () { window.prompt('انسخ الرابط:', url); });
    });
  }

  /* قراءة لوحة المسرح: فحص أي عنصر يحدّث سطر القراءة */
  var heroRead = document.getElementById('hero-read');
  if (heroRead) {
    var heroReadDefault = heroRead.textContent;
    document.querySelectorAll('.hero-map [data-read]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { heroRead.textContent = el.dataset.read; });
    });
    var heroSvg = document.querySelector('.hero-map svg');
    if (heroSvg) heroSvg.addEventListener('mouseleave', function () { heroRead.textContent = heroReadDefault; });
  }

  /* الأطلس: الفحص يحدّث لوحة الملف */
  var zones = document.querySelectorAll('.zone');
  var apName = document.getElementById('ap-name');
  if (zones.length && apName) {
    var apCount = document.getElementById('ap-count');
    var apUpdated = document.getElementById('ap-updated');
    var apDesc = document.getElementById('ap-desc');
    var apCross = document.getElementById('ap-cross');
    var selectZone = function (z) {
      zones.forEach(function (o) { o.classList.remove('active'); });
      z.classList.add('active');
      apName.textContent = z.dataset.file;
      apCount.textContent = z.dataset.count;
      apUpdated.textContent = z.dataset.updated;
      apDesc.textContent = z.dataset.desc;
      /* قفل الرصد على دبوس الملف */
      if (apCross) {
        var pin = z.querySelector('.pin');
        if (pin) {
          var bb = pin.getBBox();
          apCross.setAttribute('transform',
            'translate(' + (bb.x + bb.width / 2) + ' ' + (bb.y + bb.height / 2) + ')');
        }
      }
    };
    zones.forEach(function (z) {
      z.addEventListener('mouseenter', function () { selectZone(z); });
      z.addEventListener('click', function () { selectZone(z); });
    });
    var defZone = document.querySelector('.zone[data-file="سوريا وإسرائيل"]');
    if (defZone) selectZone(defZone);
  }

  /* المعجم: فحص عقدة يحدّث التعريف ويضيء وصلتها */
  var tnodes = document.querySelectorAll('.tnode');
  var ldTerm = document.getElementById('ld-term');
  if (tnodes.length && ldTerm) {
    var ldEn = document.getElementById('ld-en');
    var ldDef = document.getElementById('ld-def');
    var tlinks = document.querySelectorAll('.tlink');
    var selectTerm = function (n) {
      tnodes.forEach(function (o) { o.classList.remove('active'); });
      tlinks.forEach(function (l) { l.classList.remove('lit'); });
      n.classList.add('active');
      var link = document.querySelector('.tlink[data-t="' + n.dataset.t + '"]');
      if (link) link.classList.add('lit');
      ldTerm.textContent = n.dataset.term;
      ldEn.textContent = n.dataset.en;
      ldDef.textContent = n.dataset.def;
    };
    tnodes.forEach(function (n) {
      n.addEventListener('mouseenter', function () { selectTerm(n); });
      n.addEventListener('click', function () { selectTerm(n); });
    });
  }

  /* فهرس الإصدارات: ترشيح بالقسم — بتبديل ناعم */
  var chips = document.querySelectorAll('.pf-chip');
  var pubs = document.querySelectorAll('.pub');
  if (chips.length && pubs.length) {
    var applyFilter = function (f) {
      pubs.forEach(function (p) {
        p.classList.toggle('hide', f !== 'all' && p.dataset.sec !== f);
      });
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        var f = chip.dataset.filter;
        if (!hasGSAP || reducedMotion) { applyFilter(f); return; }
        var visible = Array.prototype.filter.call(pubs, function (p) { return !p.classList.contains('hide'); });
        gsap.to(visible, {
          opacity: 0, duration: 0.12, ease: 'power1.in',
          onComplete: function () {
            applyFilter(f);
            var next = Array.prototype.filter.call(pubs, function (p) { return !p.classList.contains('hide'); });
            gsap.set(pubs, { clearProps: 'opacity' });
            gsap.from(next, { opacity: 0, y: 6, duration: 0.3, stagger: 0.035, ease: 'power1.out' });
          }
        });
      });
    });
  }

  /* ============================================================
     الطبقة الحركية — الكوريغرافيا الموحّدة
     ============================================================ */
  var riseEls = document.querySelectorAll('.rise');
  var unveilEls = document.querySelectorAll('.unveil');

  function settleAll() {
    riseEls.forEach(function (el) { el.classList.add('in'); });
    unveilEls.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('section, .nl-plate').forEach(function (el) { el.classList.add('armed'); });
    document.querySelectorAll('.num[data-count]').forEach(function (el) {
      el.textContent = el.dataset.count || el.textContent;
    });
  }

  if (!hasGSAP || reducedMotion) { settleAll(); return; }

  /* ثوابت الجملة الحركية — كل الأقسام تتكلم بنفس الإيقاع */
  var M = {
    unit: 0.45,      /* دخول وحدة */
    stag: 0.06,      /* المسافة بين الوحدات */
    draw: 0.7,       /* رسم خط */
    pop:  0.32,      /* رصد علامة */
    easeUnit: 'power1.out',
    easeDraw: 'power2.out',
    easePop: 'back.out(2)'
  };

  /* ============================================================
     التشغيل بالتقاطع لا بالإحداثيات:
     IntersectionObserver يعيد التقييم مع كل تغير لياوت —
     لا مواضع محسوبة مسبقاً تفسد بعد تحميل الخط/الـSVG
     ============================================================ */
  var enterMap = new Map(); /* el -> fire() */
  function makeIO(rootMargin) {
    return new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var fire = enterMap.get(en.target);
        if (fire) { enterMap.delete(en.target); fire(); }
        obs.unobserve(en.target);
      });
    }, { rootMargin: rootMargin });
  }
  /* حزامان: قريب (القوائم) وبعيد (الذروات تبدأ أبكر) */
  var ioNear = makeIO('0px 0px -18% 0px');
  var ioFar  = makeIO('0px 0px -28% 0px');

  function onEnter(el, fire, far) {
    if (!el) return;
    /* عنصر واحد قد يحمل أكثر من دور (rise + جذر قسم) —
       التسجيلات تتركّب ولا يدوس أحدها على الآخر */
    var prev = enterMap.get(el);
    enterMap.set(el, prev ? function () { prev(); fire(); } : fire);
    (far ? ioFar : ioNear).observe(el);
  }

  /* شبكة أمان: كنس بالمستطيلات — يلقط أي عنصر فاته الـ IO
     (سكرول سريع جداً، تبويب خلفي، أو أي تفويت متصفح) */
  function sweep() {
    if (!enterMap.size) return;
    var vh = window.innerHeight;
    enterMap.forEach(function (fire, el) {
      var r = el.getBoundingClientRect();
      /* عدّى خط الإطلاق — سواء ظاهر الآن أو اتجاوزناه لفوق */
      if (r.top < vh * 0.92) {
        enterMap.delete(el);
        ioNear.unobserve(el); ioFar.unobserve(el);
        fire();
      }
    });
  }
  var sweepPending = false;
  function queueSweep() {
    if (sweepPending) return;
    sweepPending = true;
    setTimeout(function () { sweepPending = false; sweep(); }, 180);
  }
  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep, { passive: true });
  window.addEventListener('load', sweep);

  /* الضمانة القصوى: لا عنصر يبقى مخفياً أكثر من ٤ ثوانٍ مهما حدث —
     أي متبقٍ في قائمة الانتظار يُطلق كما هو (المحتوى أهم من الدخول المسرحي) */
  setTimeout(function () {
    enterMap.forEach(function (fire, el) {
      enterMap.delete(el);
      ioNear.unobserve(el); ioFar.unobserve(el);
      fire();
    });
  }, 4000);

  /* كشف rise/unveil العام */
  riseEls.forEach(function (el) { onEnter(el, function () { el.classList.add('in'); }); });
  unveilEls.forEach(function (el) { onEnter(el, function () { el.classList.add('in'); }); });

  /* جملة قسم: تايم لاين موقوف يُطلق عند دخول الجذر */
  function sect(rootSel, build, far) {
    var root = document.querySelector(rootSel);
    if (!root) return;
    var tl = gsap.timeline({ paused: true, defaults: { ease: M.easeUnit } });
    build(tl, root);
    onEnter(root, function () {
      root.classList.add('armed');
      var host = root.closest('section');           /* مسطرة الرأس تعيش على السكشن */
      if (host) host.classList.add('armed');
      tl.play();
    }, far);
  }

  function drawPath(tl, el, dur, pos) {
    var len = el.getTotalLength();
    tl.fromTo(el,
      { strokeDasharray: len + ' ' + len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: dur || M.draw, ease: M.easeDraw,
        onComplete: function () { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; } },
      pos);
  }

  /* ============ الافتتاحية: الهيرو ============ */
  if (document.querySelector('.hero-map')) {
  var heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  heroTl.from('[data-hero]', { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 });

  var land = gsap.utils.toArray('#hm-land rect');
  if (land.length) {
    heroTl.from(land, {
      opacity: 0, duration: 0.3,
      stagger: { each: 0.012, from: 'center' }, ease: 'power1.out'
    }, '-=0.45');
  }
  /* حد العلامة يُرسم، ثم خلايا الأقسام تُرصَد، ثم التسميات */
  var hsOutline = document.getElementById('hs-outline');
  if (hsOutline) drawPath(heroTl, hsOutline, 0.9, '-=0.25');
  var hsCells = gsap.utils.toArray('.hs-cell rect');
  if (hsCells.length) {
    heroTl.from(hsCells, {
      opacity: 0, scale: 0.4, transformOrigin: 'center',
      duration: M.pop, ease: M.easePop, stagger: 0.07
    }, '-=0.35');
  }
  heroTl.from('.hs-labels text, .hs-cart', { opacity: 0, duration: 0.35, stagger: 0.04 }, '-=0.15');
  }

  /* ============ بوابة الأقسام: الخلايا تُسجَّل والعلامات تُرصَد ============ */
  sect('.gateway', function () {}); /* الوحدات CSS-stagger */

  /* ============ المجرى: القيود تتوالى ============ */
  sect('.stream-grid', function () {});

  /* ============ الإصدارات المميزة: اللوحة تنكشف ثم النص يُسجَّل ============ */
  sect('.feats', function () {});

  /* ============ الأطلس: الساحل يُرسم ثم اليابسة تمتلئ ثم الملفات تُرصَد ============ */
  sect('.atlas-section', function (tl) {
    var lands = gsap.utils.toArray('.px-land');
    lands.forEach(function (p, i) {
      var len = p.getTotalLength();
      tl.fromTo(p,
        { strokeDasharray: len + ' ' + len, strokeDashoffset: len, fillOpacity: 0 },
        { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut',
          onComplete: function () { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } },
        i === 0 ? 0 : '<0.03');
    });
    tl.to(lands, { fillOpacity: 1, duration: 0.5, ease: 'power1.out' }, '-=0.5')
      .from(gsap.utils.toArray('.zone .pin'), {
        scale: 0, transformOrigin: 'center', duration: M.pop, ease: M.easePop, stagger: 0.08
      }, '-=0.25')
      .from(gsap.utils.toArray('.zone text, .zone .leader'), { opacity: 0, duration: 0.35, stagger: 0.05 }, '-=0.2');
  }, true);

  /* ============ الفهرس: الصفوف تتوالى ============ */
  sect('.pubs', function () {});

  /* ============ المعجم: الوصلات تُخط ثم العقد تُرصَد (المركز أولاً) ============ */
  sect('.lex-frame', function (tl) {
    tl.from('.tnode.center', { opacity: 0, scale: 0.6, transformOrigin: 'center', duration: M.pop, ease: M.easePop });
    gsap.utils.toArray('.tlink').forEach(function (l, i) { drawPath(tl, l, 0.5, i === 0 ? '-=0.05' : '<0.08'); });
    tl.from(gsap.utils.toArray('.tnode:not(.center)'), {
      opacity: 0, scale: 0.6, transformOrigin: 'center', duration: M.pop, ease: M.easePop, stagger: 0.07
    }, '-=0.25');
  });

  /* ============ الإرث: الكنتور يُرسم ثم التشكيلات ثم المناورة ============ */
  sect('.era-band', function (tl) {
    var contours = gsap.utils.toArray('.battle-frame path[stroke]:not(.bt-move)');
    contours.forEach(function (p, i) { drawPath(tl, p, 0.5, i === 0 ? 0 : '<0.06'); });
    tl.from(gsap.utils.toArray('.battle-frame g[fill], .battle-frame g[stroke-width="2"]'), {
      opacity: 0, duration: 0.4, stagger: 0.1
    }, '-=0.2');
    gsap.utils.toArray('.bt-move').forEach(function (p, i) { drawPath(tl, p, 0.8, i === 0 ? '-=0.1' : '<0.2'); });
    tl.from(gsap.utils.toArray('.battle-frame text'), { opacity: 0, duration: 0.3, stagger: 0.04 }, '-=0.5');
  }, true);

  /* دبابيس الخط الزمني — سيقان تُرسم وعلامات تُرصَد عند دخول اللوح */
  var tlPlate = document.querySelector('.tl-plate');
  if (tlPlate) {
    var markerTls = gsap.utils.toArray('.tlm').map(function (m, i) {
      var stem = m.querySelector('.tl-stem');
      var sq = m.querySelector('.sq-m');
      var texts = m.querySelectorAll('text');
      var mtl = gsap.timeline({ paused: true, delay: i * 0.1 });
      if (stem) mtl.from(stem, { scaleY: 0, duration: 0.35, ease: M.easeDraw, svgOrigin: stem.getAttribute('x1') + ' 200' });
      if (sq) mtl.from(sq, { opacity: 0, scale: 0.3, transformOrigin: 'center', duration: 0.25, ease: M.easePop }, '-=0.1');
      if (texts.length) mtl.from(texts, { opacity: 0, duration: 0.2 }, '-=0.1');
      return mtl;
    });
    onEnter(tlPlate, function () {
      markerTls.forEach(function (t) { t.play(); });
    });
  }

  /* ============ الباحثون: الخلايا تتوالى ============ */
  sect('.people-grid', function () {});

  /* ============ الفعاليات: التواريخ تُرصَد ثم المتن ============ */
  sect('.events-grid', function () {});

  /* ============ المداخل: البنك يترصّ سريعاً ============ */
  sect('.topics', function () {});

  /* ============ التغذية ============ */
  sect('.feed-grid', function () {});

  /* ============ قاعة المعهد: البيان يُكشف (CSS) والأرقام تتوالى ============ */
  sect('.inst', function () {}, true);

  /* ============ النشرة: تسليح فقط — الأقواس CSS ============ */
  sect('.nl-plate', function () {});

  /* ============ شبكة أمان عامة — الصفحات الداخلية ============
     أي حاوية data-stagger لم تلتقطها جملة قسم مخصصة تُسلَّح بدخولها،
     وكذلك أي سكشن (مسطرة الرأس). التسجيلات تتركّب فلا ضرر من الازدواج. */
  gsap.utils.toArray('[data-stagger]').forEach(function (el) {
    onEnter(el, function () {
      el.classList.add('armed');
      var host = el.closest('section');
      if (host) host.classList.add('armed');
    });
  });
  gsap.utils.toArray('main section, main .sec-hero, .era-band').forEach(function (el) {
    onEnter(el, function () { el.classList.add('armed'); });
  });

  /* ============ العدادات — عامة: كل رقم يُسجَّل عند وصوله ============ */
  gsap.utils.toArray('.num[data-count]').forEach(function (el) {
    onEnter(el, function () {
      var target = parseInt(el.dataset.count, 10) || 0;
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target,
        duration: 1.3,
        ease: 'power2.out',
        snap: { innerText: 1 }
      });
    });
  });
})();

/* ============================================================
   المعجم — بحث حي في المصطلحات
   ============================================================ */
(function () {
  var inp = document.getElementById('glossary-search');
  if (!inp) return;
  var rows = Array.prototype.slice.call(document.querySelectorAll('.term-row'));
  var shown = document.getElementById('glo-shown');
  function apply() {
    var q = inp.value.trim().toLowerCase();
    var n = 0;
    rows.forEach(function (r) {
      var hit = !q || (r.getAttribute('data-k') || '').toLowerCase().indexOf(q) !== -1;
      r.classList.toggle('hide', !hit);
      if (hit) n++;
    });
    if (shown) shown.textContent = n;
  }
  inp.addEventListener('input', apply);
})();

/* ============================================================
   الأرشيف — مرشحات خماسية + بحث نصي + ترتيب + معاملات الرابط
   ============================================================ */
(function () {
  var wrap = document.getElementById('arch-rows');
  if (!wrap) return;
  var rows = Array.prototype.slice.call(wrap.querySelectorAll('.pub'));
  var shown = document.getElementById('arch-shown');
  var empty = document.getElementById('arch-empty');
  var inp = document.getElementById('arch-search');
  var state = { q: '', sec: 'all', type: 'all', region: 'all', era: 'all', author: 'all' };

  function apply() {
    var n = 0;
    rows.forEach(function (r) {
      var d = r.dataset;
      var hit =
        (state.sec === 'all' || d.sec === state.sec) &&
        (state.type === 'all' || d.type === state.type) &&
        (state.region === 'all' || d.region === state.region) &&
        (state.era === 'all' || d.era === state.era) &&
        (state.author === 'all' || d.author === state.author) &&
        (!state.q || (d.k || '').toLowerCase().indexOf(state.q) !== -1);
      r.classList.toggle('hide', !hit);
      if (hit) n++;
    });
    if (shown) shown.textContent = n;
    if (empty) empty.hidden = n !== 0;
  }

  document.querySelectorAll('.f-group').forEach(function (g) {
    var key = g.getAttribute('data-g');
    g.querySelectorAll('.af-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        g.querySelectorAll('.af-chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        state[key] = b.getAttribute('data-v');
        apply();
      });
    });
  });

  if (inp) inp.addEventListener('input', function () {
    state.q = inp.value.trim().toLowerCase();
    apply();
  });

  function reset() {
    state = { q: '', sec: 'all', type: 'all', region: 'all', era: 'all', author: 'all' };
    if (inp) inp.value = '';
    document.querySelectorAll('.f-group .af-chip').forEach(function (x) {
      x.classList.toggle('on', x.getAttribute('data-v') === 'all');
    });
    apply();
  }
  var r1 = document.getElementById('arch-reset');
  var r2 = document.getElementById('arch-empty-reset');
  if (r1) r1.addEventListener('click', reset);
  if (r2) r2.addEventListener('click', reset);

  /* الترتيب الزمني — إعادة رصّ الصفوف بالتاريخ */
  document.querySelectorAll('.as-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.as-btn').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var dir = b.getAttribute('data-sort') === 'old' ? 1 : -1;
      rows.slice().sort(function (a, c) {
        var da = a.getAttribute('data-date'), dc = c.getAttribute('data-date');
        return da < dc ? -1 * dir : da > dc ? dir : 0;
      }).forEach(function (r) { wrap.appendChild(r); });
    });
  });

  /* معاملات الرابط: archive.html?q=... أو ?sec=doctrine إلخ */
  var p = new URLSearchParams(location.search);
  var any = false;
  ['q', 'sec', 'type', 'region', 'era', 'author'].forEach(function (k) {
    var v = p.get(k);
    if (!v) return;
    if (k === 'q') {
      state.q = v.trim().toLowerCase();
      if (inp) inp.value = v;
      any = true;
      return;
    }
    var g = document.querySelector('.f-group[data-g="' + k + '"]');
    var matched = false;
    if (g) g.querySelectorAll('.af-chip').forEach(function (x) {
      var on = x.getAttribute('data-v') === v;
      x.classList.toggle('on', on);
      if (on) matched = true;
    });
    if (matched) { state[k] = v; any = true; }
    else if (g) g.querySelectorAll('.af-chip').forEach(function (x) {
      x.classList.toggle('on', x.getAttribute('data-v') === 'all');
    });
  });
  if (any) apply();
})();

/* ============================================================
   لودر الانتقال بين الصفحات — علامة إيواد
   الستارة تنزل قبل المغادرة، وتنقشع بعد وصول الصفحة الجديدة
   ============================================================ */
(function () {
  var loader = document.getElementById('page-loader');
  if (!loader) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* الدخول: الستارة ظاهرة أثناء الرسم الأول ثم تنقشع */
  loader.classList.add('entering');
  function reveal() {
    loader.classList.remove('entering');
    loader.classList.add('done');
    /* تفريغ الحالة بعد انتهاء الانتقال حتى لا تعترض النقر */
    setTimeout(function () { loader.className = ''; }, 420);
  }
  if (document.readyState === 'complete') { requestAnimationFrame(reveal); }
  else { window.addEventListener('load', function () { setTimeout(reveal, 60); }); }

  /* الخروج: أي رابط داخلي عادي يمرّ بالستارة */
  document.addEventListener('click', function (e) {
    if (reduce) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest && e.target.closest('a');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    /* نفس الصفحة بأنكور فقط — لا ستارة */
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;

    e.preventDefault();
    loader.className = 'leaving';
    setTimeout(function () { location.href = a.href; }, 230);
  });

  /* الرجوع من كاش المتصفح: لا تترك الستارة عالقة */
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) loader.className = ''; });
})();

/* ============================================================
   لوحة المنصة: موجة تتبع المؤشر
   المربعات ترتفع وتضيء بقدر قربها من الماوس — تهدأ عند المغادرة
   ============================================================ */
(function () {
  var plate = document.querySelector('.hero-map svg');
  if (!plate) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cells = Array.prototype.slice.call(plate.querySelectorAll('.hm-c'));
  if (!cells.length) return;

  var RADIUS = 118;   /* نطاق تأثير الموجة بوحدات viewBox */
  var LIFT   = 9;     /* أقصى ارتفاع */

  /* مركز كل مربع مرة واحدة — لا قياس أثناء الحركة */
  var pts = cells.map(function (c) {
    return {
      el: c,
      cx: parseFloat(c.getAttribute('x')) + 13,
      cy: parseFloat(c.getAttribute('y')) + 13,
      on: false
    };
  });

  var vb = plate.viewBox.baseVal;
  var mx = -9999, my = -9999, raf = null, settling = false;

  function paint() {
    raf = null;
    var alive = false;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var dx = p.cx - mx, dy = p.cy - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < RADIUS) {
        var t = 1 - d / RADIUS;          /* 0..1 */
        var e = t * t;                    /* منحنى ألطف عند الحافة */
        p.el.style.transform = 'translateY(' + (-LIFT * e).toFixed(2) + 'px)';
        p.el.style.opacity = (0.82 + 0.18 * e).toFixed(3);
        p.on = true;
        alive = true;
      } else if (p.on) {
        p.el.style.transform = '';
        p.el.style.opacity = '';
        p.on = false;
      }
    }
    if (settling && !alive) settling = false;
  }
  function queue() { if (!raf) raf = requestAnimationFrame(paint); }

  plate.addEventListener('pointermove', function (e) {
    var r = plate.getBoundingClientRect();
    /* من بكسل الشاشة إلى إحداثيات viewBox */
    mx = (e.clientX - r.left) / r.width * vb.width;
    my = (e.clientY - r.top) / r.height * vb.height;
    queue();
  }, { passive: true });

  plate.addEventListener('pointerleave', function () {
    mx = -9999; my = -9999;
    settling = true;
    queue();
  });
})();
