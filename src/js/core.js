'use strict';
const $=id=>document.getElementById(id);
const roster=JSON.parse($('rosterData').textContent),imgs=JSON.parse($('savedData').textContent),defs=JSON.parse($('effectDefs').textContent),skills=JSON.parse($('skillData').textContent);
const traitInfo=JSON.parse($('traitInfo').textContent),traitIcons=JSON.parse($('traitIconData').textContent);
const roleVi={Tank:'ĐỠ ĐÒN',Caster:'THUẬT SƯ',Fighter:'ĐẤU SĨ',Marksman:'XẠ THỦ',Specialist:'ĐẶC THÙ',Assassin:'SÁT THỦ'};
const roleOrder=['Caster','Marksman','Fighter','Tank','Specialist','Assassin'];
const kindVi={band:'NHÓM NHẠC',class:'HỆ CHIẾN ĐẤU',solo:'ĐỘC NHẤT'};
const ui={view:'cost',effects:[],traits:[],costs:[],roles:[],locked:false,search:'',quiz:false,tab:'units',traitKind:'all',traitSearch:'',traitSelected:null};
let selectedUnit=null;
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const list=[...new Set(roster.flatMap(u=>u.traits))].sort((a,b)=>a.localeCompare(b,'en'));
const iconURL=(name)=>'https://ap.tft.tools/static/trait-icons/99da_19_'+traitInfo[name].slug+'_w.svg';
const fallbackIcon=(name)=>{const t=name.split(/\s+/).map(s=>s[0]||'').slice(0,2).join('').toLocaleUpperCase('vi');return t.length>3?t.slice(0,3):t};
function traitImg(name){const frame=el('span','trait-icon'),img=el('img');img.alt='Icon '+name;img.loading='lazy';let fall=el('span','trait-icon-fallback',fallbackIcon(name));frame.append(fall);img.src=traitIcons[name]||iconURL(name);img.onload=()=>{fall.hidden=true};img.onerror=()=>{img.hidden=true;fall.hidden=false};frame.append(img);return frame}
function switchTab(tab){
  if(!['units','traits','rewards','builder'].includes(tab))return;
  ui.tab=tab;
  ['units','traits','rewards','builder'].forEach(name=>{
    const button=$('tab-'+name);
    button.classList.toggle('active',name===tab);
    button.setAttribute('aria-pressed',String(name===tab));
  });
  document.querySelectorAll('.unit-page-part').forEach(x=>x.hidden=tab!=='units');
  $('traitsPage').hidden=tab!=='traits';
  $('builderPage').hidden=tab!=='builder';
  $('rewardsPage').hidden=tab!=='rewards';
  closeTraitPicker();
  if(tab!=='traits'&&$('traitDialog').open)$('traitDialog').close();
  if(tab==='rewards'){ if(window.tftRewardRender)window.tftRewardRender(); }
  else if(tab==='traits')renderTraits();
  else if(tab==='builder')renderBuilder();
  else render();
  window.scrollTo(0,0);
}
$('tab-units').onclick=()=>switchTab('units');
$('tab-traits').onclick=()=>switchTab('traits');
$('tab-builder').onclick=()=>switchTab('builder');
$('tab-rewards').onclick=()=>switchTab('rewards');


