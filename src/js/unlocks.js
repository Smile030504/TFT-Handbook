function renderUnlock(u){
  const dialog=$('details'), panel=$('unlockPanel');
  dialog.classList.toggle('unlock-expanded',Boolean(u.locked));
  panel.hidden=!u.locked;
  if(!u.locked)return;
  const rule=unlockRules[u.id];
  panel.replaceChildren();
  const title=el('div','unlock-titleline');
  title.append(el('span','unlock-eyebrow','🔒 CÁCH MỞ KHÓA'));
  title.append(el('span','unlock-level',rule.level?'YÊU CẦU CẤP '+rule.level:'KHÔNG YÊU CẦU CẤP TỐI THIỂU'));
  panel.append(title,el('p','unlock-statement',rule.text));
  const flow=el('div','unlock-flow'),start=el('div','unlock-start'),nodes=el('div','unlock-nodes');
  if(rule.nodes.length>=3)flow.classList.add('has-multiple','has-many');
  else if(rule.nodes.length>1)flow.classList.add('has-multiple');
  const captions=[];
  rule.nodes.forEach((n,i)=>{
    if(i>0)nodes.append(el('div','unlock-join',rule.join==='hoặc'?'HOẶC':'VÀ'));
    const card=el('div','unlock-node'),visual=el('div','unlock-node-visual'+(n.type==='trait'?' trait-visual':''));
    if(n.type==='unit'){
      const source=roster.find(v=>v.name===n.name);
      if(source){const img=el('img');img.src=imgs[source.id];img.alt=n.name;visual.append(img)}else visual.textContent='♟';
    }else if(n.type==='trait'){
      const im=el('img');im.src=traitIcons[n.name]||iconURL(n.name);im.alt='Icon '+n.name;
      im.onerror=()=>{im.remove();visual.textContent=fallbackIcon(n.name)};
      visual.append(im);
    }else visual.textContent=n.icon||'✦';
    card.append(visual,el('div','unlock-node-name',n.name));
    // Replace the numerical 2★ / 3★ badge by actual stars under the champion.
    const matched=n.type==='unit' ? (n.label||'').match(/(?:^|\s)([1-3])★/) : null;
    if(matched){card.append(el('div','unlock-node-stars','★'.repeat(Number(matched[1]))));}
    const clean=(n.label||'').replace(/(?:^|\s)[1-3]★\s*(?:[·•]\s*)?/,'').trim();
    if(clean)captions.push(clean);
    nodes.append(card);
  });
  start.append(nodes);
  // The item or action requirement is centered immediately above a long arrow.
  const link=el('div','unlock-link');
  const unique=[...new Set(captions)];
  const arrowLabel=unique.length ? unique.join(rule.join==='hoặc'?' / ':' · ') : 'Hoàn thành yêu cầu';
  link.append(el('div','unlock-arrow-label',arrowLabel),el('div','unlock-arrow-line'));
  flow.append(start,link);
  const target=el('div','unlock-target'),im=el('img');im.src=imgs[u.id];im.alt=u.name;
  target.append(im,el('b','',u.name),el('span','','🔓 SAU KHI HOÀN THÀNH'));
  flow.append(target);panel.append(flow);
  if(rule.hint)panel.append(el('p','unlock-help','LƯU Ý: '+rule.hint));
  const source=el('a','unlock-source','Nguồn điều kiện: Mobalytics · 18/11/2026');source.href=unlockSource;source.target='_blank';source.rel='noopener noreferrer';panel.append(source);
}
