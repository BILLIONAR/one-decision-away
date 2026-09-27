import { useEffect, useState } from 'react';
import { cloudSync, type CloudState } from './cloudSync';

/** Live cloud-account state (configured, session, last sync) for components. */
export function useCloudState(): CloudState {
  const [cloud, setCloud] = useState<CloudState>(cloudSync.getState());
  useEffect(() => {
    void cloudSync.init();
    return cloudSync.subscribe(setCloud);
  }, []);
  return cloud;
}
