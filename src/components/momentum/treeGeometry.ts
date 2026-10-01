/**
 * Original ODA procedural deciduous tree. Geometry, leaf shapes and bark/ground
 * textures are authored here; no external models, photography or paid assets.
 * Decorative foliage describes a coarse growth stage, never the evidence ledger.
 */
import * as THREE from 'three';

export type TreeModel = { group: THREE.Group; dispose: () => void; leaves: number; blossoms: number };

function random(seed = 107) {
  let value = seed;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

export function treeGrowth(count: number) {
  const kept = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  return { kept, leaves: Math.min(60, kept), blossoms: Math.min(30, Math.max(0, kept - 60)) };
}

function barkTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
  const ctx = canvas.getContext('2d')!; const rng = random(529);
  ctx.fillStyle = '#807361'; ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 730; i++) {
    const x = rng() * 128; const y = rng() * 256; const length = 4 + rng() * 45;
    ctx.strokeStyle = i % 3 ? `rgba(48,39,28,${0.12 + rng() * 0.32})` : `rgba(220,207,176,${0.1 + rng() * 0.3})`;
    ctx.lineWidth = 0.4 + rng() * 2; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 2, y + length * 0.3, x + 3, y + length * 0.7, x + rng() * 2, y + length); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** A folded lanceolate leaf: the raised midrib and curled margins catch light. */
