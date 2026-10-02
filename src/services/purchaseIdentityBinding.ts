type AccountState = { session: { user: { id: string } } | null; scopeRevision: number };
type IdentitySource = {
  init(): Promise<void>;
  isSessionReady(): boolean;
  getState(): AccountState;
  subscribe(listener: () => void): () => void;
};
type IdentityTarget = {
  deferIdentity(): void;
  identify(userId: string | null): Promise<void>;
  init(): Promise<void>;
};

/** Unknown authentication never authorizes an anonymous SDK identity. */
export async function refreshPurchaseIdentity(source: IdentitySource, target: IdentityTarget) {
  if (!source.isSessionReady()) target.deferIdentity();
  let revision: number;
  do {
    revision = source.getState().scopeRevision;
    await source.init();
  } while (revision !== source.getState().scopeRevision);
  if (!source.isSessionReady()) { target.deferIdentity(); return; }
  await target.identify(source.getState().session?.user.id ?? null);
  await target.init();
}

/** Announce the restored ODA account before reading any SDK entitlement. */
export function bindPurchaseIdentity(source: IdentitySource, target: IdentityTarget) {
  let disposed = false;
  const sync = () => {
    if (disposed) return;
    if (!source.isSessionReady()) { target.deferIdentity(); return; }
    // The service shares a pending identity and skips a confirmed identity.
    // Repeated events can therefore retry a failed same-account transition.
    void target.identify(source.getState().session?.user.id ?? null);
  };
  const unsubscribe = source.subscribe(sync);
  if (!source.isSessionReady()) target.deferIdentity();
  const ready = (async () => {
    let revision: number;
    do {
      revision = source.getState().scopeRevision;
      await source.init();
      // A configuration/account change can supersede initial hydration.
      // Await the current scope before announcing its initial identity.
    } while (!disposed && revision !== source.getState().scopeRevision);
    if (disposed) return;
    sync();
    if (source.isSessionReady()) await target.init();
  })();
  return {
    ready,
    dispose: () => { disposed = true; unsubscribe(); },
  };
}
