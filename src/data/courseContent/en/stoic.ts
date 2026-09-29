import type { CourseSource, GuidedCourse } from '../../courses';

// English edition (primary). New course, September 2026. See docs/COURSE_WRITING_GUIDE.md.
/*
 * Shared sources cited without redefinition: 'optimism-ellis', 'optimism-hofmann', 'optimism-nhs-cbt'
 * (optimism edition), 'state-mental-contrasting', 'mcii', 'if-then-plans' and 'oettingen-woop-method'.
 *
 * Opened and read while writing (2026-09-29): IEP Epictetus (Seddon), IEP Seneca (Wagoner), the Stoic Week
 * 2016 Handbook PDF, Tim LeBon's Stoic Week 2021 report PDF (bars in lesson 2 use its exact figures),
 * the Kross & Ayduk 2017 chapter PDF, and the Kross et al. 2014 abstract (via Europe PMC).
 * Marcus Aurelius, Seneca and Epictetus are paraphrased, never quoted.
 *
 * NOT VERIFIED: the Kross et al. 2014 full text (abstract only). The Turkish suggestion course has an
 * older entry for the same paper ('distanced-self-talk'); it has no English edition yet, so this file
 * defines 'stoic-kross-self-talk' instead. When the English suggestion edition is written, consider
 * merging the two ids. The IEP Seneca page does not cover the evening review or premeditation; those
 * practices are sourced to the Stoic Week handbook only.
 *
 * Photo ids were checked by eye on 29 Sep 2026 (all load; alt texts corrected): 1439066615861-d1af74d74000,
 * 1507525428034-b723cf961d3e, 1500534314209-a25ddb2bd429, 1464822759023-fed622ff2c3b,
 * 1506905925346-21bda4d32df4, 1475924156734-496f6cac6ec1, 1502082553048-f009c37129b9.
 * The alt texts are best guesses; correct them if a photo shows something else.
 */
export const SOURCES: CourseSource[] = [
  { id: 'stoic-epictetus-iep', title: 'Keith H. Seddon · Epictetus (Internet Encyclopedia of Philosophy)', url: 'https://iep.utm.edu/epictetu/', type: 'guidance', finding: 'Epictetus (c. 55–135 CE) was born enslaved in Hierapolis, later freed, and taught philosophy in Nicopolis, Greece; his student Arrian recorded his teaching in the Discourses and the Handbook. The article explains his central distinction between what is up to us (our opinions, intentions, desires, aversions and how we use impressions) and what is not (body, possessions, reputation, health, status and the outcomes of our actions), and his teaching that people are disturbed by their judgments about events rather than by the events themselves.', limitation: 'An encyclopedia overview of the philosophy, not psychological research; it does not discuss modern therapy. The page was read; the ancient texts are paraphrased in this course, not quoted.' },
  { id: 'stoic-seneca-iep', title: 'Robert Wagoner · Seneca (Internet Encyclopedia of Philosophy)', url: 'https://iep.utm.edu/seneca/', type: 'guidance', finding: 'Seneca (c. 4 BCE–65 CE) was a Stoic philosopher who tutored the young Nero and later served as one of his advisers. The article explains the Stoic view, as Seneca presents it, that emotions such as anger involve judgments about value: the first movement in response to a situation is involuntary, but becoming angry requires agreeing to the judgment that you have been wronged.', limitation: 'An encyclopedia overview, not research. It does not describe Seneca’s evening review or advice on anticipating misfortune; in this course those practices are sourced to the Stoic Week handbook. The page was read.' },
  { id: 'stoic-week-handbook', title: 'Stoicism Today (Gill, Ussher, Sellars, LeBon, Evans, Garratt, Robertson) · Stoic Week 2016 Handbook (Modern Stoicism)', url: 'https://modernstoicism.com/wp-content/uploads/2016/10/Stoic-Week-2016-Handbook-Stoicism-Today.pdf', type: 'technique', finding: 'The handbook teaches daily Stoic exercises with their ancient sources: the dichotomy of control from Epictetus’s Handbook (asking of each situation whether it is up to you); a morning meditation that rehearses the day’s likely difficulties and plans good responses; premeditation of adversity done realistically, at a manageable intensity and without rumination; a five-to-ten-minute evening review based on Seneca and Epictetus (what did I do badly, what did I do well, what could I do differently, reviewed as a friend would rather than harshly); and Marcus Aurelius’s view from above. It rejects the idea that Stoicism means suppressing emotion and describes Stoic psychology as an influence on modern cognitive behavioral therapy.', limitation: 'Practice guidance written by philosophers, classicists and therapists, not a trial. It states that it is not a substitute for medical advice or treatment and that the course is not suitable for people with severe mental health problems such as clinical depression or PTSD. The PDF was read.' },
  { id: 'stoic-week-report', title: 'Tim LeBon · Report on Stoic Week 2021 (Modern Stoicism)', url: 'https://modernstoicism.com/wp-content/uploads/2022/01/Stoic-Week-2021-Results-Tim-LeBon-1-1.pdf', type: 'research', finding: '1,369 people completed valid questionnaires at the start of the free seven-day online course and 459 at the end (a 33% completion rate); participants spent an average of 42 minutes a day on it. Among those who finished, flourishing rose by 11.5%, life satisfaction by 14.5% and positive emotions by 13%, while negative emotions fell by 21%.', limitation: 'A report by the course organizers. Participants chose to take part, there was no control group, all measures were self-reported and two thirds of starters did not complete the final questionnaire, so it cannot show that Stoic practice caused the changes. The PDF was read.' },
  { id: 'stoic-kross-distancing', title: 'Kross & Ayduk · 2017 · Self-distancing: theory, research, and current directions (Advances in Experimental Social Psychology, vol. 55)', url: 'https://sites.lsa.umich.edu/emotion-selfcontrol-psych/wp-content/uploads/sites/1322/2017/09/Self-distancing-theory-research-future.pdf', type: 'research', finding: 'The review summarizes experiments comparing self-immersed reflection (reliving an event through your own eyes) with self-distanced reflection (watching yourself from a distance, like a fly on the wall). Distancing reduced negative emotion and rumination, shifted thinking from recounting details toward making sense of the event, sped blood pressure recovery, reduced aggressive responses and supported wiser reasoning; its benefits held up over time better than distraction. Imagining how you will feel in ten years reduced distress, apparently by highlighting that feelings pass. Using your own name or “you” in self-talk produced similar benefits. The authors trace the idea partly to Aaron Beck’s concept of distancing in cognitive therapy.', limitation: 'Mostly short laboratory studies, often with students. Benefits were clearest for people who were more distressed and small or absent in some low-distress samples; the authors distinguish distancing to understand feelings from distancing to avoid them. The chapter PDF was read.' },
  { id: 'stoic-kross-self-talk', title: 'Kross et al. · 2014 · Self-talk as a regulatory mechanism: how you do it matters (Journal of Personality and Social Psychology)', url: 'https://doi.org/10.1037/a0035173', type: 'research', finding: 'Seven studies with 585 participants: reflecting on yourself with non-first-person pronouns and your own name, rather than “I”, increased self-distancing. In first-impression and public-speaking tasks this group performed better, felt less distress and ruminated less afterwards, and appraised future stressors more as challenges than as threats. A meta-analysis across the studies found the benefits did not depend on social anxiety.', limitation: 'Short laboratory tasks; long-term and clinical effects were not tested. Only the abstract was read (via Europe PMC).' },
];

