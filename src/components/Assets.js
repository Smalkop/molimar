export const ANIMATIONS_CSS = `
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
.animate-fade-left {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.animate-fade-left.visible {
  opacity: 1;
  transform: translateX(0);
}
.animate-fade-right {
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.animate-fade-right.visible {
  opacity: 1;
  transform: translateX(0);
}
.animate-scale-in {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.animate-scale-in.visible {
  opacity: 1;
  transform: scale(1);
}
.hero-title {
  animation: fadeInUp 0.8s ease-out forwards;
}
.hero-subtitle {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
}
.hero-cta {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.4s forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-zoom {
  animation: heroZoom 20s ease-in-out infinite alternate;
}
@keyframes heroZoom {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
.stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.stagger-children.visible > * {
  opacity: 1;
  transform: translateY(0);
}
.stagger-children.visible > *:nth-child(1) { transition-delay: 0s; }
.stagger-children.visible > *:nth-child(2) { transition-delay: 0.1s; }
.stagger-children.visible > *:nth-child(3) { transition-delay: 0.2s; }
.stagger-children.visible > *:nth-child(4) { transition-delay: 0.3s; }
.stagger-children.visible > *:nth-child(5) { transition-delay: 0.4s; }
.stagger-children.visible > *:nth-child(6) { transition-delay: 0.5s; }
.card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
.card-hover:hover .card-image { transform: scale(1.05); }
.card-image { transition: transform 0.4s ease; }
.btn-primary { transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
.btn-primary:active { transform: translateY(0); }
.whatsapp-pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
  50% { box-shadow: 0 0 0 12px rgba(37,211,102,0); }
}
.link-underline { position: relative; text-decoration: none; }
.link-underline::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 0; height: 2px; background: currentColor; transition: width 0.3s ease;
}
.link-underline:hover::after { width: 100%; }
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;
}
.form-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.form-input:focus { border-color: #0000ba; box-shadow: 0 0 0 3px rgba(0,0,186,0.1); }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.shake { animation: shake 0.4s ease-in-out; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 0.6s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .hero-zoom { animation: none !important; }
}
`;

export const ANIMATIONS_JS = `
(function(){
  function observeElements(selector,opts){
    var cfg=Object.assign({threshold:0.15,rootMargin:'0px 0px -50px 0px',stagger:0,className:'visible'},opts||{});
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry,i){
        if(entry.isIntersecting){
          setTimeout(function(){entry.target.classList.add(cfg.className)},i*(cfg.stagger||0));
          obs.unobserve(entry.target);
        }
      });
    },{threshold:cfg.threshold,rootMargin:cfg.rootMargin});
    document.querySelectorAll(selector).forEach(function(el){obs.observe(el)});
  }

  function initHeaderScroll(){
    var header=document.querySelector('header');
    if(!header)return;
    var ticking=false;
    window.addEventListener('scroll',function(){
      if(!ticking){
        window.requestAnimationFrame(function(){
          header.classList.toggle('header-scrolled',window.scrollY>50);
          ticking=false;
        });
        ticking=true;
      }
    });
  }

  function initSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var t=document.querySelector(this.getAttribute('href'));
        if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
      });
    });
  }

  function initMenuToggle(){
    var btn=document.getElementById('menu-toggle'),menu=document.getElementById('mobile-menu'),overlay=document.getElementById('menu-overlay');
    if(!btn||!menu)return;
    function toggle(open){
      menu.classList.toggle('hidden',!open);
      menu.classList.toggle('flex',open);
      document.body.classList.toggle('overflow-hidden',open);
      if(overlay)overlay.classList.toggle('hidden',!open);
    }
    btn.addEventListener('click',function(){toggle(menu.classList.contains('hidden'))});
    if(overlay)overlay.addEventListener('click',function(){toggle(false)});
    menu.querySelectorAll('a').forEach(function(l){l.addEventListener('click',function(){toggle(false)})});
  }

  function initLightbox(){
    document.querySelectorAll('[data-lightbox]').forEach(function(img){
      img.addEventListener('click',function(){
        var src=this.dataset.lightbox||this.src,alt=this.alt||'';
        var existing=document.getElementById('lightbox');
        if(existing)existing.remove();
        var lb=document.createElement('div');
        lb.id='lightbox';
        lb.className='fixed inset-0 z-50 flex items-center justify-center bg-black/80';
        lb.innerHTML='<button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10" onclick="this.parentElement.remove()">&times;</button><img src="'+src+'" alt="'+alt+'" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg">';
        lb.addEventListener('click',function(e){if(e.target===lb)lb.remove()});
        document.body.appendChild(lb);
      });
    });
  }

  function initCounterAnimation(){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var el=entry.target,target=parseInt(el.dataset.target,10);
          if(isNaN(target))return;
          var duration=1500,steps=30,increment=target/steps,current=0,stepTime=duration/steps;
          (function update(){current+=increment;if(current>=target){el.textContent=target;return}el.textContent=Math.round(current);setTimeout(update,stepTime)})();
          obs.unobserve(el);
        }
      });
    },{threshold:0.5});
    document.querySelectorAll('.animate-counter').forEach(function(el){obs.observe(el)});
  }

  function init(){
    observeElements('.animate-on-scroll',{stagger:100});
    observeElements('.animate-fade-left',{stagger:100});
    observeElements('.animate-fade-right',{stagger:100});
    observeElements('.animate-scale-in',{stagger:100});
    observeElements('.stagger-children',{stagger:80});
    initHeaderScroll();
    initSmoothScroll();
    initCounterAnimation();
    initMenuToggle();
    initLightbox();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
`;
