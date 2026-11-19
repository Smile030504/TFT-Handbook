// Chỉ dữ liệu Bias, không trộn vào mô tả kỹ năng gốc.
// Nguồn tham khảo: tactics.tools/info/set-update (PBE mùa 19).
const heartsteelBiasByName = Object.freeze({
  Kayn: 'Khi máu còn 70%, hóa Sát Thủ Bóng Tối, tạm thời không thể bị chọn làm mục tiêu và gây thêm 35% sát thương phép trong phần còn lại của giao tranh.',
  Sett: 'Cứ mỗi 4 giây hồi 4% máu tối đa; lượng hồi tăng theo lượng máu đã mất, tối đa gấp đôi.',
  Ezreal: 'Vụ nổ gây thêm 25% sát thương; cứ mỗi lần tung chiêu thứ ba, vụ nổ tác động trong phạm vi 2 ô.',
  "K'Sante": 'Nhận 25 Giáp và 25 Kháng Phép; đòn đánh gây thêm sát thương vật lý theo Giáp và Kháng Phép.',
  Alune: 'Bắn thêm 5 luồng sáng vào mục tiêu, gây sát thương phép.',
  Yone: 'Kỹ năng chém thêm 2 lần và bỏ qua 25% Giáp của mục tiêu.',
  Aphelios: 'Bắt đầu giao tranh với sẵn 5 Chakram.'
});

function renderHeartsteelBias(unit, skill) {
  const panel = $('dheartsteel');
  const description = $('dheartsteelText');
  const name = unit.name.replace(/[\u2018\u2019]/g, "'").trim();
  const isHeartsteel = unit.traits.some(trait => trait.toLowerCase() === 'heartsteel');
  const bias = isHeartsteel
    ? (skill.heartsteelBias || heartsteelBiasByName[name] || '')
    : '';

  description.textContent = bias;
  panel.hidden = !bias;
}

