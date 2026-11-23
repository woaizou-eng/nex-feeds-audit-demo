(() => {
  'use strict';

  const storageKey = 'biz-nex-concepts-datasets-v1';
  const initial = [
    {
      id: 'DEMO-DS-101',
      name: '信息流一审 · 城市生活图文',
      type: '图文',
      flow: '105317 内容一审',
      total: 120,
      done: 84,
      paused: false,
      at: '2026-11-23 10:15',
      operator: '演示运营',
    },
    {
      id: 'DEMO-DS-102',
      name: '信息流一审 · 家常美食短视频',
      type: '视频',
      flow: '105317 内容一审',
      total: 80,
      done: 26,
      paused: false,
      at: '2026-11-23 09:42',
      operator: '演示产品',
    },
    {
      id: 'DEMO-DS-103',
      name: '信息流一审 · 户外图文',
      type: '图文',
      flow: '105317 内容一审',
      total: 56,
      done: 18,
      paused: true,
      at: '2026-11-22 17:30',
      operator: '演示运营',
    },
    {
      id: 'DEMO-DS-104',
      name: '择优 · 旅行视频样本',
      type: '视频',
      flow: '演示择优流程',
      total: 40,
      done: 40,
      paused: false,
      at: '2026-11-22 16:10',
      operator: '演示产品',
    },
  ];
  let fallback = initial.map((row) => ({ ...row }));
  function load() {
    try {
      const cached = JSON.parse(localStorage.getItem(storageKey));
      if (
        Array.isArray(cached) &&
        cached.every((row) => row && typeof row.id === 'string' && typeof row.name === 'string')
      )
        return cached;
    } catch {}
    return fallback.map((row) => ({ ...row }));
  }
  function save(rows) {
    fallback = rows;
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {}
  }
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function status(row) {
    if (row.paused) return '已暂停';
    if (row.total > 0 && row.done === row.total) return '已完成';
    return '进行中';
  }
  function timestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return (
      now.getFullYear() +
      '-' +
      pad(now.getMonth() + 1) +
      '-' +
      pad(now.getDate()) +
      ' ' +
      pad(now.getHours()) +
      ':' +
      pad(now.getMinutes())
    );
  }
  const style = `
    .nxds{color:#20283c;font:14px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
    .nxds *{box-sizing:border-box}
    .nxds h2,.nxds h3{margin:0;font-weight:650}
    .nxds h2{font-size:20px}.nxds h3{font-size:17px}
    .nxds .ds-filters{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:16px 0}
    .nxds .ds-filter{display:flex;align-items:center;gap:7px;border:1px solid #dbe1eb;border-radius:7px;padding:0 10px;background:#fff;height:35px;color:#54637b;font-size:13px;white-space:nowrap}
    .nxds .ds-filter:focus-within{border-color:#6861ec}
    .nxds input,.nxds select{font:inherit;color:#28344b;background:transparent;border:0;min-width:0;margin:0;padding:0;box-shadow:none}
    .nxds input{width:160px}.nxds input:focus,.nxds select:focus{outline:0}
    .nxds button{font:inherit;cursor:pointer}
    .nxds .ds-button{background:#fff;border:1px solid #dbe1eb;border-radius:6px;color:#44536a;padding:6px 12px}
    .nxds .ds-count{font-size:13px;color:#67788e}
    .nxds .ds-scroll{overflow:auto}
    .nxds table{width:100%;min-width:790px;border-collapse:collapse;table-layout:auto;font-size:13px}
    .nxds th,.nxds td{text-align:left;padding:11px 10px;line-height:1.45;white-space:nowrap;height:auto}
    .nxds th{background:#f3f5f8;font-weight:600;color:#42516a}
    .nxds td{border-bottom:1px solid #edf0f5}
    .nxds td:first-child{white-space:normal;min-width:185px}.nxds td:first-child strong{font-weight:600}
    .nxds .ds-meta{display:block;color:#64758b;font-size:12px;margin-top:4px}
    .nxds .ds-status{display:inline-block;padding:2px 7px;border-radius:4px;color:#137e64;background:#eaf7f0}
    .nxds .ds-status[data-status="已暂停"]{color:#946117;background:#fff4de}.nxds .ds-status[data-status="已完成"]{color:#475d86;background:#eef3fa}
    .nxds progress{display:block;width:72px;height:5px;margin-top:5px;accent-color:#514bff}
    .nxds .ds-actions{display:flex;gap:10px;align-items:center}
    .nxds .ds-action{background:none;border:0;padding:4px 0;color:#4d43ce;white-space:nowrap;font-size:13px}
    .nxds .ds-action:hover{text-decoration:underline}
    .nxds .ds-msg{font-size:13px;color:#43506a;margin:10px 0}
    .nxds .ds-msg:empty{margin:0}
    .nxds td.ds-empty{text-align:center;color:#617187;padding:28px}
    .nxds dialog{width:min(380px,90vw);padding:20px;border:1px solid #dce1eb;border-radius:12px;color:#20283c;background:#fff;box-shadow:0 12px 45px #181d3b24}
    .nxds dialog::backdrop{background:#171c354a}
    .nxds dialog p{color:#55657b;margin:12px 0 20px;overflow-wrap:anywhere}
    .nxds .ds-dialog-actions{display:flex;justify-content:flex-end;gap:9px}
    .nxds .ds-danger{background:#bb3744;color:white;border-color:#bb3744}
  `;
  function renderDatasets(root) {
    root.innerHTML = `<style>${style}</style><section class="nxds" aria-label="数据集列表">
      <h2>数据集列表</h2>
      <form class="ds-filters" role="search">
        <label class="ds-filter">数据集<input type="search" name="query" placeholder="输入名称或 ID"></label>
        <label class="ds-filter">素材类型<select name="type"><option value="">全部</option><option>图文</option><option>视频</option></select></label>
        <label class="ds-filter">状态<select name="status"><option value="">全部</option><option>进行中</option><option>已暂停</option><option>已完成</option></select></label>
        <button class="ds-button" type="reset">重置</button><span class="ds-count" aria-live="polite"></span>
      </form>
      <div class="ds-scroll"><table><thead><tr><th>数据集名称 / ID</th><th>素材类型</th><th>所属流程</th><th>审核进度</th><th>状态</th><th>更新时间 / 操作人</th><th>操作</th></tr></thead><tbody></tbody></table></div>
      <p class="ds-msg" role="status"></p>
      <dialog aria-label="删除数据集"><form method="dialog"><h3>删除数据集？</h3><p></p><div class="ds-dialog-actions"><button value="cancel" class="ds-button" autofocus>取消</button><button value="delete" class="ds-button ds-danger">确认删除</button></div></form></dialog>
    </section>`;
    const area = root.querySelector('.nxds');
    const filters = area.querySelector('.ds-filters');
    const tbody = area.querySelector('tbody');
    const message = area.querySelector('.ds-msg');
    const dialog = area.querySelector('dialog');
    let pendingId = '';
    function draw() {
      const query = filters.elements.query.value.trim().toLocaleLowerCase();
      const rows = load().filter(
        (row) =>
          (!query || [row.name, row.id].some((value) => value.toLocaleLowerCase().includes(query))) &&
          (!filters.elements.type.value || row.type === filters.elements.type.value) &&
          (!filters.elements.status.value || status(row) === filters.elements.status.value),
      );
      area.querySelector('.ds-count').textContent = '共 ' + rows.length + ' 个数据集';
      tbody.innerHTML =
        rows
          .map((row) => {
            const state = status(row);
            const progress = row.total ? Math.round((100 * row.done) / row.total) : 0;
            const toggle =
              state === '已完成'
                ? ''
                : '<button class="ds-action" data-action="toggle">' +
                  (row.paused ? '恢复' : '暂停') +
                  '</button>';
            return `<tr data-id="${esc(row.id)}"><td><strong>${esc(row.name)}</strong><small class="ds-meta">${esc(row.id)}</small></td><td>${esc(row.type)}</td><td><span class="flow-tag">${esc(row.flow)}</span></td><td>${esc(row.done)} / ${esc(row.total)}<progress aria-label="审核进度" value="${progress}" max="100">${progress}%</progress></td><td><span class="ds-status" data-status="${state}">${state}</span></td><td>${esc(row.at)}<small class="ds-meta">${esc(row.operator)}</small></td><td><div class="ds-actions">${toggle}<button class="ds-action" data-action="copy">复制</button><button class="ds-action" data-action="delete">删除</button></div></td></tr>`;
          })
          .join('') || '<tr><td class="ds-empty" colspan="7">没有符合条件的数据集</td></tr>';
    }
    filters.oninput = draw;
    filters.onsubmit = (event) => {
      event.preventDefault();
      draw();
    };
    filters.onreset = (event) => {
      event.preventDefault();
      for (const input of filters.querySelectorAll('input,select')) input.value = '';
      message.textContent = '';
      draw();
    };
    tbody.onclick = (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = button.closest('tr').dataset.id;
      const rows = load(),
        row = rows.find((item) => item.id === id);
      if (!row) {
        draw();
        return;
      }
      if (button.dataset.action === 'delete') {
        pendingId = row.id;
        dialog.returnValue = 'cancel';
        dialog.querySelector('p').textContent = '将从演示列表移除「' + row.name + '」。';
        dialog.showModal();
        return;
      }
      if (button.dataset.action === 'toggle') {
        row.paused = !row.paused;
        row.operator = '演示运营';
        row.at = timestamp();
        message.textContent = '「' + row.name + '」已' + (row.paused ? '暂停' : '恢复') + '。';
      } else {
        const nextId = 'DEMO-DS-' + crypto.randomUUID().slice(0, 8);
        const name = row.name.replace(/ · 副本(?: \d+)?$/, '');
        let count = 1,
          label = name + ' · 副本';
        while (rows.some((item) => item.name === label)) label = name + ' · 副本 ' + ++count;
        rows.unshift({
          ...row,
          id: nextId,
          name: label,
          paused: true,
          done: 0,
          total: 0,
          operator: '演示运营',
          at: timestamp(),
        });
        message.textContent = '已复制为「' + label + '」。副本沿用原配置，待接入数据，当前已暂停。';
      }
      save(rows);
      draw();
    };
    dialog.onclose = () => {
      if (pendingId && dialog.returnValue === 'delete') {
        const rows = load(),
          row = rows.find((item) => item.id === pendingId);
        save(rows.filter((item) => item.id !== pendingId));
        if (row) message.textContent = '已删除「' + row.name + '」。';
        draw();
      }
      pendingId = '';
    };
    draw();
  }
  window.renderDatasets = renderDatasets;
})();
