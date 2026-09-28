import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * English edition of "Erteleme" (procrastination). Lesson IDs, practice counts
 * and answer positions match the Turkish edition; translated sources keep
 * their ids. Ariely & Wertenbroch (2002) on self-imposed deadlines was
 * retracted on 2 Sep 2026 and is deliberately not cited. The shared base
 * sources 'mcii', 'self-compassion' and 'monitoring' are translated in
 * ./confidence.ts. New sources (Sep 2026) are prefixed 'procrastination-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'procrastination-interventions', title: 'van Eerde & Klingsieck · 2018 · Meta-analysis of procrastination interventions', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1747938X18300472', type: 'research', finding: 'A meta-analysis pooling 24 studies (N = 1,173) found a large reduction in procrastination after interventions (average pre–post effect −1.07); the reduction held at follow-up measurements, and the strongest results came from cognitive behavioral therapy.', limitation: 'Because the value was calculated from before–after differences rather than against a control group, the effect may look larger than it is; only the abstract was read, and this ODA course has not been tested.' },
  { id: 'task-aversiveness', title: 'Steel · 2007 · Meta-analysis of the causes of procrastination', url: 'https://studypedia.au.dk/fileadmin/www.studiemetro.au.dk/Procrastination_2.pdf', type: 'research', finding: 'In a meta-analysis based on 691 correlations, procrastination was related to finding a task aversive (r = 0.40), low self-control (r = −0.58), low self-efficacy (r = −0.38) and impulsiveness (r = 0.41), but hardly at all to the intention to work (r = 0.03). Steel estimates that procrastination chronically affects some 15–20% of adults and that 80–95% of college students procrastinate to some degree. He proposes temporal motivation theory: the pull of a task grows with how likely success feels (expectancy) and how rewarding it is (value), and shrinks the further away the reward is (delay) and the more sensitive a person is to delay.', limitation: 'The findings are correlational and do not show cause and effect; in the PDF that was read, the minus signs were lost, so the direction of the relationships was inferred from the wording of the text. Temporal motivation theory is a model that fits these findings, not a tested treatment.' },
  { id: 'mood-repair', title: 'Sirois & Pychyl · 2013 · Procrastination and mood repair', url: 'https://eprints.whiterose.ac.uk/91793/1/Compass%20Paper%20revision%20FINAL.pdf', type: 'research', finding: 'This theoretical review explains procrastination as an attempt to ease, in the moment, the bad feeling an aversive task creates, and argues that the cost is passed on to the future self; a small analysis it reports found procrastination linked to low self-compassion (r = −0.31).', limitation: 'A narrative review with no new data, and the r = −0.31 value comes from a study not yet published at the time; the accepted author version was read.' },
  { id: 'self-forgiveness', title: 'Wohl, Pychyl & Bennett · 2010 · Self-forgiveness and procrastination', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0191886910000474', type: 'research', finding: 'Among 119 first-year students followed across two midterm exams, those who forgave themselves more for procrastinating on the first exam procrastinated less when preparing for the second, and a reduction in negative feelings explained this link.', limitation: 'The study is correlational, not experimental; it was run in a single course and student group, and of the 312 people at the first measurement only 119 remained in the analysis.' },
  { id: 'mcii-procrastination', title: 'Zhou et al. · 2026 · An experiment on WOOP (MCII) and procrastination', url: 'https://www.sciencedirect.com/science/article/pii/S0001691825014829', type: 'research', finding: 'In a randomized study with 81 university students, the group that used WOOP (Wish, Outcome, Obstacle, Plan) found their tasks less aversive and started their task on 58.8% of days; in the control group, which only thought positively, the figure was 47.3%.', limitation: 'A small study run at a single university, with one week of follow-up and no preregistration (dropout rate 19.8%); this ODA course has not been tested.' },
  { id: 'if-then-plans', title: 'Gollwitzer & Sheeran · 2006 · Meta-analysis of if–then plans', url: 'https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021', type: 'research', finding: 'Across 94 independent tests, “If … happens, then I will …” plans that answer in advance when, where and how to act showed a medium-to-large positive effect on reaching goals (d = 0.65).', limitation: 'Only the abstract was read; newer analyses that correct for publication bias were not checked, so the true effect may be smaller, and the work is not specific to procrastination.' },
  { id: 'procrastination-pychyl-start', title: 'Timothy A. Pychyl · 2008 · “Just get started” (Psychology Today, Don’t Delay blog)', url: 'https://www.psychologytoday.com/us/blog/dont-delay/200803/just-get-started', type: 'guidance', finding: 'Procrastination researcher Tim Pychyl describes experience-sampling data from his lab: tasks that people rated as very stressful and unpleasant while avoiding them felt much less aversive once they actually started, and people who made even a partial start felt more in control and more optimistic the next day. He also notes that the belief “I’ll feel more like it tomorrow” rarely comes true.', limitation: 'A blog post summarizing the author’s own research for a general audience, not a peer-reviewed paper; Pychyl himself presents starting as a first step, not a complete solution.' },
  { id: 'procrastination-pomodoro', title: 'Francesco Cirillo · The Pomodoro Technique (official site)', url: 'https://www.pomodorotechnique.com/francesco-cirillo/', type: 'technique', finding: 'Cirillo created the technique in the 1980s while struggling to focus on his university studies, using a tomato-shaped kitchen timer (“pomodoro” is Italian for tomato); his first experiment was to see whether he could study for just two minutes without interruption. The technique is widely taught as 25-minute focused blocks separated by short breaks. Cirillo stresses that the aim is not to collect pomodoros but to become aware of what happens in your mind while you work.', limitation: 'The creator’s own site, not an independent evaluation; the technique itself has not been tested as a whole in controlled trials. The exact block and break lengths are conventions, not research findings.' },
  { id: 'procrastination-pomodoro-breaks', title: 'Biwer et al. · 2023 · “Pomodoro” breaks versus self-regulated breaks', url: 'https://cris.maastrichtuniversity.nl/en/publications/understanding-effort-regulation-comparing-pomodoro-breaks-and-sel/', type: 'research', finding: '87 Dutch university students studied with either self-chosen breaks (n = 35), 6-minute breaks after every 24 minutes (“Pomodoro”, n = 25) or 3-minute breaks after every 12 minutes (n = 27). Students taking self-chosen breaks studied and rested in longer stretches but reported more fatigue and distraction and less concentration and motivation. Task completion and mental effort did not differ meaningfully; the authors conclude that fixed breaks had mood benefits and seemed more efficient.', limitation: 'Abstract only. One small study of self-study in a single session with university students; it tested break schedules, not procrastination directly, and the groups were small.' },
];

