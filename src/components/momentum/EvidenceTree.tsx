import React, { useState } from 'react';
import { treePresentation } from '../../data/treePresentation';
import '../../styles/growth.css';

export { TREE_LEAVES, MAX_BLOSSOMS } from '../../data/treePresentation';

/** Native transparent imagery illustrates coarse growth stages. Saved decisions own the exact ledger. */
export const EvidenceTree: React.FC<{ count: number; className?: string; label: string }> = ({ count, className = '', label }) => {
  const tree = treePresentation(count);
  const [failedAsset, setFailedAsset] = useState<string | null>(null);
  const failed = failedAsset === tree.file;
  return (
    <div role="img" aria-label={label} className={`oda-evidence-tree ${className}`}
      data-tree-stage={tree.stage} data-kept-count={tree.total} data-leaves={tree.leaves} data-blossoms={tree.blossoms} data-image-failed={failed}>
      <span className="oda-tree-ground" aria-hidden="true" />
      {failed ? <span className="oda-tree-unavailable" aria-hidden="true">{label}</span> : <img
        key={tree.file} src={`${import.meta.env.BASE_URL}assets/oda/trees/${tree.file}`}
        width={1254} height={1254} alt="" aria-hidden="true" decoding="async"
        style={{ transformOrigin: `${tree.origin[0]}% ${tree.origin[1]}%`, transform: `translate(${tree.offset[0]}%, ${tree.offset[1]}%) scale(${tree.scale})` }}
        onError={() => setFailedAsset(tree.file)}
      />}
    </div>
  );
};
