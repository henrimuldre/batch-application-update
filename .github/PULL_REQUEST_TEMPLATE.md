<!-- Do not include instance names, user names, credentials or customer data. -->

## What changed and why


## Related issue or discussion

<!-- For example: Fixes #12 -->

## How I tested it

- ServiceNow family release and patch:
- UI: Core UI / Next Experience
- Browser:

## Checklist

- [ ] `src/` and the update set in `update-set/` contain the same code
- [ ] The exported update set is cleaned (no instance user names, host names or unrelated records such as `sys_user_role`)
- [ ] New or changed texts are in `BAU_MSG` and the translation scripts in `translations/` are updated
- [ ] No `[BAU] message key not in BAU_MSG` warnings in the browser console
- [ ] Tested a small batch on a sub-production instance
- [ ] Screenshots added for UI changes (optional)
