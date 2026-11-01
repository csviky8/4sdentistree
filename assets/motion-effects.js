(() => {
 'use strict';
 if(document.body.classList.contains('elementor-editor-active'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const counters=new Map(),active=new Map();let counterFrame=0;
 function restore(el,state){el.replaceChildren(...state.original.childNodes);active.delete(el);}
 function finishCounters(){if(counterFrame)cancelAnimationFrame(counterFrame);counterFrame=0;for(const [el,state] of [...active])restore(el,state);}
 function animateCounters(time){counterFrame=0;for(const [el,state] of [...active]){const progress=Math.min(1,(time-state.start)/1500),eased=1-Math.pow(1-progress,3);if(progress>=1){restore(el,state);continue;}state.visual.textContent=(state.value*eased).toFixed(state.decimals)+state.suffix;}if(active.size)counterFrame=requestAnimationFrame(animateCounters);}
 function startCounter(el){const info=counters.get(el);if(!info||info.played||reduced.matches)return;info.played=true;const original=document.createElement('span');original.className='sr-only';original.append(...el.childNodes);const visual=document.createElement('span');visual.className='den-counter-visual';visual.setAttribute('aria-hidden','true');visual.textContent='0'+info.suffix;el.append(original,visual);active.set(el,{...info,original,visual,start:performance.now()});if(!counterFrame)counterFrame=requestAnimationFrame(animateCounters);}
 // Animate activity statistics only. Google ratings and review totals stay accurate and static.
 for(const stat of document.querySelectorAll('.banner-stat')){const el=stat.querySelector('strong');if(!el||/google|rating|review/i.test(stat.textContent))continue;const match=el.textContent.trim().match(/^(\d+(?:\.\d+)?)(k\+|\+|k)?$/i);if(match)counters.set(el,{value:Number(match[1]),decimals:(match[1].split('.')[1]||'').length,suffix:match[2]||'',played:false});}
 const headings=[...document.querySelectorAll('main#main h1,main#main h2')].filter(el=>!el.closest('.lightbox,.reviews-carousel'));
 const cards=[...document.querySelectorAll('main#main .card,main#main .team-card,main#main .video-card')].filter(el=>!el.parentElement.closest('.card,.team-card,.video-card'));
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);if(counters.has(el)){startCounter(el);continue;}if(!reduced.matches)el.classList.add('den-in-view');}},{threshold:.12});if(!reduced.matches){headings.forEach(el=>{el.classList.add('den-text-reveal');observer.observe(el);});cards.forEach((el,index)=>{el.classList.add('den-card-reveal');el.style.setProperty('--den-stagger',((index%3)*75)+'ms');observer.observe(el);});for(const el of counters.keys())observer.observe(el);}}
 const progress=document.createElement('div');progress.className='den-scroll-progress';progress.setAttribute('aria-hidden','true');progress.append(document.createElement('span'));document.body.append(progress);let scrollFrame=0;
 function showProgress(){scrollFrame=0;const distance=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--den-progress',String(distance>0?Math.min(1,Math.max(0,scrollY/distance)):0));}
 function scrollUpdate(){if(!reduced.matches&&!scrollFrame)scrollFrame=requestAnimationFrame(showProgress);}
 if('ResizeObserver'in window)new ResizeObserver(scrollUpdate).observe(document.body);
 window.addEventListener('scroll',scrollUpdate,{passive:true});window.addEventListener('resize',scrollUpdate,{passive:true});window.addEventListener('load',scrollUpdate,{once:true});showProgress();
 reduced.addEventListener('change',()=>{if(reduced.matches){finishCounters();if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=0;}else showProgress();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishCounters();});
})();