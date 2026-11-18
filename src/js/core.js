'use strict';
const $=id=>document.getElementById(id);
const roster=JSON.parse($('rosterData').textContent),imgs=JSON.parse($('savedData').textContent),defs=JSON.parse($('effectDefs').textContent),skills=JSON.parse($('skillData').textContent);
const traitInfo=JSON.parse($('traitInfo').textContent),traitIcons=JSON.parse($('traitIconData').textContent);
const roleVi={Tank:'ĐỠ ĐÒN',Caster:'THUẬT SƯ',Fighter:'ĐẤU SĨ',Marksman:'XẠ THỦ',Specialist:'ĐẶC THÙ',Assassin:'SÁT THỦ'};
const roleOrder=['Caster','Marksman','Fighter','Tank','Specialist','Assassin'];
const kindVi={band:'NHÓM NHẠC',class:'HỆ CHIẾN ĐẤU',solo:'ĐỘC NHẤT'};
const ui={view:'cost',effect:'all',trait:'all',locked:false,search:'',quiz:false,tab:'units',traitKind:'all',traitSearch:'',traitSelected:null};
let selectedUnit=null;
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const list=[...new Set(roster.flatMap(u=>u.traits))].sort((a,b)=>a.localeCompare(b,'en'));
const iconURL=(name)=>'https://ap.tft.tools/static/trait-icons/99da_19_'+traitInfo[name].slug+'_w.svg';
const fallbackIcon=(name)=>{const t=name.split(/\s+/).map(s=>s[0]||'').slice(0,2).join('').toLocaleUpperCase('vi');return t.length>3?t.slice(0,3):t};
function traitImg(name){const frame=el('span','trait-icon'),img=el('img');img.alt='Icon '+name;img.loading='lazy';let fall=el('span','trait-icon-fallback',fallbackIcon(name));frame.append(fall);img.src=traitIcons[name]||iconURL(name);img.onload=()=>{fall.hidden=true};img.onerror=()=>{img.hidden=true;fall.hidden=false};frame.append(img);return frame}
function switchTab(tab){
  if(!['units','traits','builder'].includes(tab))return;
  ui.tab=tab;
  ['units','traits','builder'].forEach(name=>{
    const button=$('tab-'+name);
    button.classList.toggle('active',name===tab);
    button.setAttribute('aria-pressed',String(name===tab));
  });
  document.querySelectorAll('.unit-page-part').forEach(x=>x.hidden=tab!=='units');
  $('traitsPage').hidden=tab!=='traits';
  $('builderPage').hidden=tab!=='builder';
  closeTraitPicker();
  if(tab!=='traits'&&$('traitDialog').open)$('traitDialog').close();
  if(tab==='traits')renderTraits();
  else if(tab==='builder')renderBuilder();
  else render();
  window.scrollTo(0,0);
}
$('tab-units').onclick=()=>switchTab('units');
$('tab-traits').onclick=()=>switchTab('traits');
$('tab-builder').onclick=()=>switchTab('builder');


const picker=$('traitPicker'),pickerMenu=$('traitMenu'),pickerGrid=$('traitPickerGrid');
function closeTraitPicker(){pickerMenu.hidden=true;$('traitToggle').setAttribute('aria-expanded','false')}
function setTraitFilter(name){
  ui.trait=name;
  $('traitSelectedLabel').textContent=name==='all'?'Tất cả tộc/hệ':name;
  pickerGrid.querySelectorAll('[data-trait-choice]').forEach(b=>b.classList.toggle('selected',b.dataset.traitChoice===name));
  closeTraitPicker();render();
}
function initTraitPicker(){
  for(const name of ['all',...list]){
    const b=el('button','trait-picker-choice');b.type='button';b.dataset.traitChoice=name;
    const icon=el('span','trait-picker-icon');
    if(name==='all')icon.textContent='✦';
    else {const im=el('img');im.src=traitIcons[name]||iconURL(name);im.alt='';im.loading='lazy';im.onerror=()=>{im.hidden=true;icon.textContent='✦'};icon.append(im)}
    b.append(icon,el('span','',name==='all'?'Tất cả tộc/hệ':name));
    b.classList.toggle('selected',name==='all');
    b.onclick=()=>setTraitFilter(name);pickerGrid.append(b);
  }
  $('traitToggle').onclick=()=>{const opening=pickerMenu.hidden;pickerMenu.hidden=!opening;$('traitToggle').setAttribute('aria-expanded',String(opening))};
  document.addEventListener('click',e=>{if(!picker.contains(e.target))closeTraitPicker()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTraitPicker()});
}
initTraitPicker();

for(const k of Object.keys(defs))$('n-'+k).textContent=roster.filter(u=>u.effects.includes(k)).length;
function effChip(k){const d=defs[k],x=el('span','effect '+k,d.label);x.title=d.desc;return x}
function traitChip(name){const x=el('span','trait'),dot=el('span','dot',fallbackIcon(name).slice(0,2));const icon=el('img');icon.src=traitIcons[name]||iconURL(name);icon.alt='';icon.loading='lazy';icon.onload=()=>{dot.textContent='';dot.append(icon)};icon.onerror=()=>{};x.title='Mở phần '+name;x.append(dot,document.createTextNode(name));x.onclick=(event)=>{event.stopPropagation();if($('details').open)$('details').close();ui.traitKind='all';ui.traitSearch='';$('traitSearch').value='';ui.traitSelected=name;switchTab('traits');showTraitDetail(name)};return x}
function matched(u){return (ui.effect==='all'||u.effects.includes(ui.effect))&&(ui.trait==='all'||u.traits.includes(ui.trait))&&(!ui.locked||u.locked)&&(!ui.search||u.name.toLowerCase().includes(ui.search))}
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
  // Use the default theme if storage is unavailable.
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