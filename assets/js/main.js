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
  var heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  heroTl.from('[data-hero]', { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 });

  var land = gsap.utils.toArray('#hm-land rect');
  if (land.length) {
    heroTl.from(land, {
      opacity: 0, duration: 0.3,
      stagger: { each: 0.012, from: 'center' }, ease: 'power1.out'
    }, '-=0.45');
  }
  gsap.utils.toArray('.sea-route').forEach(function (p, i) {
    var len = p.getTotalLength();
    heroTl.fromTo(p,
      { strokeDasharray: len + ' ' + len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: function () { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } },
      i === 0 ? '-=0.2' : '<0.15');
  });
  heroTl.from('.hm-cross-h', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: M.easeDraw }, '-=0.3')
    .from('.hm-cross-v', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.45, ease: M.easeDraw }, '<0.08')
    .from('.hm-watch', { opacity: 0, scale: 0.4, transformOrigin: 'center', duration: M.pop, ease: M.easePop }, '-=0.15')
    .from('.hero-sub a', { opacity: 0, y: 10, duration: 0.4, stagger: 0.07 }, '-=0.2');

  /* ============ بوابة الأقسام: الخلايا تُسجَّل والعلامات تُرصَد ============ */
  sect('.gateway', function (tl) {
    var cells = gsap.utils.toArray('.gw-cell');
    tl.from(cells, { opacity: 0, y: 14, duration: M.unit, stagger: M.stag })
      .from('.gw-cell .mark', {
        scale: 0.3, transformOrigin: 'center', duration: M.pop, ease: M.easePop, stagger: M.stag
      }, '-=0.35');
  });

  /* ============ المجرى: القيود تتوالى ============ */
  sect('.stream-grid', function (tl) {
    tl.from(gsap.utils.toArray('.st-row'), { opacity: 0, y: 10, duration: 0.35, stagger: 0.05 });
  });

  /* ============ الإصدارات المميزة: اللوحة تنكشف ثم النص يُسجَّل ============ */
  sect('.feats', function (tl) {
    gsap.utils.toArray('.feat').forEach(function (feat, i) {
      var bits = feat.querySelectorAll('h3, .exc, .m');
      tl.from(bits, { opacity: 0, y: 12, duration: M.unit, stagger: 0.07 }, i * 0.12);
    });
  });

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
  sect('.pubs', function (tl) {
    tl.from(gsap.utils.toArray('.pub'), { opacity: 0, y: 8, duration: 0.3, stagger: 0.04 });
  });

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
  sect('.people-grid', function (tl) {
    tl.from(gsap.utils.toArray('.p-cell'), { opacity: 0, y: 12, duration: M.unit, stagger: 0.08 }, 0.1);
  });

  /* ============ الفعاليات: التواريخ تُرصَد ثم المتن ============ */
  sect('.events-grid', function (tl) {
    var evs = gsap.utils.toArray('.ev');
    tl.from(evs, { opacity: 0, y: 14, duration: M.unit, stagger: 0.09 })
      .from(gsap.utils.toArray('.ev-date'), {
        scale: 0.7, transformOrigin: 'center', duration: M.pop, ease: M.easePop, stagger: 0.09
      }, '-=0.4');
  });

  /* ============ المداخل: البنك يترصّ سريعاً ============ */
  sect('.topics', function (tl) {
    tl.from(gsap.utils.toArray('.topic'), { opacity: 0, y: 8, duration: 0.28, stagger: 0.03 });
  });

  /* ============ التغذية ============ */
  sect('.feed-grid', function (tl) {
    tl.from(gsap.utils.toArray('.fpost, .ffollow'), { opacity: 0, y: 12, duration: M.unit, stagger: 0.1 });
  });

  /* ============ قاعة المعهد: البيان يُكشف (CSS) والأرقام تتوالى ============ */
  sect('.inst', function (tl) {
    tl.from(gsap.utils.toArray('.figures .fig'), { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, 0.25)
      .from('.pillars-line', { opacity: 0, duration: 0.4 }, '-=0.2');
  }, true);

  /* ============ النشرة: تسليح فقط — الأقواس CSS ============ */
  sect('.nl-plate', function () {});

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
