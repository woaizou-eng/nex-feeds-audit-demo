(() => {
  'use strict';

  const storageKey = 'biz-nex-concepts-extra-v1';
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );
  const models = {
    graphic: {
      type: '图文',
      template: '【图文】素材质量标注模板',
      item: '图片',
      sample: '江边骑行，沿途拍下的三处转角',
      account: '沿江手记',
      parent: '基础美观不达标',
      choices: ['封面图模糊', '图片白边', '封面图牛皮癣'],
    },
    video: {
      type: '视频',
      template: '【视频】素材质量标注模板',
      item: '视频画面',
      sample: '用三分钟做一道家常蒸菜',
      account: '家常食记',
      parent: '画面质量',
      choices: ['画面模糊', '镜头抖动', '字幕遮挡'],
    },
  };
  const samples = {
    whitelist: { title: '山野徒步路线图', white: true, reviewed: false, type: '图文' },
    reviewed: { title: '家庭烘焙教程', white: false, reviewed: true, type: '视频' },
    both: { title: '城市周末展览清单', white: true, reviewed: true, type: '图文' },
    neither: { title: '海边慢跑随拍', white: false, reviewed: false, type: '视频' },
  };
  const fields = { white: '账号在白名单', reviewed: '已经编辑复核', video: '内容类型为视频' };
  const flags = { machine: '免机审', human: '免人审' };

  function defaultConfig() {
    return {
      machine: { enabled: true, condition: 'white', result: '通过', reason: '白名单账号' },
      human: { enabled: false, condition: 'reviewed', result: '通过', reason: '经编辑复核' },
    };
  }
  function initial() {
    return {
      templates: {
        graphic: { active: ['封面图模糊'], draft: ['封面图模糊'] },
        video: { active: ['画面模糊'], draft: ['画面模糊'] },
      },
      media: 'graphic',
      view: 'edit',
      answers: {},
      mode: 'only',
      sample: 'whitelist',
      modes: {
        only: { draft: defaultConfig(), saved: null, last: null },
        regular: { draft: defaultConfig(), saved: null, last: null },
      },
    };
  }
  function restore() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      if (data?.templates?.graphic && data?.templates?.video && data?.modes?.only && data?.modes?.regular)
        return data;
    } catch {}
    return initial();
  }
  let state = restore();
  let liveRoot = null;
  let currentTab = '';
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }

  const css = `
  .nxw{color:#27324b;font-size:14px;line-height:1.55;min-width:0}
  .nxw *{box-sizing:border-box}
  .nxw h3,.nxw h4,.nxw p{margin:0}
  .nxw h3{font-size:17px;font-weight:650;color:#182441;line-height:1.4}
  .nxw h4{font-size:14px;font-weight:630;color:#24304a}
  .nxw button,.nxw input,.nxw select{font:inherit}
  .nxw button,.nxw input[type=checkbox],.nxw input[type=radio],.nxw select{cursor:pointer}
  .nxw .nx-card{background:#fff;border:1px solid #dee3ee;border-radius:12px;padding:22px;min-width:0}
  .nxw.nx-stack,.nxw .nx-stack{display:grid;gap:15px}
  .nxw .nx-flex,.nxw .nx-head,.nxw .nx-chips,.nxw .nx-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
  .nxw .nx-head{justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}
  .nxw .nx-dim{color:#65738c;font-size:13px}
  .nxw .nx-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;border:1px solid #d5dbea;border-radius:7px;padding:5px 12px;background:#fff;color:#35415a;font-weight:550;line-height:1.4}
  .nxw .nx-btn:hover{background:#f6f7fc;border-color:#a1a7cf}
  .nxw .nx-btn:focus-visible,.nxw select:focus-visible,.nxw input:focus-visible,.nxw summary:focus-visible,.nxw button:focus-visible{outline:2px solid #575fe5;outline-offset:2px}
  .nxw .nx-primary{color:#fff;background:#554ee5;border-color:#554ee5}
  .nxw .nx-primary:hover{color:#fff;background:#463dcc;border-color:#463dcc}
  .nxw .nx-btn:disabled{opacity:.48;cursor:not-allowed}
  .nxw .nx-seg{display:inline-flex;border:1px solid #dce1ef;background:#f4f6fa;padding:3px;border-radius:9px;gap:2px;flex-wrap:wrap}
  .nxw .nx-seg button{border:1px solid transparent;border-radius:6px;min-height:31px;background:transparent;color:#61708c;padding:4px 13px;line-height:1.25}
  .nxw .nx-seg button[aria-pressed=true]{background:#fff;color:#4741c8;border-color:#d8daed;font-weight:650;box-shadow:0 1px 3px #2326630d}
  .nxw .nx-inline-tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:4px;background:#eff1ff;color:#4e47c4;font-size:12px;font-weight:600}
  .nxw .nx-samples{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .nxw .nx-sample{display:grid;gap:6px;line-height:1.45;text-align:left;border:1px solid #dce2ed;border-radius:8px;background:#fff;color:#28344c;padding:11px 13px;min-width:0}
  .nxw .nx-sample[aria-pressed=true]{border-color:#827de9;background:#f6f5ff;box-shadow:inset 0 0 0 1px #827de9}
  .nxw .nx-subtle{font-size:12px;color:#64728a}
  .nxw .nx-divider{border-top:1px solid #e6e9f1;padding-top:16px;margin-top:16px}
  .nxw .nx-choices{display:flex;gap:8px;flex-wrap:wrap;padding:10px 0 4px}
  .nxw .nx-check{display:inline-flex;align-items:center;gap:7px;font-weight:500;background:#f8f9fc;padding:6px 10px;border:1px solid #e0e5ef;border-radius:6px;cursor:pointer}
  .nxw .nx-check:has(input:checked){background:#f0efff;border-color:#b5b1ed;color:#453fbd}
  .nxw input[type=checkbox],.nxw input[type=radio]{accent-color:#554ee5;margin:0;width:15px;height:15px;flex:none}
  .nxw .nx-note{color:#586786;background:#f4f6fb;border-left:3px solid #c6cde0;padding:9px 12px;font-size:13px;border-radius:0 5px 5px 0}
  .nxw .nx-note b{color:#33435f}
  .nxw .nx-actions{margin-top:16px}
  .nxw .nx-green{color:#18765d;background:#e9f7f1}
  .nxw .nx-field{display:grid;gap:5px;color:#53617a;font-size:13px;min-width:0}
  .nxw select,.nxw input[type=text]{width:100%;min-width:0;max-width:100%;border:1px solid #d9dfeb;border-radius:6px;min-height:35px;background:#fff;color:#29344d;padding:5px 9px}
  .nxw .nx-config{border-top:1px solid #e5e9f0;padding-top:13px;margin-top:13px}
  .nxw .nx-config:first-child{border-top:0;margin-top:0;padding-top:0}
  .nxw .nx-toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-weight:620}
  .nxw .nx-formgrid{display:grid;grid-template-columns:1.15fr .73fr 1.35fr;gap:12px;margin-top:10px}
  .nxw .nx-route{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}
  .nxw .nx-stage{padding:11px 13px;border:1px solid #e0e5f0;border-radius:8px}
  .nxw .nx-stage strong{font-size:16px;margin:3px 0;display:block}
  .nxw .nx-status{font-size:13px;color:#4c4776}
  .nxw .nx-work{background:#f8f9fc;border:1px solid #e0e5ef;border-radius:8px;padding:15px;display:grid;gap:7px}
  .nxw .nx-work strong{font-size:18px}
  .nxw .nx-tree{border-left:2px solid #d8d8f1;margin:8px 0 0 7px;padding:3px 0 3px 15px}
  .nxw .nx-task-result{font-weight:600;color:#36426b}
  @media(max-width:670px){.nxw .nx-card{padding:14px}.nxw .nx-formgrid{grid-template-columns:1fr 1fr}.nxw .nx-formgrid label:last-child{grid-column:1/-1}.nxw .nx-route,.nxw .nx-samples{grid-template-columns:1fr}.nxw .nx-stage{padding:9px 11px}}
  `;
  function addStyle() {
    if (document.getElementById('biz-nex-concept-extra-style')) return;
    const style = document.createElement('style');
    style.id = 'biz-nex-concept-extra-style';
    style.textContent = css;
    document.head.append(style);
  }
  const opt = (value, label, selected) =>
    '<option value="' +
    escape(value) +
    '"' +
    (value === selected ? ' selected' : '') +
    '>' +
    escape(label) +
    '</option>';
  const segment = (action, options, selected) =>
    '<div class="nx-seg">' +
    options
      .map(
        ([id, label]) =>
          '<button type="button" data-' +
          action +
          '="' +
          id +
          '" aria-pressed="' +
          (id === selected) +
          '">' +
          label +
          '</button>',
      )
      .join('') +
    '</div>';
  function eventButtons(root, attr, handle) {
    root
      .querySelectorAll('[' + attr + ']')
      .forEach((el) => el.addEventListener('click', () => handle(el.getAttribute(attr))));
  }
  function redraw() {
    persist();
    if (liveRoot && liveRoot.isConnected) draw(currentTab, liveRoot);
  }
  function templatePage(root) {
    const key = state.media,
      model = models[key],
      config = state.templates[key],
      preview = state.view === 'preview';
    const ans = state.answers[key] || { parent: false, picked: [] };
    const selectedTemplate = config.templateDraft || key;
    const compatible = selectedTemplate === key;
    const different =
      !compatible ||
      model.choices.some((value) => config.active.includes(value) !== config.draft.includes(value));
    const sourceSamples = Object.entries(models)
      .map(
        ([k, m]) =>
          '<button type="button" class="nx-sample" aria-pressed="' +
          (key === k) +
          '" data-media="' +
          k +
          '"><span><b>' +
          m.type +
          '</b>　' +
          m.sample +
          '</span><span class="nx-subtle">匹配模板　' +
          m.template +
          '</span></button>',
      )
      .join('');
    const templateField =
      '<label class="nx-field">内容一审 · ' +
      model.type +
      '任务的作业模板<select data-template-id>' +
      Object.entries(models)
        .map(([k, m]) => opt(k, m.template, selectedTemplate))
        .join('') +
      '</select></label>';
    const editor =
      templateField +
      (!compatible
        ? '<div class="nx-actions nx-note" role="alert">当前数据为' +
          model.type +
          '，所选模板需要' +
          models[selectedTemplate].type +
          '样本。请切回对应模板，已保存的配置仍可预览。</div>'
        : '<div class="nx-divider"><h4>' +
          model.item +
          '题　›　一级标签　' +
          model.parent +
          '</h4><div class="nx-tree"><span class="nx-dim">添加到本题的二级标签</span><div class="nx-choices">' +
          model.choices
            .map(
              (value) =>
                '<label class="nx-check"><input type="checkbox" data-label="' +
                value +
                '" ' +
                (config.draft.includes(value) ? 'checked' : '') +
                '>' +
                value +
                '</label>',
            )
            .join('') +
          '</div></div></div>') +
      '<div class="nx-actions"><button type="button" class="nx-btn nx-primary" data-save-template ' +
      (compatible ? '' : 'disabled') +
      '>保存并预览作业</button>' +
      '<span class="nx-dim">仅更新' +
      model.type +
      '模板' +
      (different ? ' · 有待保存修改' : '') +
      '</span></div>';
    const viewer =
      '<div class="nx-work"><span class="nx-subtle">' +
      model.type +
      '作业　·　' +
      model.account +
      '</span><strong>' +
      model.sample +
      '</strong><span class="nx-subtle">' +
      model.template +
      '</span></div>' +
      '<div class="nx-divider"><h4>' +
      model.item +
      '题 · 请选择问题标签</h4><div class="nx-choices"><label class="nx-check"><input type="checkbox" data-parent ' +
      (ans.parent ? 'checked' : '') +
      '>' +
      model.parent +
      '</label></div>' +
      (ans.parent && config.active.length
        ? '<div class="nx-tree"><span class="nx-dim">二级标签</span><div class="nx-choices">' +
          config.active
            .map(
              (value) =>
                '<label class="nx-check"><input type="checkbox" data-answer="' +
                value +
                '" ' +
                (ans.picked.includes(value) ? 'checked' : '') +
                '>' +
                value +
                '</label>',
            )
            .join('') +
          '</div></div>'
        : '<p class="nx-dim">' +
          (ans.parent ? '本题仅配置了一级标签。' : '勾选一级标签后，可查看本题配置的二级标签。') +
          '</p>') +
      '</div>';
    root.innerHTML =
      '<div class="nxw nx-stack"><section class="nx-card"><div class="nx-head"><h3>样本与模板</h3><span class="nx-dim">105317 · 图文与视频混合送审</span></div><div class="nx-samples">' +
      sourceSamples +
      '</div></section><section class="nx-card"><div class="nx-head"><h3>' +
      (preview ? '审核员作业预览' : '题目与标签配置') +
      '</h3>' +
      segment(
        'template-view',
        [
          ['edit', '配置标签'],
          ['preview', '作业预览'],
        ],
        state.view,
      ) +
      '</div>' +
      (preview ? viewer : editor) +
      '</section></div>';

    eventButtons(root, 'data-media', (value) => {
      state.media = value;
      redraw();
    });
    eventButtons(root, 'data-template-view', (value) => {
      state.view = value;
      redraw();
    });
    const templateSelect = root.querySelector('[data-template-id]');
    if (templateSelect)
      templateSelect.onchange = () => {
        config.templateDraft = templateSelect.value;
        redraw();
        root.querySelector('[data-template-id]').focus();
      };
    root.querySelectorAll('[data-label]').forEach(
      (input) =>
        (input.onchange = () => {
          config.draft = model.choices.filter((value) =>
            value === input.dataset.label ? input.checked : config.draft.includes(value),
          );
          redraw();
          Array.from(root.querySelectorAll('[data-label]'))
            .find((el) => el.dataset.label === input.dataset.label)
            ?.focus();
        }),
    );
    const save = root.querySelector('[data-save-template]');
    if (save)
      save.onclick = () => {
        config.active = [...config.draft];
        if (state.answers[key])
          state.answers[key].picked = state.answers[key].picked.filter((value) =>
            config.active.includes(value),
          );
        state.view = 'preview';
        redraw();
      };
    const parent = root.querySelector('[data-parent]');
    if (parent)
      parent.onchange = () => {
        state.answers[key] = { parent: parent.checked, picked: parent.checked ? ans.picked : [] };
        redraw();
        root.querySelector('[data-parent]').focus();
      };
    root.querySelectorAll('[data-answer]').forEach(
      (input) =>
        (input.onchange = () => {
          state.answers[key] = {
            parent: true,
            picked: Array.from(root.querySelectorAll('[data-answer]:checked')).map((el) => el.dataset.answer),
          };
          persist();
        }),
    );
  }
  function matches(condition, sample) {
    if (condition === 'video') return sample.type === '视频';
    return Boolean(sample[condition]);
  }
  function evaluateStage(rule, sample) {
    if (!rule.enabled) return { hit: false, value: '—', detail: '本环节免审未开启' };
    if (!matches(rule.condition, sample))
      return { hit: false, value: '—', detail: '未命中 · ' + fields[rule.condition] };
    return { hit: true, value: rule.result, detail: '命中 · ' + rule.reason };
  }
  function run(mode, config, sampleId) {
    const sample = samples[sampleId];
    const machine = evaluateStage(config.machine, sample);
    const human = evaluateStage(config.human, sample);
    const record = { sampleId, machine, human, final: '尚无最终结果', waiting: false, destination: '' };
    if (mode === 'only') {
      record.destination =
        machine.hit || human.hit
          ? '本条数据在当前任务已结束，后续可由其他任务承接。'
          : '未命中任何免审条件，记录保留未分配。';
      return record;
    }
    if (!machine.hit) {
      machine.detail += ' → 执行普通机审';
      machine.value = '通过（模拟算子）';
    }
    if (human.hit) {
      record.final = human.value;
      record.destination = '本任务已完成，按本例拟合规则采用人审环节结果。';
    } else {
      human.detail += ' → 派给审核员';
      human.value = '待人审';
      record.waiting = true;
      record.destination = '已进入本任务的人审队列，等待审核员处理。';
    }
    return record;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function configBox(key, config, regular) {
    const rule = config[key];
    const section = regular ? (key === 'machine' ? '机审节点' : '标注节点') + '　›　' : '';
    return (
      '<div class="nx-config"><label class="nx-toggle"><input type="checkbox" data-enable="' +
      key +
      '" ' +
      (rule.enabled ? 'checked' : '') +
      '>' +
      section +
      flags[key] +
      '</label>' +
      (rule.enabled
        ? '<div class="nx-formgrid"><label class="nx-field">命中条件<select data-key="' +
          key +
          '" data-prop="condition">' +
          Object.entries(fields)
            .map(([id, label]) => opt(id, label, rule.condition))
            .join('') +
          '</select></label>' +
          '<label class="nx-field">写入' +
          (key === 'machine' ? '机审' : '人审') +
          '结果<select data-key="' +
          key +
          '" data-prop="result">' +
          ['通过', '不通过'].map((value) => opt(value, value, rule.result)).join('') +
          '</select></label><label class="nx-field">免审理由<input required maxlength="60" type="text" data-key="' +
          key +
          '" data-prop="reason" value="' +
          escape(rule.reason) +
          '"></label></div>'
        : '') +
      '</div>'
    );
  }
  function resultBox(record, regular) {
    const stageHTML = (item, label) =>
      '<div class="nx-stage"><span class="nx-dim">' +
      label +
      '</span><strong>' +
      escape(item.value) +
      '</strong><span class="nx-subtle">' +
      escape(item.detail) +
      '</span></div>';
    return (
      '<div class="nx-divider" aria-live="polite"><div class="nx-head"><h4>试运行结果　' +
      samples[record.sampleId].title +
      '</h4></div><div class="nx-route">' +
      stageHTML(record.machine, '机审环节') +
      stageHTML(record.human, '人审环节') +
      '</div><p class="nx-task-result">' +
      escape(record.destination) +
      '</p><p class="nx-dim">最终审核结果　' +
      escape(record.final) +
      '</p>' +
      (regular && record.waiting
        ? '<div class="nx-actions">模拟人工提交<button class="nx-btn" data-human="通过">人审通过</button>' +
          '<button class="nx-btn" data-human="不通过">人审不通过</button></div>'
        : '') +
      '</div>'
    );
  }
  function exemptionPage(root) {
    const regular = state.mode === 'regular',
      record = state.modes[state.mode];
    const { draft, saved, last } = record,
      sample = samples[state.sample];
    const ready = Boolean(saved && same(draft, saved));
    root.innerHTML =
      '<div class="nxw nx-stack"><section class="nx-card"><div class="nx-head"><h3>审核方式</h3>' +
      segment(
        'mode',
        [
          ['only', '仅免审任务'],
          ['regular', '常规审核任务'],
        ],
        state.mode,
      ) +
      '</div><p class="nx-note">' +
      (regular
        ? '节点内优先判断免审条件。未命中时继续本任务的普通审核。'
        : '<b>讨论方案</b>　独立建任务，可分别配置免机审和免人审。命中后写对应环节结果。') +
      '</p>' +
      '<form class="nx-config" data-config><div>' +
      configBox('machine', draft, regular) +
      configBox('human', draft, regular) +
      '</div>' +
      '<div class="nx-actions"><button type="submit" class="nx-btn nx-primary">提交任务配置</button><span data-state class="nx-status" role="status">' +
      (ready ? '当前配置已提交' : saved ? '修改后待重新提交' : '尚未提交') +
      '</span></div></form></section>' +
      '<section class="nx-card"><div class="nx-head"><h3>送一条样本</h3><span class="nx-dim">' +
      (regular ? '本例拟合采用人审环节结果' : '仅记录命中的环节结果') +
      '</span></div>' +
      '<label class="nx-field">模拟送审记录<select data-sample>' +
      Object.entries(samples)
        .map(([id, s]) => opt(id, s.title + '　·　' + s.type, state.sample))
        .join('') +
      '</select></label>' +
      '<div class="nx-actions"><span class="nx-inline-tag">' +
      (sample.white ? '白名单账号' : '普通账号') +
      '</span><span class="nx-inline-tag">' +
      (sample.reviewed ? '已经编辑复核' : '未经编辑复核') +
      '</span></div><div class="nx-actions"><button type="button" class="nx-btn nx-primary" data-run ' +
      (ready ? '' : 'disabled') +
      '>送样本试运行</button><span class="nx-dim" data-run-hint>' +
      (ready ? '' : '先提交上方配置') +
      '</span></div>' +
      (last && ready && last.sampleId === state.sample ? resultBox(last, regular) : '') +
      '</section></div>';

    eventButtons(root, 'data-mode', (value) => {
      state.mode = value;
      redraw();
    });
    root.querySelectorAll('[data-enable]').forEach(
      (input) =>
        (input.onchange = () => {
          draft[input.dataset.enable].enabled = input.checked;
          redraw();
          root.querySelector('[data-enable="' + input.dataset.enable + '"]').focus();
        }),
    );
    root.querySelectorAll('[data-prop]').forEach((input) => {
      const update = () => {
        draft[input.dataset.key][input.dataset.prop] = input.value;
        record.last = null;
        const submitted = Boolean(record.saved && same(record.draft, record.saved));
        root.querySelector('[data-state]').textContent = submitted ? '当前配置已提交' : '尚待提交';
        root.querySelector('[data-run]').disabled = !submitted;
        root.querySelector('[data-run-hint]').textContent = submitted ? '' : '先提交上方配置';
        const lastResult = root.querySelector('[aria-live="polite"]');
        if (lastResult) lastResult.remove();
        persist();
      };
      input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', update);
    });
    root.querySelector('[data-config]').onsubmit = (event) => {
      event.preventDefault();
      if (!regular && !draft.machine.enabled && !draft.human.enabled) {
        root.querySelector('[data-state]').textContent = '至少开启一组免审规则后才能提交。';
        return;
      }
      for (const key of Object.keys(flags)) {
        if (draft[key].enabled && !draft[key].reason.trim()) {
          const reason = root.querySelector('[data-key="' + key + '"][data-prop="reason"]');
          reason.focus();
          root.querySelector('[data-state]').textContent = '请填写' + flags[key] + '理由。';
          return;
        }
      }
      record.saved = structuredClone(draft);
      record.last = null;
      redraw();
      root.querySelector('[data-run]').focus();
    };
    root.querySelector('[data-sample]').onchange = (event) => {
      state.sample = event.target.value;
      redraw();
    };
    root.querySelector('[data-run]').onclick = () => {
      if (!saved || !same(saved, draft)) return;
      record.last = run(state.mode, saved, state.sample);
      redraw();
    };
    eventButtons(root, 'data-human', (value) => {
      if (!regular || !record.last?.waiting) return;
      record.last.human.value = value;
      record.last.human.detail = '审核员已提交 · 本地模拟';
      record.last.waiting = false;
      record.last.final = value;
      record.last.destination = '本任务已完成，按本例拟合规则采用人审环节结果。';
      redraw();
    });
  }
  function draw(tabName, root) {
    addStyle();
    currentTab = tabName;
    liveRoot = root;
    if (tabName === 'template') templatePage(root);
    else if (tabName === 'exemption') exemptionPage(root);
  }
  window.renderExtra = draw;
  window.resetConceptScenarios = () => {
    state = initial();
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    if (liveRoot && liveRoot.isConnected) draw(currentTab, liveRoot);
  };
})();
