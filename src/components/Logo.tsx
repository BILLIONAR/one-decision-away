import React from 'react';
import { BRAND } from '../brand/current';
import { LogoC4, LogoC4Lockup } from './brand/LogoC4';
import { LogoV2, LogoV2Lockup } from './brand/LogoV2';

type LogoProps = { className?: string; title?: string };

/** Brand switch: v2 (vector) by default; the C4 raster brand stays available. */
export const Logo: React.FC<LogoProps> = (props) => (BRAND === 'c4' ? <LogoC4 {...props} /> : <LogoV2 {...props} />);
export const LogoLockup: React.FC<LogoProps> = (props) => (BRAND === 'c4' ? <LogoC4Lockup {...props} /> : <LogoV2Lockup {...props} />);
