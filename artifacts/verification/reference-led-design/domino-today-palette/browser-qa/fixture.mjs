import {getInitialDemoState} from '/workspace/oda-reference-redesign/src/services/repository.ts';
import {courseCatalogFor} from '/workspace/oda-reference-redesign/src/data/courseCatalog.ts';
const now='2026-10-03T12:00:00.000Z',today='2026-10-03';
export function makeSeed(kind='active'){
 const d=getInitialDemoState();
 Object.assign(d.profile,{displayName:'Alex',locale:'en',theme:'light',onboardingStep:'completed',simpleModeOff:true,soundMuted:true,nudgesEnabled:false,dailyWisdomEnabled:false,reminderAskedAt:now,firstOpenedAt:'2026-01-01T00:00:00Z',lastOpenedAt:now});
 d.lastActiveDateKey=today;d.lastDailyResetTimestamp=now;d.dreamJournal=[];d.completions=[];
 d.missions=d.missions.filter(m=>!m.isOneDecision);
 if(kind!=='empty')d.missions.push({id:'synthetic-palette-decision',userId:d.profile.id,title:'Read two pages',type:'daily_quest',area:'Mindset',difficulty:'easy',isOneDecision:true,status:kind==='completed'?'completed':'active',createdAt:now,scheduledFor:today,plan:{obstacle:'I reach for my phone',ifThen:'put it aside and read one paragraph.',plannedAt:now}});
 d.notebook.entries=[{id:'synthetic-palette-entry',kind:'journal',title:'A small step forward',content:'I made time to read today. Starting small helped me keep the promise I made to myself.',dateKey:today,createdAt:now,updatedAt:now,mood:'focused'}];
 d.notebook.activityDays=[{dateKey:today,rewardAmount:0}];
 const catalog=courseCatalogFor('en'),first=catalog[0].lessons[0];
 d.courseProgress={version:1,lessons:{[first.id]:{checked:Array(first.practiceCount).fill(true),answer:first.correct,reflection:'Starting small made it easier to begin.',completed:true}}};
 return d;
}
