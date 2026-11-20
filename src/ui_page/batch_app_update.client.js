var BAU = {
    title: 'Batch application update',
    msgs: {},
    language: '',
    apps: [],
    selected: {},
    page: 1,
    pageSize: 50,
    maxBatch: 100,
    staleMinutes: 60,
    requiredRole: 'admin',
    batchPrefix: '',
    loadDemoData: false,
    payload: null,
    busy: false,
    batch: null,
    items: [],
    itemsPlanId: null,
    scopeToName: {},
    lastScope: null,
    watching: false,
    pollTimer: null,
    pollToken: 0,
    pollDelay: 10000,
    pollMin: 10000,
    pollMax: 60000,
    pollStep: 10000,
    pollTimeoutMs: 30000,
    pollErrors: 0,
    maxPollErrors: 5,
    pollWhenVisible: false,
    topTitle: null,
    titleObserver: null
};

/* ---------- translations ---------- */

//English text is the sys_ui_message key. Every key passed to bauT() must be listed here.
var BAU_MSG = [
    //static text in the HTML
    'Batch application update',
    'Store applications with an update compatible with build:',
    'Batch install',
    'Batch name',
    'Current app',
    'Started by',
    'Started',
    'Last update',
    'Node',
    'Plan state',
    'Execution tracker',
    'Install plan',
    'Rollback',
    'Batch items',
    'Application',
    'Version',
    'State',
    'Message',
    'Refresh',
    'Clear selection',
    'Build payload',
    'Update selected',
    'Select or clear this page',
    'Scope',
    'Available update',
    'Records per page',
    'Payload',
    'Copy JSON',
    'Details',
    'Confirm batch update',
    'The update runs on the server and cannot be stopped from this page.',
    'Cancel',
    'Update',
    //dynamic text in the client script
    'no answer within {0} s',
    'invalid response from server',
    'Loading...',
    'upgrade to {0} assigned',
    'An upgrade to {0} is assigned (glide.war.assigned differs from glide.war). Consider installing store application updates after the upgrade has finished.',
    '{0} applications still have a compatible update.',
    '{0} applications have a compatible update.',
    'Could not load applications: {0}',
    'No applications with a compatible update.',
    'Demo data',
    'Showing {0}-{1} of {2}',
    'First page',
    'Previous page',
    'Page {0}',
    'Next page',
    'Last page',
    '{0} of {1} selected',
    'A batch install is already running',
    'Limit of {0} per batch reached. Unselect another application first.',
    'Limit of {0} reached. {1} application(s) on this page were not selected.',
    'Selected all applications on this page.',
    'Cleared this page.',
    'Selection cleared.',
    'Nothing selected.',
    'Payload built for {0} applications. Update is disabled while another batch runs.',
    'Payload built for {0} applications. Review it, then click Update selected.',
    'Payload copied to clipboard.',
    'Copy failed. Select the JSON and copy it manually.',
    'Clipboard not available. Select the JSON and copy it manually.',
    'Update {0} application(s) on {1}?',
    'Load demo data',
    'Demo data will be loaded for all {0} applications.',
    'Update {0}',
    'Build the payload first.',
    'Session token (g_ck) not found. Is the UI page set to Direct?',
    'Checking for a running batch...',
    'Another batch install is running. Wait for it to finish.',
    'Could not check for a running batch: {0}',
    'Submitting batch install...',
    'No progress id in the response: {0}',
    'Submitted',
    'Batch install submitted for {0} applications.',
    'Another batch install started in the meantime. Nothing was sent.',
    'Update request failed: {0}',
    'A batch install is running, started by {0} at {1}. Update is disabled until it finishes.',
    'A batch install is running. Update is disabled until it finishes.',
    'Batch "{0}" has not updated for {1} minutes and may have stalled. Update is enabled. Check the execution tracker before starting another batch.',
    'Unknown',
    '{0} (no update for {1} min)',
    '{0} ({1} min ago)',
    '{0} applications | {1}',
    'Loading updates',
    'Stop watching',
    'Resume watching',
    'Stopped watching. The install continues on the server.',
    'Paused while the tab is in the background',
    'Last check {0} | next in {1} s',
    'Stopped watching after {0} failed checks ({1}). The install continues on the server. Click Resume watching or reload the page.',
    'Status check failed ({0}/{1}): {2}. Retrying in {3} s.',
    'Finished, last check {0}',
    'Batch finished: {0}.',
    'Open',
    'Open in Application Manager',
    //help dialog
    'How to use this page?',
    'close',
    'What this page does',
    'Lists installed store applications that have an update compatible with the family release of this instance and installs the selected updates as one CI/CD batch, run as your user.',
    'Steps',
    'Select applications in the list. The header checkbox selects or clears the current page.',
    'Click Build payload and review the JSON.',
    'Click Update selected, then check the instance and the list in the confirmation dialog.',
    'Follow the progress in the Batch install card. The list refreshes when the batch finishes.',
    'Good to know',
    'A batch holds up to {0} applications. Only one batch can run at a time. Update is disabled while another batch is running.',
    'You can reload or close the page during an install. The install continues on the server and the page resumes tracking when you open it again.',
    'A batch without progress for {0} minutes is shown as stalled and no longer blocks Update. Check the execution tracker before starting another batch.',
    'Demo data is loaded only when Load demo data is checked, for all applications in the batch. Use it on test or demo instances. The Demo data badge shows applications that already have demo data loaded.',
    'The Rollback link in the Batch install card opens the rollback context of the batch.',
    'Requires the {0} role and access to the CI/CD API.',
    'More information about the CI/CD API from ServiceNow Docs'
];

