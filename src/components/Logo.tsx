import React from 'react';
import { BRAND } from '../brand/current';
import { LogoC4, LogoC4Lockup } from './brand/LogoC4';
import { LogoV2, LogoV2Lockup } from './brand/LogoV2';
import { LogoV3, LogoV3Lockup } from './brand/LogoV3';

type LogoProps = { className?: string; title?: string };

/** Brand switch (`node scripts/brand.mjs v3|v2|c4`); every earlier brand stays available. */
export const Logo: React.FC<LogoProps> = (props) =>
  BRAND === 'c4' ? <LogoC4 {...props} /> : BRAND === 'v2' ? <LogoV2 {...props} /> : <LogoV3 {...props} />;
export const LogoLockup: React.FC<LogoProps> = (props) =>
  BRAND === 'c4' ? <LogoC4Lockup {...props} /> : BRAND === 'v2' ? <LogoV2Lockup {...props} /> : <LogoV3Lockup {...props} />;