function leafGeometry() {
  const positions: number[] = []; const colors: number[] = []; const uv: number[] = []; const indices: number[] = [];
  const sections = 3;
  for (let i = 0; i <= sections; i++) {
    const t = i / sections; const width = Math.pow(Math.sin(Math.PI * t), 0.8) * 0.34;
    for (let j = -1; j <= 1; j++) {
      positions.push(j * width, t, j === 0 ? 0.045 * Math.sin(Math.PI * t) : -0.055 * Math.sin(Math.PI * t) + 0.045 * t * t);
      const shade = j === 0 ? 1 : 0.83 + 0.09 * t; colors.push(shade, shade, shade); uv.push((j + 1) / 2, t);
    }
  }
  for (let i = 0; i < sections; i++) for (let j = 0; j < 2; j++) {
    const a = i * 3 + j; indices.push(a, a + 1, a + 3, a + 1, a + 4, a + 3);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export function createTreeModel(count: number): TreeModel {
  const growth = treeGrowth(count); const group = new THREE.Group(); const rng = random();
  const positions: number[] = []; const uv: number[] = []; const indices: number[] = [];
  const foliage: { position: THREE.Vector3; direction: THREE.Vector3; size: number; shade: number; angle: number }[] = [];
  const barkMap = barkTexture();
  const woodMaterial = new THREE.MeshStandardMaterial({ map: barkMap, bumpMap: barkMap, bumpScale: 0.08, color: '#b6a187', roughness: 0.96 });
  const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>([woodMaterial]);

  function limb(points: THREE.Vector3[], radius: number, tip: number, sides = 9) {
    const steps = radius < 0.018 ? 3 : 8;
    const curve = new THREE.CatmullRomCurve3(points); const frames = curve.computeFrenetFrames(steps, false); const base = positions.length / 3;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; const center = curve.getPoint(t); const r = radius * Math.pow(1 - t, 0.85) + tip * t;
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2; const ridge = 1 + 0.095 * Math.cos(angle * 5 + t * 4);
        const p = center.clone().addScaledVector(frames.normals[i], Math.cos(angle) * r * ridge).addScaledVector(frames.binormals[i], Math.sin(angle) * r * ridge);
        positions.push(p.x, p.y, p.z); uv.push(j / sides, t * Math.max(0.25, curve.getLength() * 0.65));
        if (i < steps && j < sides) { const a = base + i * (sides + 1) + j; indices.push(a, a + sides + 1, a + 1, a + 1, a + sides + 1, a + sides + 2); }
      }
    }
    return curve;
  }

  function leavesAlong(curve: THREE.CatmullRomCurve3, number: number, size: number) {
    for (let i = 0; i < number; i++) {
      const t = 0.32 + i / number * 0.68; const anchor = curve.getPoint(t); const tangent = curve.getTangent(t);
      const angle = i * 2.39996 + rng() * 0.5; const spread = new THREE.Vector3(Math.cos(angle), 0.4 + rng() * 0.4, Math.sin(angle)).normalize();
      foliage.push({ position: anchor.clone().addScaledVector(spread, 0.03 + rng() * 0.06), direction: spread.addScaledVector(tangent, 0.45).normalize(), size: size * (0.7 + rng() * 0.55), shade: rng(), angle: rng() * 1.4 - 0.7 });
    }
  }

  function branch(start: THREE.Vector3, direction: THREE.Vector3, length: number, radius: number, depth: number) {
    const end = start.clone().addScaledVector(direction, length); end.y += length * 0.04;
    const curve = limb([start, start.clone().addScaledVector(direction, length * 0.28), start.clone().lerp(end, 0.65).add(new THREE.Vector3(0.015, -length * 0.02, 0.03)), end], radius, radius * 0.12, depth > 1 ? 5 : 8);
    if (depth >= 3) { leavesAlong(curve, 15, 0.23); return; }
    const children = 3;
    for (let i = 0; i < children; i++) {
      const t = 0.32 + i / (children - 1) * 0.58; const nextStart = curve.getPoint(t); const tangent = curve.getTangent(t);
      const a = i * 2.39996 + depth * 1.5 + rng() * 0.5;
      const side = new THREE.Vector3(Math.cos(a), -0.18 + rng() * 0.5, Math.sin(a));
      const nextDirection = tangent.clone().multiplyScalar(0.5).addScaledVector(side, 0.85).normalize();
      branch(nextStart, nextDirection, length * (0.57 + rng() * 0.18) * (1.02 - t * 0.15), radius * 0.39, depth + 1);
    }
  }

  if (growth.kept === 0) {
    const curve = limb([new THREE.Vector3(), new THREE.Vector3(-0.02, 0.46, 0), new THREE.Vector3(0.025, 0.92, 0.025)], 0.015, 0.005, 7);
    for (let i = 0; i < 4; i++) foliage.push({ position: curve.getPoint(0.62 + i * 0.09), direction: new THREE.Vector3(i % 2 ? 1 : -1, 0.35, i < 2 ? 0.25 : -0.35).normalize(), size: 0.25 + i * 0.01, shade: i / 4, angle: 0.3 });
  } else {
    const trunk = limb([new THREE.Vector3(), new THREE.Vector3(-0.03, 0.85, 0.03), new THREE.Vector3(0.04, 1.9, 0), new THREE.Vector3(-0.15, 3.2, 0.03), new THREE.Vector3(-0.03, 4.5, -0.12)], 0.21, 0.018, 14);
    for (let i = 0; i < 9; i++) {
      const t = 0.31 + i * 0.067; const angle = i * 2.39996 + 0.3;
      const direction = new THREE.Vector3(Math.cos(angle) * 0.95, 0.3 + i * 0.035, Math.sin(angle) * 0.95).normalize();
      branch(trunk.getPoint(t), direction, 2.45 - Math.abs(i - 3) * 0.13, 0.11 - i * 0.007, 0);
    }
    // Root flare is actual tapered wood, kept above the ground plane.
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; limb([new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(Math.cos(a) * 0.2, 0.075, Math.sin(a) * 0.2), new THREE.Vector3(Math.cos(a) * 0.48, 0.012, Math.sin(a) * 0.48)], 0.072, 0.009, 7); }
    const scale = growth.kept < 10 ? 0.4 + growth.kept * 0.009 : growth.kept < 30 ? 0.56 + (growth.kept - 10) * 0.005 : 0.76 + Math.min(30, growth.kept - 30) * 0.008;
    group.scale.setScalar(scale);
  }

  const wood = new THREE.BufferGeometry(); wood.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); wood.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); wood.setIndex(indices); wood.computeVertexNormals();
  geometries.add(wood); group.add(new THREE.Mesh(wood, woodMaterial));
  const leaf = leafGeometry(); geometries.add(leaf);
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#e4edd4', vertexColors: true, side: THREE.DoubleSide, roughness: 0.72 }); materials.add(leafMaterial);
  const density = growth.kept === 0 ? 1 : growth.kept < 10 ? 0.13 + growth.kept * 0.007 : growth.kept < 30 ? 0.3 + (growth.kept - 10) * 0.012 : 0.55 + Math.min(30, growth.kept - 30) * 0.015;
  // Evenly distributed foliage instead of filling one side of the crown first.
  const visible = foliage.filter((_, i) => ((i * 167) % 997) / 997 < density);
  const leaves = new THREE.InstancedMesh(leaf, leafMaterial, visible.length); const dummy = new THREE.Object3D(); const up = new THREE.Vector3(0, 1, 0);
  visible.forEach((item, i) => {
    dummy.position.copy(item.position); dummy.quaternion.setFromUnitVectors(up, item.direction); dummy.rotateY(item.angle); dummy.rotateX(-0.25 + item.shade * 0.6); dummy.scale.set(item.size * 0.8, item.size, item.size); dummy.updateMatrix(); leaves.setMatrixAt(i, dummy.matrix);
    leaves.setColorAt(i, new THREE.Color().setHSL(0.21 + item.shade * 0.045, 0.24 + item.shade * 0.12, 0.25 + item.shade * 0.18));
  }); leaves.instanceMatrix.needsUpdate = true; if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true; leaves.computeBoundingSphere(); group.add(leaves);

  if (growth.blossoms && visible.length) {
    const petal = new THREE.SphereGeometry(0.023, 6, 4); geometries.add(petal); const pink = new THREE.MeshStandardMaterial({ color: '#ecc5bf', roughness: 0.7 }); materials.add(pink);
    const flowers = new THREE.InstancedMesh(petal, pink, growth.blossoms * 5);
    for (let i = 0; i < growth.blossoms; i++) {
      const anchor = visible[(i * 173 + 23) % visible.length].position;
      for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; dummy.position.copy(anchor).add(new THREE.Vector3(Math.cos(a) * 0.027, 0.02 + Math.sin(a) * 0.027, 0.01)); dummy.rotation.set(0, 0, a); dummy.scale.set(0.65, 1, 0.4); dummy.updateMatrix(); flowers.setMatrixAt(i * 5 + j, dummy.matrix); }
    }
    flowers.computeBoundingSphere(); group.add(flowers);
  }

  return { group, leaves: visible.length, blossoms: growth.blossoms, dispose: () => { group.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); }); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); barkMap.dispose(); } };
}
