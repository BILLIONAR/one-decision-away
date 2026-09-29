import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * English edition of "Manifest". Lesson IDs, practice counts and answer
 * positions match the Turkish edition in src/data/courses.ts; the main visuals
 * are translated from existingVisuals.ts. The Turkish lessons cite only the
 * shared base sources 'mcii' and 'monitoring', whose English versions live in
 * ./confidence.ts. Also cited from other English editions: 'if-then-plans'
 * (procrastination), 'oettingen-woop-method' (turning-day), 'identity-cole',
 * 'identity-toth' and 'identity-dispenza-habit' (identity). New sources
 * (Sep 2026) are prefixed 'manifest-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'manifest-positive-fantasies', title: 'Kappes & Oettingen · 2011 · Positive fantasies about idealized futures sap energy', url: 'https://www.sciencedirect.com/science/article/abs/pii/S002210311100031X', type: 'research',
    finding: 'Four experiments. Experimentally induced positive fantasies about an idealized future led to less energy, measured with physiological and behavioral indicators, than fantasies that questioned the desired future, negative fantasies or neutral fantasies. The drop in energy was larger when the fantasy concerned a more pressing need. The authors conclude that low energy is one reason spontaneous positive fantasies predict poorer achievement.',
    limitation: 'Laboratory experiments with small samples. They do not show that dreaming is always harmful, only that an idealized fantasy with no obstacle and no plan can reduce the energy to act. Only the abstract was read.' },
  { id: 'manifest-belief-study', title: 'Dixon, Hornsey & Hartley · Personality and Social Psychology Bulletin · The psychology of belief in manifestation (University of Queensland summary, 2023)', url: 'https://news.uq.edu.au/2023-09-20-manifesting-your-way-bankruptcy', type: 'research',
    finding: 'Three studies with 1,023 participants. About one-third endorsed manifestation beliefs. Believers reported stronger perceptions of their own success and higher aspirations, but they were also more drawn to risky investments, more likely to have experienced bankruptcy and more likely to hold unrealistic expectations of getting rich quickly. The researchers found no objective evidence that manifesting works.',
    limitation: 'Survey research that shows associations, not causes. The university’s news summary was read, not the full article, so details of the measures were not checked.' },
  { id: 'manifest-murphy', title: 'Joseph Murphy · The Power of Your Subconscious Mind (1963; Tarcher edition 2008)', url: 'https://www.penguinrandomhouse.com/books/296695/the-power-of-your-subconscious-mind-by-joseph-murphy-phd-dd/', type: 'technique',
    finding: 'Murphy teaches that the drowsy state just before sleep is the moment most open to suggestion. He suggests shortening a wish into a brief phrase, repeating it calmly like a lullaby, picturing a short scene as if the result were happening now (for example a friend congratulating you) and ending the scene with a feeling of thanks. The publisher describes the book’s core idea as believing without reservation and picturing the result so that inner obstacles fall away.',
    limitation: 'The publisher page was read. Rehearsal and a clear intention before sleep may help you prepare. The book’s claims that the subconscious mind brings wealth, success or physical healing are not supported by research, and no one should change medical treatment because of it.' },
];

