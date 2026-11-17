/**
 * Batch Application Update: Finnish translations (fi)
 * 
 * Creates sys_ui_message records for the batch_app_update UI page.
 * Run in System Definition > Scripts - Background.
 * Existing messages are reported (same or different text) and never overwritten.
 */
(function () {
    var DRY_RUN = true; //set to false to create the records
    var LANGUAGE = 'fi'; //language code as in sys_language.id, for example 'de'
    var USE_WORKFLOW = true; //true: records are captured in your current update set
    var LOG_PREFIX = 'BatchAppUpdateTranslations (FI): ';

    //[English key, translation]. Keep {0}, {1} placeholders. Empty translations are skipped.
    var MESSAGES = [
        ['Batch application update', 'Sovellusten eräpäivitys'],
        ['Store applications with an update compatible with build:', 'Store-sovellukset, joille on saatavilla koontiversioon yhteensopiva päivitys:'],
        ['Batch install', 'Eräasennus'],
        ['Batch name', 'Erän nimi'],
        ['Current app', 'Nykyinen sovellus'],
        ['Started by', 'Aloittaja'],
        ['Started', 'Aloitettu'],
        ['Last update', 'Viimeisin päivitys'],
        ['Node', 'Solmu'],
        ['Plan state', 'Suunnitelman tila'],
        ['Execution tracker', 'Suorituksen seuranta'],
        ['Install plan', 'Asennussuunnitelma'],
        ['Rollback', 'Palautus'],
        ['Batch items', 'Erän kohteet'],
        ['Application', 'Sovellus'],
        ['Version', 'Versio'],
        ['State', 'Tila'],
        ['Message', 'Viesti'],
        ['Refresh', 'Lataa uudelleen'],
        ['Clear selection', 'Tyhjennä valinta'],
        ['Build payload', 'Luo hyötykuorma'],
        ['Update selected', 'Päivitä valitut'],
        ['Select or clear this page', 'Valitse tai tyhjennä tämä sivu'],
        ['Scope', 'Laajuus'],
        ['Available update', 'Saatavilla oleva päivitys'],
        ['Records per page', 'Tietueita sivulla'],
        ['Payload', 'Hyötykuorma'],
        ['Copy JSON', 'Kopioi JSON'],
        ['Confirm batch update', 'Vahvista eräpäivitys'],
        ['The update runs on the server and cannot be stopped from this page.', 'Päivitys suoritetaan palvelimella, eikä sitä voi pysäyttää tältä sivulta.'],
        ['Cancel', 'Peruuta'],
        ['Update', 'Päivitä'],
        ['no answer within {0} s', 'ei vastausta {0} sekunnin kuluessa'],
        ['invalid response from server', 'virheellinen vastaus palvelimelta'],
        ['Loading...', 'Ladataan...'],
        ['upgrade to {0} assigned', 'versiopäivitys versioon {0} määritetty'],
        ['An upgrade to {0} is assigned (glide.war.assigned differs from glide.war). Consider installing store application updates after the upgrade has finished.', 'Versiopäivitys versioon {0} on määritetty (glide.war.assigned poikkeaa arvosta glide.war). Harkitse Store-sovellusten päivitysten asentamista vasta, kun versiopäivitys on valmis.'],
        ['{0} applications still have a compatible update.', '{0} sovellukselle on yhä saatavilla yhteensopiva päivitys.'],
        ['{0} applications have a compatible update.', '{0} sovellukselle on saatavilla yhteensopiva päivitys.'],
        ['Could not load applications: {0}', 'Sovellusten lataaminen epäonnistui: {0}'],
        ['No applications with a compatible update.', 'Ei sovelluksia, joille on saatavilla yhteensopiva päivitys.'],
        ['Demo data', 'Esittelytiedot'],
        ['Showing {0}-{1} of {2}', 'Näytetään {0}-{1} / {2}'],
        ['First page', 'Ensimmäinen sivu'],
        ['Previous page', 'Edellinen sivu'],
        ['Page {0}', 'Sivu {0}'],
        ['Next page', 'Seuraava sivu'],
        ['Last page', 'Viimeinen sivu'],
        ['{0} of {1} selected', '{0} / {1} valittu'],
        ['A batch install is already running', 'Eräasennus on jo käynnissä'],
        ['Limit of {0} per batch reached. Unselect another application first.', 'Erän enimmäismäärä {0} on saavutettu. Poista ensin jonkin toisen sovelluksen valinta.'],
        ['Limit of {0} reached. {1} application(s) on this page were not selected.', 'Enimmäismäärä {0} on saavutettu. {1} sovellusta tällä sivulla jäi valitsematta.'],
        ['Selected all applications on this page.', 'Kaikki tämän sivun sovellukset valittu.'],
        ['Cleared this page.', 'Tämän sivun valinnat tyhjennetty.'],
        ['Selection cleared.', 'Valinta tyhjennetty.'],
        ['Nothing selected.', 'Mitään ei ole valittu.'],
        ['Payload built for {0} applications. Update is disabled while another batch runs.', 'Hyötykuorma luotu {0} sovellukselle. Päivittäminen on estetty, kun toinen erä on käynnissä.'],
        ['Payload built for {0} applications. Review it, then click Update selected.', 'Hyötykuorma luotu {0} sovellukselle. Tarkista se ja valitse sitten Päivitä valitut.'],
        ['Payload copied to clipboard.', 'Hyötykuorma kopioitu leikepöydälle.'],
        ['Copy failed. Select the JSON and copy it manually.', 'Kopiointi epäonnistui. Valitse JSON ja kopioi se manuaalisesti.'],
        ['Clipboard not available. Select the JSON and copy it manually.', 'Leikepöytä ei ole käytettävissä. Valitse JSON ja kopioi se manuaalisesti.'],
        ['Update {0} application(s) on {1}?', 'Päivitetäänkö {0} sovellusta instanssissa {1}?'],
        ['Load demo data', 'Lataa esittelytiedot'],
        ['Demo data will be loaded for all {0} applications.', 'Esittelytiedot ladataan kaikille {0} sovellukselle.'],
        ['Update {0}', 'Päivitä {0}'],
        ['Build the payload first.', 'Luo ensin hyötykuorma.'],
        ['Session token (g_ck) not found. Is the UI page set to Direct?', 'Istuntotunnusta (g_ck) ei löytynyt. Onko UI-sivulla Direct-asetus käytössä?'],
        ['Checking for a running batch...', 'Tarkistetaan käynnissä olevaa erää...'],
        ['Another batch install is running. Wait for it to finish.', 'Toinen eräasennus on käynnissä. Odota, että se valmistuu.'],
        ['Could not check for a running batch: {0}', 'Käynnissä olevan erän tarkistus epäonnistui: {0}'],
        ['Submitting batch install...', 'Lähetetään eräasennusta...'],
        ['No progress id in the response: {0}', 'Vastauksessa ei ole edistymistunnusta: {0}'],
        ['Submitted', 'Lähetetty'],
        ['Batch install submitted for {0} applications.', 'Eräasennus lähetetty {0} sovellukselle.'],
        ['Another batch install started in the meantime. Nothing was sent.', 'Toinen eräasennus käynnistyi sillä välin. Mitään ei lähetetty.'],
        ['Update request failed: {0}', 'Päivityspyyntö epäonnistui: {0}'],
        ['A batch install is running, started by {0} at {1}. Update is disabled until it finishes.', 'Eräasennus on käynnissä, aloittaja {0}, aloitettu {1}. Päivittäminen on estetty, kunnes se valmistuu.'],
        ['A batch install is running. Update is disabled until it finishes.', 'Eräasennus on käynnissä. Päivittäminen on estetty, kunnes se valmistuu.'],
        ['Batch "{0}" has not updated for {1} minutes and may have stalled. Update is enabled. Check the execution tracker before starting another batch.', 'Erä "{0}" ei ole päivittynyt {1} minuuttiin ja on voinut pysähtyä. Päivittäminen on sallittu. Tarkista suorituksen seuranta ennen uuden erän aloittamista.'],
        ['Unknown', 'Tuntematon'],
        ['{0} (no update for {1} min)', '{0} (ei päivitystä {1} min)'],
        ['{0} ({1} min ago)', '{0} ({1} min sitten)'],
        ['{0} applications | {1}', '{0} sovellusta | {1}'],
        ['Loading updates', 'Ladataan päivityksiä'],
        ['Stop watching', 'Lopeta seuranta'],
        ['Resume watching', 'Jatka seurantaa'],
        ['Stopped watching. The install continues on the server.', 'Seuranta lopetettu. Asennus jatkuu palvelimella.'],
        ['Paused while the tab is in the background', 'Keskeytetty, kun välilehti on taustalla'],
        ['Last check {0} | next in {1} s', 'Viimeisin tarkistus {0} | seuraava {1} s kuluttua'],
        ['Stopped watching after {0} failed checks ({1}). The install continues on the server. Click Resume watching or reload the page.', 'Seuranta lopetettiin {0} epäonnistuneen tarkistuksen jälkeen ({1}). Asennus jatkuu palvelimella. Valitse Jatka seurantaa tai lataa sivu uudelleen.'],
        ['Status check failed ({0}/{1}): {2}. Retrying in {3} s.', 'Tilan tarkistus epäonnistui ({0}/{1}): {2}. Uusi yritys {3} s kuluttua.'],
        ['Finished, last check {0}', 'Valmis, viimeisin tarkistus {0}'],
        ['Batch finished: {0}.', 'Erä valmis: {0}.'],
        ['How to use this page?', 'Miten tätä sivua käytetään?'],
        ['close', 'Sulje'],
        ['What this page does', 'Mitä sivu tekee'],
        ['Lists installed store applications that have an update compatible with the family release of this instance and installs the selected updates as one CI/CD batch, run as your user.', 'Näyttää asennetut Store-sovellukset, joille on saatavilla tämän instanssin julkaisuperheeseen yhteensopiva päivitys, ja asentaa valitut päivitykset yhtenä CI/CD-eränä käyttäjätunnuksellasi.'],
        ['Steps', 'Vaiheet'],
        ['Select applications in the list. The header checkbox selects or clears the current page.', 'Valitse sovellukset luettelosta. Otsikkorivin valintaruutu valitsee tai tyhjentää nykyisen sivun.'],
        ['Click Build payload and review the JSON.', 'Valitse Luo hyötykuorma ja tarkista JSON.'],
        ['Click Update selected, then check the instance and the list in the confirmation dialog.', 'Valitse Päivitä valitut ja tarkista sitten instanssi ja luettelo vahvistusikkunassa.'],
        ['Follow the progress in the Batch install card. The list refreshes when the batch finishes.', 'Seuraa edistymistä Eräasennus-kortissa. Luettelo päivittyy, kun erä valmistuu.'],
        ['Good to know', 'Hyvä tietää'],
        ['A batch holds up to {0} applications. Only one batch can run at a time. Update is disabled while another batch is running.', 'Erään mahtuu enintään {0} sovellusta. Vain yksi erä voi olla käynnissä kerrallaan. Päivittäminen on estetty, kun toinen erä on käynnissä.'],
        ['You can reload or close the page during an install. The install continues on the server and the page resumes tracking when you open it again.', 'Voit ladata sivun uudelleen tai sulkea sen asennuksen aikana. Asennus jatkuu palvelimella, ja sivu jatkaa seurantaa, kun avaat sen uudelleen.'],
        ['A batch without progress for {0} minutes is shown as stalled and no longer blocks Update. Check the execution tracker before starting another batch.', 'Erä, joka ei ole edennyt {0} minuuttiin, näytetään pysähtyneenä, eikä se enää estä päivittämistä. Tarkista suorituksen seuranta ennen uuden erän aloittamista.'],
        ['Demo data is loaded only when Load demo data is checked, for all applications in the batch. Use it on test or demo instances. The Demo data badge shows applications that already have demo data loaded.', 'Esittelytiedot ladataan vain, kun Lataa esittelytiedot on valittuna, ja silloin kaikille erän sovelluksille. Käytä sitä testi- tai esittelyinstansseissa. Esittelytiedot-merkki näyttää sovellukset, joihin esittelytiedot on jo ladattu.'],
        ['The Rollback link in the Batch install card opens the rollback context of the batch.', 'Eräasennus-kortin Palautus-linkki avaa erän palautuskontekstin.'],
        ['Requires the admin role and access to the CI/CD API.', 'Edellyttää admin-roolia ja pääsyä CI/CD-ohjelmointirajapintaan.'],
        ['More information about the CI/CD API from ServiceNow Docs', 'Lisätietoja CI/CD-ohjelmointirajapinnasta ServiceNow Docsissa']
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