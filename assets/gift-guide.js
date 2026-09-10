(function () {
  // ----- detect Shopify theme editor -----
  var isEditor = window.Shopify && window.Shopify.designMode;

  // ----- initialise all interactive behaviour -----
  function init(container) {
    var root = container || document;

    // ----- mobile interactions: menu drawer + product quick view -----
    // Only bind interactive handlers outside the theme editor
    if (!isEditor) {
      var mMenu = root.getElementById ? root.getElementById('mMenu') : root.querySelector('#mMenu');
      if (!mMenu) mMenu = document.getElementById('mMenu');

      var menuBtn = root.querySelector ? root.querySelector('#mobileView .m-menu') : document.querySelector('#mobileView .m-menu');
      if (menuBtn && mMenu) {
        menuBtn.addEventListener('click', function () { mMenu.classList.add('open'); });
        var menuClose = mMenu.querySelector('.m-close');
        if (menuClose) menuClose.addEventListener('click', function () { mMenu.classList.remove('open'); });
      }

      var mQv = document.getElementById('mQv');
      var mQvImg = document.getElementById('mQvImg');

      if (mQv && mQvImg) {
        var cards = document.querySelectorAll('#mobileView .m-card, #desktopView .card');
        cards.forEach(function (card) {
          card.addEventListener('click', function () {
            var photo = card.querySelector('img.photo');
            if (photo) mQvImg.src = photo.src;
            if (card.dataset.name) mQv.querySelector('.m-qv-name').textContent = card.dataset.name;
            if (card.dataset.price) mQv.querySelector('.m-qv-price').textContent = card.dataset.price;
            if (card.dataset.desc) mQv.querySelector('.m-qv-desc').textContent = card.dataset.desc;
            mQv.classList.add('open');
          });
        });

        var qvClose = mQv.querySelector('.m-close');
        if (qvClose) qvClose.addEventListener('click', function () { mQv.classList.remove('open'); });

        mQv.querySelectorAll('.m-qv-colors button').forEach(function (b) {
          b.addEventListener('click', function () {
            mQv.querySelectorAll('.m-qv-colors button').forEach(function (x) { x.style.boxShadow = 'inset 4px 0 0 #000'; });
            b.style.boxShadow = 'inset 6px 0 0 #000';
          });
        });

        var mSizeBtn = mQv.querySelector('.m-qv-size');
        var mSizes = document.getElementById('mQvSizes');
        if (mSizeBtn && mSizes) {
          mSizeBtn.addEventListener('click', function () { mSizes.classList.toggle('open'); });
          mSizes.querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () {
              mSizeBtn.querySelector('.txt').textContent = b.textContent;
              mSizes.classList.remove('open');
            });
          });
        }
      }
    }

    // ----- fit the 1440px desktop design into the viewport -----
    var stage = document.getElementById('stage');
    var wrap = document.getElementById('fitwrap');

    if (stage && wrap) {
      var forceView = new URLSearchParams(location.search).get('view');
      if (forceView === 'mobile') document.documentElement.classList.add('force-mobile');
      if (forceView === 'desktop') document.documentElement.classList.add('force-desktop');

      function fit() {
        if (forceView === 'mobile') return;
        if (!forceView && window.matchMedia('(max-width: 767.98px)').matches) return;

        // In the theme editor, skip transform scaling so click coordinates
        // are not distorted and inline editing works correctly
        if (isEditor) {
          stage.style.transform = 'none';
          stage.style.marginLeft = '0px';
          wrap.style.height = 'auto';
          return;
        }

        var vw = document.documentElement.clientWidth;
        var s = vw / 1440;
        stage.style.transform = 'scale(' + s + ')';
        stage.style.marginLeft = '0px';
        wrap.style.height = Math.ceil(stage.scrollHeight * s) + 'px';
      }

      window.addEventListener('resize', fit);
      window.addEventListener('load', fit);
      fit();
    }
  }

  // ----- run on initial page load -----
  init(document);

  // ----- re-initialise when the Shopify editor reloads a section -----
  document.addEventListener('shopify:section:load', function (event) {
    // Update the flag in case designMode changed
    isEditor = window.Shopify && window.Shopify.designMode;
    init(event.target);
  });
})();
