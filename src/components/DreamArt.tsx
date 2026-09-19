import React, { useState } from 'react';
import { useT } from '../i18n';

interface DreamArtProps {
  type: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export const DreamArt: React.FC<DreamArtProps> = ({ type, imageUrl, alt, className = 'w-full h-full' }) => {
  const t = useT();
  const [imageFailed, setImageFailed] = useState(false);
  const altText = alt ?? t('Luxury Dream Asset');

  if (imageUrl && !imageFailed) {
    return (
      <div className={`relative overflow-hidden bg-[#1A1A1A] ${className}`}>
        <img
          src={imageUrl}
          alt={altText}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  const sage = 'var(--color-sage, #708879)';
  const coral = 'var(--color-coral, #C98276)';
  const slate = 'var(--color-slate, #263238)';
  const ivory = 'var(--color-ivory, #F7F6F2)';
  const mutedBg = '#EAE8E0';

  switch (type) {
    case 'morning_ritual':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Ceramic Cup & Saucer */}
          <ellipse cx="80" cy="115" rx="34" ry="10" fill={sage} opacity="0.4" />
          <path d="M55 85 C55 110, 105 110, 105 85 Z" fill={ivory} stroke={slate} strokeWidth="2.5" />
          <path d="M105 90 C114 90, 114 100, 105 102" stroke={slate} strokeWidth="2.5" fill="none" />
          {/* Steaming Line */}
          <path d="M72 75 Q77 65 72 55 T72 45" stroke={coral} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M85 73 Q90 63 85 53 T85 43" stroke={sage} strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Open Journal */}
          <rect x="115" y="70" width="60" height="42" rx="4" transform="rotate(-5 115 70)" fill={ivory} stroke={slate} strokeWidth="2" />
          <line x1="122" y1="82" x2="162" y2="78" stroke={slate} strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="124" y1="92" x2="164" y2="88" stroke={slate} strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Minimalist Fountain Pen */}
          <line x1="110" y1="60" x2="155" y2="40" stroke={coral} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'library_shelf':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Oak Shelves */}
          <line x1="30" y1="120" x2="170" y2="120" stroke={slate} strokeWidth="6" strokeLinecap="round" />
          <line x1="30" y1="70" x2="170" y2="70" stroke={slate} strokeWidth="6" strokeLinecap="round" />
          {/* Books Shelf 1 */}
          <rect x="42" y="32" width="14" height="35" rx="2" fill={sage} stroke={slate} strokeWidth="2" />
          <rect x="58" y="26" width="16" height="41" rx="2" fill={coral} stroke={slate} strokeWidth="2" />
          <rect x="76" y="36" width="12" height="31" rx="2" fill={ivory} stroke={slate} strokeWidth="2" />
          <rect x="90" y="30" width="15" height="37" rx="2" fill={slate} />
          {/* Leaning Book */}
          <rect x="108" y="32" width="14" height="36" rx="2" transform="rotate(18 108 32)" fill={sage} stroke={slate} strokeWidth="2" />
          {/* Books Shelf 2 */}
          <rect x="45" y="80" width="18" height="37" rx="2" fill={ivory} stroke={slate} strokeWidth="2" />
          <rect x="65" y="84" width="14" height="33" rx="2" fill={slate} />
          <rect x="81" y="78" width="16" height="39" rx="2" fill={sage} stroke={slate} strokeWidth="2" />
          <rect x="99" y="86" width="15" height="31" rx="2" fill={coral} stroke={slate} strokeWidth="2" />
          {/* Small Potted Plant */}
          <rect x="135" y="96" width="18" height="21" rx="2" fill={slate} />
          <circle cx="144" cy="90" r="10" fill={sage} />
        </svg>
      );

