import React, { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLocale } from '../../i18n';
import { createTreeModel } from './treeGeometry';
import './InteractiveTree.css';

export type TreePerformance = { sampleCount: number; renderP50Ms: number; renderP95Ms: number; frameP50Ms: number; frameP95Ms: number; drawCalls: number; triangles: number; pixelRatio: number; decorativeLeaves: number; blossoms: number };
export type TreeFallbackReason = 'reduced-motion' | 'low-power' | 'webgl-unavailable' | 'context-lost' | 'slow-rendering' | 'render-error';
type Props = { count: number; onClose: () => void; onFallback: (reason: TreeFallbackReason, performance?: TreePerformance) => void; onReady?: (performance: TreePerformance) => void };
const copy = {
  en: { label: 'Explore your tree in 3D', help: 'Drag sideways to turn. Scroll vertically as usual. Arrow keys turn and tilt; + and − zoom.', loading: 'Preparing your tree…', left: 'Turn left', right: 'Turn right', closer: 'Zoom in', farther: 'Zoom out', reset: 'Reset view', back: 'Return to still tree' },
  tr: { label: 'Ağacını 3B keşfet', help: 'Çevirmek için yana sürükle. Dikey kaydırma normal çalışır. Oklar çevirir ve eğer; + ve − yakınlaştırır.', loading: 'Ağacın hazırlanıyor…', left: 'Sola çevir', right: 'Sağa çevir', closer: 'Yakınlaştır', farther: 'Uzaklaştır', reset: 'Görünümü sıfırla', back: 'Sabit ağaca dön' },
  es: { label: 'Explora tu árbol en 3D', help: 'Arrastra hacia los lados para girar. Desplázate verticalmente como siempre. Las flechas giran e inclinan; + y − ajustan el zoom.', loading: 'Preparando tu árbol…', left: 'Girar a la izquierda', right: 'Girar a la derecha', closer: 'Acercar', farther: 'Alejar', reset: 'Restablecer vista', back: 'Volver al árbol estático' },
};
const percentile = (numbers: number[], ratio: number) => Number([...numbers].sort((a, b) => a - b)[Math.min(numbers.length - 1, Math.floor(numbers.length * ratio))]?.toFixed(2) || 0);

