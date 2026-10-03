After root confirms final source and fresh `/workspace/oda-native-settings-otp/dist`, run:

`node /workspace/scratch/oda-native-settings-otp-browser/run.mjs`

For interactive local use, append `--serve` and open http://127.0.0.1:4190. Ctrl+C stops it. Do not run automated QA while the interactive server owns that port.

The fixture bundles actual `BackupAndCloudSettings`, `Account`, `useCloudState`, shared UI, translations and tree assets. One fake `cloudSync` singleton is shared by both screens, including callback state updates. Store routes, native detection, notification calls and all authentication responses are synthetic. No email, cloud/provider/native API calls, secrets, installs or application-source writes occur. All artifacts stay in this scratch directory.

The harness checks native Settings-to-Account routing without a send, request/verification errors and retry, same-address resend, busy controls, shared sign-in state and returning to Settings, held send after navigation, web magic-link compatibility, and EN/TR/ES at 320/390 pixels. Six code-entry PNGs and `report.json` retain results and source/CSS hashes; failures retain `failure.png`.

The final run passed all 21 checks on Account source `8fe6847b30ac3f488bb7e78323e99835fc186e3ae4adf0eab631a7f32526a533`. All six document/main scroll widths equal their 320px or 390px viewport; actual tree imagery and fonts load. Held send and verification also reject repeated form submissions without duplicate synthetic auth calls. Resend and different-email labels now have a measured 16px gap at 390px; they wrap onto separate lines at 320px.

`before-layout-fix/` preserves all six original overflow screenshots and the original source/CSS-bound report. `first-overflow-diagnostic/` preserves the first interrupted capture. `before-action-spacing/` preserves the passing v2 21-check report and six captures before the inline-action spacing adjustment. The final fixture uses only the actual built CSS, avoiding a second copy of imported component styles. The earlier purchase-identity fixture and application worktree are untouched.
