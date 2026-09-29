import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * English edition of "Odak" (focus). Lesson IDs, practice counts and answer
 * positions match the Turkish edition; translated sources keep their ids.
 * As in the Turkish notes: Fitz et al. 2019 (notification batching) and any
 * "multitasking costs X%" figure are deliberately not cited, and Ward 2017
 * appears only next to its failed replication and the meta-analysis.
 * Shared sources cited but defined elsewhere: 'mcii', 'monitoring'
 * (./confidence.ts); 'if-then-plans', 'procrastination-pomodoro',
 * 'procrastination-pomodoro-breaks' (./procrastination.ts).
 * New sources (Sep 2026) are prefixed 'focus-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'task-switching', title: 'Monsell · 2003 · The cost of switching tasks', url: 'https://pubmed.ncbi.nlm.nih.gov/12639695/', type: 'research', finding: 'According to this review, people slow down right after switching from one task to another and usually make more errors; this switch cost shrinks with preparation but does not disappear completely.', limitation: 'Only the published abstract was read, and it contains no numbers; the short delays seen in simple laboratory tasks cannot be translated directly into losses in real work.' },
  { id: 'interruptions', title: 'Mark, Gudith & Klocke · 2008 · The cost of interrupted work: speed and stress', url: 'https://ics.uci.edu/~gmark/chi08-mark.pdf', type: 'research', finding: 'In a laboratory experiment with 48 people, participants whose work was interrupted finished the task in slightly less time without losing quality, but reported higher stress, frustration, time pressure and effort.', limitation: 'A small sample, mostly university students, working on an artificial email-answering task; the results cannot be transferred directly to real working life.' },
  { id: 'notifications', title: 'Kushlev, Proulx & Dunn · 2016 · An experiment on notifications and inattention', url: 'https://interruptions.net/literature/Kushlev-CHI16.pdf', type: 'research', finding: '221 university students spent one week with notifications on and the phone within sight, and one week with notifications off and the phone out of reach; in the week with notifications they reported more inattention (d = 0.44) and hyperactivity (d = 0.45).', limitation: 'The measures rely on self-report, participants knew which condition they were in, and the raw differences were small, around 0.1 points; the authors stress that this does not mean notifications cause clinical ADHD.' },
  { id: 'phone-presence', title: 'Hartanto et al. · 2024 · Meta-analysis on the mere presence of a phone', url: 'https://assets.pubpub.org/mgkf17za/tmb_tmb0000123-41706626995650.pdf', type: 'research', finding: 'A meta-analysis pooling 33 studies and 4,368 participants found no overall effect of a phone merely being nearby on cognitive performance (d = −0.02), and the small effect seen on working memory disappeared after correcting for publication bias.', limitation: 'Based on laboratory tasks, and it examines only the phone being nearby, not using it or receiving notifications; the authors found signs of publication bias in the published studies.' },
  { id: 'brain-drain', title: 'Ward, Duke, Gneezy & Bos · 2017 · The “brain drain” experiment (not replicated)', url: 'https://www.journals.uchicago.edu/doi/full/10.1086/691462', type: 'research', finding: 'In two experiments (N = 520 and N = 275), people whose phone was on the desk scored slightly lower on a working memory task than people whose phone was in another room; the effects were small (partial η² = 0.014–0.026).', limitation: 'A preregistered direct replication found no effect, and a meta-analysis of 33 studies showed no overall effect; this finding should not be used as evidence on its own.' },
  { id: 'brain-drain-replication', title: 'Ruiz Pardo & Minda · 2022 · Replicating the “brain drain” study', url: 'https://www.sciencedirect.com/science/article/pii/S0001691822002323', type: 'research', finding: 'In a preregistered direct replication (N = 383) of the second experiment by Ward and colleagues, the phone’s location did not affect working memory performance (p = 0.91).', limitation: 'The sample consisted of young university students, and the study was run in a single laboratory.' },
  { id: 'microbreaks', title: 'Albulescu et al. · 2022 · Meta-analysis of micro-breaks', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460', type: 'research', finding: 'In a meta-analysis pooling 22 samples (N = 2,335), micro-breaks of up to 10 minutes increased vigor (d = 0.36) and reduced fatigue (d = 0.35), while the effect on overall performance was not significant (d = 0.16).', limitation: 'The number of studies is small, the well-being measures rely on self-report, there are signs of publication bias for performance, and no effect of breaks on performance was seen for mentally demanding tasks.' },
  { id: 'focus-attention-residue', title: 'Leroy · 2009 · Attention residue when switching between work tasks', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0749597809000399', type: 'research', finding: 'In two experiments, Sophie Leroy found that thoughts about a first task tended to persist after people moved on to a second one (“attention residue”), which hurt performance on the second task. Leaving the first task unfinished made this worse, finishing it was not always enough to let go, and finishing it under some time pressure helped people disengage.', limitation: 'Only the abstract was read; sample sizes and effect sizes were not checked. The experiments used laboratory tasks, and the helpful role of time pressure applied to closing the first task, not to working under pressure in general.' },
  { id: 'focus-ready-to-resume', title: 'Leroy & Glomb · 2018 · The “ready-to-resume plan” (University of Washington news release)', url: 'https://www.washington.edu/news/2018/01/16/task-interrupted-a-plan-for-returning-helps-you-move-on/', type: 'technique', finding: 'According to the university’s summary of a paper in Organization Science, four experiments (a study with 202 working professionals and laboratory studies with student participants) tested a “ready-to-resume plan”: on being interrupted, people spent about a minute writing down where they had stopped, what was still unresolved and what they would do next. The plan reduced attention residue and led to better decisions and better recall of information on the interrupting task.', limitation: 'A university news release, not the paper itself; no effect sizes were given. Whether the plan improves later performance on the original, interrupted task was not tested.' },
  { id: 'focus-newport-time-blocking', title: 'Cal Newport · 2013 · “Deep Habits: The Importance of Planning Every Minute of Your Work Day” (calnewport.com)', url: 'https://calnewport.com/deep-habits-the-importance-of-planning-every-minute-of-your-work-day/', type: 'technique', finding: 'Author and computer scientist Cal Newport describes time blocking: each evening he spends 10–20 minutes reviewing his task lists and calendar, then divides the next workday into labeled blocks on paper, leaving space beside them to redraw the plan when something unexpected happens and giving reactive work its own blocks. He says the method reduces his stress and greatly increases his output.', limitation: 'A personal blog post (first published 2013, updated 2023); his estimate of how much more productive it makes him is a personal impression, not a study. No controlled trial of time blocking was found.' },
];

export const COURSE: GuidedCourse = {
  id: 'focus', title: 'Focus', subtitle: 'Your attention is limited; take good care of it.',
  description: 'See what switching between tasks costs you, tidy up your notifications, check the claims about phones against the evidence, try short breaks and build your own focus plan.',
  scope: 'Suggestions for everyday working habits; this is not a diagnosis or treatment for attention disorders. If attention difficulties persist and affect your daily life, talk to a health professional. Do not silence calls you need for emergencies, caregiving or work.',
  outcome: 'Tidied-up notifications, a focus block you have actually tried and a plan for breaks.',
  photo: { id: '1505330622279-bf7d7fc918f4', alt: 'A bright, tidy work desk' },
  lessons: [
    { id: 'focus-1', title: 'Attention is limited, and switching has a price', minutes: 7,
      goal: 'Notice how often you switch between things during the day and how it feels.',
      reading: [
        'When you move from one task to another, your mind has to change gear. A review of laboratory studies found that people slow down right after a switch and usually make more mistakes. Getting ready for the switch shrinks this cost, but it does not make it disappear. In everyday life the switches are rarely dramatic: a glance at your inbox in the middle of a report, a reply to a message halfway through a thought, another tab opened “just for a second.” Each one is small. Together, they shape how your day feels.',
        'Being interrupted does not always slow you down. In a small experiment, people whose work was interrupted actually finished a little faster, without losing quality, but they reported more stress, frustration and time pressure. So the benefit of staying with one task may not be speed alone; it may also be working more calmly. You will not find popular figures here such as “multitasking costs you this much of your productivity,” because we could not find solid evidence behind them. What we can say is more modest: each switch carries a small load, and some switches are optional.',
      ],
      practice: ['For the next hour, make a tally mark every time you switch to another task or app.', 'Sort the switches: how many were your own choice, and how many came from a notification or another person?', 'Before your next switch, try a short preparation sentence: “Now I am moving on to …”'],
      reflection: 'How did the switches feel to you?', question: 'According to this lesson, what can working with interruptions cost you?', options: ['It always makes you finish much more slowly.', 'Interruptions have no cost at all.', 'Even if your speed holds up, you may feel more stress and pressure.'], correct: 2,
      feedback: 'In a small experiment, people who were interrupted sped up a little but reported more stress. Sometimes the cost shows up not in time, but in how you feel.', takeaway: 'Every switch is a small load; you can cut the ones you do not need.',
      sources: ['task-switching', 'interruptions', 'focus-attention-residue', 'focus-ready-to-resume'],
      visual: { kind: 'compare', title: 'Two ways of working',
        left: { label: 'Frequently interrupted', items: ['Changing gear again and again', 'A short slowdown and a risk of mistakes after each switch', 'More stress and time pressure'] },
        right: { label: 'Staying with one task', items: ['Fewer switches', 'Time to prepare for the switches you do make', 'A chance of a calmer pace'] },
        note: 'A general comparison drawn from laboratory findings; it does not give an exact figure for gains or losses.' },
      deeper: [
        { heading: 'Attention residue: part of you stays behind', paragraphs: [
          'Management researcher Sophie Leroy gave a name to a familiar feeling. In two experiments, she found that when people moved from one task to the next, part of their attention stayed with the first one. She called this attention residue: your thoughts keep circling the task you left, so the new task gets less of you than it seems, and performance on it suffers.',
          'Two details from her work are useful. The residue was stronger when the first task was left unfinished. And finishing was not always enough to let go; people disengaged more easily when they had wrapped up the first task under a little time pressure, which seemed to help them close it off. Only the abstract was read, so treat these as the headline findings rather than the full picture.',
        ],
          visual: { kind: 'cycle', title: 'The switching loop', center: 'An open task keeps calling',
            nodes: [
              { label: 'Switch', text: 'You move to something new before the last task is closed.' },
              { label: 'Residue', text: 'Part of your mind keeps working on the old task.' },
              { label: 'Slow start', text: 'The new task takes longer to get into and invites mistakes.' },
              { label: 'Pull back', text: 'You check the old task “just quickly”, and switch again.' },
            ],
            note: 'Our illustration, drawing on switch-cost research (Monsell) and attention residue (Leroy); it is not a measured model.' } },
        { heading: 'A one-minute note before you switch', paragraphs: [
          'In later work with Theresa Glomb, Leroy tested a simple fix. When an interruption arrived, people spent about a minute writing down where they had stopped, what was still open and what they would do first when they came back. According to the university’s summary, this “ready-to-resume plan” reduced attention residue and helped people make better decisions on the interrupting task, including in a study with working professionals.',
          'What was not tested is whether it also helped with the original task afterward, and our information comes from the university’s summary rather than the full paper. Still, it costs about a minute, and it is a fuller version of the preparation sentence in today’s practice: a short note that closes one door before you open the next.',
        ] },
      ],
      technique: { name: 'Ready-to-resume plan', origin: 'Sophie Leroy & Theresa Glomb · Organization Science (2018)',
        steps: [
          'When an interruption comes that cannot wait, pause for about a minute before switching.',
          'Write down where you stopped in the current task.',
          'Note what is still open or unresolved.',
          'Write the first thing you will do when you come back.',
          'Then turn fully to the new task.',
        ],
        evidence: 'In experiments summarized by the University of Washington, a plan of about one minute reduced attention residue and improved performance on the interrupting task. Whether it helps with the original task afterward was not tested, and only the news release was read.',
        sourceId: 'focus-ready-to-resume' },
      example: { title: 'Leila, 34, project manager', text: 'Leila kept a sticky note next to her keyboard for one hour on a Tuesday morning and made a tally mark at every switch. By ten o’clock she had nineteen marks. When she sorted them, twelve came from chat pings and colleagues stopping by; only seven were her own choice. She did not change anything else that day. But before each of her own switches she tried saying quietly, “Now I am moving on to the budget sheet.” Twice, when a colleague interrupted her, she scribbled one line first: “Stopped at row 40, check the travel costs next.” Coming back was noticeably easier. The day was not transformed, but she left work feeling a little less scattered than usual.' },
      photo: { id: '1745474633597-be94033b16d6', alt: 'A person working at a laptop, glancing at a phone' } },
    { id: 'focus-2', title: 'How notifications pull at your attention', minutes: 7,
      goal: 'Review your notifications and silence them for one work session.',
      reading: [
        'In one experiment, 221 university students spent one week with notifications on and their phone within sight, and another week with notifications off and the phone put away. In the week with notifications, they reported slightly more inattention and hyperactivity, such as feeling restless and finding it harder to stay with a task. The difference was small, but it was measurable. It is worth noticing how ordinary the change was: nobody gave up their phone. They only changed what it was allowed to do while they worked.',
        'This does not mean notifications cause an attention disorder, and the authors themselves stress that point. The honest message is this: silencing notifications will not solve everything on its own, but it is a low-cost step. You can leave exceptions for important people and emergencies, so you do not have to worry about missing something that matters. You can also try checking your messages at a few fixed times during the day instead of the moment they arrive. Treat it as an experiment rather than a rule, and see what changes for you.',
      ],
      practice: ['Look at which apps have sent you notifications in the last hour.', 'Turn off or silence notifications for at least two apps that can safely wait.', 'Turn on “Do Not Disturb” for one work session and add exceptions for people who may need you urgently.'],
      reflection: 'Which notification was easy to turn off, and which was hard?', question: 'Which is the most honest summary of this study’s result?', options: ['Cutting notifications made a small but measurable difference.', 'Notifications cause ADHD.', 'Turning notifications off solves all attention problems.'], correct: 0,
      feedback: 'The difference was about 0.1 points and was measured by self-report. You can think of silencing notifications as a low-cost trial, without expecting a miracle.', takeaway: 'Silencing notifications is a small step, and small steps count.',
      sources: ['notifications'],
      visual: { kind: 'bars', title: 'Average inattention (self-reported)', sourceId: 'notifications',
        bars: [
          { label: 'Notifications on, phone within sight', value: 2.38, display: '2.38' },
          { label: 'Notifications off, phone out of reach', value: 2.27, display: '2.27' },
        ],
        note: '221 students, one week in each condition. The difference is small (d = 0.44), based on self-report, and participants knew which week they were in.' },
      deeper: [
        { heading: 'Reading a small effect honestly', paragraphs: [
          'The effect size in this study, d = 0.44, is a standardized measure that compares the difference with how much scores varied. On the questionnaire itself, the gap between the two weeks was only about 0.1 points. Both things are true at once: the difference was real enough to measure, and small in everyday terms. Participants also knew which week they were in, so their expectations may have played a part.',
          'That is why this lesson presents silencing notifications as a cheap experiment rather than a cure. If a slight drop in restlessness is what you get for changing a few settings, that is still a fair trade. And if you notice no difference at all, you have learned something about yourself at almost no cost.',
        ] },
        { heading: 'Setting it up without missing what matters', paragraphs: [
          'The main worry people have about silencing their phone is missing something important. Most phones let you choose who can still reach you in “Do Not Disturb” mode, so you can build the exceptions first and silence the rest afterward. It can help to sort your notifications into a few groups, as in the table below, and decide once rather than every time a new app asks.',
        ],
          visual: { kind: 'table', title: 'Sorting your notifications for a focus block', columns: ['Kind of notification', 'Example', 'During a focus block'],
            rows: [
              ['People who may need you urgently', 'Family, caregiving, on-call work', 'Let through'],
              ['Time-bound work tools', 'Team chat on a deadline day', 'Check at set times'],
              ['Everything else', 'Social media, shopping, news', 'Silenced'],
            ],
            note: 'A suggestion, not a tested rule. Adjust it to your job and responsibilities, and never silence calls you need for emergencies or care.' } },
      ],
      example: { title: 'Daniel, 27, graduate student', text: 'Daniel checked his notification history and was surprised: in one hour, a shopping app, two news apps and a game had all buzzed. He turned all four off. Then, before sitting down with his thesis chapter at nine, he switched on Do Not Disturb for two hours and added two exceptions: his sister, who was expecting a baby, and his supervisor. In the first twenty minutes he reached for the phone three times out of habit and found nothing on the screen. At eleven he checked his messages; nothing had needed him. He is not sure he wrote more than usual, but he noticed he reread fewer paragraphs, and he plans to repeat the setup tomorrow.' },
      photo: { id: '1526045612212-70caf35c14df', alt: 'A person holding a smartphone' } },
    { id: 'focus-3', title: 'The phone on the desk: claim and evidence', minutes: 8,
      goal: 'Tell the difference between a phone simply being near you and actually using it.',
      reading: [
        'The claim that “your phone drains your mind even when it just sits on the desk” has been shared widely. The 2017 experiments that first proposed it found a small effect. But when researchers repeated one of those experiments in a preregistered direct replication, meaning the plan and analysis were fixed in advance, the effect did not appear. A meta-analysis, a study that pools the results of many others, combined 33 studies and also found no general effect of a phone simply being nearby on cognitive performance.',
        'This does not mean phones never affect attention. What was tested was a phone just being there; using it and getting notifications are separate questions. Putting your phone in another room may still help you. The likely reason is that it reduces the urge to pick it up, or at least makes acting on that urge harder. That is our inference, not a tested finding, which is exactly why this lesson asks you to test it on yourself rather than take anyone’s word for it.',
      ],
      practice: ['Notice where you usually keep your phone while you work and how many times you pick it up.', 'For one work session, put your phone somewhere you cannot reach, and note each time you feel the urge to pick it up.', 'On another day, try keeping the phone on the desk but silenced; compare the two days using your own observations.'],
      reflection: 'What is really hard for you: the phone being there, or the urge to pick it up?', question: 'What does current evidence say about a phone simply sitting on the desk?', options: ['It definitely drains your mind.', 'No general effect was found; using it and notifications are a separate question.', 'Putting your phone in another room is pointless.'], correct: 1,
      feedback: 'Looking at replications and a meta-analysis, rather than a single first study, gives a more reliable picture. In science, first findings do not always replicate. Keeping your phone out of reach may still work for you as a personal experiment.', takeaway: 'How often you reach for your phone may matter more than whether it is there.',
      sources: ['phone-presence', 'brain-drain', 'brain-drain-replication', 'notifications'],
      visual: { kind: 'table', title: 'Tracing the “phone on the desk” claim', columns: ['Study', 'Type', 'Result'],
        rows: [
          ['Ward et al. 2017', 'First experiments (N = 520 and 275)', 'Small effect'],
          ['Ruiz Pardo & Minda 2022', 'Preregistered direct replication (N = 383)', 'No effect'],
          ['Hartanto et al. 2024', 'Meta-analysis, 33 studies (N = 4,368)', 'No general effect (d = −0.02)'],
        ],
        note: 'Evidence that builds up over time, rather than any single study, gives a more reliable picture.' },
      deeper: [
        { heading: 'How a popular finding became shaky', paragraphs: [
          'The original experiments were careful and the effect they found was small. The idea spread because it was striking and easy to picture. When another team repeated the second experiment with more than 380 students and a plan registered in advance, the phone’s location made no difference to working memory.',
          'The meta-analysis added one more layer. Across 33 studies, there was no overall effect, and a small effect on working memory disappeared once the authors corrected for publication bias, the tendency for studies with positive results to get published more often. This is not a scandal. It is how science is meant to correct itself, and it is a good reason to hold single striking findings a little more loosely.',
        ],
          visual: { kind: 'steps', title: 'How one claim was tested over time',
            steps: [
              { label: 'First study', text: 'Two experiments find a small effect of a phone on the desk.' },
              { label: 'Wide attention', text: 'The idea spreads quickly because it is easy to picture.' },
              { label: 'Replication', text: 'A preregistered repeat of the experiment finds no effect.' },
              { label: 'Meta-analysis', text: '33 studies together show no general effect.' },
            ],
            note: 'Summary of the three studies in this lesson’s sources.' } },
        { heading: 'Presence versus reach', paragraphs: [
          'It helps to keep two questions apart. One is whether a silent phone lying nearby changes how well your mind works; the evidence now says, in general, no. The other is what happens when the phone is allowed to interrupt you or when you keep picking it up. The notification experiment in the previous lesson belongs to that second question, and there the effect was small but present.',
          'So if you work better with your phone in another room, you do not have to give that up. The benefit is probably about the reaching, not about the phone’s mere presence, and your own two-day comparison will tell you more than any headline.',
        ],
          visual: { kind: 'compare', title: 'Two different questions',
            left: { label: 'Phone just nearby', items: ['Tested in many laboratory studies', 'No general effect on performance', 'A small working memory effect vanished after bias correction'] },
            right: { label: 'Phone in use or alerts on', items: ['A separate question', 'Alerts on and phone visible: slightly more self-reported inattention', 'How often you reach for it may matter more'] },
            note: 'The right-hand side draws on the notification study from lesson 2; “reaching” is our inference.' } },
      ],
      example: { title: 'Marcus, 41, accountant', text: 'Marcus had read that a phone on the desk “drains your brain” and felt guilty every time he saw his. He decided to test it instead. On Monday he left the phone in his coat in the hallway during a two-hour block and made a mark on a notepad whenever he felt like getting it: six marks, mostly in the first half hour. On Wednesday he kept it face down and silenced on his desk. He picked it up nine times, and twice he only noticed after he was already scrolling. His conclusion was modest. The phone lying there did not seem to be the problem; how easy it was to grab was. He now keeps it in the hallway on heavy days and does not feel guilty on light ones.' },
      photo: { id: '1635398235411-2c41ca32ffbc', alt: 'A phone lying on a wooden table' } },
    { id: 'focus-4', title: 'Short breaks: what they promise and what they do not', minutes: 6,
      goal: 'Try a short break and observe how it works for you.',
      reading: [
        'A meta-analysis that pooled 22 samples found that breaks of up to 10 minutes increased people’s vigor, meaning a sense of energy and alertness, and reduced their fatigue. The effect on overall performance, however, was not statistically significant. In other words, a break can make you feel better; we cannot say it will necessarily make your work faster. That is still worth something. Feeling less drained in the middle of the afternoon is a real benefit, even if it never shows up on a productivity chart.',
        'For mentally demanding work, short breaks showed no effect on performance; tasks like that may need longer breaks. There is also no firm prescription for what to do during a break. Something that takes your mind away from the work is worth trying, such as getting up from the screen, looking out of a window or taking a short walk. Scrolling on your phone may feel like a rest, yet it keeps your attention on a screen, so it may be worth comparing it with a break that does not. Let your own notes decide.',
      ],
      practice: ['Put a five- to ten-minute break at the end of one work session.', 'For the break, choose something that takes you away from the screen: getting up for a glass of water, looking out of the window or a short walk.', 'Before and after the break, rate how tired you feel from 1 to 5 and write it down.'],
      reflection: 'What did your break change for you, and what did it not change?', question: 'Which statement about short breaks fits the evidence better?', options: ['They definitely improve performance in every kind of work.', 'Taking a break is just a waste of time.', 'Promising for vigor and fatigue; the effect on performance is unclear.'], correct: 2,
      feedback: 'The evidence is more consistent for feeling better than for performance. You can think of a break not as a tool for speeding up your work, but as part of looking after yourself.', takeaway: 'A short break can leave you feeling more energetic; try it without expecting a miracle.',
      sources: ['microbreaks', 'procrastination-pomodoro-breaks'],
      visual: { kind: 'bars', title: 'Average effect of micro-breaks', sourceId: 'microbreaks',
        bars: [
          { label: 'Increase in vigor', value: 0.36, display: 'd = 0.36' },
          { label: 'Reduction in fatigue', value: 0.35, display: 'd = 0.35' },
          { label: 'Overall performance (not significant)', value: 0.16, display: 'd = 0.16' },
        ],
        note: 'd shows the size of an effect; 0.36 is a small-to-medium effect. The effect on performance was not statistically significant, and the number of studies is small.' },
      deeper: [
        { heading: 'Fixed breaks or breaks when you feel like it?', paragraphs: [
          'A small Dutch study compared three ways of taking breaks during a study session. Students who chose their own breaks worked and rested in longer stretches, but reported more fatigue and distraction and less concentration and motivation than students on a fixed schedule. How much they got done did not differ meaningfully.',
          'This fits the meta-analysis above: breaks seem to change how you feel more clearly than how much you produce. It also suggests a practical point. Waiting until you feel you need a break may mean you take it later than would be good for you, so a gentle, planned break is worth trying.',
        ],
          visual: { kind: 'table', title: 'Three break schedules in one study', columns: ['Schedule', 'How it worked', 'What students reported'],
            rows: [
              ['Self-chosen', 'Breaks whenever they wanted', 'More fatigue and distraction, less concentration and motivation'],
              ['Fixed, Pomodoro-style', '6-minute break after every 24 minutes', 'Better mood; similar amount of work done'],
              ['Fixed, shorter', '3-minute break after every 12 minutes', 'Better mood; similar amount of work done'],
            ],
            note: 'Biwer et al. 2023: 87 university students in a single session; only the abstract was read. It supports trying a schedule, not a particular number of minutes.' } },
        { heading: 'Judge a break by how you feel', paragraphs: [
          'Because the evidence for performance is weak, the fairest test of a break is the one in today’s practice: how tired you feel before and after. If your rating drops from 4 to 2, the break did its job, even if your to-do list looks the same.',
          'If you do very demanding work, such as writing, coding or studying hard material, a few minutes may not be enough to recover, and a longer pause or a change of task may serve you better. Try different lengths over a week and keep the ones that help.',
        ] },
      ],
      example: { title: 'Grace, 45, customer support team lead', text: 'Grace usually worked through the afternoon and felt flat by four o’clock. On Thursday she set a timer to end her 2 p.m. session with a seven-minute break. Before it, she rated her tiredness 4 out of 5. She left her headset on the desk, walked to the end of the corridor and back, and refilled her water bottle. Afterward she rated herself 2. She could not tell whether she answered tickets any faster, and she did not pretend otherwise. What she noticed was that the last hour of the day felt less like a slog. She has kept the afternoon walk and is now trying a second one at eleven.' },
      photo: { id: '1556833232-52da3e4bd5d8', alt: 'A woman walking along a path' } },
    { id: 'focus-5', title: 'Your own focus plan', minutes: 8,
      goal: 'Combine your decisions about notifications, your phone, a work block and a break into one personal experiment.',
      reading: [
        'Time blocking, which means setting aside a specific stretch of time for a single task, is a method many people use. We have not reviewed a solid study that tests it directly, so we will not call it proven. Still, given what the earlier lessons showed about the cost of switching and the stress of interruptions, it is a reasonable personal experiment. A block gives your attention one job, a start and an end, and it brings the notification and phone decisions you have already made together into one concrete plan.',
        'Add to your plan what you will do when your attention drifts: “If I want to pick up my phone, then I will finish my sentence first.” Plans written in this if–then form have helped people follow through on their intentions in many studies. When the block ends, take a short break and look at how it went. If the block turned out shorter than you hoped, or you did not manage it at all, that is not a failure. It is information for adjusting your plan, and adjusting is part of the method.',
      ],
      practice: ['Choose one task for tomorrow and a block length that suits you; starting short is fine.', 'Complete the sentence “If my attention drifts, then I will …” and set up your notifications before the block starts.', 'After the block and the break, briefly note what worked and what you would change.'],
      reflection: 'Which part of your focus plan supports you the most?', question: 'What is the most honest way to approach time blocking?', options: ['It is the best method for everyone, and it is proven.', 'A reasonable personal experiment; you look at the result and adjust.', 'If a block falls apart, the whole day is wasted.'], correct: 1,
      feedback: 'Time blocking is a sensible thing to try, but it is not a proven technique. Watching how it works for you and adjusting it is part of the plan. If your attention difficulties persist, you can talk to a health professional.', takeaway: 'Your focus plan is an experiment: try it, look, adjust.',
      sources: ['interruptions', 'mcii', 'monitoring', 'if-then-plans', 'focus-newport-time-blocking', 'procrastination-pomodoro', 'procrastination-pomodoro-breaks'],
      visual: { kind: 'steps', title: 'One focus block',
        steps: [
          { label: 'Choose', text: 'Pick one task and a length of time that suits you.' },
          { label: 'Prepare', text: 'Silence notifications and leave exceptions for urgent contacts.' },
          { label: 'Work', text: 'If you drift, jot down what came to mind and return to the task.' },
          { label: 'Break', text: 'Get up from the screen and step away for a few minutes.' },
          { label: 'Review', text: 'Note what worked and adjust the plan.' },
        ],
        note: 'This sequence is not a proven technique; it is a suggestion to try on yourself.' },
      deeper: [
        { heading: 'How Cal Newport plans his day', paragraphs: [
          'Computer scientist and author Cal Newport, who writes about focused, undistracted work, has described time blocking on his blog. Each evening he spends ten to twenty minutes looking over his tasks and calendar, then divides the next day’s working hours into blocks on paper, each labeled with what he will do.',
          'Two details make the method more forgiving than it sounds. He leaves space next to the blocks so he can redraw the rest of the day when something unexpected happens, and he gives reactive work such as email its own blocks instead of pretending it will not come. He says the approach lowers his stress and raises his output a great deal; that is his own impression, not a measured result.',
        ] },
        { heading: 'Pomodoro: a block in miniature', paragraphs: [
          'Francesco Cirillo’s Pomodoro Technique is a smaller cousin of time blocking. It is usually taught as 25 minutes of focused work followed by a short break, repeated. Cirillo himself stresses that the point is not to collect as many rounds as possible, but to notice what your mind does while you work.',
          'The Dutch break study from the previous lesson gives it modest support: students on fixed breaks felt better than those who chose their own, without getting less done. If a whole morning block feels too big, one 25-minute round can be your first experiment.',
        ] },
        { heading: 'The plan–try–adjust loop', paragraphs: [
          'A focus plan works best as a loop rather than a one-time decision. Research on progress monitoring found that people who kept track of how they were doing were more likely to reach their goals, especially when they wrote it down. That is why the review step matters: a two-line note after each block turns a bad day into useful information.',
        ],
          visual: { kind: 'cycle', title: 'The plan–try–adjust loop', center: 'Each round teaches you something',
            nodes: [
              { label: 'Plan', text: 'One task, a length of time and an if–then sentence.' },
              { label: 'Protect', text: 'Notifications silenced, phone out of easy reach.' },
              { label: 'Work', text: 'Stay with the task; note stray thoughts and return.' },
              { label: 'Rest', text: 'A short break away from the screen.' },
              { label: 'Review', text: 'Write what worked and change one thing for next time.' },
            ],
            note: 'A suggested routine, not a tested technique. The review step draws on research linking progress monitoring to reaching goals.' } },
      ],
      technique: { name: 'Time blocking', origin: 'Cal Newport · “Deep Habits: The Importance of Planning Every Minute of Your Work Day”, calnewport.com (2013)',
        steps: [
          'The evening before, spend 10–20 minutes looking over your tasks, calendar and notes.',
          'Divide the next day’s working hours into blocks and label each with one task.',
          'Leave space beside the blocks for changes.',
          'Give reactive work, such as email or messages, its own blocks.',
          'When the day goes off plan, redraw the remaining blocks instead of giving up.',
        ],
        evidence: 'Newport describes the method from his own experience and says it greatly increases his output, but he offers no study for that claim, and no controlled trial of time blocking was found. The related evidence is on the cost of switching, the stress of interruptions and the benefit of if–then plans.',
        sourceId: 'focus-newport-time-blocking' },
      example: { title: 'Priya, 38, freelance translator', text: 'Priya planned a 45-minute block for 9 a.m. to translate a contract, the task she kept pushing to the afternoon. The night before, she wrote it on a paper plan and added one sentence: “If I want to check email, I will write the thought on the pad and keep going.” In the morning she set Do Not Disturb, with her daughter’s school as the only exception. She drifted twice and wrote “invoice” and “call the bank” on the pad. After 30 minutes a client called with something urgent, and the block ended early. She did not call it a failure. Her note read: “30 minutes, 4 pages. Start at 8:30 next time, before clients are awake.”' },
      photo: { id: '1632772998001-cc9bf6f7c852', alt: 'A planner with two pens lying on it' } },
  ],
};
