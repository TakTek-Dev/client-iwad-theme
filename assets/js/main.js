/* ============================================================
   IWAD — Main JS v4.0
   تشغيلية: درج/بحث/هيدر · رصدية: أطلس/معجم/ترشيح/spy
   حركية: كوريغرافيا (الخريطة تُبنى → الخطوط تُخط → يُسجَّل)
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
     الطبقة الرصدية — تعمل مع أو بدون حركة
     ============================================================ */

  /* -- عين القسم: مربع التسمية يمتلئ عندما يكون القسم مرئياً -- */
  var spySections = document.querySelectorAll('.spy');
  if (spySections.length && 'IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('live', en.isIntersecting);
      });
    }, { rootMargin: '-20% 0px -55% 0px' });
    spySections.forEach(function (s) { spyIO.observe(s); });
  }

  /* -- الأطلس: الفحص يحدّث لوحة الملف -- */
  var zones = document.querySelectorAll('.zone');
  var apName = document.getElementById('ap-name');
  if (zones.length && apName) {
    var apCount = document.getElementById('ap-count');
    var apUpdated = document.getElementById('ap-updated');
    var apDesc = document.getElementById('ap-desc');
    function selectZone(z) {
      zones.forEach(function (o) { o.classList.remove('active'); });
      z.classList.add('active');
      apName.textContent = z.dataset.file;
      apCount.textContent = z.dataset.count;
      apUpdated.textContent = z.dataset.updated;
      apDesc.textContent = z.dataset.desc;
    }
    zones.forEach(function (z) {
      z.addEventListener('mouseenter', function () { selectZone(z); });
      z.addEventListener('click', function () { selectZone(z); });
    });
    var def = document.querySelector('.zone[data-file="سوريا وإسرائيل"]');
    if (def) def.classList.add('active');
  }

  /* -- المعجم: فحص عقدة يحدّث التعريف ويضيء وصلتها -- */
  var tnodes = document.querySelectorAll('.tnode');
  var ldTerm = document.getElementById('ld-term');
  if (tnodes.length && ldTerm) {
    var ldEn = document.getElementById('ld-en');
    var ldDef = document.getElementById('ld-def');
    var tlinks = document.querySelectorAll('.tlink');
    function selectTerm(n) {
      tnodes.forEach(function (o) { o.classList.remove('active'); });
      tlinks.forEach(function (l) { l.classList.remove('lit'); });
      n.classList.add('active');
      var link = document.querySelector('.tlink[data-t="' + n.dataset.t + '"]');
      if (link) link.classList.add('lit');
      ldTerm.textContent = n.dataset.term;
      ldEn.textContent = n.dataset.en;
      ldDef.textContent = n.dataset.def;
    }
    tnodes.forEach(function (n) {
      n.addEventListener('mouseenter', function () { selectTerm(n); });
      n.addEventListener('click', function () { selectTerm(n); });
    });
  }

  /* -- فهرس الإصدارات: ترشيح بالقسم -- */
  var chips = document.querySelectorAll('.pf-chip');
  var pubs = document.querySelectorAll('.pub');
  if (chips.length && pubs.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        var f = chip.dataset.filter;
        pubs.forEach(function (p) {
          p.classList.toggle('hide', f !== 'all' && p.dataset.sec !== f);
        });
      });
    });
  }

  /* ============================================================
     الطبقة الحركية
     بدونها: كل شيء ظاهر بقيمه النهائية
     ============================================================ */
  var riseEls = document.querySelectorAll('.rise');
  var unveilEls = document.querySelectorAll('.unveil');

  function settleAll() {
    riseEls.forEach(function (el) { el.classList.add('in'); });
    unveilEls.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.num[data-count]').forEach(function (el) {
      el.textContent = el.dataset.count || el.textContent;
    });
  }

  if (!hasGSAP || reducedMotion) { settleAll(); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* كشف rise/unveil عبر IO — الحركة نفسها CSS */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  riseEls.forEach(function (el) { io.observe(el); });
  unveilEls.forEach(function (el) { io.observe(el); });

  /* ============================================
     مشهد الافتتاح: الخريطة تُبنى ثم يُرصد
     ============================================ */
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  tl.from('[data-hero]', {
    opacity: 0,
    y: 22,
    duration: 0.6,
    stagger: 0.08
  });

  /* اليابسة تُبنى مربعاً مربعاً (موجة من المركز) */
  var land = gsap.utils.toArray('#hm-land rect');
  if (land.length) {
    tl.from(land, {
      opacity: 0,
      duration: 0.3,
      stagger: { each: 0.012, from: 'center' },
      ease: 'power1.out'
    }, '-=0.45');
  }

  /* الممرات تُخط */
  gsap.utils.toArray('.sea-route').forEach(function (p, i) {
    var len = p.getTotalLength();
    tl.fromTo(p,
      { strokeDasharray: len + ' ' + len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: function () {
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '';
        } },
      i === 0 ? '-=0.2' : '<0.15');
  });

  /* خطا الرصد يتقاطعان ثم نقطة الرصد تثبت */
  tl.from('.hm-cross-h', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .from('.hm-cross-v', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.45, ease: 'power2.out' }, '<0.08')
    .from('.hm-watch', { opacity: 0, scale: 0.4, transformOrigin: 'center', duration: 0.35, ease: 'back.out(2)' }, '-=0.15')
    .from('.hero-sub a', { opacity: 0, y: 10, duration: 0.4, stagger: 0.07 }, '-=0.2');

  /* -- مجرى التقديرات: الصفوف تتوالى -- */
  var stRows = gsap.utils.toArray('.st-row');
  if (stRows.length) {
    gsap.from(stRows, {
      opacity: 0,
      y: 10,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.stream', start: 'top 85%' }
    });
  }

  /* -- الأطلس: المناطق تُسجَّل والدبابيس تثبت -- */
  gsap.utils.toArray('.zone').forEach(function (z, i) {
    gsap.from(z, {
      opacity: 0,
      duration: 0.4,
      delay: i * 0.08,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.atlas-frame', start: 'top 80%' }
    });
  });

  /* -- المعجم: الوصلات تُخط -- */
  gsap.utils.toArray('.tlink').forEach(function (l) {
    var len = l.getTotalLength();
    gsap.fromTo(l,
      { strokeDasharray: len, strokeDashoffset: len },
      {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.lex-frame', start: 'top 82%' },
        onComplete: function () { l.style.strokeDasharray = 'none'; }
      });
  });

  /* -- لوحة المعركة: حركتا المناورة تُخطان -- */
  gsap.utils.toArray('.bt-move').forEach(function (p, i) {
    var len = p.getTotalLength();
    gsap.fromTo(p,
      { strokeDasharray: len + ' ' + len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.9, delay: i * 0.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.battle-frame', start: 'top 78%' },
        onComplete: function () {
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '';
        } });
  });

  /* -- شريط الحقب -- */
  gsap.utils.toArray('.era').forEach(function (era, i) {
    gsap.from(era, {
      opacity: 0,
      x: -18,
      duration: 0.45,
      delay: i * 0.06,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.era-strip', start: 'top 85%' }
    });
  });

  /* -- الفهرس: الصفوف تتوالى -- */
  var pubRows = gsap.utils.toArray('.pub');
  if (pubRows.length) {
    gsap.from(pubRows, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.pubs', start: 'top 85%' }
    });
  }

  /* -- أرقام المعهد تُسجَّل -- */
  gsap.utils.toArray('.figures .num').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    gsap.fromTo(el, { innerText: 0 }, {
      innerText: target,
      duration: 1.4,
      ease: 'power2.out',
      snap: { innerText: 1 },
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
})();