export const COURSE: GuidedCourse = {
  id: 'manifest', title: 'Manifest', subtitle: 'From intention to action.',
  description: 'Get clear on what you want, rehearse the path in your mind, face the real obstacle and plan your first step.',
  scope: 'Here, manifesting means the practice of intention, preparation and action. The course does not claim that thoughts steer events through quantum effects, that the universe delivers what you focus on, or that any wish is sure to come true. It is not financial, medical or psychological advice.',
  outcome: 'One goal, a short mental rehearsal, a response to your main obstacle and a date to review how it went.',
  photo: { id: '1676782778930-11b311ec5134', alt: 'Dirt road climbing a grassy hill toward distant mountains' },
  lessons: [
    { id: 'manifest-1', title: 'Turn your wish into a behavior', minutes: 6,
      goal: 'Separate the result you want from the work you can do today.',
      reading: [
        '“I want a better job” is a wish about an outcome. “This week I will rework the first section of my résumé” is a goal about your own behavior. You cannot control other people’s decisions: whether an employer calls back, whether a client says yes. You can choose the part you prepare. This is the working core of what people call manifesting. A clear intention points your attention and your effort at something specific, and the clearer the behavior, the easier it becomes to notice chances and to start.',
        'There is room for dreaming in this course. Next to the dream we will place your conditions, your resources and your effort. What we will not do is explain a missed opportunity by saying you did not think positively enough. Popular manifesting often promises that the universe delivers whatever you focus on, but no research shows thoughts acting like a physical force on events. That is good news, in a way: the outcome was never a test of your inner purity, and the next step is still yours to choose.',
      ],
      practice: ['Write or think of one wish that matters to you, in a single sentence.', 'Choose one behavior within your control that moves you toward that wish.', 'Describe the behavior with a small finish line, for example “three lines of a draft”.'],
      reflection: 'What is today’s behavior version of your wish?', question: 'Which of these is a behavior you can choose directly?', options: ['The employer definitely choosing me.', 'Editing three lines of my résumé tomorrow.', 'Nothing going wrong at all.'], correct: 1,
      feedback: 'You cannot guarantee other people’s decisions. You can make your own preparation concrete.', takeaway: 'Give your intention a task you can actually touch.', sources: ['mcii', 'manifest-belief-study'],
      visual: { kind: 'compare', title: 'From wish to behavior',
        left: { label: 'Wish about an outcome', items: ['I want a better job.', 'The employer definitely choosing me', 'Nothing going wrong at all'] },
        right: { label: 'Goal about a behavior', items: ['Rework the first section of my résumé this week', 'Write a three-line draft tomorrow'] },
        note: 'You cannot guarantee other people’s decisions; you can make your own preparation concrete.' },
      deeper: [
        { heading: 'What holds up, and what does not', paragraphs: [
          'Manifesting books and videos usually mix two very different things. One is a set of ordinary, useful habits: deciding clearly what you want, picturing it, keeping it in view and acting on it. The other is a story about how the world works, often called the law of attraction: that like attracts like, that your thoughts send out a signal, that the universe arranges events to match it, and sometimes that quantum physics proves all this.',
          'You can keep the first part and set the second aside without losing anything that works. Physicists do not describe the world that way, and no study has shown that thinking about money, a partner or a job makes it arrive on its own. The habits, on the other hand, overlap with methods that have been tested: clear goals, mental rehearsal, planning for obstacles and tracking progress. That is what this course builds on.',
        ],
          visual: { kind: 'compare', title: 'The working core and the claims to leave aside',
            left: { label: 'Keep: the working core', items: ['A clear, specific intention', 'Rehearsing the steps in your mind', 'Seeing the obstacle and planning for it', 'Acting, then reviewing honestly'] },
            right: { label: 'Leave aside: no evidence', items: ['Thoughts as a magnet that pulls in events', '“The universe delivers” what you focus on', 'Quantum physics reshaping your reality', 'A setback as proof of negative thinking'] },
            note: 'Setting aside the right-hand column does not mean giving up hope. It means your hope gets a plan.' } },
        { heading: 'What research on manifesting beliefs found', paragraphs: [
          'Researchers at the University of Queensland studied people who believe in manifesting. Across three studies with 1,023 participants, about a third endorsed manifestation beliefs. Those believers felt more successful and aimed higher, which sounds encouraging. But they were also more drawn to risky investments, more likely to have been through bankruptcy and more likely to expect quick wealth. The researchers found no objective evidence that manifesting works.',
          'These were surveys, so they show a link, not a cause. Still, the pattern fits the rest of this course. The wish is not the problem. The risk comes when a strong feeling of certainty replaces checking the facts, asking for advice and taking small, testable steps. A behavior goal keeps you in contact with reality.',
        ] },
      ],
      example: { title: 'Daniel, 31, warehouse shift supervisor', text: 'Daniel wanted to move into a logistics planning role. For months he had a picture of an office desk as his phone wallpaper and told himself the right job would find him. On Sunday he tried the exercise. Wish: “a planning job.” Behavior: “By Thursday, rewrite the top three lines of my résumé so they mention the shift schedules I already build.” He did it on Wednesday after dinner in about twenty minutes. One line still sounded awkward, and no one called that week. But he now had a page he could send, and the next step, finding two job postings to compare, was obvious. The wallpaper stayed. It just had a task attached to it now.' },
      photo: { id: '1768055104910-8c8d213835fb', alt: 'Hand writing a to-do list in a notebook' } },

    { id: 'manifest-2', title: 'See the path, not only the result', minutes: 7,
      goal: 'Do a short mental rehearsal of your first move.',
      reading: [
        'Take a moment to think about what reaching the result you want would mean to you. Then bring the scene back to today: where are you sitting, which file are you opening, what do you type in the first line? Picturing the finish line gives the wish some warmth. Picturing the first move gives it a place to begin. Both have value, but the second is the one that tells you what to do next. This is a preparation exercise, a kind of dress rehearsal before the real thing.',
        'You do not have to close your eyes. If no vivid images come, simply describing the steps to yourself in words is enough; many people think more in sentences than in pictures. The rehearsal does not replace the real attempt. It exists to help you pick the detail that will get the attempt started: the pen that needs to be on the desk, the email you will open, the first sentence you will say. When the rehearsal is over, do one real thing it showed you.',
      ],
      practice: ['Name one difference you want your goal to make in your life.', 'Put your first two moves in order, as images or as words.', 'After the rehearsal, actually do one preparation step.'],
      reflection: 'Which missing preparation did you notice during the rehearsal?', question: 'What does mental rehearsal mean in this course?', options: ['An exercise that prepares you for real action.', 'Controlling outside events for certain with your thoughts.', 'No longer needing to try at all.'], correct: 0,
      feedback: 'Rehearsal is preparation. It does not replace action or outside conditions, and the independent effect of this single exercise has not been proven.', takeaway: 'After the dream, see the first move.', sources: ['mcii', 'manifest-murphy', 'identity-cole', 'identity-toth', 'identity-dispenza-habit'],
      visual: { kind: 'steps', title: 'Rehearsing from the result to the first move',
        steps: [
          { label: 'Meaning', text: 'What would reaching the result mean to you?' },
          { label: 'Place', text: 'Where are you sitting today?' },
          { label: 'Tool', text: 'Which file are you opening?' },
          { label: 'First line', text: 'What do you write in the first line?' },
          { label: 'Real step', text: 'After the rehearsal, actually do one preparation.' },
        ],
        note: 'If no images come, describing the steps in words is enough. Rehearsal does not replace the real attempt.' },
      deeper: [
        { heading: 'What the research on mental rehearsal says', paragraphs: [
          'A 2021 meta-analysis pooled 94 randomized studies of mental simulation, meaning deliberately imagining a future action or event. Overall, it changed later behavior by a medium amount. The type of imagery mattered. Picturing yourself carrying out the action, especially doing it well, worked best. Picturing only the desired outcome had a small effect. Picturing only the process steps was not reliable, though that estimate rests on just five effects, and the eight studies that combined an outcome with the process showed a larger effect.',
          'A separate review of mental practice in skills and sport found a small but real benefit, and found that physical practice beat mental practice alone. So the honest summary is: seeing yourself do the thing helps a little to a moderate amount; doing the thing helps more.',
        ],
          visual: { kind: 'bars', title: 'Mental simulation and later behavior (average effect, Hedges’ g)',
            bars: [
              { label: 'Rehearsing yourself performing well', value: 0.67, display: 'g = 0.67' },
              { label: 'Standard performance rehearsal', value: 0.48, display: 'g = 0.48' },
              { label: 'Imagining the desired outcome', value: 0.23, display: 'g = 0.23' },
              { label: 'Imagining process steps only (5 effects)', value: 0.17, display: 'g = 0.17' },
            ],
            note: 'From Cole et al. (2021), 94 randomized studies. About 0.2 is small and 0.5 medium. Most participants were students, some types rest on few studies, and the process-only estimate was not statistically reliable.',
            sourceId: 'identity-cole' } },
        { heading: 'How Joseph Murphy and Dr. Joe Dispenza do it', paragraphs: [
          'Two well-known teachers build their methods around rehearsal. Joseph Murphy, in The Power of Your Subconscious Mind, recommends the drowsy minutes before sleep: shorten your wish to a brief phrase, repeat it calmly, picture a short scene as if the result were already happening, and end with a feeling of thanks. Dr. Joe Dispenza, in Breaking the Habit of Being Yourself, uses a morning meditation in which you rehearse in detail how your new self thinks, acts and feels.',
          'Both contain a useful core, and both go well beyond the evidence. Murphy writes that the subconscious can bring wealth and healing; Dispenza links his practice to a quantum field and to changing your genes. You can keep the rehearsal and gently leave the rest.',
        ],
          visual: { kind: 'table', title: 'Two rehearsal methods, sorted honestly', columns: ['Teacher', 'What you do', 'Keep', 'Leave aside'],
            rows: [
              ['Joseph Murphy', 'Short phrase and a finished scene before sleep', 'A calm, clear intention; rehearsing a scene', 'The subconscious attracting money or healing'],
              ['Dr. Joe Dispenza', 'Morning meditation rehearsing the new self', 'Rehearsing how you will act and respond', 'Quantum-field and gene-changing claims'],
              ['This course', 'Outcome first, then the first concrete move', 'Seeing yourself do the step', 'Treating the picture as a replacement for action'],
            ],
            note: 'A paraphrase of each method, not a full account. Neither method has been tested as a whole in controlled trials.' } },
      ],
      example: { title: 'Priya, 27, pediatric nurse', text: 'Priya wanted to apply for a specialist training program, and she often pictured the day she would wear the new badge. That felt good but changed nothing. One night, lying in bed, she tried a different scene. After the badge, she pictured tomorrow morning: her kitchen table after breakfast, the laptop open, the application portal on the screen, the box that says “personal statement.” She noticed she did not know her login and that the statement needed a first sentence. In the morning she reset the password, wrote one rough sentence about why she chose children’s nursing, and closed the laptop after ten minutes. The badge was still months away. The application, though, had finally started.' },
      technique: { name: 'The pre-sleep scene, with a first step', origin: 'Joseph Murphy · The Power of Your Subconscious Mind (1963)',
        steps: [
          'In bed, as you begin to feel drowsy, shorten your wish to a brief sentence you can believe.',
          'Repeat the sentence slowly a few times, calmly, without forcing it.',
          'Picture a short scene as if the result had happened, for example someone you like congratulating you.',
          'ODA addition: replay the first concrete step for tomorrow, where you will be and what you will open or say.',
          'End with a moment of thanks for what is already going right, and let sleep come.',
        ],
        evidence: 'Rehearsing yourself doing a task has small-to-moderate support in research; picturing only the finished outcome has a small effect, which is why this version adds the first step. There is no evidence that the subconscious mind draws in money, success or healing. This is not a substitute for medical or psychological treatment.',
        sourceId: 'manifest-murphy' },
      photo: { id: '1517363898874-737b62a7db91', alt: 'Person sitting quietly by a window in warm light' } },

    { id: 'manifest-3', title: 'Meet the real obstacle', minutes: 8,
      goal: 'Clearly name one obstacle between what you want and where you are now.',
      reading: [
        'After thinking about the future you want, look at where you are now: maybe you hesitate to begin, maybe the plan is too big, maybe you cannot get the information you need. Psychologist Gabriele Oettingen calls this step mental contrasting: holding the wished-for future and the present reality side by side. It can feel less pleasant than dreaming alone, and that is part of why it works. The more concrete the obstacle, the clearer your response to it can be.',
        'Not every obstacle is inside you. Time, money, caring for others and access to resources are real conditions. Do not treat an obstacle outside your control as a flaw in your character, and do not treat it as a sign that you did not believe hard enough. You may need to change the size of the goal, its timing or the support around it. Seeing the obstacle honestly is not pessimism; it is what turns a wish into something you can work on.',
      ],
      practice: ['Name the nearest obstacle standing in front of your goal.', 'Separate the part of the obstacle you can influence from the part that needs support or time.', 'If it cannot be done right now, make the goal smaller or move it to a suitable time.'],
      reflection: 'Looking at your obstacle more realistically, what changed in your plan?', question: 'When outside conditions get in the way…', options: ['I should assume it is because I did not believe enough.', 'I should ignore the conditions.', 'I can reconsider support, timing or the size of the goal.'], correct: 2,
      feedback: 'A realistic plan takes outside conditions into account. Outcomes are not decided by your thoughts alone.', takeaway: 'Seeing the obstacle honestly gives your plan a direction.', sources: ['mcii', 'oettingen-woop-method', 'manifest-positive-fantasies'],
      visual: { kind: 'table', title: 'Sorting the obstacle honestly', columns: ['Obstacle', 'Type', 'Possible response'],
        rows: [
          ['Hesitating to begin', 'Inner', 'Make the step smaller'],
          ['The plan is too big', 'Plan', 'Reduce the size of the goal'],
          ['Cannot reach the information you need', 'Access', 'Ask for support'],
          ['Time, money, caring for others', 'Outside condition', 'Change the timing or the size'],
        ],
        note: 'Outside conditions are real, not flaws in your character. Outcomes are not decided by your thoughts alone.' },
      deeper: [
        { heading: 'Why a pleasant daydream can drain you', paragraphs: [
          'Earlier research by Oettingen’s group had found that people who spontaneously indulged in rosy fantasies about the future tended to achieve less. To test why, Heather Barry Kappes and Gabriele Oettingen ran four experiments in which they asked people to imagine an idealized future. Compared with fantasies that questioned that future, negative fantasies or neutral ones, the positive fantasies left people with less energy, measured both in the body and in behavior. The drop was larger when the need felt more pressing.',
          'One way to understand it: an idealized picture lets you taste the arrival without the journey, so the body relaxes as if the work were done. This does not mean dreaming is bad. It means a dream works better as a starting point than as a destination.',
        ],
          visual: { kind: 'cycle', title: 'The fantasy loop', center: 'Dream only',
            nodes: [
              { label: 'Idealized picture', text: 'You imagine the finished result, with no obstacles.' },
              { label: 'Feels like arriving', text: 'The mind enjoys it as if it were already real.' },
              { label: 'Energy drops', text: 'Less urgency to act; the body relaxes.' },
              { label: 'Little action', text: 'The day passes without a concrete step.' },
              { label: 'Wish still far', text: 'The gap feels painful, so you return to the dream.' },
            ],
            note: 'A simplified picture based on Kappes & Oettingen (2011). The way out of the loop is not to stop dreaming but to add the obstacle and a plan.' } },
        { heading: 'Dream first, then look: how WOOP works', paragraphs: [
          'Oettingen turned mental contrasting into a four-step method called WOOP: Wish, Outcome, Obstacle, Plan. You start with the pleasant part, naming the wish and imagining the best outcome, and only then turn to the main obstacle inside you, such as a habit, a feeling or a belief. The last step, the plan, comes in the next lesson.',
          'A 2021 meta-analysis of 21 studies with 15,907 participants found that mental contrasting combined with if-then plans had a small-to-medium average effect on reaching goals. That is a real effect, not a guarantee. WOOP also gives you useful information when it does not fit: if you look honestly at the obstacle and the wish no longer feels feasible, that is a signal to reshape it, not a failure.',
        ] },
      ],
      example: { title: 'Lena, 38, secondary-school teacher', text: 'Lena wanted to finish an online course in data skills. Her usual daydream was the certificate and a new role at the district office. This time she used WOOP. Wish: finish module three this month. Outcome: feeling capable with spreadsheets at work. Then the obstacle. The honest one was not laziness: after grading and putting her two children to bed, it was 9:30 p.m. and she was worn out, so she reached for her phone. Part of that was an outside condition she could not change. So she changed the plan instead: forty-five minutes on Saturday mornings while her partner took the kids to the park. She finished one lesson that first Saturday, less than she had hoped, but more than in the previous three weeks.' },
      technique: { name: 'WOOP', origin: 'Gabriele Oettingen · Rethinking Positive Thinking (2014)',
        steps: [
          'Wish: name a wish that matters to you and is challenging but feasible, in a few words.',
          'Outcome: imagine the best outcome of fulfilling it and let yourself feel it for a moment.',
          'Obstacle: ask what inside you, a habit, feeling or thought, most gets in the way, and picture it clearly.',
          'Plan: write one sentence in the form “If [obstacle], then I will [action].”',
        ],
        evidence: 'Research on mental contrasting with if-then plans shows small-to-medium average effects on reaching goals. Results vary by person and situation, and the official WOOP site belongs to the method’s developers rather than being an independent evaluation.',
        sourceId: 'oettingen-woop-method' },
      photo: { id: '1767134063671-322e6faf9206', alt: 'Fallen tree lying across a leafy forest path' } },

    { id: 'manifest-4', title: 'If this happens, then I will…', minutes: 7,
      goal: 'Link one small response to an obstacle signal.',
      reading: [
        'Now turn the obstacle you chose in the last lesson into a plan. For example: “If I open the file and don’t know where to start, then I will only write the title.” Choose a response that has a clear trigger and is small and doable. The “if” part names the moment, a time, a place or a feeling you can recognize. The “then” part names what you will do in that moment. Deciding in advance means you do not have to rely on willpower or memory when the moment arrives.',
        'If you want to use affirmations, keep them realistic: rather than “I will achieve everything,” try “I can try the first draft.” A sentence like that is useful not because it steers the universe but because it reminds you of the behavior you chose. Grand statements can feel good for a moment and then collide with a hard day. A believable sentence tied to one small action is more likely to still be standing when the obstacle actually shows up.',
      ],
      practice: ['Describe one obstacle signal in the form “If …”.', 'In the “then …” part, write a single small behavior.', 'Check that the plan fits the time and tools you have, then rehearse it once.'],
      reflection: 'What is your if-then sentence?', question: 'Which plan can actually be tried?', options: ['Everything will sort itself out.', 'If I get stuck when I open the file, I will write the title first.', 'If I send good energy, all the obstacles will disappear.'], correct: 1,
      feedback: 'The second option links a specific situation to an observable behavior. The approach studied in research looks like this kind of action planning.', takeaway: 'Tie your wish to a way of starting.', sources: ['mcii', 'if-then-plans'],
      visual: { kind: 'steps', title: 'Wish → outcome → obstacle → plan',
        steps: [
          { label: 'Wish', text: 'What do you want? For example, the first draft of my résumé.' },
          { label: 'Outcome', text: 'What would change for you once it is done?' },
          { label: 'Obstacle', text: '“When I open the file, I won’t know where to start.”' },
          { label: 'Plan', text: '“If I get stuck, then I will only write the title.”' },
        ],
        note: 'If you use an affirmation, keep it realistic: “I can try the first draft.” Its value is in reminding you of the behavior you chose.' },
      deeper: [
        { heading: 'Why if-then plans work', paragraphs: [
          'Psychologists call these plans implementation intentions. Peter Gollwitzer and Paschal Sheeran pooled 94 independent tests and found that plans saying in advance when, where and how you will act had a medium-to-large average effect on reaching goals. Newer analyses that correct for publication bias may put the true effect lower, but the direction is consistent.',
          'The likely reason is simple. When you link a situation to a response ahead of time, the situation itself becomes the reminder. You no longer need to decide in the moment, when you are tired or uneasy and the easiest option is to scroll. The plan has already done the deciding for you.',
        ],
          visual: { kind: 'compare', title: 'Vague intentions and usable plans',
            left: { label: 'Vague', items: ['I’ll work on it this week.', 'I’ll try to be more disciplined.', 'I’ll stay positive no matter what.'] },
            right: { label: 'If-then', items: ['If it is 8 p.m. on Tuesday, then I open the file at the kitchen table.', 'If I reach for my phone, then I put it in the other room for 15 minutes.', 'If I feel discouraged, then I write down one thing that did work.'] },
            note: 'A good “if” is something you will notice; a good “then” is small enough to do even on a bad day.' } },
        { heading: 'Common mistakes', paragraphs: [
          'The most common one is a vague cue: “if I have time” rarely arrives. Tie the plan to a clock time, a place or a moment you already know, such as finishing lunch. The second is a response that is too big: “then I will write the whole chapter” invites the same avoidance as before. The third is making too many plans at once. One or two plans you actually use beat a page of rules.',
          'If a plan does not fire, treat it as information, not a verdict on you. Maybe the cue was hidden, or the action was still too large. Adjust one part and try again.',
        ] },
      ],
      example: { title: 'Tomás, 35, freelance graphic designer', text: 'Tomás had been “manifesting” a portfolio website for a year. He could picture it clearly, but every time he opened the site builder, the blank page made him switch to email. So he wrote two plans on a sticky note by his screen. “If I open the builder and feel stuck, then I will only type the page title and the names of two projects.” And: “If it is 9 a.m. on Tuesday and I haven’t started, then I will set a ten-minute timer.” On Tuesday the second plan kicked in at 9:05. He typed the title and three project names, then stopped after twelve minutes. It was not a website yet, but for the first time it was more than a picture in his head.' },
      photo: { id: '1591462391971-9ffc57b382b9', alt: 'Colorful sticky notes and pens' } },

    { id: 'manifest-5', title: 'Try, look, choose again', minutes: 8,
      goal: 'Review your plan in real life and choose your next step.',
      reading: [
        'As you move toward a goal, looking back at what you did can help you see which part of the plan is working. Record not only the result but also the behavior you tried, the conditions you met and what you learned. A short note is enough: “Wrote for ten minutes on Tuesday; the kids were home; starting with the title helped.” Over a few weeks, notes like these show patterns that memory alone tends to blur, and they give you something concrete to adjust.',
        'If the result you wanted does not come, you do not have to explain it with bad thoughts, low energy or a lack of faith. Sometimes a different route, more support or a different goal is needed. Changing course is not giving up on yourself; it is using what reality has taught you. No course can guarantee an outcome. What you can do is weigh your own part and the outside conditions together, and then choose the next step with clearer eyes.',
      ],
      practice: ['Do your first small attempt, or fix exactly when you will do it.', 'Set a reasonable date to check the result, and use the questions “What did I try, and what did I learn?”', 'Choose what fits best: continue, make it smaller, get support, or change the goal.'],
      reflection: 'On which day, and looking at which information, will you review your plan?', question: 'When the result you wanted does not come, what is the most useful review?', options: ['My thoughts were not strong enough.', 'Looking at the behaviors I tried and the conditions, then making the next choice.', 'Keeping the same expectation without looking at reality.'], correct: 1,
      feedback: 'Comparing the plan with reality gives you new information. No course guarantees a result; you can weigh your own part and the outside conditions together.', takeaway: 'Put effort into your dream, and make room for what reality teaches you.', sources: ['monitoring', 'mcii', 'manifest-belief-study'],
      visual: { kind: 'bars', title: 'Tracking progress: average effect',
        bars: [{ label: 'Harkin et al. 2016 · 138 studies', value: 0.4, display: 'd = 0.40' }],
        note: 'The average effect on reaching goals of interventions that increased progress monitoring; different goals and methods were pooled. It does not promise an effect or a result for this single exercise.',
        sourceId: 'monitoring' },
      deeper: [
        { heading: 'What to track, and why writing it down helps', paragraphs: [
          'A meta-analysis of 138 experiments with nearly 20,000 people found that interventions which got people to monitor their progress helped them reach their goals, with a small-to-moderate average effect. The benefit was larger when progress was physically recorded, on paper or in an app, and when it was reported to someone else. You do not have to share your notes, but a quick line in writing seems to work better than a vague sense of how things are going.',
          'Track mostly what you control: did you do the step, when, and under what conditions? The outcome matters too, but outcomes often lag behind effort and depend on other people. If you only track the outcome, a slow month can look like failure even when your behavior was steady.',
        ],
          visual: { kind: 'cycle', title: 'The review loop', center: 'Review day',
            nodes: [
              { label: 'Try', text: 'Do the small step you planned.' },
              { label: 'Record', text: 'Write one line: what you did, when, under what conditions.' },
              { label: 'Look', text: 'On your review day, read the notes together.' },
              { label: 'Learn', text: 'What helped? What got in the way?' },
              { label: 'Choose again', text: 'Keep, shrink, get support or change the goal.' },
            ],
            note: 'The loop turns every attempt, including the ones that did not work, into information for the next one.' } },
        { heading: 'When the result does not come', paragraphs: [
          'Popular manifesting has a hidden cost here. If thoughts create reality, then an outcome that does not arrive must mean your thoughts were wrong, so the only answer is to believe harder. That can keep people stuck, and sometimes it pushes them toward risky bets. Survey research on people who strongly believe in manifesting found exactly this link with risky investments and bankruptcy, though it cannot show cause.',
          'A kinder and more useful question is: what does the evidence from my own attempts say? Sometimes the answer is to keep going, because effort and results are simply out of sync for now. Sometimes it is to change the plan, ask for help or let a goal go. Each is a legitimate choice.',
        ],
          visual: { kind: 'table', title: 'Reading your review', columns: ['What you see', 'A reasonable next choice'],
            rows: [
              ['You did the steps; the result is slow', 'Continue, and set the next review date'],
              ['You rarely did the step', 'Make it smaller or change the “if” cue'],
              ['An outside condition kept blocking you', 'Change the timing, or ask for support'],
              ['The goal no longer matters to you', 'Let it go, or choose a new wish'],
            ],
            note: 'None of these choices is a failure; each one is a decision based on what actually happened.' } },
      ],
      example: { title: 'Aisha, 45, runs a small home bakery', text: 'Aisha wanted ten regular weekly orders by the end of the quarter. For six weeks she posted photos every Monday and handed out samples at two local cafés, writing one line in a notebook each time. On her review day she read the notes. She had nine posts and six sample days, and four regular orders, not ten. Instead of deciding she had not believed enough, she looked closer. Three of the four regulars came from the same café, where she had talked with customers in person. So she chose to drop two of the posts each month and spend that time at a second café. The goal date moved back a month, and that felt like a decision rather than a defeat.' },
      photo: { id: '1762920738995-f393efe82205', alt: 'Wooden signpost pointing in several directions in a forest' } },
  ],
};