var BAU_MSG_INDEX = {};
BAU_MSG.forEach(function (key) {
    BAU_MSG_INDEX[key] = true;
});

function bauT(key, args) {
    if (!BAU_MSG_INDEX[key] && window.console) {
        console.warn('[BAU] message key not in BAU_MSG: ' + key);
    }
    var text = BAU.msgs[key] || key;
    if (args) {
        text = text.replace(/\{(\d+)\}/g, function (match, index) {
            var value = args[index];
            return value !== undefined && value !== null ? String(value) : match;
        });
    }
    return text;
}

//like bauT, but placeholders can be DOM nodes (for example bold spans)
function bauAppendTemplate(parent, key, parts) {
    var text = bauT(key);
    var re = /\{(\d+)\}/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) {
            parent.appendChild(document.createTextNode(text.substring(last, m.index)));
        }
        var part = parts[m[1]];
        if (part === undefined || part === null) {
            parent.appendChild(document.createTextNode(m[0]));
        } else if (typeof part === 'object') {
            parent.appendChild(part);
        } else {
            parent.appendChild(document.createTextNode(String(part)));
        }
        last = re.lastIndex;
    }
    if (last < text.length) {
        parent.appendChild(document.createTextNode(text.substring(last)));
    }
}

function bauApplyStaticMessages() {
    var nodes = document.querySelectorAll('[data-bau-msg]');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = bauT(nodes[i].getAttribute('data-bau-msg'));
    }
    var titled = document.querySelectorAll('[data-bau-msg-title]');
    for (var j = 0; j < titled.length; j++) {
        titled[j].title = bauT(titled[j].getAttribute('data-bau-msg-title'));
    }
}

function bauLoadMessages() {
    return bauAjax('getMessages', {
        sysparm_keys: JSON.stringify(BAU_MSG)
    }, 15000).then(function (res) {
        BAU.msgs = res.messages || {};
        BAU.language = res.language || '';
    }).catch(function () {
        //English fallback: bauT returns the key itself
        BAU.msgs = {};
    }).then(function () {
        bauApplyStaticMessages();
    });
}

/* ---------- helpers ---------- */

function bauEl(id) {
    return document.getElementById(id);
}

function bauSetStatus(msg, type) {
    var el = bauEl('bauStatus');
    el.textContent = msg || '';
    el.className = 'bau-status' + (type ? ' bau-status-' + type : '');
}

function bauSpan(text, cls) {
    var s = document.createElement('span');
    s.textContent = text || '';
    if (cls) {
        s.className = cls;
    }
    return s;
}

function bauCell(text, cls) {
    var td = document.createElement('td');
    td.textContent = text || '';
    if (cls) {
        td.className = cls;
    }
    return td;
}

function bauSetLink(id, href, text) {
    var el = bauEl(id);
    el.innerHTML = '';
    if (href) {
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = text || href;
        el.appendChild(a);
    } else {
        el.textContent = text || '-';
    }
}

//Link to the application's target version in Application Manager (Next Experience route)
function bauAppManagerLink(app) {
    var a = document.createElement('a');
    a.href = '/now/app-manager/home/app/id/' + encodeURIComponent(app.id) + '/v/' + encodeURIComponent(app.targetVersion);
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'bau-ext-link';
    a.textContent = bauT('Open') + ' \u2197';
    a.title = bauT('Open in Application Manager');
    //Opening the link must not toggle the row selection
    a.onclick = function (e) {
        e.stopPropagation();
    };
    return a;
}

function bauSelectedCount() {
    return Object.keys(BAU.selected).length;
}

function bauTotalPages() {
    return Math.max(1, Math.ceil(BAU.apps.length / BAU.pageSize));
}

function bauPageRows() {
    var start = (BAU.page - 1) * BAU.pageSize;
    return BAU.apps.slice(start, start + BAU.pageSize);
}

function bauTopDocument() {
    try {
        if (window.top && window.top !== window) {
            return window.top.document;
        }
    } catch (e) {
        //outer frame not accessible
    }
    return null;
}

//Sets "<title> | <suffix>" on the outer window, where the suffix is the shell's own title (for example "ServiceNow")
function bauApplyTopTitle(topDoc, title) {
    var current = topDoc.title || '';
    if (current === BAU.topTitle) {
        return;
    }
    var sep = current.lastIndexOf(' | ');
    var suffix = sep > -1 ? current.substring(sep + 3) : current;
    var wanted = suffix && suffix !== title ? title + ' | ' + suffix : title;
    BAU.topTitle = wanted;
    topDoc.title = wanted;
}

function bauSetTitle() {
    var title = bauT(BAU.title);
    document.title = title;

    var topDoc = bauTopDocument();
    if (!topDoc) {
        return;
    }
    bauApplyTopTitle(topDoc, title);

    //The Next UI shell sets its own title after the page loads, so let's re-apply ours
    if (window.MutationObserver && !BAU.titleObserver && topDoc.head) {
        BAU.titleObserver = new MutationObserver(function () {
            bauApplyTopTitle(topDoc, title);
        });
        BAU.titleObserver.observe(topDoc.head, {
            childList: true,
            characterData: true,
            subtree: true
        });
        var stop = function () {
            if (BAU.titleObserver) {
                BAU.titleObserver.disconnect();
                BAU.titleObserver = null;
            }
        };
        setTimeout(stop, 15000);
        window.addEventListener('pagehide', stop);
    }
}

