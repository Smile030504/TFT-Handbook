const TEAM_DEFAULT_CAPACITY=10;
const TEAM_MIN_CAPACITY=1;
const TEAM_MAX_CAPACITY=15;
const TEAM_BARON='tft91';
const TEAM_MALZAHAR='tft44';
const TEAM_STORAGE_KEY='tft19-team-composer-v2';
const teamById=new Map(roster.map(u=>[u.id,u]));
const traitMembers=new Map(list.map(trait=>[
  trait,new Set(roster.filter(u=>u.traits.includes(trait)).map(u=>u.id))
]));
const teamState={capacity:TEAM_DEFAULT_CAPACITY,ids:[],focus:null,search:'',cost:'all',openTraits:new Set()};

try{
  const saved=JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY)||'null');
  if(saved&&typeof saved==='object'){
    const raw=Number(saved.capacity);
    teamState.capacity=Number.isInteger(raw)?Math.max(TEAM_MIN_CAPACITY,Math.min(TEAM_MAX_CAPACITY,raw)):TEAM_DEFAULT_CAPACITY;
    const unique=[...new Set(Array.isArray(saved.ids)?saved.ids:[])];
    for(const id of unique){
      if(!teamById.has(id))continue;
      const unit=teamById.get(id);
      if(teamUsed()+teamSize(unit)>teamState.capacity)continue;
      teamState.ids.push(id);
    }
  }
}catch(_error){}
function teamSize(unit){return unit.id===TEAM_BARON?2:1}
function teamUnits(){return teamState.ids.map(id=>teamById.get(id)).filter(Boolean)}
function teamUsed(){return teamUnits().reduce((sum,u)=>sum+teamSize(u),0)}
function teamSave(){try{localStorage.setItem(TEAM_STORAGE_KEY,JSON.stringify({capacity:teamState.capacity,ids:teamState.ids}))}catch(_error){}}
function teamHasMalzahar(){return teamState.ids.includes(TEAM_MALZAHAR)}
function teamMessage(message){$('builderNotice').textContent=message}

