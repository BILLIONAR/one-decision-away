Bounded independent local browser QA passed for source commit `25e0dc2e9b536928bf57c04e83b167a796af5fac`, branch `fix/purchase-identity-isolation`, based on `e72724f`. Preview: `http://127.0.0.1:4188/one-decision-away/#/app`; entry bundle: `assets/index-CCDlpWJE.js`.

31 focused checks passed; 20 actual PNGs; 18 scoped axe scans without serious or critical findings; zero browser exceptions. EN/TR/ES were checked at 320×844 and 390×844. Seven relevant source hashes remained unchanged throughout the passing run: the six changed app files and the native boot guard.

Fresh web records boot to onboarding. Signed-out Today uses actual lightweight course metadata. Untouched courses show their real overview before explicit Start; partial lessons, reflections and checked practice survive reload. Returning learners resume saved lesson two directly, and Today continuation retains its real title, minutes and goal. Web Upgrade remains informational and has no purchase or restore controls. Actual EN320 welcome, ES390 course overview and EN320 Upgrade pixels were inspected.

All external requests were blocked. Synthetic local records only; no application source/evidence edits, SDK/payment/account/native testing, production requests or publication. This bounded review covers web continuity; native account-isolation behavior belongs to the parent's focused tests.

The first failure was the parent's preview base-path configuration, retained under `before-preview-fix/`. The second was the scratch helper requiring an HTTP response for ordinary same-document hash navigation, retained under `before-hash-navigation-fix/`. Both were corrected without changing app source.

Reproduce from `/workspace/oda-purchase-identity-fix` with `node --import tsx /workspace/scratch/oda-purchase-identity-browser/qa-local-continuity.mjs`. Publication remains held for parent review.