function bauAjax(method, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
        var done = false;
        var timer = setTimeout(function () {
            if (done) {
                return;
            }
            done = true;
            reject(new Error(bauT('no answer within {0} s', [Math.round((timeoutMs || 30000) / 1000)])));
        }, timeoutMs || 30000);

        var ga = new GlideAjax('BatchAppUpdateAjax');
        ga.addParam('sysparm_name', method);
        Object.keys(params || {}).forEach(function (key) {
            ga.addParam(key, params[key]);
        });
        ga.getXMLAnswer(function (answer) {
            if (done) {
                return;
            }
            done = true;
            clearTimeout(timer);
            var res;
            try {
                res = JSON.parse(answer || '{}');
            } catch (e) {
                reject(new Error(bauT('invalid response from server')));
                return;
            }
            if (res.error) {
                reject(new Error(res.error));
                return;
            }
            resolve(res);
        });
    });
}

function bauApi(method, path, body) {
    var opts = {
        method: method,
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-UserToken': window.g_ck
        }
    };
    if (body) {
        opts.body = JSON.stringify(body);
    }
    return fetch(path, opts).then(function (resp) {
        return resp.text().then(function (text) {
            var json = null;
            try {
                json = JSON.parse(text);
            } catch (e) {
                //non-JSON body
            }
            if (!resp.ok) {
                var detail = json ? JSON.stringify(json.error || json) : text;
                throw new Error('HTTP ' + resp.status + ': ' + detail);
            }
            return json;
        });
    });
}

/* ---------- application list ---------- */

function bauLoad(doneMsg, doneType) {
    bauSetStatus(bauT('Loading...'));
    bauInvalidatePayload();
    return bauAjax('getCandidates', {}, 60000).then(function (res) {
        BAU.apps = res.apps || [];
        BAU.selected = {};
        BAU.page = 1;
        BAU.batchPrefix = res.batchPrefix || '';
        if (res.staleMinutes) {
            BAU.staleMinutes = res.staleMinutes;
        }
        if (res.requiredRole) {
            BAU.requiredRole = res.requiredRole;
        }
        var buildEl = bauEl('bauBuild');
        buildEl.textContent = res.buildLabel || res.buildName || '';
        buildEl.title = res.war || '';
        var upgradeEl = bauEl('bauUpgrade');
        var upgradeBanner = bauEl('bauUpgradeBanner');
        if (res.upgradePending) {
            upgradeEl.textContent = '\u00B7 ' + bauT('upgrade to {0} assigned', [res.assignedLabel]);
            upgradeEl.title = res.warAssigned || '';
            upgradeBanner.textContent = bauT('An upgrade to {0} is assigned (glide.war.assigned differs from glide.war). Consider installing store application updates after the upgrade has finished.', [res.assignedLabel]);
            upgradeBanner.style.display = 'block';
        } else {
            upgradeEl.textContent = '';
            upgradeEl.title = '';
            upgradeBanner.style.display = 'none';
        }
        bauRender();
        if (doneMsg) {
            bauSetStatus(doneMsg + ' ' + bauT('{0} applications still have a compatible update.', [BAU.apps.length]), doneType);
        } else {
            bauSetStatus(bauT('{0} applications have a compatible update.', [BAU.apps.length]));
        }
    }).catch(function (err) {
        bauSetStatus(bauT('Could not load applications: {0}', [err.message]), 'error');
    });
}

function bauRender() {
    bauRenderRows();
    bauRenderPager();
    bauUpdateSelectionUi();
}

function bauRenderRows() {
    var body = bauEl('bauBody');
    body.innerHTML = '';
    var rows = bauPageRows();

    if (!rows.length) {
        var trEmpty = document.createElement('tr');
        var tdEmpty = bauCell(bauT('No applications with a compatible update.'), 'bau-empty');
        tdEmpty.colSpan = 5;
        trEmpty.appendChild(tdEmpty);
        body.appendChild(trEmpty);
        return;
    }

    rows.forEach(function (app) {
        var tr = document.createElement('tr');
        if (BAU.selected[app.id]) {
            tr.className = 'bau-row-selected';
        }

        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!BAU.selected[app.id];
        cb.disabled = BAU.busy;
        cb.onclick = function (e) {
            e.stopPropagation();
            bauToggleRow(app, cb.checked, cb, tr);
        };
        var tdCheck = document.createElement('td');
        tdCheck.className = 'bau-col-check';
        tdCheck.appendChild(cb);
        tr.appendChild(tdCheck);

        var tdName = bauCell(app.name, 'bau-col-name');
        if (app.demoDataLoaded) {
            tdName.appendChild(bauSpan(bauT('Demo data'), 'bau-badge'));
        }
        tr.appendChild(tdName);
        tr.appendChild(bauCell(app.scope, 'bau-mono bau-muted'));

        var tdVer = document.createElement('td');
        tdVer.className = 'bau-mono';
        tdVer.appendChild(bauSpan(app.installedVersion, 'bau-muted'));
        tdVer.appendChild(bauSpan(' \u2192 ', 'bau-arrow'));
        tdVer.appendChild(bauSpan(app.targetVersion, 'bau-target'));
        tr.appendChild(tdVer);

        var tdLink = document.createElement('td');
        tdLink.appendChild(bauAppManagerLink(app));
        tr.appendChild(tdLink);

        tr.onclick = function () {
            if (BAU.busy) {
                return;
            }
            cb.checked = !cb.checked;
            bauToggleRow(app, cb.checked, cb, tr);
        };
        body.appendChild(tr);
    });
}

