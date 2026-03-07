(function() {
  var LANG_KEY = 'nam-lang';
  var currentLang = localStorage.getItem(LANG_KEY) || 'en';
  var translations = {};
  var originals = {};

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      // Store original English content on first run
      if (!originals[key]) {
        originals[key] = el.innerHTML;
      }
      var val = key.split('.').reduce(function(o, k) { return o && o[k]; }, translations);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else if (el.hasAttribute('data-i18n-attr')) {
          el.setAttribute(el.getAttribute('data-i18n-attr'), val);
        } else {
          el.innerHTML = val;
        }
      }
    });
    document.documentElement.lang = currentLang;
  }

  function restoreEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (originals[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = originals[key];
        } else {
          el.innerHTML = originals[key];
        }
      }
    });
    document.documentElement.lang = 'en';
  }

  function updateToggleUI() {
    document.querySelectorAll('.lang-opt').forEach(function(opt) {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
    });
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    if (lang === 'en') {
      restoreEnglish();
      updateToggleUI();
      return;
    }
    // Determine the base path for i18n files
    var script = document.querySelector('script[src*="i18n.js"]');
    var basePath = '/i18n/';
    if (script) {
      var src = script.getAttribute('src');
      basePath = src.replace('i18n.js', '');
    }
    fetch(basePath + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        translations = data;
        applyTranslations();
        updateToggleUI();
      })
      .catch(function(err) {
        console.warn('NāM i18n: could not load ' + lang + '.json', err);
      });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    // Bind toggle clicks
    document.querySelectorAll('.lang-opt').forEach(function(opt) {
      opt.addEventListener('click', function() {
        setLang(this.getAttribute('data-lang'));
      });
    });

    // Load saved language
    if (currentLang !== 'en') {
      setLang(currentLang);
    } else {
      updateToggleUI();
    }
  });

  window.NamI18n = { setLang: setLang, getLang: function() { return currentLang; } };
})();