const picker=$('traitPicker'),pickerMenu=$('traitMenu'),pickerGrid=$('traitPickerGrid');
function closeTraitPicker(){pickerMenu.hidden=true;$('traitToggle').setAttribute('aria-expanded','false')}
function updateTraitPicker(){const count = ui.traits.length; $('traitSelectedLabel').textContent = count === 0 ? 'Tất cả tộc/hệ' : count === 1 ? ui.traits[0] : count + ' tộc/hệ đã chọn'; pickerGrid.querySelectorAll('[data-trait-choice]').forEach(button => {
    const name = button.dataset.traitChoice;

    const selected = name === 'all'
      ? count === 0
      : ui.traits.includes(name);

    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function toggleTraitFilter(name) {
  if (name === 'all') {
    ui.traits = [];
    closeTraitPicker();

  } else if (ui.traits.includes(name)) {
    ui.traits = ui.traits.filter(trait => trait !== name);

  } else {
    ui.traits.push(name);
  }

  updateTraitPicker();
  render();
}

function clearTraitFilters() {
  ui.traits = [];
  updateTraitPicker();
  closeTraitPicker();
}
function initTraitPicker(){
  for(const name of ['all',...list]){
    const b=el('button','trait-picker-choice');b.type='button';b.dataset.traitChoice=name;
    const icon=el('span','trait-picker-icon');
    if(name==='all')icon.textContent='✦';
    else {const im=el('img');im.src=traitIcons[name]||iconURL(name);im.alt='';im.loading='lazy';im.onerror=()=>{im.hidden=true;icon.textContent='✦'};icon.append(im)}
    b.append(icon,el('span','',name==='all'?'Tất cả tộc/hệ':name));
    b.classList.toggle('selected',name==='all');
    b.onclick = () => toggleTraitFilter(name);
    pickerGrid.append(b);
  }
  $('traitToggle').onclick=()=>{const opening=pickerMenu.hidden;pickerMenu.hidden=!opening;$('traitToggle').setAttribute('aria-expanded',String(opening))};
  document.addEventListener('click',e=>{if(!picker.contains(e.target))closeTraitPicker()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTraitPicker()});
}
initTraitPicker();

for(const k of Object.keys(defs))$('n-'+k).textContent=roster.filter(u=>u.effects.includes(k)).length;
function effChip(k){const d=defs[k],x=el('span','effect '+k,d.label);x.title=d.desc;return x}
function traitChip(name){const x=el('span','trait'),dot=el('span','dot',fallbackIcon(name).slice(0,2));const icon=el('img');icon.src=traitIcons[name]||iconURL(name);icon.alt='';icon.loading='lazy';icon.onload=()=>{dot.textContent='';dot.append(icon)};icon.onerror=()=>{};x.title='Mở phần '+name;x.append(dot,document.createTextNode(name));x.onclick=(event)=>{event.stopPropagation();if($('details').open)$('details').close();ui.traitKind='all';ui.traitSearch='';$('traitSearch').value='';ui.traitSelected=name;switchTab('traits');showTraitDetail(name)};return x}
function matched(u) {
  const matchCosts =
    ui.costs.length === 0 ||
    ui.costs.includes(u.cost);

  const matchRoles =
    ui.roles.length === 0 ||
    ui.roles.includes(u.role + '|' + u.damage);

  const matchEffects =
    ui.effects.length === 0 ||
    ui.effects.some(effect => u.effects.includes(effect));

  const matchTraits =
    ui.traits.length === 0 ||
    ui.traits.some(trait => u.traits.includes(trait));

  const matchLocked =
    !ui.locked || u.locked;

  const matchSearch =
    !ui.search ||
    u.name.toLowerCase().includes(ui.search);

  return (
    matchCosts &&
    matchEffects &&
    matchRoles &&
    matchTraits &&
    matchLocked &&
    matchSearch
  );
}
function groupKey(u){return ui.view==='cost'?String(u.cost):u.role+'|'+u.damage}
function groupLabel(k){if(ui.view==='cost')return k+' VÀNG';const [r,d]=k.split('|');return roleVi[r]+' '+(d==='Magic'?'PHÉP':'VẬT LÝ')}

const unlockRules=JSON.parse($('unlockRules').textContent);
const unlockSource='https://mobalytics.gg/tft/guides/set-19-unlockable-champions';

const themeToggle = document.getElementById('themeToggle');

try {
  if (localStorage.getItem('tft-theme') === 'light') {
    document.body.classList.remove('dark-mode');
  }
} catch (error) {
}

function updateThemeButton() {
  const dark = document.body.classList.contains('dark-mode');

  themeToggle.textContent = dark
    ? '☀️ Bật sáng'
    : '🌙 Bật tối';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  const dark = document.body.classList.contains('dark-mode');

  try {
    localStorage.setItem(
      'tft-theme',
      dark ? 'dark' : 'light'
    );
  } catch (error) {}

  updateThemeButton();
});

updateThemeButton();

// ==== TFT Rewards (approved UI; item images in src/assets/items) ====

(()=>{
  'use strict';
  const data=JSON.parse(document.getElementById('reward-appData').textContent);
  data.champions=roster; data.championImages={...imgs}; data.traitIcons=traitIcons;
  for (const [name,src] of Object.entries(data.championOverrides||{})) { const u=roster.find(x=>x.name===name); if(u) data.championImages[u.id]=src; }
  const $=id=>document.getElementById('reward-'+id); const app=$('app');const content=$('content');
  const unitByName=new Map(data.champions.map(u=>[u.name,u]));
  const imageMap={...data.itemIcons};let current='Hyperpop';let query='';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n).toLocaleString('vi-VN');
  const iconNames={gold:'🪙',tiny_duplicator:'👤',small_duplicator:'👥',champion_duplicator:'♟',component_random:'🎲',component_pack:'🧰',completed_pack:'📦',completed_random:'🎲',artifact_pack:'🎁',tacticians_crown:'👑',thiefs_gloves:'🧤',radiant_random:'✨',reforger:'🔨',magnetic_remover:'🧲',charm_energetic:'⚡',charm_passion:'💜',charm_fearless:'🗡',charm_joyous:'💚'};
  // Khi triển khai qua web server, ưu tiên item-icons.json đã được cập nhật.
  (async()=>{for(const url of ['src/data/item-icons.json','item-icons.json']){try{const response=await fetch(url);if(!response.ok)continue;const map=await response.json();if(map&&typeof map==='object'&&!Array.isArray(map)){Object.assign(imageMap,map);if(window.tftRewardRender)window.tftRewardRender();return;}}catch(_){/* file:// dùng bản dự phòng */}}})();
  const srcCandidates=(path)=>{
    if(!path)return [];
    const value=String(path);
    if(/^(data:|blob:|https?:\/\/)/i.test(value))return [value];
    const local=value.replace(/^\.?\//,'');
    // index.html dùng assets/; khi xem source trực tiếp có thể dùng src/assets/.
    return [...new Set([local,local.startsWith('assets/')?'src/'+local:local])];
  };
  function assetImg(entry,kind,holder){
    let path='',fallback='✦',cost=0;
    if(kind==='champion'){
      const unit=unitByName.get(entry.name);cost=unit?.cost||0;path=unit?data.championImages[unit.id]:'';fallback=(entry.name||'?').slice(0,2).toUpperCase();
    } else if(kind==='trait'){
      path=data.traitIcons[entry.name]||'';fallback='ẤN';
    } else {path=imageMap[entry.id]||'';fallback=iconNames[entry.id]||'◆'}
    holder.title=entry.label||entry.name||entry.id||kind;
    holder.classList.add(kind);
    if(entry.id==='gold')holder.classList.add('gold');
    if(cost){holder.style.borderColor=({1:'#88929b',2:'#29af8c',3:'#4aaff2',4:'#b36ded',5:'#e9b94b',7:'#ff865c'})[cost]||'#777';}
    const glyph=document.createElement('span');glyph.className='glyph'+(entry.id==='gold'?' gold':'');glyph.textContent=fallback;holder.append(glyph);
    const candidates=srcCandidates(path);
    if(candidates.length){const img=new Image();let idx=0;img.alt='';img.loading='lazy';img.onload=()=>{glyph.hidden=true};img.onerror=()=>{idx++;if(idx<candidates.length)img.src=candidates[idx];else img.remove()};img.src=candidates[idx];holder.append(img)}
    const qty=entry.stars?entry.stars+'★':entry.count>1?'×'+entry.count:'';
    if(qty){const b=document.createElement('span');b.className='qty';b.textContent=qty;holder.append(b)}
  }
  function visual(item,kindOverride=''){
    if(typeof item==='string')item={kind:'item',id:'',label:item};
    const kind=kindOverride||item.kind||'item';const name=item.label||item.name||'';
    const tile=document.createElement('span');tile.className='reward';tile.title=name;
    const icon=document.createElement('span');icon.className='iconbox';assetImg(item,kind,icon);
    const label=document.createElement('span');label.className='caption';label.textContent=name;tile.append(icon,label);return tile;
  }
  const visuals=(arr)=>{const flex=document.createElement('div');flex.className='content';(arr||[]).forEach(i=>flex.append(visual(i)));return flex};
  function heading(name,subtitle,sign){const s=document.createElement('div');s.className='sectionhead';const ic=document.createElement('div');ic.className='sectionicon';const imgpath=data.traitIcons[name];if(imgpath){assetImg({name},'trait',ic);const placeholder=ic.querySelector('.glyph');if(placeholder)placeholder.textContent=sign}else ic.textContent=sign;const text=document.createElement('div');text.innerHTML='<h2>'+esc(name)+'</h2><p>'+esc(subtitle)+'</p>';s.append(ic,text);return s}
  function keyDiv(str){const e=document.createElement('div');e.className='number';e.textContent=str;return e}
  function milestone(m,items,groups){const c=document.createElement('article');c.className='card milestone';c.append(keyDiv(m));const box=document.createElement('div');box.className='content';
    if(items)items.forEach(i=>box.append(visual(i)));
    if(groups){const wrap=document.createElement('div');wrap.className='poollist';for(const group of groups){const p=document.createElement('div');p.className='pool';const title=document.createElement('strong');title.textContent=group.title;p.append(title);const choices=document.createElement('div');choices.className='poolitems';for(const ch of group.choices){const v={...ch,kind:group.kind,label:group.kind==='trait'?'Ấn '+ch.name:ch.name};choices.append(visual(v))}p.append(choices);wrap.append(p)}box.append(wrap)}
    c.append(box);return c}
  function cashCard(name,subtitle,options){const c=document.createElement('article');c.className='card cashout';const h=document.createElement('div');h.className='cashhead';h.innerHTML='<strong>'+esc(name)+'</strong>'+(subtitle?'<small>'+esc(subtitle)+'</small>':'');c.append(h);for(const option of options){const row=document.createElement('div');row.className='outcome';const chance=document.createElement('div');chance.className='chance';chance.textContent=option.chance;row.append(chance,visuals(option.items));c.append(row)}return c}
  function specialCard(d){const c=document.createElement('article');c.className='card specialcard';const h=document.createElement('h3');h.textContent=d.title;const cond=document.createElement('p');cond.textContent=d.condition;c.append(h,cond);if(d.extra){const x=document.createElement('div');x.className='extra';x.textContent=d.extra;c.append(x)}c.append(visuals(d.items));return c}
  // Measure each card in the actual column width. Use the closest split where left is equal or slightly taller.
  function columns(cards,host,label){const panel=document.createElement('div');panel.className='columns';host.append(panel);
    if(!cards.length){panel.outerHTML='<p class="empty">Không tìm thấy phần thưởng phù hợp.</p>';return}
    const left=document.createElement('div'),right=document.createElement('div');left.className='column';right.className='column';panel.append(left,right);
    const measure=document.createElement('div');measure.className='measure';panel.append(measure);
    const mobile=window.matchMedia('(max-width:780px)').matches;
    if(mobile){left.append(...cards);right.remove();measure.remove();return;}
    const gap=parseFloat(getComputedStyle(panel).columnGap)||10;measure.style.width=((panel.clientWidth-gap)/2)+'px';
    const sizes=cards.map(c=>{measure.append(c);return c.getBoundingClientRect().height+gap});
    const sum=sizes.reduce((a,b)=>a+b,0);let candidate=1,best=Infinity,running=0;
    for(let i=1;i<cards.length;i++){
      running+=sizes[i-1];const rightH=sum-running;const diff=running-rightH;
      const score=Math.abs(diff)+(diff<0?sum*.8:0);if(score<best){best=score;candidate=i}
    }
    if(cards.length===1)candidate=1;
    left.append(...cards.slice(0,candidate));right.append(...cards.slice(candidate));measure.remove();
  }

  // Đọc từ trái qua phải, rồi xuống hàng: 5 | 15, 50 | 100, 200 | 350 ...
  // CSS grid keeps each pair aligned vertically even with very different card heights.
  function columnsRowMajor(cards,host,label){
    const grid=document.createElement('div'); grid.className='columns reward-row-major';
    if(!cards.length){host.append(Object.assign(document.createElement('p'),{className:'empty',textContent:'Không tìm thấy phần thưởng phù hợp.'}));return;}
    grid.append(...cards); host.append(grid);

  }
  function groupHype(){const s=heading('Hyperpop','21 mốc Hype · Phần thưởng theo lượng Hype','♫');const a=data.hype.filter(x=>(fmt(x.hype)+' '+x.label+' '+JSON.stringify(x)).toLowerCase().includes(query));const nodes=a.map(x=>milestone(fmt(x.hype),x.items,x.groups));return {head:s,nodes}}
  function groupBit(){const s=heading('8-Bit','8 mốc điểm cao · Quà theo điểm sát thương','▦');const a=data.bit.filter(x=>(fmt(x.score)+' '+JSON.stringify(x.items)).toLowerCase().includes(query));return {head:s,nodes:a.map(x=>milestone(fmt(x.score),x.items))}}
  function groupTrue(){const s=heading('True Damage','12 khoảng Bling · Phần thưởng và tỉ lệ','✦');const a=data.trueDamage.filter(x=>(x.range+' '+JSON.stringify(x.options)).toLowerCase().includes(query));return {head:s,nodes:a.map(x=>cashCard(x.range+' Bling','Giá trị ước tính: '+x.estimate+' vàng',x.options))}}
  function groupIonic(){
    const s=heading('Ionic Spark','Mốc (7) · Quà từ fan','⚡');
    const highlight=document.createElement('div');highlight.className='alert';
    highlight.innerHTML='<strong>Mỗi 2 giao tranh người chơi nhận 5 vàng + 1 Charm ngẫu nhiên</strong><p>Không nhận trùng Charm trong cùng chu kỳ. Khi đã nhận đủ bốn loại, danh sách được làm mới.</p>';
    const goldStrip=document.createElement('div');goldStrip.className='ionic-gold-strip';
    const goldHeading=document.createElement('strong');goldHeading.className='ionic-gold-title';goldHeading.textContent='Quà mỗi lần nhận';
    const goldLine=document.createElement('div');goldLine.className='ionic-gold-line';
    goldLine.append(visual({kind:'item',id:'gold',label:'5 vàng'}));
    const plus=document.createElement('span');plus.className='ionic-plus';plus.textContent='+';
    goldLine.append(plus);
    goldStrip.append(goldHeading,goldLine);
    const charmHeading=document.createElement('div');charmHeading.className='ionic-charm-heading';charmHeading.textContent='1 trong 4 Charm ngẫu nhiên';
    const grid=document.createElement('div');grid.className='charmgrid ionic-choice-grid';
    for(const d of data.charms.filter(x=>(x.name+' '+x.effect).toLowerCase().includes(query))){
      const c=document.createElement('div');c.className='charmcard';
      const icon=visual({kind:'item',id:d.id,label:d.name});
      const info=document.createElement('div');info.className='ionic-charm-info';
      const name=document.createElement('h3');name.textContent=d.name;
      const effect=document.createElement('p');effect.textContent=d.effect;
      info.append(name,effect);c.append(icon,info);grid.append(c);
    }
    return {head:s,extra:[highlight,goldStrip,charmHeading,grid]};
  }
  function groupTF(){const s=heading('TF','Quà theo lá bài của Twisted Fate','🃏');const note=document.createElement('div');note.className='alert';note.innerHTML='<strong>Phần thưởng theo bộ bài trong cửa hàng</strong><p>Các nhóm bài và tổ hợp đặc biệt được xét theo tướng xuất hiện trong cửa hàng.</p>';const normalTitle=document.createElement('h3');normalTitle.className='subhead';normalTitle.textContent='Bộ bài thông thường';const specialTitle=document.createElement('h3');specialTitle.className='subhead';specialTitle.textContent='Tổ hợp đặc biệt';const norm=data.tfNormal.filter(x=>JSON.stringify(x).toLowerCase().includes(query)).map(x=>cashCard(x.title,x.sub,x.options));const special=data.tfSpecial.filter(x=>JSON.stringify(x).toLowerCase().includes(query)).map(specialCard);return {head:s,tf:true,note,normalTitle,specialTitle,norm,special}}
  let deferredRender=0;
  function render(){content.replaceChildren();let result;
    if(current==='Hyperpop')result=groupHype();else if(current==='8-Bit')result=groupBit();else if(current==='True Damage')result=groupTrue();else if(current==='Ionic Spark')result=groupIonic();else result=groupTF();
    content.append(result.head);
    if(result.tf){content.append(result.note,result.normalTitle);columns(result.norm,content,'TF – bộ thường');content.append(result.specialTitle);columns(result.special,content,'TF – đặc biệt')}else if(result.extra)content.append(...result.extra);else columnsRowMajor(result.nodes,content,current);
  }
  function rerender(){cancelAnimationFrame(deferredRender);deferredRender=requestAnimationFrame(render)}
  $('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;current=b.dataset.tab;app.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});$('search').value='';query='';render();window.scrollTo({top:0,behavior:'instant'})});
  $('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();rerender()});
  window.tftRewardRender=render; window.addEventListener('resize',()=>{if(!$('app').closest('#rewardsPage').hidden)rerender()});render();
})();