function bauRenderPager() {
    var total = BAU.apps.length;
    var pages = bauTotalPages();
    if (BAU.page > pages) {
        BAU.page = pages;
    }

    var from = total ? (BAU.page - 1) * BAU.pageSize + 1 : 0;
    var to = Math.min(BAU.page * BAU.pageSize, total);
    bauEl('bauRange').textContent = bauT('Showing {0}-{1} of {2}', [from, to, total]);

    var nav = bauEl('bauPages');
    nav.innerHTML = '';
    nav.appendChild(bauPageBtn('\u21E4', 1, BAU.page === 1, bauT('First page')));
    nav.appendChild(bauPageBtn('\u2190', BAU.page - 1, BAU.page === 1, bauT('Previous page')));

    var end = Math.min(pages, Math.max(1, BAU.page - 2) + 4);
    var start = Math.max(1, end - 4);
    for (var p = start; p <= end; p++) {
        var b = bauPageBtn(String(p), p, false, bauT('Page {0}', [p]));
        if (p === BAU.page) {
            b.className += ' bau-page-active';
        }
        nav.appendChild(b);
    }

    nav.appendChild(bauPageBtn('\u2192', BAU.page + 1, BAU.page === pages, bauT('Next page')));
    nav.appendChild(bauPageBtn('\u21E5', pages, BAU.page === pages, bauT('Last page')));
}

function bauPageBtn(label, page, disabled, title) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bau-page-btn';
    b.textContent = label;
    b.title = title;
    b.disabled = disabled;
    b.onclick = function () {
        bauGoToPage(page);
    };
    return b;
}

function bauInstallBlocked() {
    return !!(BAU.batch && BAU.batch.active && !BAU.batch.stale);
}

function bauUpdateSelectionUi() {
    var count = bauSelectedCount();
    var chip = bauEl('bauCount');
    chip.textContent = bauT('{0} of {1} selected', [count, BAU.maxBatch]);
    chip.className = 'bau-chip' + (count >= BAU.maxBatch ? ' bau-chip-full' : '');

    bauEl('bauBtnRefresh').disabled = BAU.busy;
    bauEl('bauBtnClear').disabled = BAU.busy || count === 0;
    bauEl('bauBtnPreview').disabled = BAU.busy || count === 0;
    var demo = bauEl('bauDemoData');
    demo.disabled = BAU.busy;
    demo.checked = BAU.loadDemoData;

    var install = bauEl('bauBtnInstall');
    install.disabled = BAU.busy || !BAU.payload || bauInstallBlocked();
    install.title = bauInstallBlocked() ? bauT('A batch install is already running') : '';

    var rows = bauPageRows();
    var onPage = 0;
    rows.forEach(function (app) {
        if (BAU.selected[app.id]) {
            onPage++;
        }
    });
    var head = bauEl('bauPageAll');
    head.disabled = BAU.busy;
    head.checked = rows.length > 0 && onPage === rows.length;
    head.indeterminate = onPage > 0 && onPage < rows.length;

    bauEl('bauTable').className = 'bau-table' + (BAU.busy ? ' bau-locked' : '');
}

/* ---------- paging ---------- */

function bauGoToPage(page) {
    BAU.page = Math.min(Math.max(1, page), bauTotalPages());
    bauRender();
    bauEl('bauTableWrap').scrollTop = 0;
}

function bauSetPageSize(size) {
    BAU.pageSize = parseInt(size, 10) || 50;
    BAU.page = 1;
    bauRender();
}

/* ---------- selection ---------- */

function bauToggleRow(app, checked, cb, tr) {
    if (BAU.busy) {
        cb.checked = !checked;
        return;
    }
    if (checked) {
        if (!BAU.selected[app.id] && bauSelectedCount() >= BAU.maxBatch) {
            cb.checked = false;
            bauSetStatus(bauT('Limit of {0} per batch reached. Unselect another application first.', [BAU.maxBatch]), 'warn');
            return;
        }
        BAU.selected[app.id] = true;
    } else {
        delete BAU.selected[app.id];
    }
    tr.className = checked ? 'bau-row-selected' : '';
    bauInvalidatePayload();
    bauUpdateSelectionUi();
}

function bauTogglePage(checked) {
    if (BAU.busy) {
        return;
    }
    var skipped = 0;
    bauPageRows().forEach(function (app) {
        if (!checked) {
            delete BAU.selected[app.id];
            return;
        }
        if (BAU.selected[app.id]) {
            return;
        }
        if (bauSelectedCount() >= BAU.maxBatch) {
            skipped++;
            return;
        }
        BAU.selected[app.id] = true;
    });
    bauInvalidatePayload();
    bauRenderRows();
    bauUpdateSelectionUi();

    if (skipped) {
        bauSetStatus(bauT('Limit of {0} reached. {1} application(s) on this page were not selected.', [BAU.maxBatch, skipped]), 'warn');
    } else {
        bauSetStatus(checked ? bauT('Selected all applications on this page.') : bauT('Cleared this page.'));
    }
}

function bauClearSelection() {
    if (BAU.busy) {
        return;
    }
    BAU.selected = {};
    bauInvalidatePayload();
    bauRenderRows();
    bauUpdateSelectionUi();
    bauSetStatus(bauT('Selection cleared.'));
}

/* ---------- payload ---------- */

function bauSetDemoData(checked) {
    if (BAU.busy) {
        bauEl('bauDemoData').checked = BAU.loadDemoData;
        return;
    }
    BAU.loadDemoData = !!checked;
    bauInvalidatePayload();
    bauUpdateSelectionUi();
}

