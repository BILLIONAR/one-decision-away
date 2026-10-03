# Scoped working surface repair

Base: 635209e1731ba53e2567c0f39b011183912d7ac8, existing design/reference-led-oda branch.

- Focus: replace the cropped decorative blank card cover with the actual owned notebook+pencil cover; native 1672:941 landscape aspect and object-fit contain, no orphan quote mark. Timer controls/controllers stay unchanged.
- Today: remove duplicated hero growth stage, count and week ring. The existing GrowthTreePanel remains the sole principal growth visualization, with actual stage/count/ledger/evidence callback. GrowthWeek remains the actual secondary weekly evidence. Reduce reserved hero-art whitespace without changing quote contents or decision handlers. The protected first-kept reward component may still display its existing small contextual first-leaf icon.
- Scoped controls: protected tomorrow input retains 44px height in its flex column; existing support dismiss buttons become >=44x44; Notebook direct editor Delete becomes >=44x44. No FirstSteps, EvidenceTree or JournalWorkspace source edits.
- No assets, providers, package installation, build, commit, push or publication. Exact source-art/material fidelity remains held.