function teamIndependent(unit){
  return unit.id!==TEAM_BARON&&unit.traits.every(t=>(traitMembers.get(t)?.size||0)<=1);
}
function teamSharedTraits(a,b){
  if(a.id===b.id)return [];
  return a.traits.filter(t=>(traitMembers.get(t)?.size||0)>1&&b.traits.includes(t));
}
function teamReferences(){
  if(teamState.focus&&teamState.ids.includes(teamState.focus))return [teamById.get(teamState.focus)];
  return teamUnits();
}
function teamHint(unit){
  if(unit.id===TEAM_BARON)return teamHasMalzahar()
    ?{kind:'related',why:'Đã có Malzahar. Muốn mở khóa Baron vẫn phải hoàn thành các điều kiện khác.'}
    :{kind:'muted',why:'Thêm Malzahar để làm sáng Baron Nashor.'};
  if(teamIndependent(unit))return {kind:'independent',why:'Tướng độc lập: không có tướng nào khác chung tộc/hệ.'};
  const refs=teamReferences();
  if(!refs.length)return {kind:'neutral',why:'Bạn có thể bắt đầu với tướng bất kỳ.'};
  const common=[...new Set(refs.flatMap(other=>teamSharedTraits(other,unit)))];
  return common.length?{kind:'related',why:'Chung: '+common.join(', ')}
    :{kind:'muted',why:'Chưa có tộc/hệ trùng với tướng đang xét.'};
}
function teamAdd(unit){
  if(teamState.ids.includes(unit.id)){
    teamState.focus=unit.id;renderBuilder();
    teamMessage(unit.name+' đã ở trong đội hình. Bấm × trên thẻ tướng để xóa.');
    return;
  }
  if(teamUsed()+teamSize(unit)>teamState.capacity){
    teamMessage(unit.name+' cần '+teamSize(unit)+' suất nhưng đội chỉ còn '+(teamState.capacity-teamUsed())+' suất. Hãy tăng giới hạn bằng nút + hoặc xóa bớt tướng.');
    return;
  }
  teamState.ids.push(unit.id);
  teamState.focus=null;
  teamSave();renderBuilder();
  teamMessage('Đã thêm '+unit.name+' · '+teamUsed()+' / '+teamState.capacity+' suất.'+(unit.id===TEAM_MALZAHAR?' Baron Nashor đã được làm sáng trong kho tướng.':''));
}
function teamRemove(id){
  const before=teamById.get(id);
  teamState.ids=teamState.ids.filter(x=>x!==id);
  if(teamState.focus===id)teamState.focus=null;
  teamSave();renderBuilder();
  teamMessage('Đã xóa '+before.name+' khỏi đội hình.');
}
function teamToggleFocus(id){
  teamState.focus=teamState.focus===id?null:id;
  renderBuilder();
  const focused=teamState.focus&&teamById.get(teamState.focus);
  teamMessage(focused?'Đang gợi ý các tướng cùng tộc/hệ với '+focused.name+'.':'Đang gợi ý các tướng liên quan đến toàn đội.');
}
function teamSetCapacity(change){
  const next=teamState.capacity+change;
  if(next<TEAM_MIN_CAPACITY||next>TEAM_MAX_CAPACITY)return;
  if(next<teamUsed()){
    teamMessage('Đội hình đang dùng '+teamUsed()+' suất. Hãy xóa bớt tướng trước khi giảm giới hạn.');
    return;
  }
  teamState.capacity=next;
  teamSave();renderBuilder();
  teamMessage('Giới hạn đội hình: '+next+' suất.');
}
function renderBuilderLineup(){
  const board=$('builderBoard');board.replaceChildren();
  const team=teamUnits(),used=teamUsed();
  for(const unit of team){
    const card=el('div','builder-member'+(unit.id===TEAM_BARON?' is-baron':'')+(teamState.focus===unit.id?' is-focused':''));
    const button=el('button','builder-member-content');button.type='button';
    button.setAttribute('aria-pressed',String(teamState.focus===unit.id));
    button.setAttribute('aria-label','Xem gợi ý tộc/hệ cho '+unit.name);
    const image=el('img','builder-member-image');image.src=imgs[unit.id];image.alt='';
    button.append(image,el('span','builder-member-name',unit.name));
    if(unit.id===TEAM_BARON)button.append(el('span','builder-member-badge','2 SUẤT'));
    button.onclick=()=>teamToggleFocus(unit.id);
    const remove=el('button','builder-remove','×');remove.type='button';remove.title='Xóa '+unit.name;
    remove.setAttribute('aria-label','Xóa '+unit.name+' khỏi đội hình');remove.onclick=()=>teamRemove(unit.id);
    card.append(button,remove);board.append(card);
  }
  for(let i=0;i<teamState.capacity-used;i++){
    const empty=el('div','builder-member builder-member-empty');
    empty.append(el('span','builder-empty-plus','+'));
    empty.title='Suất trống · Chọn một tướng ở kho bên dưới';
    board.append(empty);
  }
  $('builderCapacity').textContent=String(teamState.capacity);
  $('builderMinus').disabled=teamState.capacity===TEAM_MIN_CAPACITY||teamState.capacity-1<used;
  $('builderPlus').disabled=teamState.capacity===TEAM_MAX_CAPACITY;
  $('builderFocusAll').hidden=!teamState.focus;
  $('builderInstruction').textContent=teamState.focus
    ?'Đang xem tướng liên quan đến '+teamById.get(teamState.focus)?.name+'.'
    :!team.length?'Chọn icon trong kho tướng để bắt đầu.'
    :used===teamState.capacity?'Đội đã đủ suất. Có thể tăng giới hạn hoặc xóa tướng.'
    :'Đang hiển thị gợi ý chung tộc/hệ của cả đội.';
}
function renderBuilderPool(){
  const query=teamState.search.toLowerCase();
  const options=roster.filter(u=>(teamState.cost==='all'||String(u.cost)===teamState.cost)
    &&(!query||(u.name+' '+u.traits.join(' ')).toLowerCase().includes(query)));
  $('builderPoolCount').textContent=options.length+' / '+roster.length+' TƯỚNG';
  const pool=$('builderPool');pool.replaceChildren();
  if(!options.length){pool.append(el('p','builder-empty-pool','Không có tướng phù hợp.'));return}
  for(const unit of options){
    const hint=teamHint(unit),already=teamState.ids.includes(unit.id);
    const button=el('button','builder-pick cost-'+unit.cost+' is-'+hint.kind+(already?' is-in-team':''));
    button.type='button';button.title=unit.name+' · '+unit.cost+' vàng · '+unit.traits.join(', ')+'\n'+hint.why;
    button.setAttribute('aria-label',(already?'Xem ':'Thêm ')+unit.name+' · '+hint.why);
    button.dataset.unitId=unit.id;
    const frame=el('span','builder-pick-image-wrap');const image=el('img');
    image.src=imgs[unit.id];image.alt='';image.loading='lazy';frame.append(image);
    if(already)frame.append(el('span','builder-pick-badge','✓'));
    else if(unit.id===TEAM_BARON)frame.append(el('span','builder-pick-badge','2'));
    button.append(frame,el('span','builder-pick-name',unit.name));
    button.onclick=()=>teamAdd(unit);pool.append(button);
  }
}
function teamTraitTier(name,trait,count){
  if(trait.kind==='solo')return {style:'unique',label:'ĐỘC NHẤT'};
  if(name==='K/DA')return {style:'special',label:'THEO CẤP SAO'};
  const milestones=String(trait.levels||'').split('/').map(x=>x.trim())
    .filter(x=>/^\d+$/.test(x)).map(Number);
  const reached=milestones.filter(x=>count>=x).length;
  if(!reached)return {style:'inactive',label:'CHƯA KÍCH'};
  const tiers=['bronze','silver','gold','prismatic'];
  const labels=['ĐỒNG','BẠC','VÀNG','KIM CƯƠNG'];
  const index=Math.min(reached-1,tiers.length-1);
  return {style:tiers[index],label:labels[index]};
}
function renderBuilderSynergies(){
  const panel=$('builderSynergies');panel.replaceChildren();
  const team=teamUnits();
  if(!team.length){panel.append(el('p','builder-no-synergies','Thêm một tướng để xem tộc/hệ của đội.'));return}
  const counts=new Map();
  for(const unit of team)for(const trait of unit.traits){
    if(!counts.has(trait))counts.set(trait,new Set());
    counts.get(trait).add(unit.id);
  }
  const entries=[...counts].sort((a,b)=>b[1].size-a[1].size||a[0].localeCompare(b[0]));
  for(const [name,ids] of entries){
    const trait=traitInfo[name];
    if(!trait)continue;
    const count=ids.size,tier=teamTraitTier(name,trait,count);
    const isOpen=teamState.openTraits.has(name);
    const row=el('section','builder-synergy tier-'+tier.style+(isOpen?' is-open':''));
    const toggle=el('button','builder-synergy-toggle');toggle.type='button';
    toggle.setAttribute('aria-expanded',String(isOpen));
    toggle.setAttribute('aria-label',(isOpen?'Thu gọn':'Xem')+' tướng thuộc '+name);
    const badge=el('span','builder-synergy-icon');const image=el('img');
    image.src=traitIcons[name]||iconURL(name);image.alt='';image.loading='lazy';badge.append(image);
    const info=el('span','builder-synergy-info'),header=el('span','builder-synergy-head');
    header.append(el('strong','',name),el('b','',String(count)));
    const levels=trait.kind==='solo'?'Độc nhất':name==='K/DA'?'Mốc sao: '+trait.levels:'Mốc: '+(trait.levels||'–');
    info.append(header,el('span','builder-synergy-levels',levels));
    const side=el('span','builder-synergy-side');
    side.append(el('span','builder-synergy-tier',tier.label),el('span','builder-synergy-chevron',isOpen?'⌃':'⌄'));
    toggle.append(badge,info,side);
    toggle.onclick=()=>{
      if(teamState.openTraits.has(name))teamState.openTraits.delete(name);
      else teamState.openTraits.add(name);
      renderBuilderSynergies();
    };
    row.append(toggle);
    if(isOpen){
      const expanded=el('div','builder-trait-choices');
      expanded.setAttribute('aria-label','Các tướng thuộc '+name);
      const members=[...(traitMembers.get(name)||[])].map(id=>teamById.get(id)).filter(Boolean)
        .sort((a,b)=>Number(teamState.ids.includes(b.id))-Number(teamState.ids.includes(a.id))
          ||a.cost-b.cost||a.name.localeCompare(b.name));
      for(const unit of members){
        const chosen=teamState.ids.includes(unit.id);
        const button=el('button','builder-trait-choice cost-'+unit.cost+(chosen?' is-chosen':''));
        button.type='button';
        button.title=unit.name+' · '+unit.cost+' vàng'+(chosen?' · Đã trong đội':' · Bấm để thêm');
        button.setAttribute('aria-label',(chosen?'Đã chọn, xem gợi ý ':'Thêm ')+unit.name);
        button.dataset.unitId=unit.id;
        const photo=el('span','builder-trait-portrait');
        const portrait=el('img');portrait.src=imgs[unit.id];portrait.alt='';portrait.loading='lazy';
        photo.append(portrait);
        if(chosen)photo.append(el('span','builder-trait-chosen','✓'));
        if(unit.id===TEAM_BARON&&!chosen)photo.append(el('span','builder-trait-chosen','2'));
        button.append(photo,el('span','builder-trait-name',unit.name));
        button.onclick=()=>teamAdd(unit);
        expanded.append(button);
      }
      row.append(expanded);
    }
    panel.append(row);
  }
}

function renderBuilder(){renderBuilderLineup();renderBuilderPool();renderBuilderSynergies()}

$('builderMinus').onclick=()=>teamSetCapacity(-1);
$('builderPlus').onclick=()=>teamSetCapacity(1);
$('builderFocusAll').onclick=()=>{teamState.focus=null;renderBuilder();teamMessage('Đang gợi ý các tướng liên quan đến toàn đội.')};
$('builderSearch').oninput=e=>{teamState.search=e.target.value.trim();renderBuilderPool()};
document.querySelectorAll('[data-build-cost]').forEach(button=>button.onclick=()=>{
  teamState.cost=button.dataset.buildCost;
  document.querySelectorAll('[data-build-cost]').forEach(x=>x.classList.toggle('active',x===button));
  renderBuilderPool();
});
$('builderReset').addEventListener('click',()=>{
  if(!teamState.ids.length){
    teamMessage('Đội hình hiện đang trống.');
    return;
  }
  teamState.ids=[];
  teamState.focus=null;
  teamSave();
  renderBuilder();
  teamMessage('Đã xóa toàn bộ tướng. Giới hạn suất hiện tại vẫn được giữ.');
});
renderBuilder();