function bauInvalidatePayload() {
    BAU.payload = null;
    bauEl('bauPayload').textContent = '';
    bauEl('bauPayloadCard').style.display = 'none';
    bauEl('bauBtnInstall').disabled = true;
}

function bauPreview() {
    if (BAU.busy) {
        return;
    }
    var sel = BAU.apps.filter(function (app) {
        return BAU.selected[app.id];
    });
    bauInvalidatePayload();
    if (!BAU.batchPrefix) {
        bauSetStatus(bauT('Could not load applications: {0}', ['batch prefix missing']), 'error');
        return;
    }
    if (!sel.length) {
        bauSetStatus(bauT('Nothing selected.'), 'warn');
        return;
    }

    BAU.payload = {
        packages: sel.map(function (app) {
            return {
                id: app.id,
                load_demo_data: BAU.loadDemoData,
                displayName: app.name,
                type: 'application',
                requested_version: app.targetVersion
            };
        }),
        name: BAU.batchPrefix + ' - ' + new Date().toISOString()
    };
    bauEl('bauPayload').textContent = JSON.stringify(BAU.payload, null, 1);
    bauEl('bauPayloadCard').style.display = 'block';
    bauUpdateSelectionUi();

    if (bauInstallBlocked()) {
        bauSetStatus(bauT('Payload built for {0} applications. Update is disabled while another batch runs.', [sel.length]), 'warn');
    } else {
        bauSetStatus(bauT('Payload built for {0} applications. Review it, then click Update selected.', [sel.length]), 'ok');
    }
}

function bauCopyPayload() {
    if (!BAU.payload) {
        return;
    }
    var text = JSON.stringify(BAU.payload, null, 1);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            bauSetStatus(bauT('Payload copied to clipboard.'), 'ok');
        }, function () {
            bauSetStatus(bauT('Copy failed. Select the JSON and copy it manually.'), 'warn');
        });
    } else {
        bauSetStatus(bauT('Clipboard not available. Select the JSON and copy it manually.'), 'warn');
    }
}

/* ---------- confirmation modal ---------- */

function bauConfirm(packages, onOk) {
    var modal = bauEl('bauModal');
    var okBtn = bauEl('bauModalOk');
    var cancelBtn = bauEl('bauModalCancel');

    var appsById = {};
    BAU.apps.forEach(function (app) {
        appsById[app.id] = app;
    });
    var demoCount = packages.filter(function (pkg) {
        return pkg.load_demo_data;
    }).length;
    var demoLine = bauEl('bauModalDemo');
    if (demoCount) {
        demoLine.textContent = bauT('Demo data will be loaded for all {0} applications.', [demoCount]);
        demoLine.style.display = 'block';
    } else {
        demoLine.textContent = '';
        demoLine.style.display = 'none';
    }

    var summary = bauEl('bauModalSummary');
    summary.innerHTML = '';
    var countNode = bauSpan(String(packages.length), 'bau-strong');
    var hostNode = bauSpan(window.location.host, 'bau-strong');
    bauAppendTemplate(summary, 'Update {0} application(s) on {1}?', [countNode, hostNode]);

    var list = bauEl('bauModalList');
    list.innerHTML = '';
    packages.forEach(function (pkg) {
        var app = appsById[pkg.id] || {};
        var row = document.createElement('div');
        row.className = 'bau-modal-item';
        row.appendChild(bauSpan(pkg.displayName, 'bau-modal-item-name'));
        if (pkg.load_demo_data) {
            row.appendChild(bauSpan(bauT('Demo data'), 'bau-badge'));
        }
        var ver = document.createElement('span');
        ver.className = 'bau-mono';
        ver.appendChild(bauSpan(app.installedVersion || '?', 'bau-muted'));
        ver.appendChild(bauSpan(' \u2192 ', 'bau-arrow'));
        ver.appendChild(bauSpan(pkg.requested_version, 'bau-target'));
        row.appendChild(ver);
        list.appendChild(row);
    });

    okBtn.textContent = bauT('Update {0}', [packages.length]);

    function onKey(e) {
        if (e.key === 'Escape') {
            close(false);
        }
    }

    function close(confirmed) {
        modal.style.display = 'none';
        document.removeEventListener('keydown', onKey);
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.onclick = null;
        if (confirmed) {
            onOk();
        }
    }

    okBtn.onclick = function () {
        close(true);
    };
    cancelBtn.onclick = function () {
        close(false);
    };
    modal.onclick = function (e) {
        if (e.target === modal) {
            close(false);
        }
    };
    document.addEventListener('keydown', onKey);

    modal.style.display = 'flex';
    list.scrollTop = 0;
    cancelBtn.focus();
}

/* ---------- help dialog ---------- */

function bauShowHelp() {
    var modal = bauEl('bauHelpModal');
    var closeBtn = bauEl('bauHelpClose');

    bauEl('bauHelpLimit').textContent = bauT('A batch holds up to {0} applications. Only one batch can run at a time. Update is disabled while another batch is running.', [BAU.maxBatch]);
    bauEl('bauHelpStale').textContent = bauT('A batch without progress for {0} minutes is shown as stalled and no longer blocks Update. Check the execution tracker before starting another batch.', [BAU.staleMinutes]);
    bauEl('bauHelpRole').textContent = bauT('Requires the {0} role and access to the CI/CD API.', [BAU.requiredRole]);

    function onKey(e) {
        if (e.key === 'Escape') {
            close();
        }
    }

    function close() {
        modal.style.display = 'none';
        document.removeEventListener('keydown', onKey);
        closeBtn.onclick = null;
        modal.onclick = null;
    }

    closeBtn.onclick = close;
    modal.onclick = function (e) {
        if (e.target === modal) {
            close();
        }
    };
    document.addEventListener('keydown', onKey);

    modal.style.display = 'flex';
    bauEl('bauHelpModal').querySelector('.bau-modal-body').scrollTop = 0;
    closeBtn.focus();
}

