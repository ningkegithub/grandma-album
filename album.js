'use strict';
// Cards and the viewer always use the same stable chronological collection.
const dateKey = p => { const m=p.when.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/); return m?Number(m[1])*10000+Number(m[2])*100+Number(m[3]):Infinity; };
const photos=PHOTOS.map((p,order)=>({...p,order})).sort((a,b)=>dateKey(a)-dateKey(b)||a.order-b.order);
const $=id=>document.getElementById(id);
const viewer=$('viewer'), image=$('vimg'), audio=$('bgm'), saveViewer=$('saveViewer');
let current=0,rendered=false,returnFocus=null,imageRequest=0,returnScroll=0;
const yearSections=[],yearFirstPhoto=new Map();
const photoYear=p=>(p.when.match(/^\d{4}/)||['日期待确认'])[0];
// A touch or mouse interaction must not leave a keyboard focus ring behind.
document.addEventListener('keydown',()=>{document.documentElement.dataset.input='keyboard';});
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.input='pointer';},{passive:true});
document.addEventListener('touchstart',()=>{document.documentElement.dataset.input='pointer';},{passive:true});
function textEl(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
function renderAlbum(){
  if(rendered)return;rendered=true;const fragment=document.createDocumentFragment();let grid,previousYear;
  photos.forEach((p,index)=>{
    const match=p.when.match(/^\d{4}/),year=match?match[0]:'日期待确认';
    if(year!==previousYear){previousYear=year;const section=document.createElement('section');section.className='year';section.id='year-'+year;yearSections.push(section);yearFirstPhoto.set(year,index);
      const heading=textEl('h2','');heading.tabIndex=-1;heading.append(textEl('span',year));section.append(heading);grid=document.createElement('div');grid.className='grid';section.append(grid);fragment.append(section);
      const option=textEl('option',year==='日期待确认'?year:year+'年');option.value=year;$('yearSelect').append(option);const viewerOption=textEl('option',option.textContent);viewerOption.value=year;$('viewerYearSelect').append(viewerOption);
    }
    const card=document.createElement('button');card.type='button';card.className='card';card.dataset.src=p.src;
    const thumb=document.createElement('img');thumb.src=p.thumb;thumb.alt='';thumb.loading='lazy';thumb.decoding='async';thumb.width=450;thumb.height=450;
    thumb.addEventListener('error',()=>{thumb.hidden=true;card.prepend(textEl('span','小图暂时没显示，点这里看看大图','thumb-error'));},{once:true});
    const copy=textEl('span','','card-copy');copy.append(textEl('span',p.when,'card-date'),textEl('span',p.title,'card-title'));card.append(thumb,copy);card.addEventListener('click',()=>openPhoto(index,card));grid.append(card);
  });$('timeline').append(fragment);
}
function startAlbum(focus=true){renderAlbum();$('cover').hidden=true;$('album').hidden=false;if(focus){window.scrollTo(0,0);$('yearSelect').focus();}syncVisibleYear();}
function showPhoto(index){
  current=Math.max(0,Math.min(photos.length-1,index));const p=photos[current];
  $('viewerYearSelect').value=photoYear(p);$('vwhen').textContent=p.when;$('vtitle').textContent=p.title;$('vdesc').textContent=p.desc;$('vcount').textContent=`${current+1} / ${photos.length}`;
  $('vprev').disabled=current===0;$('vnext').disabled=current===photos.length-1;resetImageTransform();viewer.classList.remove('hideui');requestAnimationFrame(()=>{viewer.style.setProperty('--caption-height',$('vbar').getBoundingClientRect().height+'px');});
  loadImage(p);
}
function loadImage(p){
  const request=++imageRequest;image.hidden=true;$('imageFeedback').hidden=false;$('imageStatus').textContent='照片正在加载…';$('retryImage').hidden=true;image.alt=p.title+'。'+p.desc;
  const loader=new Image();loader.onload=()=>{if(request!==imageRequest)return;image.src=p.src;image.hidden=false;$('imageFeedback').hidden=true;};loader.onerror=()=>{if(request!==imageRequest)return;$('imageStatus').textContent='照片暂时没加载出来，请检查网络后重试。';$('retryImage').hidden=false;};loader.src=p.src;
}
function openPhoto(index,source){returnFocus=source||document.querySelector(`.card[data-src="${photos[index].src}"]`);if(!source&&returnFocus)returnFocus.scrollIntoView({block:'center'});returnScroll=window.scrollY;showPhoto(index);if(!viewer.open){viewer.showModal();document.body.style.overflow='hidden';}$('vclose').focus();}
$('startBtn').addEventListener('click',()=>startAlbum());
function syncVisibleYear(){
  if(!rendered||$('album').hidden||viewer.open)return;
  const edge=$('yearToolbar').getBoundingClientRect().bottom+20;let visible=yearSections[0];
  for(const section of yearSections){if(section.getBoundingClientRect().top<=edge)visible=section;else break;}
  if(visible)$('yearSelect').value=visible.id.slice(5);
}
let scrollFrame=0;window.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;syncVisibleYear();});},{passive:true});
window.addEventListener('resize',syncVisibleYear);
$('viewerYearSelect').addEventListener('change',()=>{const index=yearFirstPhoto.get($('viewerYearSelect').value);if(index!==undefined)showPhoto(index);});
$('yearSelect').addEventListener('change',()=>{const section=$('year-'+$('yearSelect').value);if(!section)return;section.scrollIntoView();section.querySelector('h2').focus({preventScroll:true});});
$('vclose').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>{resetImageTransform();document.body.style.overflow='';if(returnFocus){returnFocus.focus({preventScroll:true});window.scrollTo(0,returnScroll);syncVisibleYear();}});
$('vprev').addEventListener('click',()=>showPhoto(current-1));$('vnext').addEventListener('click',()=>showPhoto(current+1));
viewer.addEventListener('keydown',event=>{if(event.target=== $('viewerYearSelect'))return;if(!saveViewer.open&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();showPhoto(current+(event.key==='ArrowRight'?1:-1));}});
$('retryImage').addEventListener('click',()=>loadImage(photos[current]));
// Stay inside this page. WeChat may turn a download link into an unusable file preview.
// A real, unwrapped original image preserves the native long-press/right-click menu.
$('savePhoto').addEventListener('click',()=>{const p=photos[current],img=$('saveImage');img.hidden=false;$('saveImageStatus').hidden=true;img.alt=p.title+'。'+p.desc;img.src=p.src;saveViewer.showModal();$('closeSave').focus();});
$('saveImage').addEventListener('error',()=>{$('saveImage').hidden=true;$('saveImageStatus').hidden=false;});
$('closeSave').addEventListener('click',()=>saveViewer.close());saveViewer.addEventListener('close',()=>{$('savePhoto').focus();});
function syncMusic(){const playing=!audio.paused;$('musicBtn').textContent=playing?'♫':'♪';$('musicBtn').title=playing?'关闭背景音乐':'播放背景音乐';$('musicBtn').setAttribute('aria-pressed',String(playing));$('musicBtn').setAttribute('aria-label',playing?'关闭背景音乐':'播放背景音乐');}
$('musicBtn').addEventListener('click',async()=>{if(!audio.paused){audio.pause();return;}try{await audio.play();$('musicStatus').textContent='';}catch(_){$('musicStatus').textContent='音乐暂时无法播放，可以继续看照片。';syncMusic();}});
audio.volume=.5;audio.addEventListener('play',syncMusic);audio.addEventListener('pause',syncMusic);audio.addEventListener('error',()=>{$('musicStatus').textContent='音乐暂时无法播放，可以继续看照片。';syncMusic();});
$('photoTotal').textContent=photos.length+' 张照片';

