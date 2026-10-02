# Scoped layout repair comparison preparation

The baseline is preserved directly from immutable committed evidence `635209e1731ba53e2567c0f39b011183912d7ac8`, whose actual application source is `3ddb98b57669ceed6f220583aa01aa523d6b6a47`. These seven **390 × 844** RGB browser captures use isolated synthetic review state. Every copied PNG hash and byte count matches both its committed Git object and the sealed capture report; all 394 recorded build hashes remain identical across that baseline capture. The raw PNGs and report are unchanged.

| Before state | Committed baseline PNG |
| --- | --- |
| sound-discovery | [sound-discovery.png](baseline/sound-discovery.png) |
| sound-detail-player | [sound-detail-player.png](baseline/sound-detail-player.png) |
| coach | [coach.png](baseline/coach.png) |
| today | [today.png](baseline/today.png) |
| focus | [focus.png](baseline/focus.png) |
| notebook | [notebook.png](baseline/notebook.png) |
| course-overview | [course-overview.png](baseline/course-overview.png) |

After captures and comparison sheets are **pending the new source freeze GO and independent visual QA**. The final sheets will pair these raw before captures with actual new after captures at native size, verify pasted pixels after PNG encode/decode, and bind both exact source revisions. No assumed after screenshot or original-reference column is inserted now. Layout findings 1–8 will be assessed under their exact scoped criteria; this baseline packet does not claim repair completion or visual fidelity acceptance.

All seven original inline reference images are visually available and inspected. Only local copies of the exact original user JPEG files remain unavailable (**0/7**), so the exact original-user-JPEG column cannot be composed locally.

[Current public source / artwork HOLD status](reference-artwork-status.md) is copied **unchanged** from the baseline commit. Public flattened source presentations have been identified; standalone clean artwork/layers and reuse availability remain unestablished. No new art, download retry, Library or provider action is part of this work.

[Baseline preservation receipt](baseline-preservation-receipt.json) records each Git path/blob, source/evidence revision, bytes, SHA256, PNG dimensions and capture-report match. This preparation changes scratch evidence only: no app edits, build, commit, push or deployment.
