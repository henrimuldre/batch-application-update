# Security policy

## Supported versions

Only the latest release in this repository receives fixes.

| Version | Supported |
|---|---|
| 1.2.1 | Yes |
| 1.2 | No |
| 1.1 | No |
| 1.0 | No |

## Reporting a vulnerability

Please do not report security issues in public issues or discussions.

Report them privately through GitHub: open the **Security** tab of this repository and select **Report a vulnerability**.

Include:

- a description of the issue and its impact
- steps to reproduce, ideally on a Personal Developer Instance (PDI)
- the ServiceNow family release and patch level you tested on

Do not include credentials, customer data or details of a production instance.

You will get an answer as soon as possible. If the report is confirmed, a fix is released and the reporter is credited unless they prefer not to be.

## Scope

In scope:

- the UI page `batch_app_update`, the Script Include `BatchAppUpdateAjax` and their ACLs
- the translation scripts in `translations/`

Out of scope:

- the ServiceNow platform itself, including the CI/CD API. Report those to ServiceNow.
- issues that require the configured role (`REQUIRE_ROLE`, default `admin`), unless they let a user do more than that role already allows

## Security design notes

- The UI page ACL and every client-callable method except `getMessages` require the role set in `REQUIRE_ROLE` (default `admin`). `getMessages` returns only the translated page texts.
- The batch install request runs as the logged-in user with the session token (`g_ck`). The tool stores no credentials.