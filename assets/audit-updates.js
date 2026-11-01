(()=>{
 'use strict';
 const here=decodeURIComponent(location.pathname).replace(/\/index\.html$/,'/');
 for(const a of document.querySelectorAll('.nav .nav-link')){const url=new URL(a.href);if(url.pathname===location.pathname||url.pathname.replace(/\.html$/,'/')===here)a.setAttribute('aria-current','page');}
 const header=document.querySelector('.header-stack');if(header&&'ResizeObserver'in window)new ResizeObserver(()=>{document.documentElement.style.scrollPaddingTop=(header.offsetHeight+18)+'px';}).observe(header);
 const filterButtons=[...document.querySelectorAll('[data-gallery-filter]')],sections=[...document.querySelectorAll('[data-gallery-section]')];
 function galleryFilter(filter){for(const section of sections)section.hidden=filter!=='all'&&section.dataset.gallerySection!==filter;for(const b of filterButtons){const active=b.dataset.galleryFilter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}}
 for(const b of filterButtons)b.addEventListener('click',()=>galleryFilter(b.dataset.galleryFilter));if(location.hash==='#smiles'&&filterButtons.length)galleryFilter('smiles');
 const slides=[...document.querySelectorAll('[data-review-slide]')],carousel=document.querySelector('.reviews-carousel');let index=0,playing=!matchMedia('(prefers-reduced-motion:reduce)').matches,timer;
 const reviewDesktop=matchMedia('(min-width: 901px)');
 const pause=document.querySelector('.review-pause');function showReview(n){if(!slides.length)return;index=(n+slides.length)%slides.length;slides.forEach((s,i)=>{s.hidden=i!==index;});document.querySelector('.review-counter').textContent=`${index+1} / ${slides.length}`;}
 function schedule(){clearInterval(timer);if(playing&&!document.hidden)timer=setInterval(()=>showReview(index+1),6500);if(pause){pause.textContent=playing?'Pause':'Play';pause.setAttribute('aria-label',playing?'Pause automatic reviews':'Play automatic reviews');}}
 document.querySelector('.review-prev')?.addEventListener('click',()=>{showReview(index-1);schedule();});document.querySelector('.review-next')?.addEventListener('click',()=>{showReview(index+1);schedule();});pause?.addEventListener('click',()=>{playing=!playing;schedule();});carousel?.addEventListener('mouseenter',()=>clearInterval(timer));carousel?.addEventListener('mouseleave',schedule);carousel?.addEventListener('focusin',()=>clearInterval(timer));carousel?.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget))schedule();});document.addEventListener('visibilitychange',schedule);reviewDesktop.addEventListener('change',()=>showReview(index));if(slides.length){showReview(index);schedule();}
})();