export const COURSE: GuidedCourse = {
  id: 'procrastination', title: 'Procrastination', subtitle: 'Not laziness, a feeling.',
  description: 'Notice the feeling behind putting things off, shrink the task, attach a plan to your real obstacle, and come back after procrastinating without beating yourself up.',
  scope: 'Skills training for everyday procrastination; it is not therapy. If procrastination comes with intense anxiety, long-lasting low mood or attention difficulties and clearly affects your life, you can get support from a professional.',
  outcome: 'A shrunken task, an if–then plan and a sentence for coming back after you have procrastinated.',
  photo: { id: '1758598304525-c2bc7aada66d', alt: 'Woman working on a laptop at a desk surrounded by plants' },
  lessons: [
    { id: 'procrastination-1', title: 'The feeling behind putting things off', minutes: 7,
      goal: 'Name the feeling that a task you have been putting off brings up in you.',
      reading: ['Putting things off is usually not laziness. In a large review of the research, people who procrastinated did not intend to work any less than others; where they struggled was turning the intention into action. According to the same review, 80–95% of university students procrastinate to some degree, and for an estimated 15–20% of adults it is a chronic problem. You are not the only one living with this, and it says little about your character.', 'The more boring, unclear or worrying a task feels, the more we tend to put it off. One explanation, developed by researchers Fuschia Sirois and Tim Pychyl, is that when we procrastinate, what we are escaping is not the task itself but the feeling it brings up in us: we feel relief in the moment, and our later self pays the price. Today we will try to notice that feeling without judging it. Naming it is the first step toward handling it differently.'],
      practice: ['Choose one task you have been putting off for a while.', 'When you think of the task, name what you feel in a word or two: dread, worry, uncertainty or something else.', 'Consider which part of the task brings up this feeling; do not try to solve it, just note it.'],
      reflection: 'What is the feeling that really makes this task hard for you?', question: 'According to this lesson, which explains procrastination better?', options: ['People who procrastinate do not actually want to work.', 'Moving away, in the moment, from an unpleasant feeling the task brings up.', 'Procrastination is a character trait that never changes.'], correct: 1,
      feedback: 'Finding a task aversive was linked to procrastination, while a lack of intention was hardly linked at all. These are not proof of cause and effect, but they can soften the way you see yourself.', takeaway: 'What you put off is often a feeling, not proof that you are lazy.', sources: ['task-aversiveness', 'mood-repair', 'procrastination-pychyl-start'],
      visual: { kind: 'bars', title: 'How strongly each factor relates to procrastination', sourceId: 'task-aversiveness',
        bars: [
          { label: 'Self-control (inverse)', value: 0.58, display: 'r = −0.58' },
          { label: 'Finding the task aversive', value: 0.40, display: 'r = 0.40' },
          { label: 'Self-efficacy (inverse)', value: 0.38, display: 'r = −0.38' },
          { label: 'Intention to work', value: 0.03, display: 'r = 0.03' },
        ],
        note: 'The bars show the strength of each relationship with procrastination; a minus sign means procrastination rises as self-control or self-efficacy falls. These are correlations and do not show cause and effect.' },
      deeper: [
        { heading: 'Tim Pychyl’s view: a problem of feelings, not of time', paragraphs: [
          'Psychologist Tim Pychyl, a long-time procrastination researcher, describes it as a way of regulating emotions that backfires. A task makes us feel anxious, bored, frustrated or unsure. Putting it off brings quick relief, so avoiding starts to feel like a solution. But the task does not go away; it comes back later, often bigger, with extra stress and self-blame attached.',
          'In a review with Fuschia Sirois, Pychyl describes this as a trade between two versions of you: the present self gets the relief, the future self gets the bill. Seen this way, a to-do app or a stricter schedule will only help so much. What helps more is learning to notice the feeling, tolerate it for a little while, and take one small action anyway.',
        ],
          visual: { kind: 'cycle', title: 'The procrastination loop', center: 'Short-term relief, long-term cost',
            nodes: [
              { label: 'Task', text: 'A task that feels unclear, boring or threatening.' },
              { label: 'Feeling', text: 'Dread, worry or frustration rises.' },
              { label: 'Avoidance', text: 'You switch to something easier.' },
              { label: 'Relief', text: 'The bad feeling eases for now.' },
              { label: 'Return', text: 'The task comes back, now with extra pressure and self-blame.' },
            ],
            note: 'A description of the mood-repair view (Sirois and Pychyl), not a measured model. Breaking the loop usually starts with noticing the feeling.' } },
        { heading: 'What the numbers say, and what they do not', paragraphs: [
          'In Piers Steel’s large review, procrastination was strongly linked to finding a task aversive and to impulsiveness, and hardly linked at all to how much people intended to work. Steel estimates that procrastination is a chronic problem for about 15–20% of adults. These are correlations: they do not prove that aversive tasks cause procrastination, but they point to where it is worth looking.',
          'The encouraging part is what the numbers leave out. Wanting to work is not the missing piece, so you do not need to “want it more.” The feeling around the task, the size of the first step and the plan for the hard moment can all be changed, and the next lessons work on exactly those.',
        ] },
      ],
      example: { title: 'Sofia, 31, marketing coordinator', text: 'Sofia had been avoiding her expense report for three weeks. She usually told herself she was “just bad at admin.” During a coffee break she tried the exercise instead: she opened the email with the report template and paused to notice what happened. The word that came was “dread,” and underneath it, “embarrassment.” The part that triggered it was not the spreadsheet; it was the crumpled receipts in her bag, some of them probably lost. She wrote on a sticky note: “Dread + embarrassment, about missing receipts.” She did not start the report that day. But “bad at admin” had turned into a specific feeling about a specific part, and that felt like something she could work with.' },
      photo: { id: '1552360708-ebcdf76845ac', alt: 'Woman sitting by a window, deep in thought' } },
    { id: 'procrastination-2', title: 'Shrink the task, find the first move', minutes: 6,
      goal: 'Turn the task you are putting off into a first move so small and concrete that it does not feel heavy.',
      reading: ['“Prepare the presentation” or “clean the house” does not tell you where to start. Uncertainty can make a task feel heavier than it is, because your mind tries to hold the whole thing at once without knowing which part comes first. “Open the document and write three headings,” on the other hand, is a beginning you can see. Being small does not make it unimportant. A first move concrete enough to picture is often the difference between thinking about a task and doing it.', 'The feeling “I can do this,” which psychologists call self-efficacy, was found to be inversely related to procrastination: the lower it was, the more people tended to put things off. We think small, achievable first steps may feed that feeling; this is an inference, not a direct finding. After you make the first move, you do not have to continue; stopping is also an option. The aim today is simply to discover that the task has a doorway, and to walk through it once.'],
      practice: ['Write or say the task you chose in the previous lesson in one sentence.', 'Break the task into three small parts; start the first with a clear verb such as open, write, call or choose.', 'If the first part still feels heavy, shrink it to a two-minute version and try it now.'],
      reflection: 'What was the smallest first move for your task?', question: 'Which is a concrete first move?', options: ['Being more disciplined this week.', 'Getting the project done as soon as possible.', 'Opening the report file and writing the first heading.'], correct: 2,
      feedback: 'A concrete verb and object show you where to begin. You do not need to solve the big task in one go.', takeaway: 'To start, you do not need to see the whole task, only its first move.', sources: ['task-aversiveness', 'procrastination-pychyl-start', 'procrastination-pomodoro', 'procrastination-pomodoro-breaks'],
      visual: { kind: 'steps', title: 'From big task to first move',
        steps: [
          { label: 'Big task', text: 'Prepare the presentation.' },
          { label: 'Parts', text: 'Choose a topic, find sources, write the slides.' },
          { label: 'First part', text: 'Choose the topic of the presentation.' },
          { label: 'First move', text: 'Open a blank document and write three possible topics.' },
        ],
        note: 'If the first move still feels heavy, shrink it by one more step.' },
      deeper: [
        { heading: 'Why starting changes the feeling', paragraphs: [
          'Tim Pychyl describes a pattern from his lab’s research: tasks that people rated as very stressful and unpleasant while they were avoiding them felt much less unpleasant once they had actually started. People who made even a partial start also felt more in control and more hopeful the next day. The dread lives mostly in the waiting.',
          'He also points to a common trap: “I’ll feel more like doing it tomorrow.” Tomorrow’s mood rarely turns out to be better. A tiny first move does not wait for the right mood; it changes the mood by giving you a different experience of the task.',
        ] },
        { heading: 'Working in short, timed blocks', paragraphs: [
          'Francesco Cirillo developed the Pomodoro Technique in the 1980s, as a student who could not concentrate. His very first experiment was modest: could he study for just two minutes without interruption? The technique grew from there into timed blocks of focused work, usually taught as 25 minutes, separated by short breaks.',
          'One small study compared break schedules in 87 university students. Students who took fixed breaks (6 minutes after every 24, or 3 after every 12) reported less fatigue and distraction and more concentration and motivation than students who chose their own breaks, and they got through a similar amount of work. It was a single session with a small sample, so treat it as a hint, not a rule. The block length that suits you may be much shorter to begin with.',
        ],
          visual: { kind: 'table', title: 'Three ways to take breaks (Biwer et al. 2023)', columns: ['Break schedule', 'Students', 'What they reported'],
            rows: [
              ['Self-chosen breaks', '35', 'Longer stretches; more fatigue and distraction, less concentration and motivation'],
              ['6 min after every 24 min', '25', 'Better mood measures; similar task completion'],
              ['3 min after every 12 min', '27', 'Better mood measures; similar task completion'],
            ],
            note: 'One small study of a single self-study session. It tested break schedules, not procrastination directly.' } },
      ],
      example: { title: 'Kevin, 45, freelance translator', text: 'Kevin had a 20-page contract to translate and had spent two mornings “getting ready” by answering email. On the third morning he wrote the task as “translate the contract,” then broke it into parts: read it through, build a glossary, translate section one. Even “read it through” felt heavy, so he shrank it: open the file and read the first page. He set a kitchen timer for ten minutes, because 25 felt like too much. When it rang he had read three pages and noted four tricky terms. He took a five-minute break, made tea, and set the timer again. The contract was still long, but it was no longer a wall; it was a pile of pages, and he had moved some of them.' },
      technique: { name: 'The Pomodoro Technique', origin: 'Francesco Cirillo · The Pomodoro Technique (developed in the 1980s)',
        steps: [
          'Pick one task, or the first move of a bigger task, and write it down.',
          'Set a timer for one focused block; 25 minutes is the classic length, but start with 10 or even 2 if that feels safer.',
          'Work only on that task until the timer rings; if another thought pops up, jot it on paper and return.',
          'When the timer rings, take a short break of about five minutes away from the screen.',
          'After a few blocks, take a longer break, and notice what pulled your attention away so you can plan for it next time.',
        ],
        evidence: 'The Pomodoro Technique as a whole has not been tested in controlled trials. One small study found that fixed, Pomodoro-style breaks went with better mood and similar output compared with self-chosen breaks, but it did not measure procrastination. Treat the timings as a starting point to adjust, not as a rule.',
        sourceId: 'procrastination-pomodoro' },
      photo: { id: '1448387473223-5c37445527e7', alt: 'A foot stepping onto the first stair' } },
    { id: 'procrastination-3', title: 'Attach a plan to your real obstacle', minutes: 8,
      goal: 'Apply wish, obstacle and an if–then plan to the task you are putting off.',
      reading: ['Only picturing a happy outcome may not be enough to get you started; it can even feel so pleasant that the urge to act fades. In a method called WOOP, developed by psychologist Gabriele Oettingen, you first think about what you want and what it would bring you, then look at the real obstacle that stops you from the inside. In the last step you attach a response to the obstacle: “If … happens, then I will ….” The plan links a moment you can recognize to a small action.', 'In a small experiment with 81 students, those who used WOOP found their tasks less aversive and got started on a larger share of days than students who only thought positively. This was a one-week study at a single university, not a final answer. A larger body of research on if–then plans in general points in the same direction, with medium-to-large average effects that may shrink once publication bias is taken into account. Still, the method is easy to try and costs little: a few minutes and one sentence.'],
      practice: ['Wish and outcome: think about what you want this week regarding the task you are putting off, and what it would give you if it happened.', 'Obstacle: name the inner obstacle that stops you most, for example “picking up my phone” or “feeling not good enough.”', 'Plan: complete the sentence “If [obstacle] happens, then I will [small action]” and rehearse it once in your mind.'],
      reflection: 'What is your if–then sentence?', question: 'What sets WOOP apart from just thinking positively?', options: ['Seeing the real obstacle and attaching a concrete response to it.', 'Picturing success as vividly as possible.', 'Trying never to think about obstacles.'], correct: 0,
      feedback: 'In this approach, the obstacle is not ignored; it is turned into a plan. Effects in research are averages and can vary from person to person.', takeaway: 'See your obstacle and prepare a small response to it.', sources: ['mcii-procrastination', 'if-then-plans', 'mcii', 'task-aversiveness', 'oettingen-woop-method'],
      visual: { kind: 'bars', title: 'Share of days on which people started their task', sourceId: 'mcii-procrastination',
        bars: [
          { label: 'WOOP (wish, outcome, obstacle, plan)', value: 58.8, display: '58.8%' },
          { label: 'Positive thinking only', value: 47.3, display: '47.3%' },
        ],
        note: '81 university students, one week of follow-up. A single small study; it does not guarantee the same result for you.' },
      deeper: [
        { heading: 'Piers Steel’s temporal motivation theory', paragraphs: [
          'Piers Steel pulls the procrastination research together into one idea, temporal motivation theory. A task pulls you more when you expect to succeed at it (expectancy) and when it matters or rewards you (value). It pulls you less when the reward is far away (delay) and when you are more easily swayed by what is close at hand (impulsiveness). A report due in three weeks competes badly with a video that rewards you right now.',
          'The useful part is that each piece suggests a lever. You can raise expectancy by shrinking the task, raise value by linking it to what you care about, shorten the delay with nearer checkpoints and small rewards, and reduce impulsiveness by putting distractions out of reach. WOOP and if–then plans work mainly on the last one: they decide in advance what you will do when the pull comes.',
        ],
          visual: { kind: 'table', title: 'Four levers from temporal motivation theory', columns: ['Factor', 'What it means', 'One thing to try'],
            rows: [
              ['Expectancy', 'How sure you feel you can do it', 'Shrink the task until success feels likely'],
              ['Value', 'How much it matters or rewards you', 'Write one line on why it matters to you'],
              ['Delay', 'How far away the payoff is', 'Set a nearer checkpoint with a small reward'],
              ['Impulsiveness', 'How strongly nearby temptations pull', 'Make an if–then plan and move the distraction away'],
            ],
            note: 'Based on Steel’s model, which fits correlational findings; it is a way of thinking, not a tested treatment.' } },
        { heading: 'Common mistakes with if–then plans', paragraphs: [
          'The “if” is often too vague. “If I don’t feel like it” is true almost all the time, so it cannot act as a clear cue. “If I pick up my phone after sitting down at my desk” is a moment you will recognize when it happens.',
          'The “then” is often too big. “Then I’ll work for two hours” asks for the very effort the obstacle is blocking. “Then I’ll write one sentence first” is small enough to happen even when the feeling is strong. One plan for your most common obstacle is better than five plans you will not remember.',
        ] },
      ],
      example: { title: 'Grace, 26, graduate student', text: 'Grace wanted to finish the literature review for her thesis this week; if she did, she could stop feeling guilty every weekend. When she looked for the obstacle, it was not time. It was the moment after opening the document, when she felt she did not know enough, and reached for her phone. Her plan: “If I reach for my phone after opening the document, then I’ll put it in the drawer and write one sentence about the first paper.” She rehearsed it once on the bus. On Tuesday she caught herself with the phone already in her hand, laughed a little, and put it in the drawer. The sentence she wrote was clumsy. She wrote a second one anyway.' },
      photo: { id: '1553044020-8c90843adf96', alt: 'Yellow sticky notes and a pen' } },
    { id: 'procrastination-4', title: 'After procrastinating: forgive yourself', minutes: 7,
      goal: 'After putting something off, form a sentence that is both forgiving and responsible instead of attacking yourself.',
      reading: ['After procrastinating, it is easy to tell yourself, “You did it again; you’ll never change.” That harsh voice may feel like it is keeping you in line, but it may not make the next start any easier. It can make the task feel even more aversive, and an aversive task is exactly the kind we avoid. In a study with first-year university students, those who forgave themselves more for procrastinating before the first exam procrastinated less when preparing for the second.', 'That study was not experimental; it does not prove that forgiveness reduces procrastination. The link was explained by a reduction in negative feelings: students who forgave themselves felt less bad about the course, and that seemed to make it easier to approach. Forgiving yourself does not mean ignoring what happened. It means saying: “I put it off; that is human. Next time I will do this differently.” Both halves matter: the kindness and the next step.'],
      practice: ['Briefly recall a recent moment when you put something off, and notice what you said to yourself.', 'Say to yourself the understanding sentence you would say to a friend in the same situation.', 'Then decide on one concrete thing you will do differently next time.'],
      reflection: 'What forgiving but responsible sentence would you like to say to yourself?', question: 'What does forgiving yourself mean in this lesson?', options: ['Treating what happened as unimportant and changing nothing.', 'Giving yourself permission to keep procrastinating.', 'Accepting what happened and choosing the next step.'], correct: 2,
      feedback: 'Forgiving is not dropping responsibility. Instead of beating yourself up, it can make it easier to turn to the part you can fix.', takeaway: 'You procrastinated; that does not define you. The next step is still yours.', sources: ['self-forgiveness', 'mood-repair', 'self-compassion'],
      visual: { kind: 'compare', title: 'Your inner voice after procrastinating',
        left: { label: 'Attacking yourself', items: ['“I’m just lazy.”', 'Turns one moment into your whole identity.', 'Can make the task feel even more aversive.'] },
        right: { label: 'Forgiving yourself', items: ['“I put it off; that’s human.”', 'Accepts what happened and keeps responsibility.', 'Makes room for the next small step.'] },
        note: 'Forgiving does not mean ignoring what happened or carrying on the same way.' },
      deeper: [
        { heading: 'What the self-forgiveness study found', paragraphs: [
          'Michael Wohl, Tim Pychyl and Shannon Bennett followed first-year students across two midterm exams. After the first exam, students reported how much they had procrastinated and how much they had forgiven themselves for it. Those who forgave themselves more procrastinated less before the second exam, and the link ran through feeling less negative about the course.',
          'The study has real limits: it was correlational, it took place in one course, and only 119 of the 312 students who started were in the final analysis. So it cannot prove that forgiveness causes less procrastination. But it fits the mood-repair view: if procrastination is a way of escaping bad feelings, piling more bad feelings on top is unlikely to help. Self-compassion research more broadly shows small-to-medium short-term benefits for stress and anxiety.',
        ] },
        { heading: 'A three-part forgiveness script', paragraphs: [
          'Self-forgiveness can feel vague, so it helps to have words ready. The three parts below keep honesty and kindness together. Say them silently or write them down; the exact wording is yours.',
          'If the harsh voice comes back while you do this, that is normal. You do not need to argue with it or silence it. Simply notice it (“there’s the critic again”) and go back to the script.',
        ],
          visual: { kind: 'steps', title: 'Forgive, then return',
            steps: [
              { label: 'Name it', text: '“I put off the report again this week.”' },
              { label: 'Make it human', text: '“It felt unclear and stressful; many people avoid tasks like that.”' },
              { label: 'Take responsibility', text: '“It still matters to me, and I can fix part of it.”' },
              { label: 'Choose the next step', text: '“Tomorrow at 9 I’ll open the file and write the first heading.”' },
            ],
            note: 'Forgiveness here means dropping the attack, not dropping the task.' } },
      ],
      example: { title: 'Daniel, 36, project manager', text: 'Daniel had promised his team a budget draft by Friday, and on Friday afternoon it was still a blank page. On the drive home he heard the usual voice: “You always do this. Everyone will see you can’t manage anything.” By the time he parked, he felt too heavy to open the laptop at all. Sitting in the car, he tried the script. “I didn’t do the draft. It felt vague and I kept avoiding it; that happens to people. It still matters, and I can fix some of it.” Then the step: an email to his team saying the draft would come Monday at noon, and a note to open the file at 8:30. On Monday, starting felt less like facing a verdict.' },
      photo: { id: '1778958619388-b529cc4e78e8', alt: 'Young woman drinking tea by a window' } },
    { id: 'procrastination-5', title: 'Your own procrastination plan', minutes: 8,
      goal: 'Set up a one-week experiment with a first move, a plan, a review and, if you like, interim deadlines.',
      reading: ['In studies of procrastination interventions, procrastination fell clearly after the intervention, and the drop held at follow-up measurements. This value was calculated from before–after differences rather than against a control group, so the effect may look bigger than it is. The strongest results came from cognitive behavioral therapy delivered by professionals, and this course is not therapy. What it can offer is a small, personal experiment built from the tools you have practiced: a first move, a plan and a review.', 'Splitting a big task into several interim deadlines on your calendar, setting yourself gentle checkpoints, is an idea worth trying. But a frequently cited study on this was retracted, and we have not reviewed strong evidence to take its place. So think of interim deadlines not as a proven method but as an experiment you observe on yourself. If a checkpoint helps you start, keep it; if it only adds pressure and guilt, drop it without drama.'],
      practice: ['Write out your task following the rows of the table: first move, time and place, if–then plan.', 'If you like, add a few interim dates to the big task; think of them not as strict rules but as gentle reminders to yourself.', 'At the end of the week, spend two minutes reviewing what worked and what you will change.'],
      reflection: 'Which part of your plan will you keep, and which will you change?', question: 'What is the most honest approach to deadlines you set for yourself?', options: ['It is a proven method that definitely works.', 'Worth trying but with limited evidence; watch how it works for you.', 'It never works and should never be tried.'], correct: 1,
      feedback: 'Trying a method with limited evidence is fine; what matters is honestly observing how it works for you. If procrastination clearly affects your life, you can get support from a professional.', takeaway: 'Keep your plan small, try it, review it, and ask for support when you need it.', sources: ['procrastination-interventions', 'if-then-plans', 'monitoring', 'task-aversiveness'],
      visual: { kind: 'table', title: 'Weekly procrastination plan', columns: ['Step', 'Example', 'Your plan'],
        rows: [
          ['First move', 'Open the document and write three headings', '…'],
          ['Time and place', 'Tuesday 9:00, kitchen table', '…'],
          ['If–then', 'If I pick up my phone, I’ll write one sentence first', '…'],
          ['Interim deadline (experiment)', 'Thursday: first draft', '…'],
          ['Review', 'Sunday evening, two minutes', '…'],
        ],
        note: 'Interim deadlines are an experiment with limited evidence; change or drop them if they do not help.' },
      deeper: [
        { heading: 'Matching tools to your kind of stuck', paragraphs: [
          'Procrastination does not look the same every time, and the tools in this course fit different versions of it. When a task feels shapeless, shrinking it helps most. When a particular moment keeps derailing you, an if–then plan fits. When the payoff is far away, a nearer checkpoint shortens the delay, which is exactly what Steel’s model predicts should help.',
          'You do not need all of them at once. Pick the one or two that match the way you tend to get stuck, try them for a week, and look at what happened. Tracking what you did, even with a simple tick, was linked to better goal progress in a large meta-analysis, and it gives your weekly review something real to look at.',
        ],
          visual: { kind: 'table', title: 'Which tool for which kind of stuck?', columns: ['If the task feels…', 'Try', 'From lesson'],
            rows: [
              ['Heavy and dreadful', 'Name the feeling, then a two-minute first move', '1 and 2'],
              ['Shapeless or huge', 'Break it into parts and a concrete verb', '2'],
              ['Fine until a certain moment', 'An if–then plan for that moment', '3'],
              ['Far off and easy to ignore', 'A nearer checkpoint with a small reward', '5'],
              ['Ruined because you already put it off', 'The forgiveness script, then one step', '4'],
            ],
            note: 'A menu, not a checklist. One or two tools that fit you are enough for a week.' } },
        { heading: 'When to look for more support', paragraphs: [
          'The strongest results in the intervention research came from cognitive behavioral therapy with a trained professional. That is worth knowing, because some procrastination is tangled up with things a short course cannot address, such as ongoing anxiety, depression or attention difficulties like ADHD.',
          'Signs that it may be time to talk to a doctor or therapist include: putting things off is costing you jobs, grades, relationships or health; the feelings around tasks are intense or constant; or you have tried several approaches and nothing shifts. Asking for help at that point is not a failure of willpower. It is choosing a stronger tool for a harder problem.',
        ] },
      ],
      example: { title: 'Nadia, 29, veterinary technician applying to school', text: 'Nadia’s application essay was due in three weeks, and she knew herself: she would start the night before. On Sunday she filled in the plan. First move: open a document and list three moments that made her want this career. Time and place: Tuesday 7 p.m., kitchen table, after dinner. If–then: “If I start rereading old emails, I’ll write one sentence first.” As an experiment, she set two interim dates: rough draft by next Sunday, and a friend reading it the Wednesday after. Tuesday went fine. Thursday she skipped entirely. On Sunday’s two-minute review she noted that the friend’s date had pushed her more than her own, so she moved the friend’s reading up by three days.' },
      photo: { id: '1506784983877-45594efa4cbe', alt: 'Coffee cup resting on an open planner' } },
  ],
};
