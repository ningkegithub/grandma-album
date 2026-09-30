'use strict';
// Cards and the viewer always use the same stable chronological collection.
const dateKey = p => { const m=p.when.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/); return m?Number(m[1])*10000+Number(m[2])*100+Number(m[3]):Infinity; };
const photos=PHOTOS.map((p,order)=>({...p,order})).sort((a,b)=>dateKey(a)-dateKey(b)||a.order-b.order);
const $=id=>document.getElementById(id);
const viewer=$('viewer'), image=$('vimg'), audio=$('bgm'), saveViewer=$('saveViewer');
let current=0,rendered=false,returnFocus=null,lastPhoto=null,imageRequest=0;
try{lastPhoto=localStorage.getItem('grandma-album-last-photo');}catch(_){/* Storage is optional. */}
// A touch or mouse interaction must not leave a keyboard focus ring behind.
document.addEventListener('keydown',()=>{document.documentElement.dataset.input='keyboard';});
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.input='pointer';},{passive:true});
document.addEventListener('touchstart',()=>{document.documentElement.dataset.input='pointer';},{passive:true});
function textEl(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
function updateResume(){const p=photos.find(p=>p.src===lastPhoto);$('startBtn').textContent=p?'接着看照片':'打开相册';$('lastViewed').hidden=!p;if(p)$('lastViewed').textContent='上次看到 '+p.when;}
function renderAlbum(){
  if(rendered)return;rendered=true;const fragment=document.createDocumentFragment();let grid,previousYear;
  photos.forEach((p,index)=>{
    const match=p.when.match(/^\d{4}/),year=match?match[0]:'日期待确认';
    if(year!==previousYear){previousYear=year;const section=document.createElement('section');section.className='year';section.id='year-'+year;
      const heading=textEl('h2',year==='日期待确认'?year:year+'年');heading.tabIndex=-1;heading.append(textEl('small',photos.filter(x=>x.when.startsWith(year+'年')).length+'张'));section.append(heading);grid=document.createElement('div');grid.className='grid';section.append(grid);fragment.append(section);
      const option=textEl('option',year==='日期待确认'?year:year+'年');option.value=year;$('yearSelect').append(option);
    }
    const card=document.createElement('button');card.type='button';card.className='card';card.dataset.src=p.src;
    const thumb=document.createElement('img');thumb.src=p.thumb;thumb.alt='';thumb.loading='lazy';thumb.decoding='async';thumb.width=600;thumb.height=450;
    thumb.addEventListener('error',()=>{thumb.hidden=true;card.prepend(textEl('span','小图暂时没显示，点这里看看大图','thumb-error'));},{once:true});
    const copy=textEl('span','','card-copy');copy.append(textEl('span',p.when,'card-date'),textEl('span',p.title,'card-title'),textEl('span',p.desc,'card-desc'));card.append(thumb,copy);card.addEventListener('click',()=>openPhoto(index,card));grid.append(card);
  });$('timeline').append(fragment);
}
function startAlbum(focus=true){renderAlbum();$('cover').hidden=true;$('album').hidden=false;if(focus){window.scrollTo(0,0);$('albumHeading').focus();}}
function showPhoto(index){
  current=Math.max(0,Math.min(photos.length-1,index));const p=photos[current];
  $('vwhen').textContent=p.when;$('vtitle').textContent=p.title;$('vdesc').textContent=p.desc;$('vcount').textContent=`${current+1} / ${photos.length}`;
  $('vprev').disabled=current===0;$('vnext').disabled=current===photos.length-1;$('viewerContent').scrollTo(0,0);
  loadImage(p);lastPhoto=p.src;try{localStorage.setItem('grandma-album-last-photo',p.src);}catch(_){}updateResume();
}
function loadImage(p){
  const request=++imageRequest;image.hidden=true;$('imageFeedback').hidden=false;$('imageStatus').textContent='照片正在加载…';$('retryImage').hidden=true;image.alt=p.title+'。'+p.desc;
  const loader=new Image();loader.onload=()=>{if(request!==imageRequest)return;image.src=p.src;image.hidden=false;$('imageFeedback').hidden=true;};loader.onerror=()=>{if(request!==imageRequest)return;$('imageStatus').textContent='照片暂时没加载出来，请检查网络后重试。';$('retryImage').hidden=false;};loader.src=p.src;
}
function openPhoto(index,source){returnFocus=source||document.querySelector(`.card[data-src="${photos[index].src}"]`);showPhoto(index);if(!viewer.open){viewer.showModal();document.body.style.overflow='hidden';}$('vclose').focus();}
$('startBtn').addEventListener('click',()=>{const index=photos.findIndex(p=>p.src===lastPhoto);startAlbum(index<0);if(index>=0)openPhoto(index);});
$('yearSelect').addEventListener('change',()=>{const section=$('year-'+$('yearSelect').value);if(!section)return;section.scrollIntoView();section.querySelector('h2').focus({preventScroll:true});});
$('vclose').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>{document.body.style.overflow='';if(returnFocus){returnFocus.focus({preventScroll:true});returnFocus.scrollIntoView({block:'center'});}});
$('vprev').addEventListener('click',()=>showPhoto(current-1));$('vnext').addEventListener('click',()=>showPhoto(current+1));
viewer.addEventListener('keydown',event=>{if(!saveViewer.open&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();showPhoto(current+(event.key==='ArrowRight'?1:-1));}});
$('retryImage').addEventListener('click',()=>loadImage(photos[current]));
// Stay inside this page. WeChat may turn a download link into an unusable file preview.
// A real, unwrapped original image preserves the native long-press/right-click menu.
$('savePhoto').addEventListener('click',()=>{const p=photos[current],img=$('saveImage');img.hidden=false;$('saveImageStatus').hidden=true;img.alt=p.title+'。'+p.desc;img.src=p.src;saveViewer.showModal();$('closeSave').focus();});
$('saveImage').addEventListener('error',()=>{$('saveImage').hidden=true;$('saveImageStatus').hidden=false;});
$('closeSave').addEventListener('click',()=>saveViewer.close());saveViewer.addEventListener('close',()=>{$('savePhoto').focus();});
function syncMusic(){const playing=!audio.paused;$('musicBtn').textContent=playing?'音乐 · 开':'音乐 · 关';$('musicBtn').setAttribute('aria-pressed',String(playing));$('musicBtn').setAttribute('aria-label',playing?'关闭背景音乐':'播放背景音乐');}
$('musicBtn').addEventListener('click',async()=>{if(!audio.paused){audio.pause();return;}try{await audio.play();$('musicStatus').textContent='';}catch(_){$('musicStatus').textContent='音乐暂时无法播放，可以继续看照片。';syncMusic();}});
audio.volume=.5;audio.addEventListener('play',syncMusic);audio.addEventListener('pause',syncMusic);audio.addEventListener('error',()=>{$('musicStatus').textContent='音乐暂时无法播放，可以继续看照片。';syncMusic();});
$('albumMeta').textContent=`${photos[0].when.slice(0,4)} — ${photos[photos.length-1].when.slice(0,4)} · ${photos.length} 张照片`;$('photoTotal').textContent=photos.length+' 张照片';updateResume();
