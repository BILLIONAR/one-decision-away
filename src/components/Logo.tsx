import React from 'react';
import { BRAND } from '../brand/current';
import { LogoC4, LogoC4Lockup } from './brand/LogoC4';
import { LogoV2, LogoV2Lockup } from './brand/LogoV2';
import { LogoV3, LogoV3Lockup } from './brand/LogoV3';
import { LogoV4, LogoV4Lockup } from './brand/LogoV4';
import { LogoV5, LogoV5Lockup, LogoV5Compact, type LogoV5Props } from './brand/LogoV5';

type LogoProps = LogoV5Props;

/** Brand switch (`node scripts/brand.mjs v5|v4|v3|v2|c4`); every earlier brand stays available. */
export const Logo: React.FC<LogoProps> = (props) =>
  BRAND === 'v5' ? <LogoV5 {...props} /> : BRAND === 'v4' ? <LogoV4 {...props} /> : BRAND === 'c4' ? <LogoC4 {...props} /> : BRAND === 'v2' ? <LogoV2 {...props} /> : <LogoV3 {...props} />;
export const LogoLockup: React.FC<LogoProps> = (props) =>
  BRAND === 'v5' ? <LogoV5Lockup {...props} /> : BRAND === 'v4' ? <LogoV4Lockup {...props} /> : BRAND === 'c4' ? <LogoC4Lockup {...props} /> : BRAND === 'v2' ? <LogoV2Lockup {...props} /> : <LogoV3Lockup {...props} />;
export const LogoCompact: React.FC<LogoProps> = (props) => BRAND === 'v5' ? <LogoV5Compact {...props} /> : <LogoLockup {...props} />;
