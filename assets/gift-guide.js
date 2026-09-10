// ----- marquee content builders -----
  // ----- mobile interactions: menu drawer + product quick view -----
  var mMenu = document.getElementById('mMenu');
  document.querySelector('#mobileView .m-menu').addEventListener('click', function () { mMenu.classList.add('open'); });
  mMenu.querySelector('.m-close').addEventListener('click', function () { mMenu.classList.remove('open'); });

  var mQv = document.getElementById('mQv');
  var mQvImg = document.getElementById('mQvImg');
  document.querySelectorAll('#mobileView .m-card, #desktopView .card').forEach(function (card) {
    card.addEventListener('click', function () {
      var photo = card.querySelector('img.photo');
      if (photo) mQvImg.src = photo.src;
      if (card.dataset.name) mQv.querySelector('.m-qv-name').textContent = card.dataset.name;
      if (card.dataset.price) mQv.querySelector('.m-qv-price').textContent = card.dataset.price;
      if (card.dataset.desc) mQv.querySelector('.m-qv-desc').textContent = card.dataset.desc;
      mQv.classList.add('open');
    });
  });
  mQv.querySelector('.m-close').addEventListener('click', function () { mQv.classList.remove('open'); });
  mQv.querySelectorAll('.m-qv-colors button').forEach(function (b) {
    b.addEventListener('click', function () {
      mQv.querySelectorAll('.m-qv-colors button').forEach(function (x) { x.style.boxShadow = 'inset 4px 0 0 #000'; });
      b.style.boxShadow = 'inset 6px 0 0 #000';
    });
  });

  var mSizeBtn = mQv.querySelector('.m-qv-size');
  var mSizes = document.getElementById('mQvSizes');
  mSizeBtn.addEventListener('click', function () { mSizes.classList.toggle('open'); });
  mSizes.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      mSizeBtn.querySelector('.txt').textContent = b.textContent;
      mSizes.classList.remove('open');
    });
  });

  // ----- fit the 1440px desktop design into the viewport -----
  var stage = document.getElementById('stage');
  var wrap = document.getElementById('fitwrap');
  var forceView = new URLSearchParams(location.search).get('view');
  if (forceView === 'mobile') document.documentElement.classList.add('force-mobile');
  if (forceView === 'desktop') document.documentElement.classList.add('force-desktop');
  function fit() {
    if (forceView === 'mobile') return; // forced mobile view is fluid
    if (!forceView && window.matchMedia('(max-width: 767.98px)').matches) return; // mobile view is fluid
    var vw = document.documentElement.clientWidth;
    var s = vw / 1440; // fill the full viewport width (scale up or down, no side margins)
    stage.style.transform = 'scale(' + s + ')';
    stage.style.marginLeft = '0px';
    wrap.style.height = Math.ceil(stage.scrollHeight * s) + 'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  fit();