let scale=1,tx=0,ty=0,lastTap=0,tapTimer=null;
const stage=$('stage'),points=new Map();let pinchDistance=0,pinchScale=1,swipeX=null,moved=false;
function applyImageTransform(){image.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')';}
function resetImageTransform(){scale=1;tx=0;ty=0;points.clear();swipeX=null;if(tapTimer){clearTimeout(tapTimer);tapTimer=null;}applyImageTransform();}
function clampImage(){const r=image.getBoundingClientRect(),x=Math.max(0,(r.width-stage.clientWidth)/2),y=Math.max(0,(r.height-stage.clientHeight)/2);tx=Math.max(-x,Math.min(x,tx));ty=Math.max(-y,Math.min(y,ty));applyImageTransform();}
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;stage.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===1){swipeX=e.clientX;moved=false;}if(points.size===2){const a=[...points.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pinchScale=scale;}});
stage.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const previous=points.get(e.pointerId),dx=e.clientX-previous.x,dy=e.clientY-previous.y;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){const a=[...points.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinchDistance>0){scale=Math.max(1,Math.min(5,pinchScale*d/pinchDistance));clampImage();}moved=true;}else if(points.size===1){if(Math.abs(e.clientX-swipeX)>12||Math.abs(dy)>12)moved=true;if(scale>1){tx+=dx;ty+=dy;clampImage();}}});
stage.addEventListener('pointerup',e=>{if(!points.has(e.pointerId))return;points.delete(e.pointerId);if(points.size)return;const now=Date.now();if(!moved){if(now-lastTap<320){if(tapTimer){clearTimeout(tapTimer);tapTimer=null;}scale=scale>1?1:2.5;tx=0;ty=0;applyImageTransform();}else{if(tapTimer)clearTimeout(tapTimer);tapTimer=setTimeout(()=>{tapTimer=null;viewer.classList.toggle('hideui');},330);}lastTap=now;}else if(scale===1&&swipeX!==null){const dx=e.clientX-swipeX;if(Math.abs(dx)>60)showPhoto(current+(dx<0?1:-1));}swipeX=null;});
stage.addEventListener('pointercancel',e=>{points.delete(e.pointerId);if(!points.size)swipeX=null;});
window.addEventListener('resize',()=>{if(viewer.open)viewer.style.setProperty('--caption-height',$('vbar').getBoundingClientRect().height+'px');});
