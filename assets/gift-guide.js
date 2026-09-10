/* Tisso Gift Guide — interactions.
 * Vanilla JS written for Shopify theme-editor safety:
 *  - strict IIFE, no globals leaked
 *  - all clicks handled via document-level delegation, so the editor's
 *    live section re-renders (HTML swapped without a page reload) never
 *    orphan the handlers
 *  - every lookup guarded, so templates without these elements (404,
 *    future pages) never throw
 *  - listens to Shopify's own section lifecycle event
 */
(function () {
  'use strict';

  /* delegate clicks for a selector; handler gets the matched element */
  function on(selector, handler) {
    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(selector) : null;
      if (el) handler(el, e);
    });
  }

  function $(sel) { return document.querySelector(sel); }

  var currentVariantId = null;

  /* ---------- menu drawer ---------- */
  on('#mobileView .m-menu', function () {
    var m = $('#mMenu'); if (m) m.classList.add('open');
  });
  on('#mMenu .m-close', function () {
    var m = $('#mMenu'); if (m) m.classList.remove('open');
  });

  /* ---------- product quick view (cards in both views) ---------- */
  on('#mobileView .m-card, #desktopView .card', function (card) {
    var qv = $('#mQv');
    if (!qv) return;
    var img = $('#mQvImg');
    var photo = card.querySelector('img.photo');
    if (photo && img) img.src = photo.src;
    if (card.dataset.name) { var n = qv.querySelector('.m-qv-name'); if (n) n.textContent = card.dataset.name; }
    if (card.dataset.price) { var p = qv.querySelector('.m-qv-price'); if (p) p.textContent = card.dataset.price; }
    if (card.dataset.desc) { var d = qv.querySelector('.m-qv-desc'); if (d) d.textContent = card.dataset.desc; }
    qv.classList.add('open');
  });
  on('#mQv .m-close', function () {
    var qv = $('#mQv'); if (qv) qv.classList.remove('open');
  });

  /* ---------- color swatches: chosen one gets black background ---------- */
  on('#mQv .m-qv-colors button', function (btn) {
    btn.parentNode.querySelectorAll('button').forEach(function (x) {
      x.classList.remove('sel');
    });
    btn.classList.add('sel');
  });

  /* ---------- click on the dark scrim closes the quick view ---------- */
  on('#mQv', function (el, e) {
    if (e.target === el) el.classList.remove('open');
  });

  /* ---------- size dropdown ---------- */
  on('#mQv .m-qv-size', function () {
    var s = $('#mQvSizes'); if (s) s.classList.toggle('open');
  });
  on('#mQvSizes button', function (btn) {
    var t = $('#mQv .m-qv-size .txt'); if (t) t.textContent = btn.textContent;
    var s = $('#mQvSizes'); if (s) s.classList.remove('open');
  });

  /* ---------- Shopify cart: remember variant, add, drawer ---------- */
  on('#mobileView .m-card, #desktopView .card', function (card) {
    currentVariantId = card.dataset.variantId || null;
  });

  var mCart = $('#mCart');

  function money(cents, currency) {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency', currency: currency || 'EUR'
      }).format(cents / 100);
    } catch (e) { return (cents / 100).toFixed(2); }
  }

  function cartJson() {
    return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); });
  }

  function setCount(n) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; });
  }

  function renderCart(cart) {
    var wrap = $('#mCartItems');
    var empty = $('#mCartEmpty');
    var total = $('#mCartTotal');
    var items = cart.items || [];
    if (wrap) {
      wrap.textContent = '';
      items.forEach(function (it) {
        var row = document.createElement('div'); row.className = 'm-cart-item';
        var img = document.createElement('img');
        img.src = it.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        img.alt = it.title || '';
        var mid = document.createElement('div'); mid.className = 'ci-t';
        mid.textContent = it.title || '';
        var q = document.createElement('span'); q.className = 'ci-q';
        q.textContent = 'Qty: ' + it.quantity;
        mid.appendChild(q);
        var p = document.createElement('div'); p.className = 'ci-p';
        p.textContent = money(it.final_line_price, cart.currency);
        row.appendChild(img); row.appendChild(mid); row.appendChild(p);
        wrap.appendChild(row);
      });
    }
    if (empty) empty.hidden = items.length > 0;
    if (total) total.textContent = money(cart.total_price, cart.currency);
    setCount(cart.item_count || 0);
  }

  function openCart() {
    if (!mCart) return;
    cartJson()
      .then(function (cart) { renderCart(cart); mCart.classList.add('open'); })
      .catch(function () { mCart.classList.add('open'); });
  }

  on('[data-cart-open]', openCart);
  on('[data-cart-close]', function () { if (mCart) mCart.classList.remove('open'); });
  on('#mCart', function (el, e) { if (e.target === el) el.classList.remove('open'); });

  /* ADD TO CART inside the quick view (not the checkout link, which shares the class) */
  on('#mQv .m-qv-cart', function () {
    if (!currentVariantId) return;
    fetch('/cart/add.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: currentVariantId, quantity: 1 }] })
    }).then(function (r) {
      if (!r.ok) throw new Error('add failed');
      var qv = $('#mQv'); if (qv) qv.classList.remove('open');
      openCart();
    }).catch(function () {});
  });

  setCount(0);
  cartJson().then(function (c) { setCount(c.item_count || 0); }).catch(function () {});
  document.addEventListener('shopify:section:load', function () {
    cartJson().then(function (c) { setCount(c.item_count || 0); }).catch(function () {});
  });

  /* ---------- fit the 1440px desktop stage into the viewport ---------- */
  var stage = $('#stage');
  var wrap = $('#fitwrap');
  var forceView = new URLSearchParams(location.search).get('view');
  if (forceView === 'mobile') document.documentElement.classList.add('force-mobile');
  if (forceView === 'desktop') document.documentElement.classList.add('force-desktop');

  function fit() {
    if (!stage || !wrap) return;               /* template without the stage */
    if (forceView === 'mobile') return;        /* forced mobile view is fluid */
    if (!forceView && window.matchMedia('(max-width: 767.98px)').matches) return;
    var s = document.documentElement.clientWidth / 1440;
    stage.style.transform = 'scale(' + s + ')';
    stage.style.marginLeft = '0px';
    wrap.style.height = Math.ceil(stage.scrollHeight * s) + 'px';
  }

  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  /* fired by the theme editor after it swaps in fresh section HTML */
  document.addEventListener('shopify:section:load', fit);
  fit();
})();
