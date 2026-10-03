Run `node /workspace/scratch/oda-purchase-identity-upgrade-browser/run.mjs` for the automated Chromium acceptance checks and six screenshots.

Run the same command with `--serve` to open the interactive fixture at http://127.0.0.1:4189. The expandable local control panel switches synthetic account state and completes held purchase/restore/verification promises. Stop with Ctrl+C.

This imports the actual Upgrade component, translations, purchase binding helper, course/entitlement data and fresh production CSS/fonts from `/workspace/oda-purchase-identity-fix`. Store, cloud, native and purchase boundaries are synthetic. It never loads a RevenueCat SDK, contacts Apple/cloud/providers, or reads environment secrets. All external browser requests are denied during acceptance checks. It writes only to this scratch directory.
