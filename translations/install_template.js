/**
 * Batch Application Update: translation template. Copy this file, set LANGUAGE and fill in the translations
 * 
 * Creates sys_ui_message records for the batch_app_update UI page.
 * Run in System Definition > Scripts - Background.
 * Existing messages are reported (same or different text) and never overwritten.
 */
(function () {
    var DRY_RUN = true; //set to false to create the records
    var LANGUAGE = 'xx'; //language code as in sys_language.id, for example 'de'
    var USE_WORKFLOW = true; //true: records are captured in your current update set
    var LOG_PREFIX = 'BatchAppUpdateTranslations: ';

    //[English key, translation]. Keep {0}, {1} placeholders. Empty translations are skipped.
    var MESSAGES = [
        ['Batch application update', ''],
        ['Store applications with an update compatible with build:', ''],
        ['Batch install', ''],
        ['Batch name', ''],
        ['Current app', ''],
        ['Started by', ''],
        ['Started', ''],
        ['Last update', ''],
        ['Node', ''],
        ['Plan state', ''],
        ['Execution tracker', ''],
        ['Install plan', ''],
        ['Rollback', ''],
        ['Batch items', ''],
        ['Application', ''],
        ['Version', ''],
        ['State', ''],
        ['Message', ''],
        ['Refresh', ''],
        ['Clear selection', ''],
        ['Build payload', ''],
        ['Update selected', ''],
        ['Select or clear this page', ''],
        ['Scope', ''],
        ['Available update', ''],
        ['Records per page', ''],
        ['Payload', ''],
        ['Copy JSON', ''],
        ['Confirm batch update', ''],
        ['The update runs on the server and cannot be stopped from this page.', ''],
        ['Cancel', ''],
        ['Update', ''],
        ['no answer within {0} s', ''],
        ['invalid response from server', ''],
        ['Loading...', ''],
        ['upgrade to {0} assigned', ''],
        ['An upgrade to {0} is assigned (glide.war.assigned differs from glide.war). Consider installing store application updates after the upgrade has finished.', ''],
        ['{0} applications still have a compatible update.', ''],
        ['{0} applications have a compatible update.', ''],
        ['Could not load applications: {0}', ''],
        ['No applications with a compatible update.', ''],
        ['Demo data', ''],
        ['Showing {0}-{1} of {2}', ''],
        ['First page', ''],
        ['Previous page', ''],
        ['Page {0}', ''],
        ['Next page', ''],
        ['Last page', ''],
        ['{0} of {1} selected', ''],
        ['A batch install is already running', ''],
        ['Limit of {0} per batch reached. Unselect another application first.', ''],
        ['Limit of {0} reached. {1} application(s) on this page were not selected.', ''],
        ['Selected all applications on this page.', ''],
        ['Cleared this page.', ''],
        ['Selection cleared.', ''],
        ['Nothing selected.', ''],
        ['Payload built for {0} applications. Update is disabled while another batch runs.', ''],
        ['Payload built for {0} applications. Review it, then click Update selected.', ''],
        ['Payload copied to clipboard.', ''],
        ['Copy failed. Select the JSON and copy it manually.', ''],
        ['Clipboard not available. Select the JSON and copy it manually.', ''],
        ['Update {0} application(s) on {1}?', ''],
        ['Load demo data', ''],
        ['Demo data will be loaded for all {0} applications.', ''],
        ['Update {0}', ''],
        ['Build the payload first.', ''],
        ['Session token (g_ck) not found. Is the UI page set to Direct?', ''],
        ['Checking for a running batch...', ''],
        ['Another batch install is running. Wait for it to finish.', ''],
        ['Could not check for a running batch: {0}', ''],
        ['Submitting batch install...', ''],
        ['No progress id in the response: {0}', ''],
        ['Submitted', ''],
        ['Batch install submitted for {0} applications.', ''],
        ['Another batch install started in the meantime. Nothing was sent.', ''],
        ['Update request failed: {0}', ''],
        ['A batch install is running, started by {0} at {1}. Update is disabled until it finishes.', ''],
        ['A batch install is running. Update is disabled until it finishes.', ''],
        ['Batch "{0}" has not updated for {1} minutes and may have stalled. Update is enabled. Check the execution tracker before starting another batch.', ''],
        ['Unknown', ''],
        ['{0} (no update for {1} min)', ''],
        ['{0} ({1} min ago)', ''],
        ['{0} applications | {1}', ''],
        ['Loading updates', ''],
        ['Stop watching', ''],
        ['Resume watching', ''],
        ['Stopped watching. The install continues on the server.', ''],
        ['Paused while the tab is in the background', ''],
        ['Last check {0} | next in {1} s', ''],
        ['Stopped watching after {0} failed checks ({1}). The install continues on the server. Click Resume watching or reload the page.', ''],
        ['Status check failed ({0}/{1}): {2}. Retrying in {3} s.', ''],
        ['Finished, last check {0}', ''],
        ['Batch finished: {0}.', ''],
        ['How to use this page?', ''],
        ['close', ''],
        ['What this page does', ''],
        ['Lists installed store applications that have an update compatible with the family release of this instance and installs the selected updates as one CI/CD batch, run as your user.', ''],
        ['Steps', ''],
        ['Select applications in the list. The header checkbox selects or clears the current page.', ''],
        ['Click Build payload and review the JSON.', ''],
        ['Click Update selected, then check the instance and the list in the confirmation dialog.', ''],
        ['Follow the progress in the Batch install card. The list refreshes when the batch finishes.', ''],
        ['Good to know', ''],
        ['A batch holds up to {0} applications. Only one batch can run at a time. Update is disabled while another batch is running.', ''],
        ['You can reload or close the page during an install. The install continues on the server and the page resumes tracking when you open it again.', ''],
        ['A batch without progress for {0} minutes is shown as stalled and no longer blocks Update. Check the execution tracker before starting another batch.', ''],
        ['Demo data is loaded only when Load demo data is checked, for all applications in the batch. Use it on test or demo instances. The Demo data badge shows applications that already have demo data loaded.', ''],
        ['The Rollback link in the Batch install card opens the rollback context of the batch.', ''],
        ['Requires the admin role and access to the CI/CD API.', ''],
        ['More information about the CI/CD API from ServiceNow Docs', '']
    ];

    var out = [];
    out.push('DRY_RUN=' + DRY_RUN + ' | language=' + LANGUAGE + ' | USE_WORKFLOW=' + USE_WORKFLOW + ' | entries=' + MESSAGES.length);

    //Stop if the language is not installed and active
    var grLang = new GlideRecord('sys_language');
    grLang.addQuery('id', LANGUAGE);
    grLang.addQuery('active', true);
    grLang.setLimit(1);
    grLang.query();
    if (!grLang.hasNext()) {
        out.push('ABORT: language "' + LANGUAGE + '" is not installed or not active on this instance.');
        gs.info(LOG_PREFIX + out.join('\n'));
        return;
    }

    function maxLength(element) {
        var grDict = new GlideRecord('sys_dictionary');
        grDict.addQuery('name', 'sys_ui_message');
        grDict.addQuery('element', element);
        grDict.setLimit(1);
        grDict.query();
        return grDict.next() ? parseInt(grDict.getValue('max_length'), 10) || 0 : 0;
    }
    var keyMax = maxLength('key');
    var msgMax = maxLength('message');

    var counts = { created: 0, wouldCreate: 0, sameText: 0, differentText: 0, untranslated: 0, badPlaceholders: 0, tooLong: 0, failed: 0 };

    function placeholders(text) {
        return (String(text).match(/\{\d+\}/g) || []).sort().join(',');
    }

    for (var i = 0; i < MESSAGES.length; i++) {
        var key = MESSAGES[i][0];
        var text = MESSAGES[i][1];

        if (!text) {
            counts.untranslated++;
            continue;
        }
        if (placeholders(key) !== placeholders(text)) {
            counts.badPlaceholders++;
            out.push('PLACEHOLDERS DIFFER: ' + key + ' | ' + text);
            continue;
        }
        if ((keyMax && key.length > keyMax) || (msgMax && text.length > msgMax)) {
            counts.tooLong++;
            out.push('TOO LONG: ' + key);
            continue;
        }

        var grExisting = new GlideRecord('sys_ui_message');
        grExisting.addQuery('key', key);
        grExisting.addQuery('language', LANGUAGE);
        grExisting.setLimit(1);
        grExisting.query();
        if (grExisting.next()) {
            if (grExisting.getValue('message') === text) {
                counts.sameText++;
            } else {
                counts.differentText++;
                out.push('EXISTS different (kept): ' + key + ' | existing: ' + grExisting.getValue('message') + ' | script: ' + text);
            }
            continue;
        }

        if (DRY_RUN) {
            counts.wouldCreate++;
            out.push('WOULD CREATE: ' + key);
            continue;
        }

        var grNew = new GlideRecord('sys_ui_message');
        grNew.initialize();
        grNew.setValue('key', key);
        grNew.setValue('language', LANGUAGE);
        grNew.setValue('message', text);
        grNew.setWorkflow(USE_WORKFLOW);
        if (grNew.insert()) {
            counts.created++;
        } else {
            counts.failed++;
            out.push('FAILED: ' + key);
        }
    }

    out.push('Result: ' + JSON.stringify(counts));
    gs.info(LOG_PREFIX + out.join('\n'));
})();