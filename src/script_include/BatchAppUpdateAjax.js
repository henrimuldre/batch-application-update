var BatchAppUpdateAjax = Class.create();
BatchAppUpdateAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    BATCH_PREFIX: 'Batch Applications Update',
    STALE_MINUTES: 60,

    /* ---------- client callable ---------- */

    getCandidates: function () {
        if (!gs.hasRole('admin')) {
            return this._accessError();
        }

        var buildName = gs.getProperty('glide.buildname');
        var apps = [];
        var seen = {};

        var grSSA = new GlideRecord('sys_store_app');
        grSSA.addEncodedQuery('install_dateISNOTEMPTY^hide_on_ui=false^nameNOT LIKE@^update_available=true');
        grSSA.orderBy('name');
        grSSA.query();

        while (grSSA.next()) {
            var name = grSSA.getValue('name');
            if (seen[name]) {
                continue;
            }
            seen[name] = true;

            var installed = grSSA.getValue('version');
            var target = this._highestCompatibleVersion(grSSA.getUniqueValue(), buildName);
            if (!target || this._compareVersions(target, installed) <= 0) {
                continue;
            }

            apps.push({
                id: grSSA.getUniqueValue(),
                name: name,
                scope: grSSA.getValue('scope'),
                installedVersion: installed,
                targetVersion: target,
                demoDataLoaded: String(grSSA.getValue('demo_data')) === 'demo_data_loaded'
            });
        }

        var war = gs.getProperty('glide.war', '') || gs.getProperty('current_war', '');
        var warAssigned = gs.getProperty('glide.war.assigned', '');
        var upgradePending = !!war && !!warAssigned && warAssigned !== war;

        return JSON.stringify({
            buildName: buildName,
            batchPrefix: this.BATCH_PREFIX,
            buildLabel: this._buildDescription(war) || buildName,
            war: war,
            warAssigned: warAssigned,
            assignedLabel: upgradePending ? (this._buildDescription(warAssigned) || warAssigned) : null,
            upgradePending: upgradePending,
            staleMinutes: this.STALE_MINUTES,
            apps: apps
        });
    },

    getActiveBatch: function () {
        if (!gs.hasRole('admin')) {
            return this._accessError();
        }
        return JSON.stringify({
            batch: this._findActiveBatch()
        });
    },

    getBatchStatus: function () {
        if (!gs.hasRole('admin')) {
            return this._accessError();
        }
        var trackerId = String(this.getParameter('sysparm_tracker_id') || '');
        var grTracker = new GlideRecord('sys_execution_tracker');
        if (!trackerId || !grTracker.get(trackerId)) {
            return JSON.stringify({
                error: gs.getMessage('Execution tracker not found: {0}', [trackerId])
            });
        }
        return JSON.stringify({
            batch: this._describeBatch(grTracker)
        });
    },

    getBatchItems: function () {
        if (!gs.hasRole('admin')) {
            return this._accessError();
        }
        var planId = String(this.getParameter('sysparm_plan_id') || '');
        return JSON.stringify({
            items: this._getItems(planId)
        });
    },

    getMessages: function () {
        //Translations for the UI page. gs.getMessage falls back to the key (English) when no record exists.
        var keys = [];
        try {
            keys = JSON.parse(String(this.getParameter('sysparm_keys') || '[]'));
        } catch (e) {
            keys = [];
        }
        var messages = {};
        for (var i = 0; i < keys.length && i < 500; i++) {
            var key = String(keys[i]);
            messages[key] = gs.getMessage(key);
        }
        return JSON.stringify({
            language: gs.getSession().getLanguage(),
            messages: messages
        });
    },

    /* ---------- batch helpers ---------- */

    _findActiveBatch: function () {
        var grTracker = new GlideRecord('sys_execution_tracker');
        grTracker.addQuery('type', 'sys.applifecycle.operation');
        grTracker.addQuery('name', 'STARTSWITH', this.BATCH_PREFIX);
        grTracker.addQuery('state', 'IN', '0,1');
        grTracker.orderByDesc('sys_created_on');
        grTracker.setLimit(1);
        grTracker.query();
        return grTracker.next() ? this._describeBatch(grTracker) : null;
    },

    _describeBatch: function (grTracker) {
        var state = grTracker.getValue('state');
        var active = state === '0' || state === '1';
        var idleMs = new GlideDateTime().getNumericValue() -
            new GlideDateTime(grTracker.getValue('sys_updated_on')).getNumericValue();
        var plan = this._findPlan(grTracker.getValue('name'));

        return {
            trackerId: grTracker.getUniqueValue(),
            name: grTracker.getValue('name'),
            state: state,
            stateLabel: grTracker.getDisplayValue('state'),
            active: active,
            stale: active && idleMs > this.STALE_MINUTES * 60000,
            idleMinutes: Math.floor(idleMs / 60000),
            percent: parseInt(grTracker.getValue('percent_complete') || '0', 10),
            message: grTracker.getValue('message') || '',
            detail: grTracker.getValue('detail_message') || '',
            node: grTracker.getValue('node') || '',
            startTime: grTracker.getDisplayValue('start_time'),
            updated: grTracker.getDisplayValue('sys_updated_on'),
            startedBy: this._userDisplayName(grTracker.getValue('sys_created_by')),
            planId: plan ? plan.getUniqueValue() : null,
            planState: plan ? plan.getDisplayValue('state') : null,
            planStateValue: plan ? plan.getValue('state') : null,
            rollbackId: plan ? plan.getValue('rollback_context') : null,
            rollbackNumber: plan ? plan.getDisplayValue('rollback_context') : null,
            rollbackTable: plan && !plan.rollback_context.nil() ? plan.rollback_context.getReferenceTable() : null
        };
    },

    _findPlan: function (name) {
        var plan = new GlideRecord('sys_batch_install_plan');
        plan.addQuery('name', name);
        plan.orderByDesc('sys_created_on');
        plan.setLimit(1);
        plan.query();
        return plan.next() ? plan : null;
    },

    _getItems: function (planId) {
        var items = [];
        if (!planId) {
            return items;
        }
        var grItem = new GlideRecord('sys_batch_install_item');
        grItem.addQuery('batch_install_plan', planId);
        grItem.orderBy('name');
        grItem.query();
        while (grItem.next()) {
            var demo = String(grItem.getValue('demo_data'));
            var appId = grItem.getValue('id');
            items.push({
                id: appId,
                scope: this._appScope(appId),
                name: grItem.getValue('name'),
                version: grItem.getValue('version'),
                state: grItem.getValue('state'),
                stateLabel: grItem.getDisplayValue('state'),
                statusMessage: grItem.getValue('status_message') || '',
                reason: grItem.getValue('reason') || '',
                demoData: demo === '1' || demo === 'true'
            });
        }
        return items;
    },

    _appScope: function (appId) {
        var app = new GlideRecord('sys_store_app');
        if (appId && app.get(appId)) {
            return app.getValue('scope');
        }
        return '';
    },

    _userDisplayName: function (userName) {
        var user = new GlideRecord('sys_user');
        if (userName && user.get('user_name', userName)) {
            return user.getDisplayValue();
        }
        return userName || '';
    },

    _accessError: function () {
        return JSON.stringify({
            error: gs.getMessage('admin role required')
        });
    },

    /* ---------- version helpers ---------- */

    _highestCompatibleVersion: function (appId, buildName) {
        var best = null;
        var grVer = new GlideRecord('sys_app_version');
        grVer.addEncodedQuery('source_app_id=' + appId + '^compatibilitiesLIKE' + buildName);
        grVer.query();
        while (grVer.next()) {
            var v = grVer.getValue('version');
            if (!best || this._compareVersions(v, best) > 0) {
                best = v;
            }
        }
        return best;
    },

    _compareVersions: function (a, b) {
        var pa = String(a || '').split('.');
        var pb = String(b || '').split('.');
        var len = Math.max(pa.length, pb.length);
        for (var i = 0; i < len; i++) {
            var na = parseInt(pa[i] || '0', 10);
            var nb = parseInt(pb[i] || '0', 10);
            if (na !== nb) {
                return na > nb ? 1 : -1;
            }
        }
        return 0;
    },

    _buildDescription: function (war) {
        var m = /^glide-([a-z]+)-\d{2}-\d{2}-\d{4}__patch([0-9a-z]+)(?:-hotfix(\d+))?-\d{2}-\d{2}-\d{4}/i.exec(war || '');
        if (!m) {
            return null;
        }
        var family = m[1].charAt(0).toUpperCase() + m[1].substring(1).toLowerCase();
        var desc = family + ' patch ' + m[2].toLowerCase();
        if (m[3]) {
            desc += ' hotfix ' + m[3];
        }
        return desc;
    },

    type: 'BatchAppUpdateAjax'
});