/** Lazy-load this component only after an explicit request; static imagery is primary. */
export default function InteractiveTree({ count, onClose, onFallback, onReady }: Props) {
  const [locale] = useLocale(); const labels = copy[locale]; const helpId = useId(); const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); const controls = useRef<{ turn: (amount: number) => void; zoom: (amount: number) => void; reset: () => void } | null>(null);
  const callbacks = useRef({ onFallback, onReady }); callbacks.current = { onFallback, onReady };
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; const viewport = viewportRef.current; if (!canvas || !viewport) return;
    setReady(false);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) { callbacks.current.onFallback('reduced-motion'); return; }
    const browser = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (browser.connection?.saveData || (browser.deviceMemory !== undefined && browser.deviceMemory <= 2)) { callbacks.current.onFallback('low-power'); return; }
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }); }
    catch { callbacks.current.onFallback('webgl-unavailable'); return; }
    let disposed = false; let failed = false; let frame = 0; let model: ReturnType<typeof createTreeModel> | undefined;
    const fail = (reason: TreeFallbackReason, performance?: TreePerformance) => { if (!disposed && !failed) { failed = true; if (frame) cancelAnimationFrame(frame); callbacks.current.onFallback(reason, performance); } };
    const releases: (() => void)[] = [];
    const cleanup = () => {
      if (disposed) return;
      disposed = true; controls.current = null; if (frame) cancelAnimationFrame(frame);
      for (const release of releases.reverse()) { try { release(); } catch { /* Complete the remaining cleanup even after a lost context. */ } }
      try { model?.dispose(); } catch { /* Release the renderer even if model disposal failed. */ }
      try { renderer.dispose(); } finally { renderer.forceContextLoss(); }
    };
    try {
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
    scene.add(new THREE.HemisphereLight('#fff9e9', '#4b5340', 2.3));
    const sun = new THREE.DirectionalLight('#fff4d6', 3.0); sun.position.set(-4, 7, 5); scene.add(sun);
    const fill = new THREE.DirectionalLight('#eef1de', 1.0); fill.position.set(3, 4, -4); scene.add(fill);
    model = createTreeModel(count); scene.add(model.group);

    // Original soft contact shadow, no shadow-map pass or downloaded texture.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d'); if (!ctx) throw new Error('Canvas texture is unavailable'); const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(42,49,28,.23)'); gradient.addColorStop(0.45, 'rgba(42,49,28,.12)'); gradient.addColorStop(1, 'rgba(42,49,28,0)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas); releases.push(() => shadowTexture.dispose());
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }); releases.push(() => shadowMaterial.dispose());
    const shadowGeometry = new THREE.PlaneGeometry(count === 0 ? 0.8 : 3.6, count === 0 ? 0.8 : 3.6);
    releases.push(() => shadowGeometry.dispose());
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.01; scene.add(shadow);
    let yaw = 0; let tilt = 0.075; let zoom = 1; let samples = 0; let lastAt = 0;
    const renderTimes: number[] = []; const frameTimes: number[] = [];
    const bounds = new THREE.Box3().setFromObject(model.group);
    const matureHeight = Math.max(5.2, bounds.max.y); const radius = Math.max(2.45, Math.abs(bounds.min.x), Math.abs(bounds.max.x), Math.abs(bounds.min.z), Math.abs(bounds.max.z));
    const target = new THREE.Vector3(0, matureHeight / 2, 0);
    // A sphere about the fixed target fits at every yaw/tilt and maximum zoom.
    const framingRadius = Math.sqrt(2 * radius * radius + (matureHeight / 2) ** 2);
    const render = () => {
      frame = 0; if (disposed || failed || document.hidden) return;
      const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const limitingAngle = Math.atan(vertical * Math.min(1, camera.aspect));
      const distance = framingRadius / Math.sin(limitingAngle) * 1.05 * 1.16 / zoom;
      camera.position.set(Math.sin(yaw) * distance * Math.cos(tilt), target.y + Math.sin(tilt) * distance, Math.cos(yaw) * distance * Math.cos(tilt)); camera.lookAt(target);
      canvas.dataset.yaw = yaw.toFixed(4); canvas.dataset.zoom = zoom.toFixed(3);
      const before = performance.now();
      try { renderer.render(scene, camera); } catch { fail('render-error'); return; }
      const duration = performance.now() - before;
      if (samples < 16) {
        samples++;
        if (samples > 3) { renderTimes.push(duration); if (lastAt) frameTimes.push(before - lastAt); }
        lastAt = before;
        if (samples === 16) {
          const result: TreePerformance = { sampleCount: renderTimes.length, renderP50Ms: percentile(renderTimes, 0.5), renderP95Ms: percentile(renderTimes, 0.95), frameP50Ms: percentile(frameTimes, 0.5), frameP95Ms: percentile(frameTimes, 0.95), drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio: renderer.getPixelRatio(), decorativeLeaves: model!.leaves, blossoms: model!.blossoms };
          canvas.dataset.performance = JSON.stringify(result);
          // Samples measure CPU submission and host RAF cadence, not native-phone GPU time.
          if (result.renderP50Ms > 32 || result.frameP50Ms > 65) { fail('slow-rendering', result); return; }
          setReady(true); callbacks.current.onReady?.(result);
        }
        if (samples < 16) frame = requestAnimationFrame(render);
      }
    };
    const schedule = () => { if (!frame && !disposed && !failed) frame = requestAnimationFrame(render); };
    const resize = () => { try { const rect = viewport.getBoundingClientRect(); if (!rect.width || !rect.height) return; camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); schedule(); } catch { fail('render-error'); } };
    controls.current = { turn: amount => { yaw += amount; schedule(); }, zoom: amount => { zoom = Math.min(1.16, Math.max(0.84, zoom + amount)); schedule(); }, reset: () => { yaw = 0; tilt = 0.075; zoom = 1; schedule(); } };
    let pointer: { id: number; x: number; y: number; yaw: number; axis: 'pending' | 'horizontal' | 'vertical' } | null = null;
    const down = (event: PointerEvent) => { if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return; pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, axis: 'pending' }; if (event.pointerType === 'mouse') canvas.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return; const dx = event.clientX - pointer.x; const dy = event.clientY - pointer.y;
      if (pointer.axis === 'pending' && Math.max(Math.abs(dx), Math.abs(dy)) > 8) pointer.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'horizontal' : 'vertical';
      if (pointer.axis === 'horizontal') { yaw = pointer.yaw - dx * 0.009; schedule(); }
    };
    const end = () => { pointer = null; };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') yaw -= Math.PI / 12; else if (event.key === 'ArrowRight') yaw += Math.PI / 12;
      else if (event.key === 'ArrowUp') tilt = Math.min(0.24, tilt + 0.04); else if (event.key === 'ArrowDown') tilt = Math.max(-0.04, tilt - 0.04);
      else if (['+', '='].includes(event.key)) zoom = Math.min(1.16, zoom + 0.08); else if (event.key === '-') zoom = Math.max(0.84, zoom - 0.08);
      else if (event.key === 'Home' || event.key === '0') { controls.current?.reset(); event.preventDefault(); return; } else return;
      event.preventDefault(); schedule();
    };
    const contextLost = () => fail('context-lost'); const visibility = () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else { lastAt = 0; schedule(); } };
    const motionChanged = () => { if (motion.matches) fail('reduced-motion'); };
    const observer = new ResizeObserver(resize); releases.push(() => observer.disconnect()); observer.observe(viewport);
    releases.push(() => {
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end); canvas.removeEventListener('lostpointercapture', end); canvas.removeEventListener('keydown', key); canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', motionChanged);
    });
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end); canvas.addEventListener('keydown', key); canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibility); motion.addEventListener('change', motionChanged); resize();
    return cleanup;
    } catch { fail('render-error'); cleanup(); return cleanup; }
  }, [count]);

  return <section className="oda-tree-3d" aria-label={labels.label}>
    <div ref={viewportRef} className="oda-tree-3d-viewport">
      <canvas ref={canvasRef} tabIndex={0} role="img" aria-label={labels.label} aria-describedby={helpId} />
      {!ready && <p className="oda-tree-3d-loading" role="status">{labels.loading}</p>}
    </div>
    <p id={helpId} className="oda-tree-3d-instructions">{labels.help}</p>
    <div className="oda-tree-3d-controls">
      <button type="button" aria-label={labels.left} onClick={() => controls.current?.turn(-Math.PI / 12)}>↶</button>
      <button type="button" aria-label={labels.right} onClick={() => controls.current?.turn(Math.PI / 12)}>↷</button>
      <button type="button" aria-label={labels.farther} onClick={() => controls.current?.zoom(-0.08)}>−</button>
      <button type="button" aria-label={labels.closer} onClick={() => controls.current?.zoom(0.08)}>+</button>
      <button type="button" className="oda-tree-3d-reset" onClick={() => controls.current?.reset()}>{labels.reset}</button>
    </div>
    <button type="button" className="oda-tree-3d-return" onClick={onClose}>{labels.back}</button>
  </section>;
}