    case 'cabin_weekend':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Mountain Silhouettes */}
          <polygon points="20,130 75,55 130,130" fill={sage} opacity="0.3" />
          <polygon points="80,130 135,45 190,130" fill={slate} opacity="0.2" />
          {/* Ground */}
          <line x1="20" y1="130" x2="180" y2="130" stroke={slate} strokeWidth="3" />
          {/* Cabin Structure */}
          <polygon points="100,65 60,105 140,105" fill={coral} stroke={slate} strokeWidth="2.5" />
          <rect x="70" y="105" width="60" height="25" fill={ivory} stroke={slate} strokeWidth="2.5" />
          <rect x="93" y="112" width="14" height="18" fill={slate} />
          {/* Warm Window Glow */}
          <circle cx="100" cy="85" r="7" fill={ivory} stroke={slate} strokeWidth="2" />
          {/* Pine Trees */}
          <polygon points="40,130 50,100 60,130" fill={sage} />
          <polygon points="145,130 155,95 165,130" fill={sage} />
        </svg>
      );

    case 'work_machine':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Ultra-wide Monitor */}
          <rect x="40" y="40" width="120" height="68" rx="6" fill={slate} stroke={slate} strokeWidth="2" />
          <rect x="45" y="45" width="110" height="58" rx="3" fill="#1C2429" />
          {/* Clean Code/Design Lines */}
          <line x1="55" y1="58" x2="95" y2="58" stroke={sage} strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="68" x2="120" y2="68" stroke={coral} strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="78" x2="80" y2="78" stroke={ivory} strokeWidth="3" strokeLinecap="round" />
          {/* Stand */}
          <rect x="95" y="108" width="10" height="18" fill={slate} />
          <rect x="80" y="126" width="40" height="4" rx="2" fill={slate} />
          {/* Low profile keyboard */}
          <rect x="60" y="132" width="80" height="8" rx="2" fill={ivory} stroke={slate} strokeWidth="1.5" />
        </svg>
      );

    case 'ebike':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Wheels */}
          <circle cx="55" cy="105" r="26" stroke={slate} strokeWidth="4" fill="none" />
          <circle cx="145" cy="105" r="26" stroke={slate} strokeWidth="4" fill="none" />
          <circle cx="55" cy="105" r="4" fill={slate} />
          <circle cx="145" cy="105" r="4" fill={slate} />
          {/* Geometric Frame */}
          <line x1="55" y1="105" x2="90" y2="105" stroke={sage} strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="105" x2="125" y2="75" stroke={sage} strokeWidth="4" strokeLinecap="round" />
          <line x1="55" y1="105" x2="85" y2="75" stroke={sage} strokeWidth="4" strokeLinecap="round" />
          <line x1="85" y1="75" x2="125" y2="75" stroke={sage} strokeWidth="4" strokeLinecap="round" />
          <line x1="125" y1="75" x2="145" y2="105" stroke={slate} strokeWidth="4" strokeLinecap="round" />
          {/* Saddle & Handlebars */}
          <line x1="85" y1="75" x2="80" y2="65" stroke={slate} strokeWidth="3" />
          <line x1="72" y1="65" x2="90" y2="65" stroke={slate} strokeWidth="4" strokeLinecap="round" />
          <line x1="125" y1="75" x2="130" y2="60" stroke={slate} strokeWidth="3" />
          <line x1="122" y1="60" x2="140" y2="60" stroke={coral} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'pro_course':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Certificate / Blueprint Parchment */}
          <rect x="45" y="35" width="110" height="90" rx="6" fill={ivory} stroke={slate} strokeWidth="2.5" />
          <circle cx="100" cy="65" r="16" fill={sage} opacity="0.3" />
          <polygon points="100,52 104,62 114,63 106,70 109,80 100,74 91,80 94,70 86,63 96,62" fill={coral} />
          {/* Lines */}
          <line x1="65" y1="92" x2="135" y2="92" stroke={slate} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="75" y1="102" x2="125" y2="102" stroke={slate} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          {/* Seal Ribbon */}
          <path d="M94 118 L94 135 L100 130 L106 135 L106 118" fill={coral} />
        </svg>
      );

    case 'giving_fund':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Open Hands / Sprout */}
          <ellipse cx="100" cy="130" rx="40" ry="12" fill={sage} opacity="0.3" />
          <path d="M100 120 Q100 80 100 65" stroke={slate} strokeWidth="4" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M100 90 Q80 75 75 90 Q85 105 100 90 Z" fill={sage} stroke={slate} strokeWidth="2" />
          <path d="M100 75 Q120 60 125 75 Q115 90 100 75 Z" fill={sage} stroke={slate} strokeWidth="2" />
          {/* Radiant Sun */}
          <circle cx="100" cy="45" r="12" fill={coral} />
        </svg>
      );

    case 'health_retreat':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Balanced Zen Stones */}
          <ellipse cx="100" cy="125" rx="45" ry="14" fill={slate} />
          <ellipse cx="100" cy="100" rx="35" ry="12" fill={sage} />
          <ellipse cx="100" cy="78" rx="25" ry="10" fill={coral} />
          <ellipse cx="100" cy="58" rx="15" ry="7" fill={ivory} stroke={slate} strokeWidth="2" />
          {/* Bamboo leaf element */}
          <path d="M40 120 Q55 80 80 70" stroke={sage} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'japan_month':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Mount Fuji shape */}
          <polygon points="40,130 100,50 160,130" fill={slate} opacity="0.8" />
          <polygon points="85,70 100,50 115,70 108,76 100,73 92,76" fill={ivory} />
          {/* Crimson Sun Disc */}
          <circle cx="145" cy="55" r="20" fill={coral} />
          {/* Torii Gate Outline */}
          <rect x="25" y="85" width="40" height="4" rx="2" fill={coral} />
          <rect x="30" y="93" width="30" height="3" fill={coral} />
          <line x1="32" y1="85" x2="32" y2="130" stroke={coral} strokeWidth="3" />
          <line x1="58" y1="85" x2="58" y2="130" stroke={coral} strokeWidth="3" />
        </svg>
      );

    case 'creative_studio':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Large Studio Window Frame with Sunbeam */}
          <rect x="35" y="30" width="70" height="85" rx="4" fill={ivory} stroke={slate} strokeWidth="2.5" />
          <line x1="70" y1="30" x2="70" y2="115" stroke={slate} strokeWidth="2" />
          <line x1="35" y1="72" x2="105" y2="72" stroke={slate} strokeWidth="2" />
          {/* Draft Table & Lamp */}
          <line x1="95" y1="125" x2="165" y2="100" stroke={slate} strokeWidth="4" strokeLinecap="round" />
          <line x1="110" y1="120" x2="105" y2="135" stroke={slate} strokeWidth="3" />
          <line x1="155" y1="105" x2="150" y2="135" stroke={slate} strokeWidth="3" />
          {/* Architect Lamp */}
          <path d="M145 102 L140 80 L130 85" stroke={coral} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="130" cy="85" r="5" fill={coral} />
        </svg>
      );

    case 'freedom_fund':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Safe Box / Autonomous Vault */}
          <rect x="50" y="40" width="100" height="80" rx="10" fill={ivory} stroke={slate} strokeWidth="3" />
          <circle cx="100" cy="80" r="22" stroke={slate} strokeWidth="3" fill={sage} opacity="0.3" />
          <circle cx="100" cy="80" r="8" fill={coral} />
          <line x1="100" y1="72" x2="100" y2="64" stroke={slate} strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="88" x2="100" y2="96" stroke={slate} strokeWidth="3" strokeLinecap="round" />
          <line x1="92" y1="80" x2="84" y2="80" stroke={slate} strokeWidth="3" strokeLinecap="round" />
          <line x1="108" y1="80" x2="116" y2="80" stroke={slate} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'reliable_car':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Streamlined Modern Sedan */}
          <path d="M35 110 L45 85 L85 70 L140 70 L165 95 L170 110 Z" fill={ivory} stroke={slate} strokeWidth="2.5" />
          {/* Windows */}
          <polygon points="85,73 135,73 150,92 85,92" fill={sage} opacity="0.5" stroke={slate} strokeWidth="1.5" />
          {/* Wheels */}
          <circle cx="65" cy="115" r="16" fill={slate} />
          <circle cx="65" cy="115" r="7" fill={ivory} />
          <circle cx="145" cy="115" r="16" fill={slate} />
          <circle cx="145" cy="115" r="7" fill={ivory} />
          {/* Ground */}
          <line x1="20" y1="131" x2="180" y2="131" stroke={slate} strokeWidth="2" strokeOpacity="0.4" />
        </svg>
      );

    case 'biz_launch':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Rocket / Launch Craft Geometry */}
          <path d="M100 30 C85 55 80 85 80 110 L120 110 C120 85 115 55 100 30 Z" fill={ivory} stroke={slate} strokeWidth="2.5" />
          <circle cx="100" cy="65" r="8" fill={coral} />
          {/* Fins */}
          <polygon points="80,95 60,115 80,115" fill={sage} stroke={slate} strokeWidth="2" />
          <polygon points="120,95 140,115 120,115" fill={sage} stroke={slate} strokeWidth="2" />
          {/* Thrust vectors */}
          <line x1="95" y1="120" x2="90" y2="135" stroke={coral} strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="120" x2="100" y2="140" stroke={coral} strokeWidth="3" strokeLinecap="round" />
          <line x1="105" y1="120" x2="110" y2="135" stroke={coral} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'peaceful_home':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          {/* Modern Architectural Pavilion House */}
          {/* Main Block */}
          <rect x="40" y="70" width="80" height="55" fill={ivory} stroke={slate} strokeWidth="2.5" />
          {/* Pitched modern roof */}
          <polygon points="30,70 80,35 130,70" fill={coral} stroke={slate} strokeWidth="2.5" />
          {/* Glass Doors */}
          <rect x="55" y="85" width="22" height="40" fill={sage} opacity="0.4" stroke={slate} strokeWidth="1.5" />
          <rect x="80" y="85" width="22" height="40" fill={sage} opacity="0.4" stroke={slate} strokeWidth="1.5" />
          {/* Secondary Wing */}
          <rect x="120" y="85" width="45" height="40" fill={ivory} stroke={slate} strokeWidth="2" />
          <rect x="130" y="95" width="25" height="18" fill={sage} opacity="0.4" stroke={slate} strokeWidth="1.5" />
          {/* Surrounding Garden Tree */}
          <circle cx="160" cy="70" r="16" fill={sage} />
          <line x1="160" y1="85" x2="160" y2="125" stroke={slate} strokeWidth="3" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="160" rx="12" fill={mutedBg} />
          <circle cx="100" cy="80" r="30" stroke={slate} strokeWidth="2.5" fill={ivory} />
          <polygon points="100,60 106,73 120,75 110,84 113,98 100,90 87,98 90,84 80,75 94,73" fill={coral} />
        </svg>
      );
  }
};