export const COURSE: GuidedCourse = {
  id: 'stoic',
  title: 'Stoic Calm',
  subtitle: 'Ancient tools for putting your energy where it can do some good',
  description: 'What would change if you spent your energy only on what is actually yours to move? This course turns five Stoic practices into short daily exercises and checks each one honestly against modern psychology.',
  scope: 'For adults who want steadier responses to stress, setbacks and uncertainty. Stoicism here does not mean suppressing emotions or putting on a brave face; feelings are welcome, and the practice is about what you do next. This is education and self-practice, not therapy, and it is not a substitute for treatment. If you live with anxiety, depression, trauma or intrusive worry, some exercises, especially imagining setbacks, may not suit you; please work with a qualified professional. If you are in crisis or thinking about harming yourself, contact your local emergency number now.',
  outcome: 'A control sort for any worry, a way to catch the judgment between an event and your reaction, a gentle version of rehearsing setbacks, a step-back technique for heated moments, a five-minute evening review, and one small decision you act on today.',
  photo: { id: '1439066615861-d1af74d74000', alt: 'A wooden pier on a still mountain lake' },
  lessons: [
    { id: 'stoic-1', title: 'What is up to you', minutes: 8,
      goal: 'Sort a current worry into what is up to you and what is not, and move your energy to the first list.',
      reading: [
        'Epictetus was born enslaved in the first century and later taught philosophy in Greece. His student Arrian wrote down his lessons in two works, the Discourses and a short Handbook. The idea that opens the Handbook is simple and demanding. Some things are up to us: our judgments, our intentions, what we want and avoid, and how we choose to act. Other things are not: our body, our possessions, our reputation, other people and, importantly, the results of our actions. Epictetus argued that much of our distress comes from treating the second list as if it belonged to the first.',
        'This is not a call to stop caring. You can care a great deal about a job interview. But the offer is not up to you; your preparation, your honesty in the room and your follow-up are. When you pour worry into the offer, the worry has nowhere to go. When you pour it into preparation, it turns into something useful. Modern Stoic teachers treat this as the most basic exercise in the tradition: ask of each situation whether it is up to you, and put your effort where the answer is yes. The rest you hold more lightly, not because it does not matter, but because gripping it does not help.',
      ],
      deeper: [
        { heading: 'Why it works', paragraphs: [
          'Worry tends to circle around outcomes: will they like me, will it work, will it happen. Outcomes depend on many things you cannot see or steer, so thinking about them rarely reaches an end point. Actions are different. An action has a first step, a time and a place, so thinking about it can finish in doing it.',
          'The control sort does not remove the uncomfortable feeling. It gives the feeling a job. That practical idea links this ancient exercise with the modern planning research you will meet in the last lesson of this course.',
        ],
          visual: { kind: 'steps', title: 'The control sort', steps: [
            { label: 'Name it', text: 'Write the worry in one plain sentence.' },
            { label: 'Split it', text: 'Draw two columns: up to me, and not up to me.' },
            { label: 'Check the first column', text: 'Keep only your own judgments, intentions and actions there; move outcomes across.' },
            { label: 'Choose', text: 'Pick one item from the first column to act on today.' },
            { label: 'Release', text: 'For the second column, note that you have done your part.' },
          ], note: 'Our step-by-step version of the dichotomy of control as taught in the Stoic Week handbook.' } },
        { heading: 'Common mistakes', paragraphs: [
          'The first mistake is putting outcomes in the first column. Getting the job, being liked, recovering from an illness: you can influence them, but you do not decide them. What you decide is your effort, your attitude and your next step. Keeping those separate is the whole exercise.',
          'The second mistake is using the idea to excuse passivity. If something unfair is happening, your response to it is up to you, and that response can include speaking up, asking for help or leaving. The dichotomy of control asks you to act well, not to shrug.',
        ] },
      ],
      example: { title: 'Leyla, 31, nurse', text: 'Leyla had a performance review on Friday and spent Wednesday evening replaying every possible thing her manager might say. At ten she took a sheet of paper and drew a line down the middle. On the right she wrote what was not up to her: her manager’s mood, the budget for raises, and how a colleague had described a shift that went badly. On the left she wrote what was: bringing the patient feedback she had saved, asking one clear question about her next training step, and explaining the difficult shift calmly rather than defensively. She put the page in her bag and went to bed. The worry did not vanish, but it had shrunk to three concrete tasks. On Friday the review was mixed. She came out knowing she had done her part.' },
      practice: [
        'Write one worry that has been on your mind this week in a single sentence.',
        'Split it into two columns, what is up to you and what is not, and move any outcome you placed on the left over to the right.',
        'Circle one item in the left column and decide when today you will act on it.',
      ],
      reflection: 'Where are you spending energy on something that is not yours to decide?',
      question: 'In Epictetus’s distinction, which of these is up to you?',
      options: [
        'Whether your application is accepted.',
        'How carefully you prepare your application.',
        'What other people think of your application.',
      ], correct: 1,
      feedback: 'Your preparation is your own action. Acceptance and other people’s opinions depend on things outside you, even though your effort can influence them.',
      takeaway: 'Care about the outcome, and work on the part that is yours.',
      sources: ['stoic-epictetus-iep', 'stoic-week-handbook'],
      visual: { kind: 'compare', title: 'Up to you, or not?',
        left: { label: 'Up to you', items: ['Your judgments about what happened', 'Your intentions and effort', 'How you respond, including what you say next'] },
        right: { label: 'Not up to you', items: ['Other people’s choices and opinions', 'Results, reputation and status', 'Health, possessions and much of what happens to your body'] },
        note: 'Summarized from Epictetus’s Handbook as described in the Internet Encyclopedia of Philosophy and the Stoic Week handbook.' },
      technique: { name: 'The control sort', origin: 'Epictetus · Handbook, recorded by Arrian (early 2nd century), as taught in the Stoic Week Handbook (Modern Stoicism, 2016)',
        steps: [
          'Write down the situation that is troubling you.',
          'Ask of each part of it: is this up to me?',
          'List what is up to you as actions, judgments or intentions, not outcomes.',
          'Choose one of those actions and decide when you will take it.',
          'Remind yourself that the rest is not yours to decide, and let your attention return to the action.',
        ],
        evidence: 'The distinction is a philosophical tool, not a tested treatment. It is part of Stoic Week, whose self-selected participants reported improved well-being in uncontrolled surveys, but no controlled study has tested the control sort on its own.',
        sourceId: 'stoic-week-handbook' },
      photo: { id: '1507525428034-b723cf961d3e', alt: 'A calm shoreline where clear water meets the sand' } },

    { id: 'stoic-2', title: 'The story between event and feeling', minutes: 9,
      goal: 'Catch the judgment that sits between something that happens and how you feel about it.',
      reading: [
        'Epictetus taught that people are disturbed less by what happens than by the judgments they make about it. A message left unanswered is just a message left unanswered. The pain comes from the verdict we add: they are ignoring me, I have done something wrong, I do not matter. The Stoics practiced pausing before agreeing with such a verdict. Seneca described the first jolt of anger as involuntary, something like a flinch. In his account, anger proper begins only when we agree that we have been wronged and that striking back is right. The flinch happens to you; the agreement is yours.',
        'Nearly two thousand years later, psychologist Albert Ellis built a therapy on a similar insight. His ABC model says that an activating event (A) leads to emotional and behavioral consequences (C) through beliefs (B), especially rigid musts and catastrophic conclusions. Aaron Beck, the other founder of cognitive therapy, helped people step back and see a thought as a thought rather than a fact. The Stoic Week team, which includes cognitive therapists, describes Stoic psychology as an influence on modern cognitive behavioral therapy (CBT). The point is not to feel nothing. It is to notice the story, test it, and choose one that fits the facts better.',
      ],
      deeper: [
        { heading: 'Not suppressing, but examining', paragraphs: [
          'A common picture of Stoicism is a stiff upper lip: feel nothing, show nothing. The ancient Stoics did aim to be free of what they called passions, emotions built on false judgments. But the Stoic Week handbook points out that Marcus Aurelius admired one of his teachers for being free of passions and full of affection at the same time. Stoic calm is not numbness.',
          'Seneca’s distinction helps here. The first flinch of fear or anger is not a failure; it is a body doing its job. The practice begins in the moment after, when you ask what you are telling yourself and whether it is true. Pushing the feeling down skips that question. Examining the judgment answers it.',
        ] },
        { heading: 'What the research says, and what it does not', paragraphs: [
          'CBT, which grew partly from these ideas, has broad research support as a therapy. A review of 269 meta-analyses found the strongest evidence for anxiety disorders, anger problems and general stress, among others. That is evidence for therapy with a trained professional, not for reading a lesson.',
          'Stoicism itself has been studied mostly through Stoic Week, a free seven-day online course. In 2021, 1,369 people filled in the opening questionnaire and 459 filled in the closing one. Those who finished reported higher well-being and fewer negative emotions. But participants chose to take part, there was no control group, two thirds did not complete the final questionnaire and everything was self-reported. These figures show what finishers said, not what Stoicism causes.',
        ],
          visual: { kind: 'bars', title: 'Stoic Week 2021: changes reported by people who finished', bars: [
            { label: 'Flourishing', value: 11.5, display: '+11.5%' },
            { label: 'Life satisfaction', value: 14.5, display: '+14.5%' },
            { label: 'Positive emotions', value: 13, display: '+13%' },
            { label: 'Negative emotions (reduction)', value: 21, display: '−21%' },
          ], note: '459 of 1,369 starters finished. Self-selected participants, no control group, self-report measures. Figures from Tim LeBon’s Stoic Week 2021 report.', sourceId: 'stoic-week-report' } },
      ],
      example: { title: 'Sam, 26, junior designer', text: 'Sam’s lead replied to his first big mock-up with a single line: let’s talk tomorrow. By lunch Sam was sure he had failed and was drafting an apology. He remembered the ABC idea and wrote it out. A: a short message asking to talk. B: she hates it, I am out of my depth, I should have known better. C: dread, and an afternoon of anxious tinkering. Then he read B as if a stranger had written it. The message said nothing about quality, and short messages were how she scheduled every meeting. A better-fitting belief was: she wants to discuss it, and I do not yet know how she sees it. The dread eased a notch. He spent the afternoon listing his design choices and his reasons. The next day she asked for two changes and said the rest worked.' },
      practice: [
        'Recall one moment today when you felt a sharp emotion, and write the event in neutral words a camera could record.',
        'Underneath, write the judgment you added, word for word, including any must, should or always.',
        'Write one alternative judgment that fits the facts at least as well, and notice whether the feeling shifts even slightly.',
      ],
      reflection: 'Which judgment do you tend to add to events without noticing?',
      question: 'In the Stoic view, where does most of the distress in an upsetting moment come from?',
      options: [
        'From the event itself, which cannot be changed.',
        'From feeling any emotion at all.',
        'From the judgment we add about what the event means.',
      ], correct: 2,
      feedback: 'Epictetus located the disturbance in our judgments about events. Feelings themselves are not the enemy; Seneca saw the first jolt as involuntary. The work lies in examining what we agree to next.',
      takeaway: 'Between what happens and how you feel, there is a story, and you can check it.',
      sources: ['stoic-epictetus-iep', 'stoic-seneca-iep', 'stoic-week-handbook', 'optimism-ellis', 'stoic-kross-distancing', 'optimism-hofmann', 'optimism-nhs-cbt', 'stoic-week-report'],
      visual: { kind: 'cycle', title: 'Event, judgment, feeling, action', nodes: [
        { label: 'Event', text: 'Something happens: a message, a delay, a comment.' },
        { label: 'Judgment', text: 'You add a verdict: this is a disaster, they must respect me.' },
        { label: 'Feeling', text: 'The emotion follows the verdict more than the event.' },
        { label: 'Action', text: 'You act on the feeling, which shapes what happens next.' },
      ], center: 'Pause at the judgment', note: 'Our summary of Epictetus’s point and Albert Ellis’s ABC model.' },
      technique: { name: 'The ABC check, Stoic style', origin: 'Albert Ellis · ABC model of rational emotive behavior therapy (first presented 1956)',
        steps: [
          'A: write the activating event in plain, factual words.',
          'B: write the belief you added, especially any must, should or catastrophe.',
          'C: note the feeling and what you did, or wanted to do.',
          'Dispute: ask whether the belief is true, whether it helps, and which part of it is up to you to hold differently.',
          'Write a more flexible belief based on preference rather than demand, and one action it suggests.',
        ],
        evidence: 'The ABC model is a core part of rational emotive behavior therapy, and CBT as a therapy has broad research support. This self-help version has not been tested on its own and is not a substitute for therapy with a trained professional.',
        sourceId: 'optimism-ellis' },
      photo: { id: '1500534314209-a25ddb2bd429', alt: 'Layers of hazy hills at dusk' } },

    { id: 'stoic-3', title: 'Rehearse the hard day, gently', minutes: 9,
      goal: 'Imagine a likely setback briefly and realistically, then plan your response, without sliding into worry.',
      reading: [
        'The Stoics practiced something that sounds gloomy at first: imagining difficulties in advance. Later writers call it premeditatio malorum, the premeditation of adversities. Marcus Aurelius, a Roman emperor who kept a private notebook we now call the Meditations, wrote about starting the day by expecting to meet difficult people and deciding in advance how he would treat them. The purpose was not to invite disaster. It was to meet ordinary setbacks, like a delayed train or a rude reply, with a plan instead of a shock. The Stoic Week handbook compares it with modern exposure: looking calmly at a feared possibility, in small doses, can make it less frightening.',
        'Done badly, this becomes rumination: replaying worst cases over and over with no end and no plan. The Stoic Week handbook is clear about the difference. Keep the imagined setback realistic, keep the intensity manageable, and pair it with how you want to respond. That last part matters. Research on mental contrasting, developed by Gabriele Oettingen and colleagues, found that picturing a real obstacle and then making an if-then plan had a small-to-medium average effect on reaching goals. The Stoic rehearsal and the modern plan meet in the same place: see the difficulty clearly, then decide what you will do about it.',
      ],
      deeper: [
        { heading: 'Premeditation or worry?', paragraphs: [
          'Worry and premeditation both look ahead, but they feel different. Worry repeats the same scene, grows more vivid and ends in dread. Premeditation visits the scene once, notes what is likely rather than everything that is possible, and ends with a response you could actually give.',
          'A useful test: after two or three minutes, do you have a sentence that starts with “If this happens, I will…”? If yes, you rehearsed. If you are still circling, stop, stand up and do something with your hands. You can come back to it later.',
        ],
          visual: { kind: 'steps', title: 'A two-minute rehearsal', steps: [
            { label: 'Pick', text: 'Choose one realistic setback for today or this week.' },
            { label: 'Picture', text: 'Imagine it once, briefly, at a manageable intensity.' },
            { label: 'Sort', text: 'Notice which parts of it are up to you.' },
            { label: 'Plan', text: 'Write one if-then sentence for your response.' },
            { label: 'Stop', text: 'Close the exercise and return to your day.' },
          ], note: 'Our summary, combining the Stoic Week handbook’s cautions with if-then planning.' } },
        { heading: 'Who should skip this one', paragraphs: [
          'The Stoic Week handbook itself says its course is not suitable for people with severe mental health problems, naming conditions such as clinical depression and PTSD, and that it is not a substitute for medical advice. If imagining bad outcomes pulls you into panic, intrusive images or hours of worry, skip this lesson’s practice and talk with a qualified professional. Therapists who use exposure for anxiety do it carefully and with support, for good reason.',
        ] },
      ],
      example: { title: 'Ana, 38, primary school teacher', text: 'Ana had a parent meeting at four with a father who had complained twice by email. In the morning, over coffee, she gave herself two minutes. She pictured the likely version, not the worst: he interrupts, raises his voice a little and says she is unfair to his son. She noticed her chest tighten and let it. Then she asked what was hers: her tone, the facts she brought and whether she stayed focused on the child’s progress. She wrote on a sticky note: if he interrupts, I will pause, say I want to hear him, and then return to the reading scores. At four, he did interrupt. Ana paused, as planned. The meeting was not warm, but it stayed on track, and she did not spend the evening replaying it.' },
      practice: [
        'Choose one realistic difficulty that could come up in the next day or two, not the worst thing you can imagine.',
        'Picture it once for about a minute, noticing your feelings without pushing them away.',
        'Write one sentence starting with “If this happens, I will…”, then close the exercise and move on.',
      ],
      reflection: 'Which setback would feel lighter if you had already decided how to respond?',
      question: 'What separates Stoic premeditation from rumination?',
      options: [
        'Premeditation imagines the worst possible outcome as vividly as possible.',
        'Premeditation is brief and realistic and ends with a planned response.',
        'Premeditation means repeating the scene until the fear goes away.',
      ], correct: 1,
      feedback: 'Rehearsal visits a likely difficulty briefly, at a manageable intensity, and closes with a plan. Rumination repeats worst cases without an end or a decision.',
      takeaway: 'See the hard moment once, decide your response, then return to today.',
      sources: ['stoic-week-handbook', 'state-mental-contrasting', 'if-then-plans'],
      visual: { kind: 'table', title: 'Rehearsal or rumination?', columns: ['Question', 'Stoic rehearsal', 'Rumination'],
        rows: [
          ['How long?', 'A minute or two', 'Hours, on and off'],
          ['What do you imagine?', 'A likely difficulty', 'The worst possible case'],
          ['How does it end?', 'With an if-then plan', 'With more dread'],
          ['What happens next?', 'You return to your day', 'The scene replays'],
        ],
        note: 'Our summary, based on the cautions in the Stoic Week handbook.' },
      technique: { name: 'Premeditation of adversity', origin: 'Marcus Aurelius · Meditations (2nd century), as taught in the Stoic Week Handbook (Modern Stoicism, 2016)',
        steps: [
          'Pick one realistic difficulty you may meet today.',
          'Imagine it briefly and at a manageable intensity.',
          'Remind yourself which parts of it are up to you.',
          'Decide how you want to respond and put it into an if-then sentence.',
          'End the exercise and turn your attention back to the present.',
        ],
        evidence: 'No controlled trial has tested Stoic premeditation on its own. The closest modern evidence is for mental contrasting and if-then plans, which showed small-to-medium average effects on reaching goals in meta-analyses. It is not suitable for everyone who struggles with anxiety or intrusive thoughts.',
        sourceId: 'stoic-week-handbook' },
      photo: { id: '1464822759023-fed622ff2c3b', alt: 'Forested valleys below snowy mountains' } },

    { id: 'stoic-4', title: 'The view from above', minutes: 9,
      goal: 'Step back from a heated moment by changing your viewpoint, the words you use, or your sense of time.',
      reading: [
        'In his Meditations, Marcus Aurelius often pictured his life from far away: the whole earth, crowds of people, centuries passing. Modern Stoics call this the view from above. From that height, the argument at breakfast or the tense email looks smaller, not because it does not matter, but because it takes its place among everything else. The exercise is less about feeling tiny and more about loosening the grip one moment can have on your whole attention. You are still in the scene. You simply see more of it than the part that hurts.',
        'Psychologists Ethan Kross and Ozlem Ayduk have studied a close cousin of this idea, which they call self-distancing. In their experiments, people who replayed a painful memory as a fly on the wall, watching themselves from a distance, reported less negative emotion than people who relived it through their own eyes, and they made more sense of what had happened. Another route is language. In seven studies with 585 people, those who talked to themselves using their own name or “you” instead of “I” felt less distress, performed better on a stressful speech according to observers, and ruminated less afterwards.',
      ],
      deeper: [
        { heading: 'Three ways to step back', paragraphs: [
          'Kross and Ayduk’s review describes several routes to distance. You can change your viewpoint in space, as in the fly-on-the-wall exercise. You can change your words, by addressing yourself by name. Or you can change your viewpoint in time, by asking how you will feel about this in ten years. In their studies, the time route seemed to work by reminding people that feelings pass.',
        ],
          visual: { kind: 'table', title: 'Three ways to step back', columns: ['Route', 'Try this', 'What studies found'],
            rows: [
              ['Space', 'Watch the scene as a fly on the wall, seeing yourself in it.', 'Less negative emotion, more understanding, faster blood pressure recovery than reliving it.'],
              ['Words', 'Coach yourself by name or as “you”.', 'Less distress and rumination, better-rated speeches, more challenge than threat.'],
              ['Time', 'Ask how you will see this in ten years.', 'Less distress, linked to seeing feelings as temporary.'],
            ],
            note: 'From Kross & Ayduk (2017) and Kross et al. (2014); mostly short laboratory studies.' } },
        { heading: 'Limits and fair questions', paragraphs: [
          'Most of these studies were short laboratory experiments, often with students. Benefits were clearest for people who were already quite upset; in some studies people with little distress gained little. The authors also separate stepping back to understand a feeling from stepping back to avoid it. Distancing helps when you use it to look more clearly, not to look away.',
          'The Stoics and the psychologists are not describing exactly the same thing. Marcus Aurelius aimed at a vast, cosmic perspective; the experiments ask for a few steps back. Both point the same way: a little distance makes room for a wiser response.',
        ] },
      ],
      example: { title: 'Priya, 33, software tester', text: 'Priya was about to join a video call where a colleague had publicly blamed her team for a missed release. Her heart was racing and she had a sharp reply ready. With three minutes to go she tried two things. First she pictured the call from the corner of the room, as if watching two tired people in a busy company, one of whom was her. Then she talked to herself by name: Priya, you want the release fixed, not a win in the chat. You know the timeline. Say it once, calmly. She still felt angry when the call began. But she opened with the timeline instead of the reply, and the conversation moved to what each team needed. Afterwards she noticed she was not replaying it, which was new.' },
      practice: [
        'Think of a situation that is bothering you right now and notice how close and loud it feels.',
        'Replay it for a minute as a fly on the wall, watching yourself in the scene from a distance.',
        'Give yourself one sentence of advice using your own name or “you”, the way a calm friend would.',
      ],
      reflection: 'How will this situation look to you ten years from now?',
      question: 'In Kross and colleagues’ studies, what helped people handle a stressful speech?',
      options: [
        'Talking to themselves by name or as “you” instead of “I”.',
        'Replaying the worst moments through their own eyes.',
        'Distracting themselves until the feeling vanished.',
      ], correct: 0,
      feedback: 'Non-first-person self-talk increased distance, reduced distress and rumination, and led to speeches that observers rated higher. The review also found that distancing held up better over time than distraction.',
      takeaway: 'A few steps back can turn a flood into a view.',
      sources: ['stoic-week-handbook', 'stoic-kross-distancing', 'stoic-kross-self-talk'],
      visual: { kind: 'compare', title: 'Immersed or distanced?',
        left: { label: 'Through your own eyes', items: ['Replays the details: what they said, how it felt.', 'Asks why me, again and again.', 'Feelings stay loud and return later.'] },
        right: { label: 'From a few steps back', items: ['Sees yourself in the wider scene.', 'Asks what makes sense of this.', 'Emotion eases and the event feels clearer.'] },
        note: 'Our summary of self-immersed and self-distanced reflection in Kross & Ayduk (2017).' },
      technique: { name: 'The view from above', origin: 'Marcus Aurelius · Meditations (2nd century), as taught in the Stoic Week Handbook (Modern Stoicism, 2016)',
        steps: [
          'Sit quietly and picture yourself where you are right now.',
          'Slowly rise above the room, the street and the city, seeing yourself as a small figure in it.',
          'Keep widening the view to the country, the planet and the long stretch of time.',
          'From that height, look back at what is troubling you and notice its place among everything else.',
          'Return slowly and ask what one wise response to it would be.',
        ],
        evidence: 'The view from above itself has not been tested in trials. Experiments on self-distancing, a related idea, found less emotional reactivity and rumination, mostly in short laboratory studies; benefits were larger for people who were more distressed.',
        sourceId: 'stoic-week-handbook' },
      photo: { id: '1506905925346-21bda4d32df4', alt: 'Mountain ridges seen from above a sea of clouds' } },

    { id: 'stoic-5', title: 'The evening review', minutes: 8,
      goal: 'Close the day with a short, fair review that turns mistakes into one lesson for tomorrow.',
      reading: [
        'Seneca, a Roman philosopher who tutored and later advised the emperor Nero, is one of the Stoics linked with a nightly habit: before sleep, going back over the day. Epictetus recommended the same kind of review. In its modern form, taught in the Stoic Week handbook, it takes five to ten minutes and three questions. What did I do badly? What did I do well? What could I do differently? The review is meant to be specific. Not “I was awful today” but “I cut Ali off in the meeting when he disagreed.” Specific actions can be learned from. Global verdicts about yourself cannot.',
        'The handbook adds a condition that changes everything: review the day as a good friend or a fair teacher would, not as a prosecutor. A harsh review keeps you awake replaying scenes. A fair one names the slip, notes what went right, and ends with a small adjustment. There is a link here to the self-distancing research from the last lesson. When people reflect from a few steps back, they tend to move from recounting what happened to understanding it, and they ruminate less. The evening review works best in that spirit: a look back that makes sense of the day, then a closed notebook and sleep.',
      ],
      deeper: [
        { heading: 'Keeping it from becoming rumination', paragraphs: [
          'Put a limit on it: five to ten minutes, on paper, at roughly the same time each evening. Paper gives the review an end. When the three questions are answered, the day is closed.',
          'Count the good as carefully as the bad. The second question is not decoration. If you only look for faults, the review turns into a list of charges. If you also look for what went well, you learn what to repeat.',
        ],
          visual: { kind: 'cycle', title: 'The review loop', nodes: [
            { label: 'Act', text: 'Live the day, making the best choices you can.' },
            { label: 'Review', text: 'In the evening, answer the three questions on paper.' },
            { label: 'Adjust', text: 'Pick one small change for tomorrow.' },
            { label: 'Rest', text: 'Close the notebook and let the day end.' },
          ], center: 'Learn, not punish', note: 'Our summary of the evening meditation in the Stoic Week handbook.' } },
        { heading: 'What the evidence says', paragraphs: [
          'No controlled trial has tested the Stoic evening review on its own. In Stoic Week it is one of several daily practices, and the course as a whole has been evaluated only with self-selected, self-reported surveys without a control group. The best reason to try it is practical: it is short, free and easy to drop if it does not help you.',
          'If an evening review regularly leaves you more anxious or unable to sleep, move it earlier, shorten it or stop. If low mood or self-criticism is heavy and lasting, talk with a professional.',
        ] },
      ],
      example: { title: 'Tom, 52, shop owner', text: 'Tom used to lie awake going over everything that had gone wrong in the shop. He decided to try the review at nine, at the kitchen table, with a small notebook. The first night he wrote: badly, snapped at a supplier on the phone when a delivery was late; well, stayed patient with a confused older customer and found her the right part; differently, when a delivery is late, ask for the new time before saying anything else. It took seven minutes. He closed the notebook and left it on the counter. He still thought about the supplier in bed, but the thought had somewhere to go: it was written down, with a plan. After two weeks he noticed the same kinds of slip showing up, which told him where to practice.' },
      practice: [
        'Set a five-minute timer this evening and write short answers to: what did I do badly, what did I do well, what could I do differently?',
        'Rewrite any harsh sentence in the tone a fair friend would use, keeping the facts.',
        'Choose one small adjustment for tomorrow, write it at the top of a new page, and close the notebook.',
      ],
      reflection: 'What would a fair friend say about how you handled today?',
      question: 'What tone does the modern Stoic evening review recommend?',
      options: [
        'The tone of a strict judge, so you never repeat a mistake.',
        'The tone of a fair friend who names mistakes and what went well.',
        'No judgment at all: list only what went well so you sleep better.',
      ], correct: 1,
      feedback: 'The review names real slips and real successes, specifically and kindly, and ends with one adjustment. Harshness tends to feed rumination; ignoring mistakes teaches nothing.',
      takeaway: 'Look back to learn, then close the day.',
      sources: ['stoic-seneca-iep', 'stoic-week-handbook', 'stoic-kross-distancing', 'stoic-week-report'],
      visual: { kind: 'steps', title: 'Three questions before sleep', steps: [
        { label: 'What did I do badly?', text: 'Name one specific action, not a verdict on yourself.' },
        { label: 'What did I do well?', text: 'Find at least one thing worth repeating.' },
        { label: 'What could I do differently?', text: 'Turn the lesson into one small change for tomorrow.' },
      ], note: 'From the evening meditation in the Stoic Week handbook, based on Seneca and Epictetus.' },
      technique: { name: 'Evening review', origin: 'Seneca and Epictetus, as taught in the Stoic Week Handbook (Modern Stoicism, 2016)',
        steps: [
          'Sit down at a set time in the evening with a notebook.',
          'Go through the day briefly, in order, from morning to now.',
          'Answer: what did I do badly, what did I do well, what could I do differently?',
          'Use the voice of a fair friend, naming specific actions rather than judging yourself as a person.',
          'Write one adjustment for tomorrow and close the notebook.',
        ],
        evidence: 'The review has not been tested on its own in controlled studies. It is one part of Stoic Week, whose finishers reported improved well-being in uncontrolled, self-reported surveys.',
        sourceId: 'stoic-week-handbook' },
      photo: { id: '1475924156734-496f6cac6ec1', alt: 'Waves on a rocky shore at dusk' } },

    { id: 'stoic-6', title: 'One decision today', minutes: 8,
      goal: 'Turn the Stoic focus on what is up to you into one small, concrete decision you act on today.',
      reading: [
        'For the Stoics, philosophy was a way of living, not only a set of ideas to admire. Everything in this course leads here. The control sort shows you where your power is. Checking your judgment keeps a story from steering you. Rehearsal prepares a response, distance cools a heated moment, and the evening review teaches you something about your day. None of it matters much until you do one thing differently. That is also the idea behind ODA: one decision a day, made on purpose, in the part of life that is actually yours to shape.',
        'A good Stoic decision has three features. It is inside your control: an action, not an outcome. It is small enough to do today. And it is tied to a moment, so you do not have to rely on memory or willpower. Planning research helps with that last part. Across 94 tests, plans in the form “If situation X happens, then I will do Y” had a medium-to-large average effect on reaching goals, though newer analyses suggest the true effect may be smaller. Gabriele Oettingen’s WOOP method adds a wish and an obstacle to the plan; the research it rests on shows a small-to-medium effect.',
      ],
      deeper: [
        { heading: 'Why small and specific', paragraphs: [
          'Big resolutions usually live in the outcome column: get fit, be calmer, fix the relationship. A Stoic decision moves the resolution back into your own column: walk for ten minutes after lunch, take three breaths before answering my manager, ask my partner one real question at dinner. You can keep that decision today, however the day treats you.',
          'Then let the result go. If you took the walk and still feel tired, the decision was kept. The outcome belongs to the second column. What you learned goes into tonight’s review.',
        ],
          visual: { kind: 'compare', title: 'Outcome resolution or Stoic decision?',
            left: { label: 'Outcome resolution', items: ['Get the promotion.', 'Stop being anxious.', 'Make them understand me.'] },
            right: { label: 'Stoic decision for today', items: ['Send the project summary to my manager by 3 pm.', 'When my chest tightens, breathe slowly three times before replying.', 'Listen to their side for two minutes before giving mine.'] },
            note: 'Our own examples.' } },
        { heading: 'When the day goes wrong anyway', paragraphs: [
          'Some days the plan will not happen. A child gets sick, a meeting runs late, energy runs out. The Stoic answer is not self-blame. What remains up to you is how you respond now: a smaller version of the same decision, or simply noting what got in the way for tonight’s review. Keep the thread, not a perfect record.',
          'This course is a set of practices, not a treatment. If stress, low mood or anxiety are getting in the way of daily life, the most Stoic decision may be to ask for professional help, an action that is fully within your control.',
        ] },
      ],
      example: { title: 'Can, 29, sales assistant', text: 'Can had been worried for weeks about money and about a tense relationship with his brother. Both felt too big to touch. On Sunday morning he did a control sort. His brother’s mood and the rent increase went in the second column. In the first went checking his spending for the month and getting in touch with his brother. He picked one decision for the day: if he finished lunch, then he would send his brother a short message asking how his new job was going. He wrote it on his phone’s lock screen. After lunch he almost skipped it, then sent it. The reply came in the evening, brief but friendly. Nothing was fixed. But that night, in his review, Can wrote that he had acted on something that was his, and chose tomorrow’s decision: the spending check.' },
      practice: [
        'Pick one worry or goal and write the part of it that is up to you as an action, not an outcome.',
        'Shrink that action until you could do it today in under fifteen minutes.',
        'Attach it to a moment with an if-then sentence, such as “If I finish lunch, then I will…”, and then do it.',
      ],
      reflection: 'What is one small thing, fully up to you, that you could do today?',
      question: 'Which of these is a Stoic-style decision for today?',
      options: [
        'Become a calmer person this year.',
        'Make sure my team approves my proposal.',
        'If I open my laptop after lunch, then I will spend ten minutes outlining the proposal.',
      ], correct: 2,
      feedback: 'It is an action within your control, small enough for today, and tied to a moment by an if-then plan. The other two describe outcomes or long-term hopes.',
      takeaway: 'Do one small thing that is yours, today, and let the rest be.',
      sources: ['stoic-epictetus-iep', 'stoic-week-handbook', 'if-then-plans', 'oettingen-woop-method', 'mcii'],
      visual: { kind: 'table', title: 'From worry to one decision', columns: ['Worry', 'Up to you', 'Decision for today'],
        rows: [
          ['Will I get the job?', 'Preparation and follow-up', 'Practice my answer to the hardest question for ten minutes after dinner.'],
          ['Is my friend upset with me?', 'Reaching out and listening', 'Send a short, honest message before noon.'],
          ['Am I neglecting my health?', 'Movement and bedtime', 'Take a ten-minute walk after lunch.'],
        ],
        note: 'Our own examples of the control sort turned into if-then decisions.' },
      technique: { name: 'WOOP', origin: 'Gabriele Oettingen · Rethinking Positive Thinking (2014)',
        steps: [
          'Wish: name something you want that is challenging but possible.',
          'Outcome: picture the best result of it for a moment.',
          'Obstacle: find the main obstacle in your way, often a habit or a feeling of your own.',
          'Plan: write “If [obstacle], then I will [action]” and pick a time today to begin.',
        ],
        evidence: 'Mental contrasting combined with if-then plans showed a small-to-medium average effect on reaching goals across 21 studies (g = 0.336). The official WOOP site belongs to the method’s developers and is not an independent evaluation.',
        sourceId: 'oettingen-woop-method' },
      photo: { id: '1502082553048-f009c37129b9', alt: 'A single tree standing in an open landscape' } },
  ],
};
