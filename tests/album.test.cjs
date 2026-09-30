const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.events={};this.attributes={};this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.value='';this.open=false;this._text='';this.className='';const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:x=>classes.has(x)?(classes.delete(x),false):(classes.add(x),true)};}
 set textContent(v){this._text=String(v)} get textContent(){return this._text+this.children.map(c=>c.textContent).join('')}
 append(...children){this.children.push(...children)}prepend(...children){this.children.unshift(...children)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.events[k]??=[]).push(fn)}
 dispatch(k,extra={}){for(const f of this.events[k]??[])f({preventDefault(){},...extra})}click(){if(!this.disabled)this.dispatch('click')}focus(){document.activeElement=this}scrollTo(){}scrollIntoView(){}querySelector(tag){return this.children.find(c=>c.tagName===tag)}
 showModal(){this.open=true}close(){this.open=false;this.dispatch('close')}
}
const ids={};const document={activeElement:null,body:new Element('body'),getElementById:id=>ids[id]??=(new Element()),createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment'),querySelectorAll:s=>s==='.music'?music:[],querySelector:s=>walk(ids.timeline).find(x=>s.includes(x.dataset.src)&&x.className==='card')};
function walk(el){return [el,...el.children.flatMap(walk)]}
ids.bgm=new Element('audio');ids.bgm.paused=true;let playCount=0;ids.bgm.play=()=>{playCount++;ids.bgm.paused=false;ids.bgm.dispatch('play');return Promise.resolve();};ids.bgm.pause=()=>{ids.bgm.paused=true;ids.bgm.dispatch('pause');};
const music=[new Element('button'),new Element('button')];const loads=[];class Image{set src(value){this._src=value;loads.push(this)}get src(){return this._src}}
const storage=new Map();const context=vm.createContext({document,Image,window:{scrollTo(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},console});
for(const file of ['photos.js','album.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const run=code=>vm.runInContext(code,context);
assert.equal(run('PHOTOS.length'),836);assert.equal(run('new Set(PHOTOS.map(p=>p.src)).size'),836);assert.equal(run('photos.every((p,i)=>i===0 || dateKey(photos[i-1])<=dateKey(p))'),true);
assert.equal(ids.bgm.paused,true);assert.equal(playCount,0);assert.equal(loads.length,0,'cover must not load original photos');
ids.startBtn.click();let cards=walk(ids.timeline).filter(x=>x.className==='card');assert.equal(cards.length,836);assert.equal(ids.cover.hidden,true);assert.equal(ids.album.hidden,false);assert.equal(document.activeElement,ids.albumHeading);assert.equal(playCount,0,'opening album must not autoplay music');music[0].click();assert.equal(playCount,1);assert.equal(music[1].textContent,'关闭音乐');music[1].click();assert.equal(ids.bgm.paused,true);assert.equal(music[0].textContent,'播放音乐');
const years=walk(ids.timeline).filter(x=>x.className==='year');assert.equal(new Set(years.map(x=>x.id)).size,years.length);assert.equal(years.find(x=>walk(x).some(x=>x.dataset.src==='photos/p502.jpg')).id,'year-2017');
assert.equal(cards[0].children[0].loading,'lazy');cards[0].click();assert.equal(ids.viewer.open,true);assert.equal(ids.vprev.disabled,true);assert.equal(ids.vcount.textContent,'第 1 / 836 张');assert.equal(document.activeElement,ids.vclose);assert.equal(ids.imageFeedback.hidden,false);
loads.at(-1).onerror();assert.equal(ids.retryImage.hidden,false);ids.retryImage.click();loads.at(-1).onload();assert.equal(ids.imageFeedback.hidden,true);assert.equal(ids.vimg.src,'photos/p001.jpg');
ids.vnext.click();let stale=loads.at(-1);ids.vnext.click();let latest=loads.at(-1);stale.onload();assert.equal(ids.imageFeedback.hidden,false);latest.onload();assert.equal(ids.vcount.textContent,'第 3 / 836 张');
ids.zoomBtn.click();assert.equal(ids.zoomBtn.attributes['aria-pressed'],'true');ids.vnext.click();assert.equal(ids.zoomBtn.attributes['aria-pressed'],'false');
ids.vsave.click();assert.match(ids.saveStatus.textContent,/请求下载/);assert.ok(!ids.saveStatus.textContent.includes('已保存'));assert.equal(storage.get('grandma-album-last-photo'),run('photos[current].src'));
ids.vclose.click();assert.equal(ids.viewer.open,false);assert.equal(document.activeElement,cards[0]);assert.equal(document.body.style.overflow,'');ids.resumeAlbum.click();assert.equal(ids.viewer.open,true);assert.equal(ids.vcount.textContent,'第 4 / 836 张');
run('showPhoto(835)');assert.equal(ids.vnext.disabled,true);ids.viewer.dispatch('keydown',{key:'ArrowRight'});assert.equal(ids.vcount.textContent,'第 836 / 836 张');ids.viewer.dispatch('keydown',{key:'ArrowLeft'});assert.equal(ids.vcount.textContent,'第 835 / 836 张');
run('startAlbum()');assert.equal(walk(ids.timeline).filter(x=>x.className==='card').length,836,'repeated start must not duplicate photos');
console.log('PASS: 836 retained/unique; chronological single-source order; 2017 p502 placement; lazy loading; modal open/close/focus; first/last boundaries; navigation; stale-load isolation; error/retry; zoom reset; truthful save message; resume; idempotent render; no autoplay; synchronized music on/off controls.');
