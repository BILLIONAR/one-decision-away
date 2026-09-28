import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * English edition of "Özgüven" (confidence). Lesson IDs, practice counts and
 * answer positions match the Turkish edition in src/data/courses.ts; the
 * visuals are translated from existingVisuals.ts. This file also carries the
 * English versions of the shared base sources 'mcii', 'self-compassion' and
 * 'monitoring' (same ids). 'bandura-self-efficacy' is translated in
 * ./turning-day.ts. New sources (Sep 2026) are prefixed 'confidence-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'mcii', title: 'Wang, Wang & Gai · 2021 · Meta-analysis on reaching goals', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.565202/full', type: 'research', finding: '21 studies, 15,907 participants: contrasting a goal with the real obstacle together with an if–then plan showed a small-to-medium average effect (g = 0.336).', limitation: 'Publication bias is possible; results vary by person and situation. The effectiveness of this ODA course has not been tested.' },
  { id: 'self-compassion', title: 'Han & Kim · 2023 · Meta-analysis of self-compassion interventions', url: 'https://pubmed.ncbi.nlm.nih.gov/37362192/', type: 'research', finding: 'Across 56 randomized trials, self-compassion interventions showed small-to-medium short-term average effects on stress, anxiety and depressive symptoms.', limitation: 'The overall risk of bias was high; data on active comparisons and online delivery are more limited. The abstract that was reviewed does not prove a treatment effect for this exercise.' },
  { id: 'monitoring', title: 'Harkin et al. · 2016 · Meta-analysis of progress monitoring', url: 'https://pubmed.ncbi.nlm.nih.gov/26479070/', type: 'research', finding: '138 experimental studies, 19,951 people: interventions that increased progress monitoring showed an average benefit for reaching goals (d = 0.40). The benefit was larger when progress was reported to others or made public and when it was physically recorded.', limitation: 'Very different goals and monitoring methods were pooled. You do not need to share your private notes; the tracking screen used here has not been tested separately. The abstract was reviewed.' },
  { id: 'confidence-fear-ladder', title: 'Psychology Tools · Fear ladder (exposure hierarchy)', url: 'https://www.psychologytools.com/resource/fear-ladder', type: 'guidance', finding: 'A clinician resource describing the fear ladder used in cognitive behavioral therapy for anxiety: identify the fear, list feared situations, give each a predicted fear rating, rank them from least to most frightening, and begin gradual exposure with the lower steps, moving up over time. It notes that the pace should be adjusted if a person becomes overwhelmed and that therapists usually guide the process.', limitation: 'A practical guide for clinicians, not a study; it describes how exposure is done in therapy rather than testing a self-help version. This course uses the idea only for everyday, safe challenges.' },
  { id: 'confidence-five-second-rule', title: 'Mel Robbins · The 5 Second Rule (2017) · “Motivation is garbage” podcast episode', url: 'https://www.melrobbins.com/episode/episode-3/', type: 'technique', finding: 'Robbins describes counting backward “5, 4, 3, 2, 1” and then moving, so that you act in the short window between an impulse and the moment when fear, excuses and self-doubt talk you out of it. She argues that action comes first and motivation follows.', limitation: 'The author’s own podcast page. We found no controlled study of the 5 second rule itself; the evidence is mostly personal stories. Its useful core, a clear cue that starts a small, planned action, overlaps with if–then planning.' },
];

