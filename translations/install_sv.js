/**
 * Batch Application Update: Swedish translations (sv)
 * 
 * Creates sys_ui_message records for the batch_app_update UI page.
 * Run in System Definition > Scripts - Background.
 * Existing messages are reported (same or different text) and never overwritten.
 */
(function () {
    var DRY_RUN = true; //set to false to create the records
    var LANGUAGE = 'sv'; //language code as in sys_language.id, for example 'de'
    var USE_WORKFLOW = true; //true: records are captured in your current update set
    var LOG_PREFIX = 'BatchAppUpdateTranslations (SV): ';

    //[English key, translation]. Keep {0}, {1} placeholders. Empty translations are skipped.
    var MESSAGES = [
        ['Batch application update', 'Batchuppdatering av applikationer'],
        ['Store applications with an update compatible with build:', 'Store-applikationer med en uppdatering som är kompatibel med versionen:'],
        ['Batch install', 'Batchinstallation'],
        ['Batch name', 'Batchnamn'],
        ['Current app', 'Aktuell applikation'],
        ['Started by', 'Startad av'],
        ['Started', 'Startad'],
        ['Last update', 'Senaste uppdatering'],
        ['Node', 'Nod'],
        ['Plan state', 'Planstatus'],
        ['Execution tracker', 'Körningsspårare'],
        ['Install plan', 'Installationsplan'],
        ['Rollback', 'Återställ'],
        ['Batch items', 'Batchobjekt'],
        ['Application', 'Applikation'],
        ['Version', 'Version'],
        ['State', 'Status'],
        ['Message', 'Meddelande'],
        ['Refresh', 'Läs in igen'],
        ['Clear selection', 'Rensa urval'],
        ['Build payload', 'Skapa nyttolast'],
        ['Update selected', 'Uppdatera valda'],
        ['Select or clear this page', 'Markera eller avmarkera den här sidan'],
        ['Scope', 'Omfång'],
        ['Available update', 'Tillgänglig uppdatering'],
        ['Records per page', 'Poster per sida'],
        ['Payload', 'Nyttolast'],
        ['Copy JSON', 'Kopiera JSON'],
        ['Confirm batch update', 'Bekräfta batchuppdatering'],
        ['The update runs on the server and cannot be stopped from this page.', 'Uppdateringen körs på servern och kan inte stoppas från den här sidan.'],
        ['Cancel', 'Avbryt'],
        ['Update', 'Uppdatera'],
        ['no answer within {0} s', 'inget svar inom {0} s'],
        ['invalid response from server', 'ogiltigt svar från servern'],
        ['Loading...', 'Läser in...'],
        ['upgrade to {0} assigned', 'uppgradering till {0} tilldelad'],
        ['An upgrade to {0} is assigned (glide.war.assigned differs from glide.war). Consider installing store application updates after the upgrade has finished.', 'En uppgradering till {0} är tilldelad (glide.war.assigned skiljer sig från glide.war). Överväg att installera uppdateringar av Store-applikationer när uppgraderingen är klar.'],
        ['{0} applications still have a compatible update.', '{0} applikationer har fortfarande en kompatibel uppdatering.'],
        ['{0} applications have a compatible update.', '{0} applikationer har en kompatibel uppdatering.'],
        ['Could not load applications: {0}', 'Det gick inte att läsa in applikationer: {0}'],
        ['No applications with a compatible update.', 'Inga applikationer med en kompatibel uppdatering.'],
        ['Demo data', 'Demodata'],
        ['Showing {0}-{1} of {2}', 'Visar {0}-{1} av {2}'],
        ['First page', 'Första sidan'],
        ['Previous page', 'Föregående sida'],
        ['Page {0}', 'Sida {0}'],
        ['Next page', 'Nästa sida'],
        ['Last page', 'Sista sidan'],
        ['{0} of {1} selected', '{0} av {1} valda'],
        ['A batch install is already running', 'En batchinstallation pågår redan'],
        ['Limit of {0} per batch reached. Unselect another application first.', 'Gränsen på {0} per batch är nådd. Avmarkera en annan applikation först.'],
        ['Limit of {0} reached. {1} application(s) on this page were not selected.', 'Gränsen på {0} är nådd. {1} applikation(er) på den här sidan markerades inte.'],
        ['Selected all applications on this page.', 'Alla applikationer på den här sidan är markerade.'],
        ['Cleared this page.', 'Den här sidan är avmarkerad.'],
        ['Selection cleared.', 'Urvalet är rensat.'],
        ['Nothing selected.', 'Inget är markerat.'],
        ['Payload built for {0} applications. Update is disabled while another batch runs.', 'Nyttolast skapad för {0} applikationer. Uppdatera är inaktiverad medan en annan batch körs.'],
        ['Payload built for {0} applications. Review it, then click Update selected.', 'Nyttolast skapad för {0} applikationer. Granska den och klicka sedan på Uppdatera valda.'],
        ['Payload copied to clipboard.', 'Nyttolasten har kopierats till urklipp.'],
        ['Copy failed. Select the JSON and copy it manually.', 'Kopieringen misslyckades. Markera JSON-texten och kopiera den manuellt.'],
        ['Clipboard not available. Select the JSON and copy it manually.', 'Urklipp är inte tillgängligt. Markera JSON-texten och kopiera den manuellt.'],
        ['Update {0} application(s) on {1}?', 'Uppdatera {0} applikation(er) på {1}?'],
        ['Load demo data', 'Läs in demodata'],
        ['Demo data will be loaded for all {0} applications.', 'Demodata läses in för alla {0} applikationer.'],
        ['Update {0}', 'Uppdatera {0}'],
        ['Build the payload first.', 'Skapa nyttolasten först.'],
        ['Session token (g_ck) not found. Is the UI page set to Direct?', 'Sessionstoken (g_ck) hittades inte. Är UI-sidan inställd på Direct?'],
        ['Checking for a running batch...', 'Kontrollerar om en batch pågår...'],
        ['Another batch install is running. Wait for it to finish.', 'En annan batchinstallation pågår. Vänta tills den är klar.'],
        ['Could not check for a running batch: {0}', 'Det gick inte att kontrollera om en batch pågår: {0}'],
        ['Submitting batch install...', 'Skickar batchinstallation...'],
        ['No progress id in the response: {0}', 'Inget förlopps-id i svaret: {0}'],
        ['Submitted', 'Skickad'],
        ['Batch install submitted for {0} applications.', 'Batchinstallation skickad för {0} applikationer.'],
        ['Another batch install started in the meantime. Nothing was sent.', 'En annan batchinstallation startade under tiden. Inget skickades.'],
        ['Update request failed: {0}', 'Uppdateringsbegäran misslyckades: {0}'],
        ['A batch install is running, started by {0} at {1}. Update is disabled until it finishes.', 'En batchinstallation pågår, startad av {0} {1}. Uppdatera är inaktiverad tills den är klar.'],
        ['A batch install is running. Update is disabled until it finishes.', 'En batchinstallation pågår. Uppdatera är inaktiverad tills den är klar.'],
        ['Batch "{0}" has not updated for {1} minutes and may have stalled. Update is enabled. Check the execution tracker before starting another batch.', 'Batchen "{0}" har inte uppdaterats på {1} minuter och kan ha avstannat. Uppdatera är aktiverad. Kontrollera körningsspåraren innan du startar en ny batch.'],
        ['Unknown', 'Okänd'],
        ['{0} (no update for {1} min)', '{0} (ingen uppdatering på {1} min)'],
        ['{0} ({1} min ago)', '{0} (för {1} min sedan)'],
        ['{0} applications | {1}', '{0} applikationer | {1}'],
        ['Loading updates', 'Läser in uppdateringar'],
        ['Stop watching', 'Sluta bevaka'],
        ['Resume watching', 'Återuppta bevakning'],
        ['Stopped watching. The install continues on the server.', 'Bevakningen har stoppats. Installationen fortsätter på servern.'],
        ['Paused while the tab is in the background', 'Pausad medan fliken är i bakgrunden'],
        ['Last check {0} | next in {1} s', 'Senaste kontroll {0} | nästa om {1} s'],
        ['Stopped watching after {0} failed checks ({1}). The install continues on the server. Click Resume watching or reload the page.', 'Bevakningen stoppades efter {0} misslyckade kontroller ({1}). Installationen fortsätter på servern. Klicka på Återuppta bevakning eller läs in sidan igen.'],
        ['Status check failed ({0}/{1}): {2}. Retrying in {3} s.', 'Statuskontrollen misslyckades ({0}/{1}): {2}. Försöker igen om {3} s.'],
        ['Finished, last check {0}', 'Klar, senaste kontroll {0}'],
        ['Batch finished: {0}.', 'Batchen är klar: {0}.'],
        ['How to use this page?', 'Hur använder jag den här sidan?'],
        ['close', 'Stäng'],
        ['What this page does', 'Vad sidan gör'],
        ['Lists installed store applications that have an update compatible with the family release of this instance and installs the selected updates as one CI/CD batch, run as your user.', 'Visar installerade Store-applikationer som har en uppdatering som är kompatibel med instansens familjeversion och installerar de valda uppdateringarna som en CI/CD-batch som körs som din användare.'],
        ['Steps', 'Steg'],
        ['Select applications in the list. The header checkbox selects or clears the current page.', 'Välj applikationer i listan. Kryssrutan i rubrikraden markerar eller avmarkerar den aktuella sidan.'],
        ['Click Build payload and review the JSON.', 'Klicka på Skapa nyttolast och granska JSON-texten.'],
        ['Click Update selected, then check the instance and the list in the confirmation dialog.', 'Klicka på Uppdatera valda och kontrollera sedan instansen och listan i bekräftelsedialogen.'],
        ['Follow the progress in the Batch install card. The list refreshes when the batch finishes.', 'Följ förloppet i kortet Batchinstallation. Listan uppdateras när batchen är klar.'],
        ['Good to know', 'Bra att veta'],
        ['A batch holds up to {0} applications. Only one batch can run at a time. Update is disabled while another batch is running.', 'En batch kan innehålla upp till {0} applikationer. Bara en batch kan köras åt gången. Uppdatera är inaktiverad medan en annan batch körs.'],
        ['You can reload or close the page during an install. The install continues on the server and the page resumes tracking when you open it again.', 'Du kan läsa in sidan igen eller stänga den under en installation. Installationen fortsätter på servern och sidan återupptar uppföljningen när du öppnar den igen.'],
        ['A batch without progress for {0} minutes is shown as stalled and no longer blocks Update. Check the execution tracker before starting another batch.', 'En batch utan förlopp på {0} minuter visas som avstannad och blockerar inte längre Uppdatera. Kontrollera körningsspåraren innan du startar en ny batch.'],
        ['Demo data is loaded only when Load demo data is checked, for all applications in the batch. Use it on test or demo instances. The Demo data badge shows applications that already have demo data loaded.', 'Demodata läses in endast när Läs in demodata är markerad, för alla applikationer i batchen. Använd det på test- eller demoinstanser. Märket Demodata visar applikationer som redan har demodata inlästa.'],
        ['The Rollback link in the Batch install card opens the rollback context of the batch.', 'Länken Återställ i kortet Batchinstallation öppnar batchens återställningskontext.'],
        ['Requires the admin role and access to the CI/CD API.', 'Kräver rollen admin och åtkomst till CI/CD-API:t.'],
        ['More information about the CI/CD API from ServiceNow Docs', 'Mer information om CI/CD-API:t i ServiceNow Docs']
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