/* ========================================
   Chrysa Dore Language Switcher
   ======================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'chrysadore-lang';
  var DEFAULT_LANG = 'vi';
  var LANGS = [
    { code: 'vi', label: 'Ti\u1EBFng Vi\u1EC7t' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '\u4E2D\u6587' }
  ];

  /* --- Helpers --- */

  function getCurrentLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'vi' || stored === 'en' || stored === 'zh')) {
      return stored;
    }
    return DEFAULT_LANG;
  }

  function saveLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  /* --- Translation --- */

  function applyLang(lang) {
    var els = document.querySelectorAll('[data-vi], [data-en], [data-zh]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var val = el.getAttribute('data-' + lang);
      if (val !== null && val !== '') {
        /* For inputs with placeholder */
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.innerHTML = val;
        }
      }
    }
    /* Update html lang attribute */
    document.documentElement.lang = lang;
  }

  /* --- Widget UI --- */

  function createWidget() {
    var currentLang = getCurrentLang();

    /* Container */
    var widget = document.createElement('div');
    widget.className = 'lang-widget';

    /* Button */
    var btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.setAttribute('aria-label', 'Change language');
    btn.textContent = currentLang.toUpperCase();

    /* Dropdown */
    var dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';

    for (var i = 0; i < LANGS.length; i++) {
      var opt = document.createElement('button');
      opt.className = 'lang-option';
      if (LANGS[i].code === currentLang) {
        opt.classList.add('active');
      }
      opt.setAttribute('data-lang-code', LANGS[i].code);

      var codeSpan = document.createElement('span');
      codeSpan.className = 'lang-option-code';
      codeSpan.textContent = LANGS[i].code.toUpperCase();

      opt.appendChild(codeSpan);
      opt.appendChild(document.createTextNode(LANGS[i].label));

      dropdown.appendChild(opt);
    }

    widget.appendChild(dropdown);
    widget.appendChild(btn);
    document.body.appendChild(widget);

    /* Events */
    var isOpen = false;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen = !isOpen;
      dropdown.classList.toggle('open', isOpen);
    });

    dropdown.addEventListener('click', function (e) {
      var target = e.target.closest('.lang-option');
      if (!target) return;
      var lang = target.getAttribute('data-lang-code');
      if (!lang) return;

      /* Update active state */
      var opts = dropdown.querySelectorAll('.lang-option');
      for (var j = 0; j < opts.length; j++) {
        opts[j].classList.remove('active');
      }
      target.classList.add('active');

      /* Apply */
      saveLang(lang);
      applyLang(lang);
      btn.textContent = lang.toUpperCase();

      /* Close dropdown */
      isOpen = false;
      dropdown.classList.remove('open');
    });

    /* Close on outside click */
    document.addEventListener('click', function () {
      if (isOpen) {
        isOpen = false;
        dropdown.classList.remove('open');
      }
    });

    widget.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  /* --- Init --- */

  function init() {
    createWidget();
    var lang = getCurrentLang();
    if (lang !== DEFAULT_LANG) {
      applyLang(lang);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