function showCard(u){selectedUnit=u;const dg=$('details');$('dimage').src=imgs[u.id];$('dname').textContent=u.name;$('dmeta').textContent=u.cost+' VÀNG · '+roleVi[u.role]+' '+(u.damage==='Magic'?'PHÉP':'VẬT LÝ');$('dlock').textContent=u.locked?'🔒 CẦN MỞ KHÓA':'✓ CÓ SẴN TRONG CỬA HÀNG';renderUnlock(u);const sk=skills[u.id];$('dskillmana').textContent='Năng lượng: '+sk.mana;$('dskillsummary').textContent=sk.summary;$('dskillkey').textContent=sk.key;renderHeartsteelBias(u,sk);$('dtraits').replaceChildren(...u.traits.map(traitChip));$('deffects').replaceChildren(...(u.effects.length?u.effects.map(effChip):[el('span','dtext','Không có hiệu ứng nằm trong bộ lọc hiện tại')]));$('deffectnote').textContent=u.effects.map(k=>defs[k].desc).join(' ');
if(!dg.open)dg.showModal()}
function card(u){const c=el('article','card'),p=el('div','pic'),im=el('img');im.src=imgs[u.id];im.alt=u.name;im.loading='lazy';p.append(im,el('span','cost',u.cost+' VÀNG'));if(u.locked){const lk=el('span','lock');lk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> KHÓA';p.append(lk)}p.onclick=()=>showCard(u);
const body=el('div','cardbody');body.append(el('h3','cardname',u.name),el('div','meta',roleVi[u.role]+' · '+(u.damage==='Magic'?'Phép':'Vật lý')));const tl=el('div','traitline');u.traits.forEach(t=>tl.append(traitChip(t)));body.append(tl);if(u.effects.length){const tags=el('div','tags');u.effects.forEach(k=>tags.append(effChip(k)));body.append(tags)}const acts=el('div','actions'),btn=el('button','smallbtn',u.locked?'🔒 XEM CÁCH MỞ KHÓA':'XEM KỸ NĂNG · TỘC/HỆ');btn.onclick=()=>showCard(u);acts.append(btn);body.append(acts);c.append(p,body);return c}


const costLevels = [...new Set(
  roster.map(unit => unit.cost)
)].sort((a, b) => a - b);


function updateCostButtons() {
  document.querySelectorAll('#quicknav [data-cost]')
    .forEach(button => {
      const value = button.dataset.cost;

      const active = value === 'all'
        ? ui.costs.length === 0
        : ui.costs.includes(Number(value));

      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
}


function initCostFilters() {
  const container = $('quicknav');

  container.setAttribute(
    'aria-label',
    'Lọc theo giá vàng'
  );

  container.replaceChildren();

  function addCostButton(value, label) {
    const button = el('button', 'cost-filter-btn', label);

    button.type = 'button';
    button.dataset.cost = String(value);

    button.onclick = () => {
      if (value === 'all') {
        ui.costs = [];

      } else if (ui.costs.includes(value)) {
        ui.costs = ui.costs.filter(
          cost => cost !== value
        );

      } else {
        ui.costs.push(value);
      }

      updateCostButtons();
      render();
    };

    container.append(button);
  }

  addCostButton('all', 'TẤT CẢ');

  
costLevels.forEach(cost => {
  addCostButton(
    cost,
    `${cost} VÀNG`
  );
});

  updateCostButtons();
}


initCostFilters();


function render() {
  const arr = roster.filter(matched);


  $('status').textContent =
    'Đang hiển thị ' + arr.length + ' / ' +
    roster.length + ' tướng' +
    (ui.locked ? ' · Chỉ tướng khóa' : '');

  $('board').replaceChildren();

  if (!arr.length) {
    $('board').append(
      el('div', 'noresults',
        'Không có tướng phù hợp. Hãy xóa bớt bộ lọc.')
    );
    return;
  }

  function appendGroup(name, members, index, traitName = null) {
    const section = el('section', 'group');
    section.id = 'group-' + index;

    const header = el('div', 'grouphead');

    if (traitName) {
      const icon = el('img', 'filter-trait-icon');

      icon.src = traitIcons[traitName] || iconURL(traitName);
      icon.alt = '';

      icon.onerror = () => {
        icon.hidden = true;
      };

      header.append(icon);
    }

    header.append(
      el('h2', '', name),
      el('small', '', members.length + ' tướng')
    );

    section.append(header);

    if (members.length) {
      const grid = el('div', 'cards');

      members.forEach(unit => {
        grid.append(card(unit));
      });

      section.append(grid);
    } else {
      section.append(
        el('div', 'noresults',
          'Không có tướng phù hợp với các bộ lọc còn lại.')
      );
    }

    $('board').append(section);
  }

  if (ui.traits.length > 0 && ui.view === 'cost') {
    ui.traits.forEach((trait, index) => {

      const members = arr
        .filter(unit => unit.traits.includes(trait))
        .sort((a, b) =>
          a.cost - b.cost ||
          a.name.localeCompare(b.name, 'vi')
        );

      appendGroup(trait, members, index, trait);
    });

    return;
  }

  const groups = arr.reduce((result, unit) => {
    const key = groupKey(unit);

    (result[key] ??= []).push(unit);
    return result;
  }, {});

  const keys = Object.keys(groups).sort((a, b) =>
    ui.view === 'cost'
      ? Number(a) - Number(b)
      : roleOrder.indexOf(a.split('|')[0]) -
          roleOrder.indexOf(b.split('|')[0]) ||
        a.localeCompare(b)
  );

  keys.forEach((key, index) => {
    appendGroup(
      groupLabel(key),
      groups[key],
      index
    );
  });
}

function syncMultiButtons(selector, stateKey, dataKey) {
  document.querySelectorAll(selector).forEach(button => {

    const value = button.dataset[dataKey];

    const selected = value === 'all'
      ? ui[stateKey].length === 0
      : ui[stateKey].includes(value);

    button.classList.toggle('active', selected);

    button.setAttribute(
      'aria-pressed',
      String(selected)
    );
  });
}


function initMultiFilter(selector, stateKey, dataKey) {
  document.querySelectorAll(selector).forEach(button => {

    button.addEventListener('click', () => {
      const value = button.dataset[dataKey];

      if (value === 'all') {
        ui[stateKey] = [];

      } else if (ui[stateKey].includes(value)) {
        ui[stateKey] = ui[stateKey].filter(
          item => item !== value
        );

      } else {
        ui[stateKey].push(value);
      }

      syncMultiButtons(selector, stateKey, dataKey);
      render();
    });
  });

  syncMultiButtons(selector, stateKey, dataKey);
}



function initRoleFilters() {
  const container = $('roleFilters');

  const allButton = el('button', 'pill-btn active', 'Tất cả');
  allButton.type = 'button';
  allButton.dataset.role = 'all';
  container.append(allButton);

  roleOrder.forEach(role => {
    ['Attack', 'Magic'].forEach(damage => {
      const count = roster.filter(unit =>
        unit.role === role &&
        unit.damage === damage
      ).length;

      if (count === 0) return;

      const damageLabel =
        damage === 'Magic' ? 'PHÉP' : 'VẬT LÝ';

      const label =
        `${roleVi[role]} ${damageLabel} · ${count}`;

      const button = el('button', 'pill-btn', label);

      button.type = 'button';
      button.dataset.role = `${role}|${damage}`;

      container.append(button);
    });
  });
}


initRoleFilters();

initMultiFilter('[data-role]', 'roles', 'role');
initMultiFilter('[data-effect]', 'effects', 'effect');


$('onlyLocked').onchange = e => {
  ui.locked = e.target.checked;
  render();
};


$('search').oninput = e => {
  ui.search = e.target.value.trim().toLowerCase();
  render();
};


$('byCost').onclick = () => {
  ui.view = 'cost';

  $('byCost').classList.add('primary');
  $('byRole').classList.remove('primary');

  render();
};


$('byRole').onclick = () => {
  ui.view = 'role';

  $('byRole').classList.add('primary');
  $('byCost').classList.remove('primary');

  render();
};


$('reset').onclick = () => {
  ui.costs = [];
  ui.roles = [];
  ui.effects = [];
  ui.locked = false;
  ui.search = '';

  updateCostButtons();

  syncMultiButtons('[data-role]', 'roles', 'role');
  syncMultiButtons('[data-effect]', 'effects', 'effect');

  clearTraitFilters();

  $('onlyLocked').checked = false;
  $('search').value = '';

  render();
};


$('close').onclick = $('done').onclick = () => {
  $('details').close();
};

$('details').onclick = e => {
  if (e.target === $('details')) {
    $('details').close();
  }
};
