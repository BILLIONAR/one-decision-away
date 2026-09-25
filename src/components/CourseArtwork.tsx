import React from 'react';

/** Original course illustrations. The adjacent course title supplies the meaning. */
export function CourseArtwork({ courseId, className = '' }: { courseId: string; className?: string }) {
  const ink = 'var(--accent)';
  const red = 'var(--brand-burgundy)';
  const paper = 'var(--bg-elevated)';
  return <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" focusable="false" className={`oda-course-art ${className}`}>
    <ellipse cx="101" cy="142" rx="74" ry="5" fill="var(--accent-soft)" />
    {courseId === 'confidence' && <>
      <path d="M26 136V114H64V88H103V58H145V136" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M45 106C59 83 65 62 99 56C118 52 125 42 133 28" stroke={red} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 7" />
      <path d="M122 30L134 24L138 37" stroke={red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="104" cy="77" r="7" fill={red} />
      <path d="M150 34H175M163 22V47" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M33 136H171" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </>}
    {courseId === 'adhd' && <>
      <rect x="19" y="35" width="56" height="68" rx="6" transform="rotate(-12 19 35)" fill="var(--brand-burgundy-soft)" stroke={red} strokeWidth="1.8" />
      <path d="M32 52L53 48M34 63L61 57M37 74L52 71" stroke={red} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M74 80H104M96 72L105 80L96 88" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="114" y="26" width="65" height="108" rx="8" fill={paper} stroke={ink} strokeWidth="2" />
      <rect x="124" y="39" width="45" height="22" rx="4" fill="var(--accent-soft)" />
      <path d="M129 50L133 54L141 46M148 50H160M127 77H166M127 92H157M127 107H162" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="69" cy="124" r="6" fill={red} />
      <path d="M80 125H100" stroke={red} strokeWidth="2" strokeLinecap="round" />
    </>}
    {courseId === 'motivation' && <>
      <path d="M39 98C39 54 65 27 106 27C141 27 167 47 172 74M164 63L173 76L181 63" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M167 97C151 127 116 142 82 131" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" />
      <circle cx="39" cy="105" r="19" fill="var(--brand-burgundy-soft)" stroke={red} strokeWidth="2" />
      <path d="M35 96L47 105L35 114V96Z" fill={red} />
      <rect x="80" y="61" width="51" height="48" rx="6" fill={paper} stroke={ink} strokeWidth="2" />
      <path d="M92 85L101 94L119 76" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="171" cy="89" r="5" fill={red} />
    </>}
    {courseId === 'faith' && <>
      <path d="M100 130V69" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M99 102C78 103 61 87 62 70C84 71 98 82 99 102Z" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M101 82C100 60 113 44 133 43C134 63 122 78 101 82Z" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M77 85L97 103M120 56L104 78" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 120C63 111 74 114 87 127C94 133 106 133 113 127C126 114 137 111 155 120" stroke={red} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M39 129C59 135 73 144 100 144C127 144 141 135 161 129" stroke={red} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="42" r="4" fill={red} />
      <path d="M99 21V32M47 62L55 66M146 78L154 75" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
    </>}
    {courseId === 'manifest' && <>
      <path d="M28 127H58C78 127 68 94 91 94H106C130 94 120 61 142 61H166" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M76 110V131M71 110H81" stroke={red} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="127" r="7" fill={red} />
      <circle cx="100" cy="94" r="6" fill={paper} stroke={ink} strokeWidth="2" />
      <circle cx="165" cy="61" r="18" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" />
      <circle cx="165" cy="61" r="7" fill={red} />
      <rect x="35" y="27" width="57" height="49" rx="5" fill={paper} stroke={ink} strokeWidth="1.8" />
      <path d="M48 42H79M48 51H68M48 60H74" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M110 42H127M119 33V50" stroke={red} strokeWidth="1.8" strokeLinecap="round" />
    </>}
    {courseId === 'procrastination' && <>
      <rect x="30" y="58" width="62" height="70" rx="6" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" />
      <path d="M30 81H92M30 104H92M61 58V128" stroke={ink} strokeWidth="1.6" strokeDasharray="3 5" />
      <rect x="112" y="98" width="30" height="30" rx="5" fill="var(--brand-burgundy-soft)" stroke={red} strokeWidth="2" />
      <path d="M92 113H106M100 107L107 113L100 119" stroke={red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="150" cy="50" r="22" fill={paper} stroke={ink} strokeWidth="2" />
      <path d="M150 37V50L159 56" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M158 128H176M40 136H176" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="127" cy="84" r="5" fill={red} />
    </>}
    {courseId === 'focus' && <>
      <circle cx="92" cy="84" r="46" fill={paper} stroke={ink} strokeWidth="2" />
      <circle cx="92" cy="84" r="30" fill="var(--accent-soft)" stroke={ink} strokeWidth="1.8" />
      <circle cx="92" cy="84" r="13" fill={paper} stroke={ink} strokeWidth="1.8" />
      <circle cx="92" cy="84" r="5" fill={red} />
      <path d="M150 34C150 26 156 21 162 21C168 21 174 26 174 34V46L178 52H146L150 46Z" fill="var(--brand-burgundy-soft)" stroke={red} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M143 57L181 20" stroke={red} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="140" y="98" width="34" height="34" rx="6" fill={ink} opacity=".9" transform="rotate(8 157 115)" />
      <path d="M36 136H170" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </>}
    {courseId === 'sleep' && <>
      <path d="M118 30C101 34 90 50 92 68C94 88 111 102 131 101C141 100 150 96 156 89C136 91 118 76 116 57C115 47 117 38 118 30Z" fill="var(--accent-soft)" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M150 34H164L150 48H164M168 18H177L168 27H177" stroke={red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 128V104H172V128M28 116H172" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="38" y="90" width="38" height="14" rx="7" fill={paper} stroke={ink} strokeWidth="1.8" />
      <path d="M80 104C94 94 128 94 164 104" stroke={red} strokeWidth="2" strokeLinecap="round" />
      <circle cx="58" cy="44" r="3" fill={red} /><circle cx="76" cy="28" r="2" fill={ink} />
    </>}
    {courseId === 'calm' && <>
      <path d="M24 92C42 92 44 62 62 62C80 62 82 108 100 108C118 108 120 56 138 56C156 56 158 92 176 92" stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M24 108C44 108 50 124 70 124C90 124 96 112 116 112C136 112 146 122 176 122" stroke={red} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" fill="none" />
      <circle cx="138" cy="56" r="10" fill="var(--brand-burgundy-soft)" stroke={red} strokeWidth="2" />
      <path d="M58 44C58 30 70 22 82 24C82 38 72 46 58 44Z" fill="var(--accent-soft)" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M58 44L74 30" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M36 138H168" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    </>}
  </svg>;
}
