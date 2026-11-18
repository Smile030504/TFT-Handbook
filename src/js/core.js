'use strict';
const $=id=>document.getElementById(id);
const roster=JSON.parse($('rosterData').textContent),imgs=JSON.parse($('savedData').textContent),defs=JSON.parse($('effectDefs').textContent),skills=JSON.parse($('skillData').textContent);
const traitInfo=JSON.parse($('traitInfo').textContent),traitIcons=JSON.parse($('traitIconData').textContent);
const roleVi={Tank:'ĐỠ ĐÒN',Caster:'THUẬT SƯ',Fighter:'ĐẤU SĨ',Marksman:'XẠ THỦ',Specialist:'ĐẶC THÙ',Assassin:'SÁT THỦ'};
const roleOrder=['Caster','Marksman','Fighter','Tank','Specialist','Assassin'];
const kindVi={band:'NHÓM NHẠC',class:'HỆ CHIẾN ĐẤU',solo:'ĐỘC NHẤT'};
const ui={view:'cost',effect:'all',trait:'all',locked:false,search:'',quiz:false,tab:'units',traitKind:'all',traitSearch:'',traitSelected:null};
let selectedUnit=null,selectedPasteTrait=null;
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const list=[...new Set(roster.flatMap(u=>u.traits))].sort((a,b)=>a.localeCompare(b,'en'));
const iconURL=(name)=>'https://ap.tft.tools/static/trait-icons/99da_19_'+traitInfo[name].slug+'_w.svg';
const fallbackIcon=(name)=>{const t=name.split(/\s+/).map(s=>s[0]||'').slice(0,2).join('').toLocaleUpperCase('vi');return t.length>3?t.slice(0,3):t};
function traitImg(name){const frame=el('span','trait-icon'),img=el('img');img.alt='Icon '+name;img.loading='lazy';let fall=el('span','trait-icon-fallback',fallbackIcon(name));frame.append(fall);img.src=traitIcons[name]||iconURL(name);img.onload=()=>{fall.hidden=true};img.onerror=()=>{img.hidden=true;fall.hidden=false};frame.append(img);return frame}
function switchTab(tab){ui.tab=tab;const isTraits=tab==='traits';$('tab-units').classList.toggle('active',!isTraits);$('tab-traits').classList.toggle('active',isTraits);document.querySelectorAll('.unit-page-part').forEach(x=>x.hidden=isTraits);$('traitsPage').hidden=!isTraits;if(!isTraits&&$('traitDialog').open)$('traitDialog').close();if(isTraits)renderTraits();else render();window.scrollTo(0,0)}
$('tab-units').onclick=()=>switchTab('units');$('tab-traits').onclick=()=>switchTab('traits');
for(const t of list){const op=el('option','',t);op.value=t;$('trait').append(op)}
for(const k of Object.keys(defs))$('n-'+k).textContent=roster.filter(u=>u.effects.includes(k)).length;
function effChip(k){const d=defs[k],x=el('span','effect '+k,d.label);x.title=d.desc;return x}
function traitChip(name){const x=el('span','trait'),dot=el('span','dot',fallbackIcon(name).slice(0,2));const icon=el('img');icon.src=traitIcons[name]||iconURL(name);icon.alt='';icon.loading='lazy';icon.onload=()=>{dot.textContent='';dot.append(icon)};icon.onerror=()=>{};x.title='Mở phần '+name;x.append(dot,document.createTextNode(name));x.onclick=(event)=>{event.stopPropagation();if($('details').open)$('details').close();ui.traitKind='all';ui.traitSearch='';$('traitSearch').value='';ui.traitSelected=name;switchTab('traits');showTraitDetail(name)};return x}
function matched(u){return (ui.effect==='all'||u.effects.includes(ui.effect))&&(ui.trait==='all'||u.traits.includes(ui.trait))&&(!ui.locked||u.locked)&&(!ui.search||u.name.toLowerCase().includes(ui.search))}
function groupKey(u){return ui.view==='cost'?String(u.cost):u.role+'|'+u.damage}
function groupLabel(k){if(ui.view==='cost')return k+' VÀNG';const [r,d]=k.split('|');return roleVi[r]+' '+(d==='Magic'?'PHÉP':'VẬT LÝ')}

const unlockRules=JSON.parse($('unlockRules').textContent);
const unlockSource='https://mobalytics.gg/tft/guides/set-19-unlockable-champions';