/* ---------- install ---------- */

function bauInstall() {
    if (BAU.busy) {
        return;
    }
    if (!BAU.payload) {
        bauSetStatus(bauT('Build the payload first.'), 'warn');
        return;
    }
    if (!window.g_ck) {
        bauSetStatus(bauT('Session token (g_ck) not found. Is the UI page set to Direct?'), 'error');
        return;
    }

    bauSetStatus(bauT('Checking for a running batch...'));
    bauAjax('getActiveBatch', {}, 30000).then(function (res) {
        if (res.batch && res.batch.active && !res.batch.stale) {
            bauShowBatch(res.batch);
            bauSetStatus(bauT('Another batch install is running. Wait for it to finish.'), 'warn');
            return;
        }
        bauSetStatus('');
        bauConfirm(BAU.payload.packages, bauStartInstall);
    }).catch(function (err) {
        bauSetStatus(bauT('Could not check for a running batch: {0}', [err.message]), 'error');
    });
}

function bauStartInstall() {
    if (BAU.busy || !BAU.payload) {
        return;
    }
    var payload = BAU.payload;

    BAU.busy = true;
    bauRenderRows();
    bauUpdateSelectionUi();
    bauSetStatus(bauT('Checking for a running batch...'));

    //Second check right before the POST, in case another admin started a batch while the dialog was open
    bauAjax('getActiveBatch', {}, 30000).then(function (res) {
        if (res.batch && res.batch.active && !res.batch.stale) {
            var blocked = new Error('blocked');
            blocked.blocked = true;
            blocked.batch = res.batch;
            throw blocked;
        }
        bauSetStatus(bauT('Submitting batch install...'));
        return bauApi('POST', '/api/sn_cicd/app/batch/install', payload);
    }).then(function (json) {
        var r = (json && json.result) || {};
        var links = r.links || {};
        var trackerId = links.progress ? links.progress.id : null;
        if (!trackerId) {
            throw new Error(bauT('No progress id in the response: {0}', [JSON.stringify(json)]));
        }

        BAU.busy = false;
        BAU.selected = {};
        bauInvalidatePayload();
        bauRenderRows();

        BAU.items = [];
        BAU.itemsPlanId = null;
        BAU.scopeToName = {};
        BAU.lastScope = null;
        bauRenderItems();

        BAU.batch = {
            trackerId: trackerId,
            name: payload.name,
            state: '0',
            stateLabel: bauT('Submitted'),
            active: true,
            stale: false,
            percent: 0
        };
        bauRenderBatch();
        bauUpdateBanner();
        bauUpdateSelectionUi();
        bauSetStatus(bauT('Batch install submitted for {0} applications.', [payload.packages.length]), 'ok');

        bauStopWatching();
        bauStartWatching();
    }).catch(function (err) {
        BAU.busy = false;
        bauRenderRows();
        if (err && err.blocked) {
            bauShowBatch(err.batch);
            bauSetStatus(bauT('Another batch install started in the meantime. Nothing was sent.'), 'warn');
        } else {
            bauSetStatus(bauT('Update request failed: {0}', [err && err.message ? err.message : err]), 'error');
        }
        bauUpdateSelectionUi();
    });
}

/* ---------- batch tracking ---------- */

function bauCurrentScope(detail) {
    var m = /Loading update:\s*([^\/\s]+)\//.exec(detail || '');
    return m ? m[1] : null;
}

var BAU_KIND = {
    tracker: {
        '0': '',
        '1': 'running',
        '2': 'ok',
        '3': 'fail',
        '4': 'warn'
    },
    plan: {
        ready: '',
        in_progress: 'running',
        installed: 'ok',
        partial_install: 'warn',
        failed: 'fail',
        invalid: 'fail',
        rolled_back: 'warn'
    },
    item: {
        ready: '',
        in_progress: 'running',
        installed: 'ok',
        failed: 'fail',
        invalid: 'fail',
        rolled_back: 'warn'
    }
};

function bauKind(map, value) {
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : '';
}

function bauStateKind(b) {
    if (!b) {
        return '';
    }
    if (b.active && b.stale) {
        return 'warn';
    }
    return bauKind(BAU_KIND.tracker, String(b.state));
}

//Final outcome: the plan state when it is final (it can be partial_install), otherwise the tracker state
function bauOutcomeKind(b) {
    var planKind = b ? bauKind(BAU_KIND.plan, b.planStateValue || '') : '';
    if (planKind && planKind !== 'running') {
        return planKind;
    }
    return bauStateKind(b);
}

function bauItemKind(item) {
    return bauKind(BAU_KIND.item, String(item.state || ''));
}

