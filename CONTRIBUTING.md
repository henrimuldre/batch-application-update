# Contributing

Thanks for helping improve Batch Application Update. Bug reports, ideas, translations and code changes are all welcome.

## Before you start

- **Questions and ideas:** start a discussion in [Discussions](../../discussions).
- **Bugs:** open an [issue](../../issues/new/choose) with the bug report template.
- **Larger changes:** open an issue or discussion first, so we can agree on the approach before you spend time on it.

Never include instance names, user names, credentials, customer data or other sensitive details in issues, screenshots, logs or update sets.

## Development setup

You need a ServiceNow instance where you can install store application updates, for example a Personal Developer Instance (PDI). Do not develop against a production instance.
To get your own PDI, go to [ServiceNow Developers](https://developer.servicenow.com/dev.do) page, login or create an account for free and request a new instance.

1. Import `update-set/Batch_Application_Update_v1.0.xml` and commit it.
2. Create a new local update set for your change and make it current.
3. Make your changes in the instance:
   - UI page `batch_app_update` (HTML and client script)
   - Script Include `BatchAppUpdateAjax`

## Rules for code changes

- **Keep `src/` and the update set in sync.** Copy your final code into the matching files in `src/` and export a new update set XML that contains the same code.
- **Global scope, ES5.** The client script and the Script Include must run without a build step. Do not use `let`, `const`, arrow functions or other syntax the ServiceNow script engine or older browsers may reject.
- **Texts go through `bauT()`.** Every user-facing text must be an English key in `BAU_MSG` in the client script. Static texts in the HTML use `data-bau-msg="<key>"`. If you add, change or remove a key, update all translation scripts in `translations/` as well.
- **Keep the admin checks.** Every client-callable method in `BatchAppUpdateAjax` must keep its role check.
- **No instance-specific values.** No hard-coded `sys_id` values, host names, user names or customer-specific logic.

## Cleaning an exported update set

Before you commit an exported XML, check it for data from your instance:

- `sys_created_by` and `sys_updated_by` values, both in the main XML and inside each `<payload>`
- instance names, host names and URLs
- records that do not belong to the tool. "Add to Update Set" utilities can add dependencies such as the `admin` role record (`sys_user_role`), remove those

The update set must contain only the UI page, the Script Include, the two ACLs and their two role links.

## Translations

To add a language, copy `translations/install_template.js`, set `LANGUAGE` and fill in the translations. See the Translations section in the [README](README.md). Keep every `{0}`, `{1}` placeholder from the key.

## Testing

Before you open a pull request, test on a sub-production instance:

1. The page loads and lists applications without errors in the status line or the browser console.
2. Build a payload with and without **Load demo data** and check the JSON.
3. Run a small batch (two or three applications) and check that progress, plan state and batch items update until the batch finishes.
4. Reload the page while a batch is running: the batch card comes back and **Update selected** stays disabled.
5. Open the help dialog.
6. If you changed texts, switch the session language and check that no `[BAU] message key not in BAU_MSG` warnings appear in the console.

## Pull requests

- One topic per pull request.
- Describe what changed and why and how you tested it.
- Include screenshots for UI changes, taken on a PDI or with sensitive details removed.

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