export const COURSE: GuidedCourse = {
  id: 'confidence', title: 'Confidence', subtitle: 'One step, even when you are scared.',
  description: 'Notice your inner critic, choose a safe experiment, and move forward on the strength of your own effort.',
  scope: 'Everyday courage and self-compassion practice. It is not exposure therapy for dangerous situations, trauma or intense anxiety; for those, please work with a trained professional.',
  outcome: 'A courage step that fits you and a plan for trying again.',
  photo: { id: '1756244834590-b1a32e94df40', alt: 'Woman looking out over a mountain lake at sunrise' },
  lessons: [
    { id: 'confidence-1', title: 'Name the fear, not yourself', minutes: 6,
      goal: 'Separate a feeling from the verdict you pass on yourself.',
      reading: ['“I get nervous when I speak” describes an experience. “I’m not good enough” is a verdict that spreads across your whole life. Today, without trying to prove or disprove the second sentence, we will describe what happens to you more concretely: where you are, what you are doing and what you feel. A description gives you something to work with; a verdict only gives you something to carry around. You can change a situation step by step, but it is hard to change a verdict.', 'Choose a safe, small situation, such as sharing an idea in a meeting. The fear does not need to disappear for this lesson to work; you are only practicing a more accurate way of describing it. If a situation is genuinely dangerous, setting a boundary and asking for help are brave decisions too. Courage does not mean walking into harm; it means choosing a step that is right for you, at a pace you can manage, with support when you need it.'],
      practice: ['Describe in one sentence a safe situation you have held back from recently.', 'Notice the label you have stuck on yourself and restate it as “In this situation, I feel …”.', 'Say to yourself, out loud or silently, the understanding response you would give a close friend.'],
      reflection: 'What was your fairer sentence about yourself?', question: 'Which one separates the situation from your identity?', options: ['I always fail.', 'I got tense in this conversation; I can prepare a short sentence.', 'I should never get tense again.'], correct: 1,
      feedback: 'Naming a specific situation makes room for a next step that can change. A feeling is not a summary of who you are.', takeaway: 'Fear is an experience, not the whole of you.', sources: ['self-compassion', 'bandura-self-efficacy'],
      visual: { kind: 'compare', title: 'From a label to a description',
        left: { label: 'Label', items: ['I’m not good enough.', 'I always fail.', 'That’s just the kind of person I am.'] },
        right: { label: 'Description of the situation', items: ['I get nervous when I speak.', 'I got tense in this conversation.', 'I hold back when sharing ideas in meetings.'] },
        note: 'The sentences on the right do not deny the feeling; they make room for a next step that can change.' },
      deeper: [
        { heading: 'Why labels are so sticky', paragraphs: [
          'A label is efficient. “I’m bad at speaking up” saves you the effort of looking at each situation, and it also seems to protect you: if you already expect to fail, nothing can surprise you. The cost is that a label has no handle. You cannot practice “not being useless,” but you can practice “saying one sentence in the Monday meeting.”',
          'Talking to yourself the way you would talk to a friend is not a trick to feel good. Self-compassion interventions showed small-to-medium short-term reductions in stress and anxiety across 56 randomized trials, although the studies had a high overall risk of bias. A calmer, fairer inner voice leaves more room to see what actually happened.',
        ],
          visual: { kind: 'table', title: 'Rewriting a label as a situation', columns: ['Label', 'Situation + feeling', 'Possible next step'],
            rows: [
              ['I’m awkward.', 'At parties with strangers, I feel on edge.', 'Prepare one question to ask someone'],
              ['I’m a coward.', 'I held back when my manager disagreed with me.', 'Write down the point I wanted to make'],
              ['I’m hopeless at this.', 'On my first try at the presentation, I lost my place.', 'Practice the opening twice out loud'],
            ],
            note: 'The middle column is honest about the feeling; the right-hand column gives it somewhere to go.' } },
        { heading: 'Your body’s part in it', paragraphs: [
          'Albert Bandura listed the state of the body among the four sources of self-efficacy, your belief that you can do something. A racing heart, a dry mouth or a shaky voice can easily be read as proof: “See, I can’t do this.” But a pounding heart can also simply mean that something matters to you. It is information about the moment, not a verdict about your ability.',
          'So when you describe the situation, you can include the body without letting it decide: “My heart was pounding, and I still said my sentence.” Both parts are true, and together they tell a very different story from “I was a nervous wreck.”',
        ] },
      ],
      example: { title: 'Olivia, 33, lab technician', text: 'In team meetings Olivia rarely spoke, and afterward she would think, “I’m just not a confident person.” On Tuesday evening she tried the exercise. The safe situation: the weekly lab meeting, when her supervisor asks for comments. The label: “I’m hopeless in groups.” She rewrote it: “In the weekly meeting, when everyone looks at me, I feel my face go hot and I freeze.” Then she asked what she would tell her friend Mei in the same spot, and wrote: “Lots of people freeze when all eyes are on them. You know your work.” Nothing changed at the next meeting. But when her face went hot, she thought “there’s the heat” instead of “there’s proof,” and that felt slightly lighter.' },
      photo: { id: '1579017308347-e53e0d2fc5e9', alt: 'Person writing by hand in an open notebook' } },
    { id: 'confidence-2', title: 'The smallest form of courage', minutes: 7,
      goal: 'Turn a goal that feels hard into a safe, doable experiment.',
      reading: ['“I’ll speak comfortably in front of everyone” can be a big, vague expectation. Today’s experiment might be just preparing one question, or telling one person you trust about your idea. Being small does not make it unimportant. Small experiments are how you collect evidence that the larger version might be possible too, and each one teaches you something about what helps you and what gets in the way. The step only has to be real, not impressive.', 'Keep control of the step you choose. If the discomfort climbs too high, you can stop, choose a smaller step or ask for support. You do not need to compete with this course to push yourself. The point is not to prove that you can endure anything, but to learn that you can act while some fear is still present. A step that is slightly uncomfortable but clearly doable is usually the right size to begin with.'],
      practice: ['Think of an easy, a medium and a hard version of the thing you hold back from.', 'Choose the smallest version you can safely try today, and decide where you will do it.', 'Do the experiment you chose, or finish the concrete preparation for a suitable time.'], reflection: 'Which small experiment suits you right now?', question: 'Which choice is more useful for a first step?', options: ['I have to do the hardest one.', 'Waiting vaguely until the fear is completely gone.', 'Choosing a small, concrete experiment within my own limits.'], correct: 2,
      feedback: 'The aim is not to defeat your biggest fear, but to be able to choose a behavior that suits you. You do not need to put yourself in danger.', takeaway: 'Sometimes courage is a single sentence.', sources: ['mcii', 'self-compassion', 'confidence-fear-ladder', 'bandura-self-efficacy'],
      visual: { kind: 'table', title: 'Three versions of the same task', columns: ['Version', 'Example experiment'],
        rows: [
          ['Easy', 'Preparing one question in advance'],
          ['Medium', 'Telling one person you trust about your idea'],
          ['Hard', 'Speaking in front of everyone'],
          ['Your task', 'Easy: … / Medium: … / Hard: …'],
        ],
        note: 'Choose the smallest version you can safely try today. If the discomfort climbs too high, you can stop or make the step smaller.' },
      deeper: [
        { heading: 'From three versions to a ladder', paragraphs: [
          'The easy–medium–hard exercise is a small version of a tool therapists use called a fear ladder, or exposure hierarchy. You list situations connected to one fear, guess how frightening each would feel, and order them from least to most. Then you start near the bottom and move up only when a step starts to feel manageable. In cognitive behavioral therapy for anxiety, this gradual approach is a core tool.',
          'For everyday confidence, the same shape works on a smaller scale. A rating from 0 (no fear) to 10 (the most you can imagine) is enough. Aim your first experiments at the rungs that feel like a 3 or a 4: uncomfortable but doable. If a step turns out to be a 9, that is not failure; it tells you to add a rung below it.',
        ],
          visual: { kind: 'steps', title: 'A sample confidence ladder: speaking up at work',
            steps: [
              { label: 'Fear 2', text: 'Write down one comment before the meeting.' },
              { label: 'Fear 4', text: 'Share the comment with one colleague afterward.' },
              { label: 'Fear 5', text: 'Ask one question in a small meeting.' },
              { label: 'Fear 7', text: 'Give your opinion in the full team meeting.' },
              { label: 'Fear 9', text: 'Present a short update to the whole department.' },
            ],
            note: 'Move up only when the current rung feels manageable. For anxiety that is intense or rooted in trauma, build and climb a ladder with a trained therapist.' } },
        { heading: 'Why doing beats waiting', paragraphs: [
          'Albert Bandura considered mastery experiences, things you have actually done, the strongest source of the belief that you can do something. Watching others, encouraging words and a calm body help too, but none of them carries the weight of your own experience. Waiting until the fear is gone skips the very thing that would reduce it.',
          'That is also why the step should be yours. An experiment someone pushes you into, or one that goes far beyond what you can manage, is more likely to end in escape than in learning. A step you chose, at a level you can finish, leaves you with evidence you can trust.',
        ] },
      ],
      example: { title: 'Ben, 24, retail assistant', text: 'Ben wanted to ask his manager for more hours but kept freezing. He drew three boxes. Hard: ask in person on the shop floor. Medium: send a short message asking for five minutes to talk. Easy: write down exactly what he wanted and why. Easy felt almost like cheating, but he did it on his lunch break, sitting in the staff room: “I’d like four more hours a week, ideally Saturdays; I’ve covered twice this month.” He rated the medium step at a 6 and decided to wait a day. On Thursday he sent the message. His hands were cold as he pressed send. The manager replied, “Sure, Friday after close.” The conversation itself was still ahead, but now he had two steps behind him.' },
      photo: { id: '1635895752485-99ba511c07e1', alt: 'Stepping stones across water at sunset' } },
    { id: 'confidence-3', title: 'Separate the prediction from what happened', minutes: 8,
      goal: 'Evaluate an experiment through observation rather than judgment.',
      reading: ['Before a conversation, the mind can produce many scenarios, most of them unpleasant. After an experiment, it is also easy to remember only the moment you felt embarrassed. In this lesson, think about what a camera would have seen: the sentence you said, the reply you got, the help you asked for. A camera does not know what people were thinking; it only records what happened. That limitation is exactly what makes it useful here.', 'For example, “My voice shook, but I asked my question” holds two facts at once. Confidence becomes fragile when it depends on every experiment being flawless; here, your measure of success is trying the behavior you chose. Keeping a short record of what you actually did gives you something more reliable than the memory of how it felt. Over time, those records add up to evidence that your inner critic cannot easily dismiss.'],
      practice: ['Recall the prediction you had before your small experiment.', 'Write down or name silently two observations of what actually happened; separate mind reading from observation.', 'If you did not try, record that honestly and make your next experiment smaller.'], reflection: 'What was different from your prediction?', question: 'Which one is observable information?', options: ['Everyone thought I was ridiculous.', 'I asked my question and one person answered.', 'That’s just the kind of person I am.'], correct: 1,
      feedback: 'Instead of assuming what others thought, record what was seen and heard. This record is not a performance grade.', takeaway: 'Take one piece of information from today’s experiment.', sources: ['monitoring', 'bandura-self-efficacy'],
      visual: { kind: 'compare', title: 'What would a camera have seen?',
        left: { label: 'Prediction', items: ['Everyone laughed at me.', 'Everyone noticed I was tense.', 'That’s just the kind of person I am.'] },
        right: { label: 'Observation', items: ['I asked my question.', 'One person answered.', 'My voice shook, but I asked my question.'] },
        note: 'Instead of assuming what others thought, record what was seen and heard. This record is not a performance grade.' },
      deeper: [
        { heading: 'Bandura’s four sources, applied to your experiment', paragraphs: [
          'Bandura described four sources that feed self-efficacy: mastery experiences, watching others, encouraging words from others, and the state of your body. Each experiment you try can draw on all four, but only if you notice them. A camera-style record helps with the first and the most powerful: it turns a blurry memory into a clear “I did this.”',
          'Bandura also wrote that a belief built up through repeated success is shaken less by the occasional setback. That is why recording matters more than any single result. One awkward conversation, set against five recorded ones that went fine, looks like what it is: one data point.',
        ],
          visual: { kind: 'table', title: 'Four sources of self-efficacy in a courage experiment', columns: ['Source', 'What to look for after your experiment'],
            rows: [
              ['Mastery experience', 'What did I actually do? Write the behavior, not the grade.'],
              ['Watching others', 'Did I see someone else do something similar, imperfectly, and survive?'],
              ['Encouraging words', 'Did anyone respond kindly, or can I say one fair sentence to myself?'],
              ['Body state', 'Did the nervousness peak and then settle? When?'],
            ],
            note: 'Bandura considered mastery experience the most powerful source. This table is a reflection aid, not a treatment plan.' } },
        { heading: 'The replay trap', paragraphs: [
          'After a social moment, many people replay it again and again, zooming in on one awkward second. Each replay feels like learning, but it mostly strengthens the prediction you started with. The camera question interrupts this: it asks for two observations and then lets you stop.',
          'Tracking progress in writing was linked to better goal attainment in a large meta-analysis, and physically recording it was linked to a larger benefit. A replay is not a record. A record is short, factual and finished; you can close the notebook.',
        ] },
      ],
      example: { title: 'Lucas, 30, software developer', text: 'Lucas had asked a question at a conference Q&A, his experiment for the week. Walking out, his mind was already replaying it: his voice had cracked, and surely everyone had noticed. That night he opened his notes and wrote his prediction from before: “I’ll stumble, the speaker will be dismissive, people will stare.” Then two camera observations: “I asked about the migration timeline. The speaker said it was a good question and answered for about a minute.” He added: “My voice cracked on the first word.” Reading the three lines together, the crack looked small next to the rest. He wrote one more line for next time: “Same kind of question, in a smaller session.”' },
      photo: { id: '1572020487535-31e268b25e21', alt: 'Man taking notes in a notebook' } },
    { id: 'confidence-4', title: 'A supportive sentence for your inner voice', minutes: 6,
      goal: 'After a mistake, talk to yourself in a way that is both honest and helpful.',
      reading: ['Saying “Nothing happened” may not convince you. “That was hard; I still tried to say a sentence” may be more realistic. Being kind to yourself does not mean giving up responsibility. You can be warm and honest at the same time, the way a good coach is with a player after a rough game: clear about what went wrong, and clearly on the player’s side. That combination is what makes the next attempt feel possible.', 'If there was a mistake, pick the part that can be fixed. Apologizing to someone, checking the information again or preparing a note for the next meeting are concrete options. Putting yourself down does not replace these steps; it usually just makes them harder to take, because it adds shame to a situation that already feels uncomfortable. A repair, even a small one, turns the mistake into something you have dealt with rather than something you keep carrying.'],
      practice: ['Notice the harsh sentence in your mind; you do not have to keep rereading it.', 'Acknowledge the situation by saying, “This was hard for me.”', 'Then add one support or repair step.'], reflection: 'What sentence would you like to say to yourself in your next hard moment?', question: 'What might a supportive inner voice sound like?', options: ['I made a mistake; I can figure out the part to fix.', 'If I made a mistake, I’m worthless.', 'I’m perfect in every situation.'], correct: 0,
      feedback: 'The first sentence protects both your responsibility and your humanity. Realistic support does not need exaggerated affirmations.', takeaway: 'Being fair to yourself can make it easier to try again.', sources: ['self-compassion', 'bandura-self-efficacy', 'self-forgiveness'],
      visual: { kind: 'steps', title: 'From a harsh inner voice to a supportive sentence',
        steps: [
          { label: 'Notice', text: 'See the harsh sentence; you do not have to keep rereading it.' },
          { label: 'Acknowledge', text: '“This was hard for me.”' },
          { label: 'Speak fairly', text: '“I made a mistake; I can figure out the part to fix.”' },
          { label: 'One step', text: 'Apologize, check the information or prepare a note.' },
        ],
        note: 'Being kind to yourself is not giving up responsibility; there is no need for exaggerated affirmations either.' },
      deeper: [
        { heading: 'What the research on self-compassion shows', paragraphs: [
          'Across 56 randomized trials, self-compassion interventions showed small-to-medium short-term reductions in stress, anxiety and depressive symptoms. That is a real but modest effect, and the studies had a high overall risk of bias, so it is fair to hold the finding lightly. It also fits a study on procrastination, in which students who forgave themselves more for putting off one exam procrastinated less before the next.',
          'A useful way to think of it is that harshness and kindness both aim at the same thing, doing better next time, but harshness adds fear on top, and fear tends to make the next attempt feel riskier. A fair, warm sentence leaves the lesson in place and takes the extra threat away.',
        ] },
        { heading: 'Why overblown affirmations can backfire', paragraphs: [
          'Bandura counted encouraging words among the sources of self-efficacy but saw them as weaker than your own experience. Telling yourself “I’m amazing at everything” right after a stumble clashes with what you just lived through, which can make it hard to believe.',
          'Realistic support works with the evidence rather than against it. It names what happened, recognizes the effort, and points to a next step. Compare the two columns below and notice which ones you could actually believe on a bad day.',
        ],
          visual: { kind: 'compare', title: 'Hype or realistic support?',
            left: { label: 'Hype', items: ['“I’m perfect and nothing went wrong.”', '“I’ll never make that mistake again.”', '“Everyone loved it.”'] },
            right: { label: 'Realistic support', items: ['“That was hard, and I still did it.”', '“I know which part to fix next time.”', '“One person seemed interested; that’s a start.”'] },
            note: 'Encouragement is most believable when it matches what actually happened.' } },
      ],
      example: { title: 'Fatima, 42, school administrator', text: 'Fatima sent a parent email with the wrong date for the school trip. When a parent replied pointing it out, her stomach dropped and the familiar voice started: “How could you be so careless? Everyone will think you can’t do your job.” She noticed the sentence and did not argue with it. She said quietly, “This was hard. I made a mistake with the date.” Then the fair part: “I can fix it within the hour.” She sent a short correction to all parents, thanked the one who had noticed, and added a date check to her email template. The embarrassment lingered for the afternoon. But she had spent her energy on the repair, not on the verdict.' },
      photo: { id: '1573497491208-6b1acb260507', alt: 'Two women sitting at a table talking' } },
    { id: 'confidence-5', title: 'Your own courage plan', minutes: 8,
      goal: 'Choose one experiment, one source of support and one review for the week ahead.',
      reading: ['Finishing this course does not mean your fears will end. You can now use naming the feeling, shrinking the step and gathering information from an experiment together. These three tools work best as a routine: name, shrink, try, record, and then choose the next step based on what you learned. Fear may still come along each time; the difference is that you now have a way of moving with it rather than waiting for it to leave.', 'Build rest and support into your plan. A day without an experiment does not erase all your progress. Changing a step that does not work for you is taking your own life seriously. A plan that fits your real week, with its tired evenings and busy days, will carry you further than an ideal plan you cannot keep. Decide in advance who you could talk to if a step turns out harder than expected.'],
      practice: ['Decide on one safe behavior you will try in the coming days, and when.', 'Set up a starting plan: “If I want to hold back and put it off, first I will …”.', 'Choose a two-minute review after your experiment and a source of support you can reach if needed.'], reflection: 'What step are you choosing to take, even if you are scared?', question: 'What if the plan does not work?', options: ['I should criticize myself more harshly.', 'I should review the step and the conditions, and ask for support if needed.', 'It shows that I can never change.'], correct: 1,
      feedback: 'Whether a plan works depends on conditions. Reviewing it is a normal part of the process.', takeaway: 'Even when you are scared, you can choose a step that fits you.', sources: ['mcii', 'monitoring', 'self-compassion', 'confidence-five-second-rule', 'confidence-fear-ladder'],
      visual: { kind: 'table', title: 'Courage plan template', columns: ['Part of the plan', 'Your answer'],
        rows: [
          ['Experiment', 'One safe behavior and when: …'],
          ['Starting plan', '“If I want to put it off, first I will ….”'],
          ['Review', 'Two minutes after the experiment: what happened?'],
          ['Support', 'Someone you can reach if needed: …'],
          ['Rest', 'When you will take a break: …'],
        ],
        note: 'A day without an experiment does not erase your progress. You can change a step that is not working.' },
      deeper: [
        { heading: 'The 5 second rule, honestly', paragraphs: [
          'Mel Robbins popularized a simple move for the moment of hesitation: count backward from five and, at one, physically move toward the action. Her idea is that there is a short window between an impulse and the flood of reasons not to act, and the countdown helps you use it. Many people find it a helpful nudge.',
          'It is worth being clear about the evidence: we could not find a controlled study of the 5 second rule itself, and the support for it comes mainly from personal stories. Its useful core looks a lot like an if–then plan with a built-in cue: “If I notice myself hesitating, then I count down and take the first small action.” Used that way, for a step you have already chosen and that is safe, it is a low-cost experiment.',
        ] },
        { heading: 'Keeping the ladder going', paragraphs: [
          'Confidence tends to grow unevenly. Some weeks you will climb a rung; some weeks you will stay put or step down because life got heavy. A short weekly review keeps you honest without turning it into a grade. Written records were linked to a larger benefit in the progress-monitoring research, so a few lines on paper are worth the two minutes.',
          'Use the review to pick the next rung, not to judge the last one. If a step felt like a 3 twice in a row, it may be time to move up. If it felt like an 8, add a smaller step below it. Either way, you are learning how your courage works.',
        ],
          visual: { kind: 'table', title: 'Two-minute weekly review', columns: ['Question', 'Example answer'],
            rows: [
              ['What did I try?', 'Asked one question in the small meeting.'],
              ['How scary was it, 0–10?', 'Before: 6. After: 3.'],
              ['What did a camera see?', 'I asked; my manager wrote it down.'],
              ['Next rung?', 'Same step once more, then a comment in the full meeting.'],
            ],
            note: 'Ratings are for choosing the next step, not for grading yourself.' } },
      ],
      example: { title: 'Rosa, 57, returning to work after years at home', text: 'Rosa wanted to introduce herself to the other volunteers at the library, but each week she would slip in, sort books and leave. Her plan: on Saturday, say hello and her name to one volunteer. Starting plan: “If I want to slip away, first I will count down from five and say ‘Hi, I’m Rosa.’” Support: her daughter, who would call on Saturday evening. On Saturday she caught herself heading for the back room. She counted, turned around and said it to the woman at the returns desk. The woman smiled, said her own name, and went back to work. That was all. In her two-minute review Rosa wrote: “Fear before: 7. After: 3. Next: ask someone how long they have volunteered.”' },
      technique: { name: 'The 5 second rule', origin: 'Mel Robbins · The 5 Second Rule (2017)',
        steps: [
          'Choose in advance one safe, small action you want to take, such as asking your question in the meeting.',
          'Notice the moment you start to hesitate: a pause, an excuse, a sudden urge to do something else.',
          'Count backward silently: 5, 4, 3, 2, 1.',
          'At “1,” make the first physical move toward the action: raise your hand, stand up, press call.',
          'Afterward, write one line about what you did, and choose whether to use the countdown again.',
        ],
        evidence: 'We found no controlled research on the 5 second rule itself; the support is mostly personal stories. Its working core, a clear cue linked to a small, pre-chosen action, resembles if–then planning, which has research support. Use it only for steps that are safe and that you have chosen, not to push through real danger or intense anxiety.',
        sourceId: 'confidence-five-second-rule' },
      photo: { id: '1748609422318-7301636fb625', alt: 'Hand writing a plan in a notebook with checkboxes' } },
  ],
};
