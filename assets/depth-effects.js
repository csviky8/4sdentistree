(() => {
  'use strict';
  if(document.body.classList.contains('elementor-editor-active'))return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(hover: hover) and (pointer: fine)');
  const selector='.card,.team-card,.gallery-item,.video-card,.article-aside,.hero-media,.split-media.image-frame';
  const elements=[...document.querySelectorAll(selector)].filter(el=>!el.parentElement.closest(selector));
  let current=null,frame=0,x=0,y=0;
  function clear(){if(frame)cancelAnimationFrame(frame);frame=0;if(current){current.style.removeProperty('--den-rx');current.style.removeProperty('--den-ry');current.classList.remove('den-depth-active');current=null;}}
  function render(){frame=0;if(!current)return;const box=current.getBoundingClientRect();if(!box.width||!box.height)return;const nx=Math.max(-.5,Math.min(.5,(x-box.left)/box.width-.5)),ny=Math.max(-.5,Math.min(.5,(y-box.top)/box.height-.5));const max=current.classList.contains('hero-media')?4:6;current.style.setProperty('--den-rx',(-ny*max).toFixed(2)+'deg');current.style.setProperty('--den-ry',(nx*max).toFixed(2)+'deg');}
  for(const el of elements){el.classList.add('den-depth-ready');el.addEventListener('pointermove',event=>{if(motion.matches||!pointer.matches||event.pointerType==='touch')return;if(current!==el){clear();current=el;el.classList.add('den-depth-active');}x=event.clientX;y=event.clientY;if(!frame)frame=requestAnimationFrame(render);},{passive:true});el.addEventListener('pointerleave',clear);el.addEventListener('pointercancel',clear);}
  motion.addEventListener('change',clear);pointer.addEventListener('change',clear);window.addEventListener('blur',clear);window.addEventListener('scroll',clear,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();