function bauUpdateBanner() {
    var el = bauEl('bauBanner');
    var b = BAU.batch;
    if (b && b.active && !b.stale) {
        el.className = 'bau-banner bau-banner-info';
        el.textContent = b.startedBy && b.startTime ?
            bauT('A batch install is running, started by {0} at {1}. Update is disabled until it finishes.', [b.startedBy, b.startTime]) :
            bauT('A batch install is running. Update is disabled until it finishes.');
        el.style.display = 'block';
    } else if (b && b.active && b.stale) {
        el.className = 'bau-banner bau-banner-warn';
        el.textContent = bauT('Batch "{0}" has not updated for {1} minutes and may have stalled. Update is enabled. Check the execution tracker before starting another batch.', [b.name, b.idleMinutes]);
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

function bauRenderBatch() {
    var b = BAU.batch;
    var card = bauEl('bauRunCard');
    if (!b) {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';

    var kind = b.active ? bauStateKind(b) : bauOutcomeKind(b);
    var pill = bauEl('bauRunState');
    var stateLabel = b.stateLabel || bauT('Unknown');
    pill.textContent = b.active && b.stale ? bauT('{0} (no update for {1} min)', [stateLabel, b.idleMinutes]) : stateLabel;
    pill.className = 'bau-pill' + (kind ? ' bau-pill-' + kind : '');

    var pct = isNaN(b.percent) ? 0 : Math.max(0, Math.min(100, b.percent));
    bauEl('bauRunPercent').textContent = pct + '%';
    var bar = bauEl('bauRunBar');
    bar.style.width = pct + '%';
    bar.className = 'bau-progress-bar' +
        (kind === 'ok' ? ' bau-progress-ok' : '') +
        (kind === 'fail' ? ' bau-progress-fail' : '') +
        (kind === 'warn' ? ' bau-progress-warn' : '');

    bauEl('bauRunMessage').textContent = b.message || '';
    bauEl('bauRunDetail').textContent = b.detail || '';

    var scope = b.active ? bauCurrentScope(b.detail) : null;
    bauEl('bauRunCurrent').textContent = scope ?
        (BAU.scopeToName[scope] ? BAU.scopeToName[scope] + ' (' + scope + ')' : scope) : '-';

    bauEl('bauRunName').textContent = b.name || '-';
    bauEl('bauRunStartedBy').textContent = b.startedBy || '-';
    bauEl('bauRunStarted').textContent = b.startTime || '-';
    bauEl('bauRunUpdated').textContent = b.updated ? bauT('{0} ({1} min ago)', [b.updated, b.idleMinutes]) : '-';
    bauEl('bauRunNode').textContent = b.node || '-';
    var planCell = bauEl('bauRunPlanState');
    planCell.innerHTML = '';
    if (b.planState) {
        var planKind = bauKind(BAU_KIND.plan, b.planStateValue || '');
        planCell.appendChild(bauSpan(b.planState, 'bau-pill' + (planKind ? ' bau-pill-' + planKind : '')));
    } else {
        planCell.textContent = '-';
    }

    bauSetLink('bauRunTracker', b.trackerId ? '/sys_execution_tracker.do?sys_id=' + b.trackerId : null, b.trackerId);
    bauSetLink('bauRunPlan', b.planId ? '/sys_batch_install_plan.do?sys_id=' + b.planId : null, b.planId);
    bauSetLink('bauRunRollback',
        b.rollbackId && b.rollbackTable ? '/' + b.rollbackTable + '.do?sys_id=' + b.rollbackId : null,
        b.rollbackNumber || b.rollbackId);

    bauRenderWatchButton();
}

function bauRenderItems() {
    var card = bauEl('bauItemsCard');
    if (!BAU.items.length) {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';

    var counts = {};
    BAU.items.forEach(function (item) {
        var key = item.stateLabel || item.state || bauT('Unknown');
        counts[key] = (counts[key] || 0) + 1;
    });
    var countText = Object.keys(counts).map(function (k) {
        return k + ': ' + counts[k];
    }).join(', ');
    bauEl('bauItemsSummary').textContent = bauT('{0} applications | {1}', [BAU.items.length, countText]);

    var current = BAU.batch && BAU.batch.active ? bauCurrentScope(BAU.batch.detail) : null;
    var body = bauEl('bauItemsBody');
    body.innerHTML = '';

    BAU.items.forEach(function (item) {
        var tr = document.createElement('tr');
        var isCurrent = !!current && item.scope === current;
        if (isCurrent) {
            tr.className = 'bau-row-current';
        }

        var tdName = bauCell(item.name, 'bau-col-name');
        if (item.demoData) {
            tdName.appendChild(bauSpan(bauT('Demo data'), 'bau-badge'));
        }
        if (isCurrent) {
            tdName.appendChild(bauSpan(bauT('Loading updates'), 'bau-badge'));
        }
        tr.appendChild(tdName);

        tr.appendChild(bauCell(item.version, 'bau-mono'));

        var kind = bauItemKind(item);
        var tdState = document.createElement('td');
        tdState.appendChild(bauSpan(item.stateLabel || item.state || '-', 'bau-pill' + (kind ? ' bau-pill-' + kind : '')));
        tr.appendChild(tdState);

        tr.appendChild(bauCell([item.statusMessage, item.reason].filter(Boolean).join(' | '), 'bau-muted'));
        body.appendChild(tr);
    });
}

function bauLoadItems() {
    var b = BAU.batch;
    if (!b || !b.planId) {
        return Promise.resolve();
    }
    var planId = b.planId;
    return bauAjax('getBatchItems', {
        sysparm_plan_id: planId
    }, 60000).then(function (res) {
        BAU.items = res.items || [];
        BAU.itemsPlanId = planId;
        BAU.scopeToName = {};
        BAU.items.forEach(function (item) {
            if (item.scope) {
                BAU.scopeToName[item.scope] = item.name;
            }
        });
        bauRenderItems();
        bauRenderBatch();
    });
}

function bauShowBatch(batch) {
    BAU.batch = batch;
    bauRenderBatch();
    bauUpdateBanner();
    bauUpdateSelectionUi();
    if (batch.planId && BAU.itemsPlanId !== batch.planId) {
        bauLoadItems().then(null, function () { });
    }
    if (batch.active && !BAU.watching) {
        bauStartWatching();
    }
}

function bauRenderWatchButton() {
    var btn = bauEl('bauBtnWatch');
    btn.style.display = BAU.batch && BAU.batch.active ? '' : 'none';
    btn.textContent = BAU.watching ? bauT('Stop watching') : bauT('Resume watching');
}

function bauToggleWatch() {
    if (BAU.watching) {
        bauStopWatching(bauT('Stopped watching. The install continues on the server.'));
    } else {
        bauEl('bauRunNote').textContent = '';
        bauStartWatching();
    }
}

function bauStartWatching() {
    if (!BAU.batch) {
        return;
    }
    BAU.watching = true;
    BAU.pollDelay = BAU.pollMin;
    BAU.pollErrors = 0;
    BAU.pollWhenVisible = false;
    bauRenderWatchButton();
    bauSchedulePoll(0);
}

function bauStopWatching(msg) {
    BAU.watching = false;
    BAU.pollToken++;
    if (BAU.pollTimer) {
        clearTimeout(BAU.pollTimer);
        BAU.pollTimer = null;
    }
    bauRenderWatchButton();
    if (msg) {
        bauEl('bauRunNote').textContent = msg;
    }
}

function bauSchedulePoll(delay) {
    if (BAU.pollTimer) {
        clearTimeout(BAU.pollTimer);
    }
    BAU.pollTimer = setTimeout(bauPoll, delay);
}

function bauPoll() {
    BAU.pollTimer = null;
    if (!BAU.watching || !BAU.batch) {
        return;
    }
    if (document.hidden) {
        BAU.pollWhenVisible = true;
        bauEl('bauRunChecked').textContent = bauT('Paused while the tab is in the background');
        return;
    }

    var token = ++BAU.pollToken;
    bauAjax('getBatchStatus', {
        sysparm_tracker_id: BAU.batch.trackerId
    }, BAU.pollTimeoutMs).then(function (res) {
        if (token !== BAU.pollToken || !BAU.watching) {
            return;
        }
        BAU.pollErrors = 0;
        bauEl('bauRunNote').textContent = '';

        var prev = BAU.batch || {};
        var b = res.batch;
        var changed = b.updated !== prev.updated || b.state !== prev.state;
        BAU.batch = b;

        var scope = bauCurrentScope(b.detail);
        if (b.planId && (BAU.itemsPlanId !== b.planId || scope !== BAU.lastScope)) {
            bauLoadItems().then(null, function () { });
        }
        BAU.lastScope = scope;

        bauRenderBatch();
        bauRenderItems();
        bauUpdateBanner();
        bauUpdateSelectionUi();

        if (!b.active) {
            bauFinish();
            return;
        }

        BAU.pollDelay = changed ? BAU.pollMin : Math.min(BAU.pollMax, BAU.pollDelay + BAU.pollStep);
        bauEl('bauRunChecked').textContent = bauT('Last check {0} | next in {1} s',
            [new Date().toLocaleTimeString(), Math.round(BAU.pollDelay / 1000)]);
        bauSchedulePoll(BAU.pollDelay);
    }).catch(function (err) {
        if (token !== BAU.pollToken || !BAU.watching) {
            return;
        }
        BAU.pollErrors++;
        if (BAU.pollErrors >= BAU.maxPollErrors) {
            bauStopWatching(bauT('Stopped watching after {0} failed checks ({1}). The install continues on the server. Click Resume watching or reload the page.',
                [BAU.pollErrors, err.message]));
            return;
        }
        BAU.pollDelay = Math.min(BAU.pollMax, BAU.pollDelay + BAU.pollStep);
        bauEl('bauRunNote').textContent = bauT('Status check failed ({0}/{1}): {2}. Retrying in {3} s.',
            [BAU.pollErrors, BAU.maxPollErrors, err.message, Math.round(BAU.pollDelay / 1000)]);
        bauSchedulePoll(BAU.pollDelay);
    });
}

function bauFinish() {
    bauStopWatching();
    bauEl('bauRunChecked').textContent = bauT('Finished, last check {0}', [new Date().toLocaleTimeString()]);

    bauLoadItems().then(null, function () { }).then(function () {
        var b = BAU.batch;
        var kind = bauOutcomeKind(b);
        bauRenderBatch();
        bauUpdateBanner();
        bauUpdateSelectionUi();
        bauLoad(bauT('Batch finished: {0}.', [b.planState || b.stateLabel || bauT('Unknown')]),
            kind === 'ok' ? 'ok' : (kind === 'fail' ? 'error' : 'warn'));
    });
}

function bauCheckActiveBatch() {
    return bauAjax('getActiveBatch', {}, 30000).then(function (res) {
        if (res.batch) {
            bauShowBatch(res.batch);
        }
        return res.batch;
    });
}

document.addEventListener('visibilitychange', function () {
    if (!document.hidden && BAU.watching && BAU.pollWhenVisible) {
        BAU.pollWhenVisible = false;
        bauSchedulePoll(0);
    }
});

/* ---------- init ---------- */

addLoadEvent(function () {
    //Translations first, so every text below is rendered in the user's language
    bauLoadMessages().then(function () {
        bauSetTitle();
        bauLoad();
        bauCheckActiveBatch().catch(function (err) {
            bauSetStatus(bauT('Could not check for a running batch: {0}', [err.message]), 'warn');
        });
    });
});