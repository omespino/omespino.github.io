(function () {
  var SUN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'light' ? MOON_SVG : SUN_SVG;
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  function initThemeToggle() {
    var menu = document.querySelector('.main-navigation .menu');
    if (!menu) return;

    var li = document.createElement('li');
    li.className = 'menu-item theme-toggle-item';
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    li.appendChild(btn);
    menu.insertBefore(li, menu.firstChild);

    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    var theme = saved || 'dark';
    applyTheme(theme);

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function detectLanguage(source) {
    var text = source.trim();
    if (/^<\?php|&lt;\?php/.test(text)) return "php";
    if (/^<\?xml|<\/?[a-z][\s\S]*>/i.test(text)) return "markup";
    if (/^#!.*\bpython\b|^\s*(import|from|def|class)\s/m.test(text)) return "python";
    if (/\b(var|let|const|function|require|document\.|console\.)\b/.test(text)) return "javascript";
    if (/^#!.*\b(bash|sh)\b|(^|\n)\s*#|\$ |# |adb |curl |grep |python |openssl |steghide |base64 /m.test(text)) return "bash";
    return "text";
  }

  function restorePlaceholders(value, placeholders) {
    return value.replace(/\u0000(\d+)\u0000/g, function (_, index) {
      return placeholders[Number(index)];
    });
  }

  function stash(value, pattern, className, placeholders) {
    return value.replace(pattern, function (match) {
      var token = '<span class="code-' + className + '">' + match + "</span>";
      placeholders.push(token);
      return "\u0000" + (placeholders.length - 1) + "\u0000";
    });
  }

  function highlightMarkup(source) {
    var placeholders = [];
    var html = escapeHtml(source);
    html = stash(html, /&lt;!--[\s\S]*?--&gt;/g, "comment", placeholders);
    html = stash(html, /"[^"]*"|'[^']*'/g, "string", placeholders);
    html = html.replace(/\s([\w:-]+)=/g, ' <span class="code-attr">$1</span>=');
    html = html.replace(/(&lt;\/?)([\w:-]+)/g, '$1<span class="code-tag">$2</span>');
    return restorePlaceholders(html, placeholders);
  }

  function highlightShell(source) {
    var placeholders = [];
    var html = escapeHtml(source);
    html = stash(html, /"[^"]*"|'[^']*'|`[^`]*`/g, "string", placeholders);
    html = stash(html, /(^|\s)#.*$/gm, "comment", placeholders);
    html = html.replace(/\b(adb|apktool|base64|cat|chmod|curl|echo|file|grep|head|nc|openssl|python|sudo|su|wget|steghide)\b/g, '<span class="code-command">$1</span>');
    html = html.replace(/(\s|^)(-[A-Za-z0-9-]+)/g, '$1<span class="code-flag">$2</span>');
    html = html.replace(/(\$[A-Za-z_][A-Za-z0-9_]*)/g, '<span class="code-var">$1</span>');
    return restorePlaceholders(html, placeholders);
  }

  function highlightCode(source) {
    var placeholders = [];
    var html = escapeHtml(source);
    html = stash(html, /\/\*[\s\S]*?\*\/|\/\/.*$|#.*$/gm, "comment", placeholders);
    html = stash(html, /"[^"]*"|'[^']*'|`[^`]*`/g, "string", placeholders);
    html = html.replace(/\b(var|let|const|function|return|if|else|for|while|require|import|from|def|class|try|catch|new|exec|echo|include)\b/g, '<span class="code-keyword">$1</span>');
    html = html.replace(/\b(true|false|null|None)\b/g, '<span class="code-literal">$1</span>');
    return restorePlaceholders(html, placeholders);
  }

  function movePageHero() {
    var body = document.body;
    if (!body.classList.contains("research-page") && !body.classList.contains("single")) return;

    var page = document.getElementById("page");
    var content = document.getElementById("content");
    var main = document.getElementById("main");
    var hero = null;

    if (main) {
      Array.prototype.some.call(main.children, function (child) {
        if (child.classList && child.classList.contains("hero-title")) {
          hero = child;
          return true;
        }
        return false;
      });
    }

    if (!page || !content || !main || !hero) return;

    var heroWrap = page.querySelector(".page-hero");
    if (!heroWrap) {
      heroWrap = document.createElement("div");
      heroWrap.className = "page-hero";
      page.insertBefore(heroWrap, content);
    }

    heroWrap.appendChild(hero);

    if (body.classList.contains("single")) {
      var entryHeader = main.querySelector("article > .entry-header");
      if (entryHeader) {
        var existingPostHero = heroWrap.querySelector(".post-hero");
        var postHero = existingPostHero || document.createElement("div");
        if (!existingPostHero) {
          postHero.className = "post-hero";
          heroWrap.appendChild(postHero);
        }
        postHero.appendChild(entryHeader);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    movePageHero();

    document.querySelectorAll("pre.code-block > code, pre > code").forEach(function (block) {
      if (block.dataset.highlighted === "true") return;

      var source = block.textContent;
      var language = detectLanguage(source);

      if (language === "markup") {
        block.innerHTML = highlightMarkup(source);
      } else if (language === "bash") {
        block.innerHTML = highlightShell(source);
      } else if (language === "javascript" || language === "python" || language === "php") {
        block.innerHTML = highlightCode(source);
      } else {
        block.innerHTML = escapeHtml(source);
      }

      block.dataset.language = language;
      block.dataset.highlighted = "true";
    });
  });
}());
