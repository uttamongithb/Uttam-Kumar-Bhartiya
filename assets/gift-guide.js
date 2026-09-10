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
