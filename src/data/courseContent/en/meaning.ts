import type { CourseSource, GuidedCourse } from '../../courses';

// English edition (primary). New course, September 2026. See docs/COURSE_WRITING_GUIDE.md.
/*
 * Shared sources cited without redefinition: 'motivation-sdt' and 'motivation-sdt-meta' (motivation edition),
 * 'faith-kindness' (faith edition), 'mcii', 'if-then-plans', 'habits' and 'monitoring'.
 *
 * VERIFIED WHILE WRITING (2026-09-29): https://www.viktorfrankl.org/logotherapy.html (read) and
 * https://contextualscience.org/the_six_core_processes_of_act (read). Carrillo et al. 2019 numbers were checked
 * by the ODA team before writing; they are used in the lesson 5 chart.
 *
 * LEFT UNVERIFIED: Frankl's three sources of meaning (creating/doing, experiencing/loving, attitude toward
 * unavoidable suffering) and the biographical details in lesson 1 come from his book as widely summarized; the
 * institute's biography page returned 404. Laura King's original 2001 Best Possible Self paper was not opened.
 * The "values compass" is a common ACT teaching metaphor, not a term from the ACBS page. The Tony Robbins
 * reference in lesson 3 is unsourced general description. Research on purpose in life and health or mortality
 * (Cohen, Bavishi & Rozanski 2016) could not be opened (rate-limited), so the course makes no health claims about
 * purpose. Steger's Meaning in Life Questionnaire was not opened and is not cited.
 *
 * Photo ids were checked by eye on 29 Sep 2026 (all load; alt texts corrected): 1500530855697-b586d89ba3ee,
 * 1469474968028-56623f02e42e, 1470071459604-3b5ec3a7fe05, 1447752875215-b2761acb3c5d,
 * 1519681393784-d120267933ba, 1501785888041-af3ef285b470, 1472214103451-9374bd1c798e.
 */
export const SOURCES: CourseSource[] = [
  { id: 'meaning-frankl', title: 'Viktor E. Frankl · Man’s Search for Meaning (1946) and the Viktor Frankl Institute Vienna (logotherapy overview)', url: 'https://www.viktorfrankl.org/logotherapy.html', type: 'technique', finding: 'The Viktor Frankl Institute describes logotherapy and existential analysis as a meaning-centered approach to psychotherapy that Frankl developed from the 1930s. It rests on three assumptions: freedom of will (people can choose their stance toward their circumstances, even in illness or hardship), the will to meaning (searching for meaning is a primary human motivation, and when it is frustrated people can feel an inner emptiness), and meaning in life (meaning is specific to each person and situation, to be discovered rather than prescribed). In his book Frankl describes three broad sources of meaning: creating a work or doing a deed, experiencing something or loving someone, and the attitude you take toward suffering you cannot avoid.', limitation: 'The institute page was read. The three sources of meaning are taken from Frankl’s book as widely summarized and were not re-checked against an opened page. Logotherapy is a clinical approach with a smaller research base than many other therapies; the reflections in this course are self-practice, not logotherapy.' },
  { id: 'meaning-act-values', title: 'Association for Contextual Behavioral Science · The six core processes of ACT (values and committed action)', url: 'https://contextualscience.org/the_six_core_processes_of_act', type: 'technique', finding: 'Acceptance and Commitment Therapy (ACT) aims to build psychological flexibility through six connected processes. Values are described as chosen qualities of purposeful action that can never be obtained like an object but can be lived moment by moment, as ongoing directions in areas such as family and work; ACT helps people choose values that are truly their own rather than driven by avoidance, social pressure or “I should” thoughts. Committed action means building larger and larger patterns of values-based behavior, linking concrete, achievable goals to values and working with the inner barriers that show up along the way.', limitation: 'A description by the professional association around ACT, not a study. It explains the model; it does not show how much a values exercise done on your own helps. The compass picture used in this course is a common way of teaching ACT values, not a term from this page.' },
  { id: 'meaning-carrillo', title: 'Carrillo et al. · 2019 · Effects of the Best Possible Self intervention: a systematic review and meta-analysis (PLOS One)', url: 'https://doi.org/10.1371/journal.pone.0222386', type: 'research', finding: 'Pooling 29 studies with 2,909 participants, the meta-analysis found that the Best Possible Self exercise improved optimism (d = 0.334), positive affect (d = 0.511) and wellbeing (d = 0.325), and reduced negative affect (d = 0.192) and depressive symptoms (d = 0.115), compared with control conditions.', limitation: 'Effects were small to medium, and the effect on depressive symptoms was small. Studies differed in how often and how long people wrote, and most measured short-term outcomes. The analysis tests the Best Possible Self exercise, not meaning in life directly and not this course.' },
  { id: 'meaning-best-possible-self', title: 'Laura A. King · Best Possible Self writing (2001), as reviewed by Carrillo et al. (2019)', url: 'https://doi.org/10.1371/journal.pone.0222386', type: 'technique', finding: 'In the Best Possible Self exercise, people imagine a future in which things have gone as well as they realistically could, after working hard toward what matters to them, and write about that future for several minutes, sometimes on several occasions. Carrillo et al. pooled 29 studies of this exercise.', limitation: 'King’s original 2001 paper was not opened; the procedure is described as it is commonly used in the studies that were reviewed. Session length and number of sessions vary between studies. Linking the exercise to personal values is this course’s own addition.' },
];

export const COURSE: GuidedCourse = {
  id: 'meaning',
  title: 'Meaning and Values',
  subtitle: 'Find what matters to you, then take one small step toward it today',
  description: 'What if meaning is less a big answer you find once and more a direction you choose again each day? This course brings together Viktor Frankl’s ideas about meaning and the values work of Acceptance and Commitment Therapy, and turns them into small, daily decisions.',
  scope: 'For adults who feel busy but directionless, are at a crossroads, or want their days to reflect what they care about. It is education and self-reflection, not therapy or treatment. Feeling unsure about meaning from time to time is part of being human, but if life has felt empty or meaningless for weeks, please talk to a doctor or a mental health professional. If you have thoughts of harming yourself, contact your local emergency number now.',
  outcome: 'A map of where meaning already shows up in your life, a short list of values in your own words, a check for which of them are truly yours, a way to face hard situations you cannot change, a written picture of your best possible future, and one small values-based decision you can make every day.',
  photo: { id: '1500530855697-b586d89ba3ee', alt: 'A road winding through open hills toward the horizon' },
  lessons: [
    { id: 'meaning-1', title: 'Where meaning comes from', minutes: 8,
      goal: 'Learn Frankl’s three broad sources of meaning and notice where each already shows up in your life.',
      reading: [
        'Viktor Frankl was a Viennese psychiatrist who developed an approach he called logotherapy, a therapy centered on meaning. His best-known book grew out of his years as a prisoner in Nazi concentration camps. One of his central ideas is that the search for meaning is a basic human drive, not a luxury for people whose other problems are solved. When that search is blocked for a long time, he argued, people can feel an inner emptiness. Frankl did not think anyone could hand you the meaning of your life. In his view it is specific to you and your situation, and it is discovered rather than invented.',
        'Frankl described three broad places where meaning can be found. The first is creating or doing: work, a project, a deed, something you give to the world. The second is experiencing or loving: beauty, nature, truth, and above all another person, known and cared for as they are. The third is the attitude you take toward suffering you cannot avoid. Most people find meaning in all three at different times. The useful question is not what the meaning of life is in general. It is what this moment, this relationship or this task is asking of you.',
      ],
      deeper: [
        { heading: 'Meaning as a response, not a big answer', paragraphs: [
          'Many people wait for one grand purpose to arrive before they feel their life counts. Frankl turned the question around. Instead of asking what life owes you, you can ask what life is asking of you, here, today. That shift makes meaning smaller and closer: a conversation to show up for, a piece of work to do well, a person to care for.',
          'The Viktor Frankl Institute describes this as freedom of will: even when circumstances are fixed, you keep some freedom in how you respond. That freedom does not make hard things easy. It gives you somewhere to stand.',
        ],
          visual: { kind: 'compare', title: 'Two ways to ask about meaning',
            left: { label: 'Waiting for a big answer', items: ['What is the meaning of my life?', 'I will feel it once everything is sorted.', 'Meaning is somewhere else.'] },
            right: { label: 'Responding to this moment', items: ['What is this moment asking of me?', 'I can act on what matters today.', 'Meaning is often close by.'] },
            note: 'Our own illustration of the shift Viktor Frankl describes.' } },
        { heading: 'What the research says, and what it does not', paragraphs: [
          'Logotherapy is a clinical approach with a smaller research base than many other therapies, so this course treats Frankl’s ideas as a helpful way of thinking rather than a proven treatment. Some pieces of his picture do connect with research, though. A meta-analysis of 27 studies with 4,045 people found that doing acts of kindness had a small-to-medium positive effect on the wellbeing of the person doing them.',
          'That is one small, measurable slice of the first source of meaning: doing something for someone else. It does not prove Frankl right about everything, and it is not a reason to force yourself into good deeds. It is a hint that meaning often lives in ordinary actions.',
        ] },
      ],
      example: { title: 'Tomás, 41, warehouse supervisor', text: 'Tomás had started to feel that his life was just work, sleep and bills. One Sunday evening he drew three columns on the back of an envelope: doing, experiencing, facing. Under doing he wrote that he had trained two new starters that month, and both were now confident. Under experiencing he wrote the Saturday walks with his daughter and the smell of the bakery on his route to work. Under facing he wrote his father’s illness, which he could not fix but could keep visiting. Nothing in his life had changed. But on Monday he noticed he was paying more attention when the newest starter asked a question, because now he knew that part of the job mattered to him.' },
      practice: [
        'Draw three columns labeled doing, experiencing and facing, and write at least one thing from the past month under each.',
        'Circle the entry that surprised you most, the one you did not expect to count as meaningful.',
        'Choose one moment today where you will ask yourself what this moment is asking of you, and write down when it will be.',
      ],
      reflection: 'Which of the three sources of meaning do you tend to overlook in your own life?',
      question: 'Which set describes Frankl’s three broad sources of meaning?',
      options: [
        'Money, status and recognition.',
        'Creating or doing, experiencing or loving, and the attitude toward unavoidable suffering.',
        'Positive thinking, visualization and affirmations.',
      ], correct: 1,
      feedback: 'Frankl pointed to what you give (work and deeds), what you receive (experiences and love) and the stance you take toward suffering you cannot avoid.',
      takeaway: 'Meaning is less a single answer than a response to what each day asks of you.',
      sources: ['meaning-frankl', 'faith-kindness'],
      visual: { kind: 'table', title: 'Three sources of meaning', columns: ['Source', 'What it involves', 'An everyday example'],
        rows: [
          ['Creating or doing', 'Giving something through work, a project or a deed', 'Helping a new colleague find their feet'],
          ['Experiencing or loving', 'Receiving beauty, truth, nature or another person', 'A slow walk with someone you love'],
          ['Attitude', 'The stance you take toward suffering you cannot avoid', 'Keeping your dignity and kindness through an illness'],
        ],
        note: 'Sources from Viktor Frankl; the examples are our own.' },
      technique: { name: 'Three sources of meaning review', origin: 'Viktor E. Frankl · Man’s Search for Meaning (1946)',
        steps: [
          'Set aside ten quiet minutes with paper and a pen.',
          'Under “doing”, list things you have made, given or accomplished recently, however small.',
          'Under “experiencing”, list moments of beauty, connection or love you have received.',
          'Under “facing”, list any difficulty you cannot change and how you have chosen to carry it.',
          'Read the lists back and ask which one you would like to feed a little more this week.',
        ],
        evidence: 'This review is our own structured way of reflecting on Frankl’s three sources of meaning; it has not been tested as an exercise. Frankl’s ideas come from clinical experience and philosophy more than from controlled trials.',
        sourceId: 'meaning-frankl' },
      photo: { id: '1469474968028-56623f02e42e', alt: 'A lone figure on a rock above a misty valley' } },

    { id: 'meaning-2', title: 'Values are a direction, not a finish line', minutes: 9,
      goal: 'Understand the difference between values and goals, and name a few values in your own words.',
      reading: [
        'Acceptance and Commitment Therapy, usually called ACT, is a modern psychological approach that gives values a central place. In ACT, values are chosen qualities of how you want to act: being caring, being curious, being honest, being brave. They are different from goals. A goal can be finished and ticked off, such as running a race, getting a job or paying off a loan. A value can never be completed. You never reach the end of being caring. You can only act in a caring way, or not, in this particular moment.',
        'A helpful picture is a compass. If you want to travel west, you can walk west for years and never arrive at a place called West. Along the way you pass real destinations, and those are your goals. Values tell you which way to face; goals mark the stops on the road. This matters because goals come and go. When you reach one you can feel strangely empty, and when you miss one you can feel lost. A value stays with you in both cases and points to the next step.',
      ],
      deeper: [
        { heading: 'Values across areas of life', paragraphs: [
          'ACT describes values as ongoing directions in different areas of life, such as family, work, friendship, health and community. It can help to look at a few areas one at a time, because the value that matters most at work might be different from the one that matters most at home.',
          'Keep the words short and active. “Being a present parent” is easier to act on than “family”. If a value sounds like something you would only say to impress others, set it aside for now.',
        ],
          visual: { kind: 'table', title: 'The same area, seen as a value and as a goal', columns: ['Life area', 'A value (a direction)', 'A goal (a destination)'],
            rows: [
              ['Family', 'Being warm and present', 'Eat dinner together three nights this week'],
              ['Work', 'Doing careful, useful work', 'Finish the report by Friday'],
              ['Health', 'Caring for my body', 'Walk 20 minutes after lunch'],
              ['Friendship', 'Being loyal and in touch', 'Call Sam this weekend'],
            ],
            note: 'Our own examples of the values-versus-goals distinction described in ACT.' } },
        { heading: 'Common mistakes', paragraphs: [
          'The first mistake is writing feelings as values, such as “being happy” or “feeling calm”. Feelings come and go and are not fully in your control. Values are about what you do, which is why they stay usable on hard days.',
          'The second mistake is turning values into rules: “I must always be productive”. A value is a freely chosen direction, not a stick to beat yourself with. The third is choosing too many at once. Three or four values that feel alive are more useful than a list of twenty.',
        ] },
      ],
      example: { title: 'Priya, 33, graphic designer', text: 'Priya had set herself a goal of landing a senior role by the end of the year. When the promotion went to someone else, she felt that the whole year had been wasted. That evening she tried the compass exercise. Under work she wrote the value “making things that are clear and kind to use”. Looking back at the year, she could see dozens of moments where she had lived that value: the accessibility fixes nobody asked for, the junior designer she had coached. The goal had slipped away, but the direction was still there. The next morning she spent twenty minutes sketching a portfolio piece built around that value, instead of scrolling job ads.' },
      practice: [
        'Pick three areas of your life and write one value for each as a short phrase that starts with “being” or a verb.',
        'Next to each value, write one goal that would move you in that direction in the next month.',
        'Check each value: could you act on it even on a bad day? If not, rewrite it as something you do rather than something you feel.',
      ],
      reflection: 'If nobody would ever know what you did, which direction would you still want your life to face?',
      question: 'According to ACT, what is the key difference between a value and a goal?',
      options: [
        'Values are more important than goals, so you should drop your goals.',
        'Values are feelings, and goals are actions.',
        'A goal can be completed, while a value is an ongoing direction you can only act on moment by moment.',
      ], correct: 2,
      feedback: 'Goals are destinations you can reach and tick off. Values are chosen directions that can never be completed, only lived in each moment. You need both.',
      takeaway: 'Goals are the stops on the road; values are the way you are facing.',
      sources: ['meaning-act-values', 'motivation-sdt'],
      visual: { kind: 'compare', title: 'Values and goals',
        left: { label: 'Values', items: ['A direction you choose', 'Never finished', 'Available in every moment', 'Example: being caring'] },
        right: { label: 'Goals', items: ['A destination you reach', 'Can be ticked off', 'Belong to a future point', 'Example: visit Mom on Sunday'] },
        note: 'Our own summary of the distinction described by the Association for Contextual Behavioral Science.' },
      technique: { name: 'Values compass', origin: 'Acceptance and Commitment Therapy · values work, as described by the Association for Contextual Behavioral Science',
        steps: [
          'Draw a simple compass and label four points with areas of your life, such as relationships, work, health and personal growth.',
          'For each area, write in a few words how you want to act there, as a quality rather than an outcome.',
          'Rate from 0 to 10 how closely your actions this past week matched each value.',
          'Choose the area with the biggest gap that you care about most.',
          'Write one small action you could take this week in that direction.',
        ],
        evidence: 'Values clarification is a core part of ACT, which is described as a set of processes rather than a single exercise. This compass version has not been tested on its own, and its effect when done alone, outside therapy, is unknown.',
        sourceId: 'meaning-act-values' },
      photo: { id: '1470071459604-3b5ec3a7fe05', alt: 'Clouds drifting over green cliffs and a valley' } },

    { id: 'meaning-3', title: 'Whose values are these?', minutes: 9,
      goal: 'Separate values you have truly chosen from ones driven by pressure, guilt or fear.',
      reading: [
        'Some of the values we carry are borrowed. They come from parents, a culture, a job or social media, and they often arrive with the word “should”. I should want a bigger house. I should be more ambitious. ACT encourages people to choose values that are genuinely their own, and not to pick them to avoid discomfort, to please others or because a thought insists on it. A borrowed value is not always wrong. Many values we learned from others become truly ours. The question is whether it still feels chosen when you look at it closely.',
        'Research on self-determination theory draws a similar line. It separates autonomous motivation, which comes from interest and personal values, from controlled motivation, which comes from rewards, pressure or other people’s expectations. Motivation that feels chosen tends to be of higher quality and easier to keep up. A simple check is to imagine that nobody would ever see or praise what you do. If the value still matters, it is probably yours. If it deflates at once, it may belong to someone else’s picture of your life.',
      ],
      deeper: [
        { heading: 'Asking “why”, honestly', paragraphs: [
          'Popular coaches, Tony Robbins among the best known, often urge people to find their “why”: the deeper reason behind what they want. The idea has something real in it. Asking why you want something a few times in a row can move you from a surface goal toward the value underneath it.',
          'But the dramatic promises that sometimes come with it, that the right “why” will make you unstoppable, have not been tested. The honest version is quieter. Asking why helps you see what you care about. It does not replace planning, rest or support, and your answer can change over the years.',
        ],
          visual: { kind: 'compare', title: 'A “should” value or a chosen one?',
            left: { label: 'Feels like a should', items: ['Comes with guilt or fear', 'Matters mostly if others see it', 'Sounds like someone else’s voice'] },
            right: { label: 'Feels chosen', items: ['Still matters when nobody is watching', 'Gives a sense of energy or rightness', 'You would pick it again today'] },
            note: 'Our own checklist, based on ACT’s emphasis on freely chosen values and on self-determination theory.' } },
        { heading: 'What the research says', paragraphs: [
          'A meta-analysis of 73 intervention studies in health found that programs based on self-determination theory produced small-to-medium increases in autonomous motivation and small positive changes in physical and psychological health. People whose autonomous motivation grew also tended to improve their health behaviors.',
          'Those studies were about health habits, not life values in general, and the health effects were modest. Still, they fit with the idea behind this lesson: doing something for reasons you own tends to hold up better than doing it under pressure.',
        ] },
      ],
      example: { title: 'Marcus, 26, junior accountant', text: 'Marcus had listed “financial success” as one of his top values. When he tried the nobody-is-watching test, it went flat almost at once. What he actually felt was a fear of disappointing his parents, who had struggled for money. He asked himself why he wanted financial success, three times in a row. The answers moved from “to have a good salary” to “so my family feels safe” to “being someone people can rely on”. That last phrase felt alive. He kept working hard at his job, but he also started calling his younger brother every week to help him with his college applications. It cost nothing, and it felt more like him than the salary target ever had.' },
      practice: [
        'Take the values you wrote in the last lesson and read each one while imagining that nobody would ever see or praise you for living it.',
        'Mark each value as chosen, should, or unsure, and notice any body sensations as you do.',
        'For one value marked should or unsure, ask “why does this matter to me?” three times and write down where you end up.',
      ],
      reflection: 'Which of your values would you keep even if the people you want to impress never found out?',
      question: 'What does self-determination theory say about motivation that comes from personal values?',
      options: [
        'It is a form of autonomous motivation, which tends to be of higher quality than motivation driven by pressure or rewards.',
        'It is weaker than motivation driven by rewards and pressure.',
        'It only matters for people who already have high self-esteem.',
      ], correct: 0,
      feedback: 'Self-determination theory separates autonomous motivation, rooted in interest and values, from controlled motivation, driven by rewards, pressure or others’ expectations. The first tends to last longer and feel better.',
      takeaway: 'A value is yours if it still matters when nobody is watching.',
      sources: ['meaning-act-values', 'motivation-sdt', 'motivation-sdt-meta'],
      visual: { kind: 'steps', title: 'From a surface goal to a value',
        steps: [
          { label: 'Name it', text: 'Write down something you want, such as a promotion or a new city.' },
          { label: 'Ask why', text: 'Why does that matter to me? Write the answer in one line.' },
          { label: 'Ask again', text: 'Repeat two more times, going one layer deeper each time.' },
          { label: 'Check it', text: 'Would this still matter if nobody ever knew? If yes, you may have found a value.' },
        ],
        note: 'Our own version of a common “why” exercise; it has not been tested as a separate technique.' },
      technique: { name: 'Chosen or should? check', origin: 'Acceptance and Commitment Therapy · values work, as described by the Association for Contextual Behavioral Science',
        steps: [
          'Write down one value you hold, in a short active phrase.',
          'Ask whether you are holding it to avoid a feeling such as guilt, shame or fear.',
          'Ask whether you are holding it mainly to please someone or to look good to others.',
          'Ask whether it comes from a thought that says you should value it, rather than from caring about it.',
          'If the answers are mostly no, keep it; if they are mostly yes, look for the value underneath or rewrite it in your own words.',
        ],
        evidence: 'These questions follow ACT’s description of choosing values that are not driven by avoidance, social pressure or “should” thoughts. The check itself has not been tested as a stand-alone exercise.',
        sourceId: 'meaning-act-values' },
      photo: { id: '1447752875215-b2761acb3c5d', alt: 'A wooden footbridge through a green forest' } },

    { id: 'meaning-4', title: 'Meaning when things are hard', minutes: 10,
      goal: 'Learn how to find the part you can still choose when you face a situation you cannot change.',
      reading: [
        'Frankl’s third source of meaning is the most demanding: the attitude you take toward suffering you cannot avoid. It is easy to misread. Frankl did not say that suffering is good or that you should seek it out. If suffering can be removed, the meaningful thing is to remove it, whether that means changing a job, leaving a harmful situation or getting medical help. His point was about what remains when something truly cannot be changed: a loss, an illness, a past event. Even then, he argued, you keep some freedom in how you carry it.',
        'That freedom is usually small and practical. It might be the choice to stay kind while you are in pain, to keep one routine that makes you feel like yourself, or to let a loss deepen your care for the people still here. This is not the same as pretending to be fine. You can feel grief, anger and fear fully and still ask what you want your response to stand for. ACT makes a related point: values can guide what you do while difficult feelings are still present.',
      ],
      deeper: [
        { heading: 'What this idea is not', paragraphs: [
          'This lesson is not a claim that everything happens for a reason, and it is not a demand that you find a silver lining. Some things are simply painful and unfair. Searching for meaning too early, especially when someone else pushes you to, can feel like being told your pain is not allowed.',
          'It is also not a replacement for help. Choosing your attitude works alongside practical steps and support from others, never instead of them.',
        ] },
        { heading: 'When to get more support', paragraphs: [
          'Hard seasons are part of life, and many people get through them with time, rest and the people around them. But if you have felt empty, hopeless or that life is meaningless for several weeks, or if daily life is becoming hard to manage, please talk to a doctor or a mental health professional. This course is not a substitute for treatment.',
          'If you ever have thoughts of harming yourself, contact your local emergency number or a crisis line straight away. Reaching out is not a failure of meaning. It is one of the most meaningful things a person can do.',
        ],
          visual: { kind: 'steps', title: 'If a hard time does not ease',
            steps: [
              { label: 'Notice', text: 'Has the emptiness or hopelessness lasted for weeks, or is it growing?' },
              { label: 'Tell someone', text: 'Share how you feel with one person you trust.' },
              { label: 'Get help', text: 'Talk to a doctor or a mental health professional.' },
              { label: 'In a crisis', text: 'If you think about harming yourself, call your local emergency number now.' },
            ],
            note: 'General safety guidance, not medical advice.' } },
      ],
      example: { title: 'Elena, 52, primary school teacher', text: 'Elena’s mother had moved into a care home with advancing dementia, and visits left Elena drained and tearful. She had tried everything she could think of to slow the decline, and nothing worked. One evening she wrote two lists: what she could still change and what she could not. The illness went on the second list. On the first she wrote the way she spent her visits. Instead of testing her mother’s memory, which upset them both, she started bringing old songs to hum together and a hand cream her mother liked. The visits were still sad. But Elena began to leave them feeling that she had shown up as the daughter she wanted to be.' },
      practice: [
        'Pick one current difficulty and split it into two lists: what you can still change and what you truly cannot.',
        'For the first list, choose one practical step and decide when you will take it.',
        'For the second list, write one sentence about how you want to carry it, starting with “Even so, I can…”.',
      ],
      reflection: 'In a situation you cannot change, what would you like your response to stand for?',
      question: 'What did Frankl mean by finding meaning in unavoidable suffering?',
      options: [
        'That suffering is good for you and should be sought out.',
        'That you should hide your pain and act as if you are fine.',
        'That when something truly cannot be changed, you can still choose the attitude you take toward it.',
      ], correct: 2,
      feedback: 'Frankl was clear that avoidable suffering should be removed. The attitude you take matters for what remains when change is not possible, and it can coexist with grief and fear.',
      takeaway: 'Change what you can; for what you cannot, choose how you want to carry it.',
      sources: ['meaning-frankl', 'meaning-act-values'],
      visual: { kind: 'compare', title: 'Two lists for a hard situation',
        left: { label: 'What I can change', items: ['Asking for help or information', 'Practical steps, however small', 'Leaving what is harmful, if I can'] },
        right: { label: 'What I cannot change', items: ['The loss, the diagnosis or the past event', 'Other people’s choices', 'My stance toward it is still mine'] },
        note: 'Our own illustration, based on Frankl’s idea of the attitude toward unavoidable suffering.' },
      technique: { name: 'The attitude question', origin: 'Viktor E. Frankl · Man’s Search for Meaning (1946)',
        steps: [
          'Name the situation in one plain sentence, without softening it.',
          'Write down what you feel about it, and let those feelings be there.',
          'Check honestly whether any part of it can still be changed, and plan a step for that part first.',
          'For the part that cannot change, ask what kind of person you want to be while you carry it.',
          'Choose one small action today that fits that answer.',
        ],
        evidence: 'This sequence is our own way of applying Frankl’s idea of the attitude toward unavoidable suffering. It comes from his clinical and personal experience and has not been tested as an exercise. It is not a treatment for grief, trauma or depression.',
        sourceId: 'meaning-frankl' },
      photo: { id: '1519681393784-d120267933ba', alt: 'Stars above snowy mountains at night' } },

    { id: 'meaning-5', title: 'Picture the life you are aiming for', minutes: 10,
      goal: 'Use the Best Possible Self exercise to picture a future shaped by your values, and turn it into a first step.',
      reading: [
        'The Best Possible Self exercise was developed by psychologist Laura King. You imagine yourself at some point in the future, after things have gone as well as they realistically could because you worked hard toward what matters to you. Then you write about that future for several minutes, in as much concrete detail as you can. The point is not to predict the future or to wish things into existence. It is to give your values a picture. When you can see what a life lived in a certain direction might look like, it becomes easier to take the first step toward it.',
        'This is one of the better-studied positive psychology exercises. A 2019 meta-analysis pooled 29 studies with 2,909 participants. Compared with control conditions, the exercise improved optimism, positive feelings and wellbeing, and reduced negative feelings and depressive symptoms. The effects were small to medium, and the effect on depression was small. That is honest, useful evidence: a short writing exercise can shift how you feel about the future a little. It does not make that future happen on its own. That part still depends on what you do next.',
      ],
      deeper: [
        { heading: 'Making the picture useful', paragraphs: [
          'A vivid future is most helpful when it connects back to today. After writing, it helps to name the value your best possible self is living, the main obstacle that could get in the way, and a plan for that obstacle.',
          'That second half has its own evidence. A meta-analysis of 21 studies with 15,907 participants found that contrasting a goal with the real obstacle and making an if–then plan had a small-to-medium average effect on reaching goals.',
        ],
          visual: { kind: 'table', title: 'From picture to plan', columns: ['Step', 'Question', 'Example'],
            rows: [
              ['Picture', 'What does my best possible future look like?', 'I run a small, calm design studio.'],
              ['Value', 'Which value is it living?', 'Making things that are clear and kind to use.'],
              ['Obstacle', 'What in me could get in the way?', 'I avoid showing my work.'],
              ['Plan', 'If that happens, then what will I do?', 'If I hesitate, then I send one piece to one person.'],
            ],
            note: 'Our own example, combining the Best Possible Self exercise with goal-obstacle-plan thinking.' } },
        { heading: 'What the research says', paragraphs: [
          'The largest effect in the meta-analysis was on positive feelings, and the smallest was on depressive symptoms. Studies differed in how often and how long people wrote, and most measured changes over days or weeks rather than years.',
          'So the fair summary is this: the exercise reliably lifts mood and hope a little in the short term. Linking it to your values and to a first step is this course’s own addition, meant to turn that lift into action.',
        ] },
      ],
      example: { title: 'Jonah, 38, nurse', text: 'Jonah had been feeling stuck in night shifts for years. On a day off he set a timer for fifteen minutes and wrote about himself five years on, with things having gone as well as they realistically could. To his surprise, the picture was not about money. It was about teaching: running training sessions for new nurses, calm and prepared. When he read it back, he named the value, “helping others become confident”, and the obstacle, his fear of speaking in front of groups. He wrote an if–then plan: if a chance to present comes up, then I will say yes before I can talk myself out of it. The next week he volunteered to run a ten-minute session at the ward meeting.' },
      practice: [
        'Set a timer for 15 minutes and write about your life a few years from now, after things have gone as well as they realistically could because you worked for them.',
        'Underline the value that your best possible self is living, and name one inner obstacle that could get in the way.',
        'Write one if–then plan for that obstacle and one small step you can take this week.',
      ],
      reflection: 'Which value is quietly at the center of the future you pictured?',
      question: 'What did the 2019 meta-analysis of the Best Possible Self exercise find?',
      options: [
        'It guarantees that the imagined future will happen.',
        'Small-to-medium improvements in optimism, positive feelings and wellbeing, with a small effect on depressive symptoms.',
        'No effect on anything measured.',
      ], correct: 1,
      feedback: 'Across 29 studies, the exercise produced small-to-medium improvements, largest for positive feelings and smallest for depressive symptoms. It changes how you feel about the future, not the future itself.',
      takeaway: 'Picture where your values could lead, then take the first step on your own two feet.',
      sources: ['meaning-carrillo', 'meaning-best-possible-self', 'mcii'],
      visual: { kind: 'bars', title: 'Best Possible Self exercise vs control conditions',
        bars: [
          { label: 'Positive feelings', value: 0.511, display: 'd = 0.511' },
          { label: 'Optimism', value: 0.334, display: 'd = 0.334' },
          { label: 'Wellbeing', value: 0.325, display: 'd = 0.325' },
          { label: 'Fewer negative feelings', value: 0.192, display: 'd = 0.192' },
          { label: 'Fewer depressive symptoms', value: 0.115, display: 'd = 0.115' },
        ],
        note: 'Standardized effect sizes from a meta-analysis of 29 studies with 2,909 participants (Carrillo et al., 2019). Mostly short-term outcomes; this is not a test of this course.',
        sourceId: 'meaning-carrillo' },
      technique: { name: 'Best Possible Self', origin: 'Laura A. King · Best Possible Self writing (2001)',
        steps: [
          'Choose a point in the future, such as five years from now.',
          'Imagine that everything has gone as well as it realistically could, because you worked hard and stayed true to what matters to you.',
          'Write about that future continuously for about 15 minutes, in concrete detail: where you are, what you do, who is with you.',
          'Do not worry about spelling or style; keep the pen moving.',
          'If you like, repeat the exercise on a few different days and notice what stays the same.',
        ],
        evidence: 'A meta-analysis of 29 studies found small-to-medium short-term improvements in optimism, positive feelings and wellbeing, with a small effect on depressive symptoms. How long and how often people wrote varied between studies.',
        sourceId: 'meaning-best-possible-self' },
      photo: { id: '1501785888041-af3ef285b470', alt: 'A calm lake surrounded by mountains' } },

    { id: 'meaning-6', title: 'One values-based decision a day', minutes: 8,
      goal: 'Turn your values into one small, concrete decision each day, and keep it going.',
      reading: [
        'Values only change a life when they show up in behavior. ACT calls this committed action: building larger and larger patterns of behavior that are guided by your values, starting from steps you can actually take. The steps can be tiny. Being caring might mean sending one message. Being curious might mean reading five pages. Being healthy might mean going to bed twenty minutes earlier. What turns them into committed action is that you choose them on purpose, because of the direction they point in, and that you come back to them when you drift.',
        'This is the idea behind making one decision a day. Each morning, or the night before, you ask one question: what is one small thing I can do today that moves me toward a value I care about? Then you decide when and where you will do it. If–then plans help here: a meta-analysis of 94 tests found that deciding in advance when, where and how to act had a medium-to-large effect on reaching goals. Some days you will miss. Research on habits suggests that missing once does not undo the process.',
      ],
      deeper: [
        { heading: 'Why small works', paragraphs: [
          'Big commitments made in a burst of inspiration often collapse on the first difficult day. Small, specific steps are easier to start and easier to repeat, and repetition in the same context is how actions slowly become automatic. A study that followed 96 people for 12 weeks found that the time this took varied a lot between people, so there is no magic number of days.',
          'Keeping a simple record also helps. A meta-analysis of 138 studies found that monitoring your progress improved the chances of reaching goals, especially when progress was written down.',
        ],
          visual: { kind: 'table', title: 'From value to today’s decision', columns: ['Value', 'Today’s decision', 'If–then plan'],
            rows: [
              ['Being a present parent', 'Phone in a drawer during dinner', 'If I sit down to eat, then my phone goes in the drawer.'],
              ['Caring for my body', 'A 15-minute walk', 'If I finish lunch, then I walk around the block.'],
              ['Being a loyal friend', 'Message one friend', 'If I get on the bus home, then I text Ana.'],
              ['Learning and growing', 'Read five pages', 'If I get into bed, then I read before any screen.'],
            ],
            note: 'Our own examples of linking values to if–then plans.' } },
        { heading: 'Common mistakes', paragraphs: [
          'The first mistake is choosing a decision that is really a goal in disguise, such as “get fit”. Make it something you could finish today. The second is treating a missed day as proof that you do not really hold the value. A value is a direction; you can turn back toward it at any moment.',
          'The third is only choosing decisions that feel comfortable. Committed action sometimes means doing something that brings up nervousness or doubt, because it matters. You can take those feelings with you.',
        ] },
      ],
      example: { title: 'Sofia, 45, office manager', text: 'Sofia had finished this course with three values: being warm with her family, caring for her body and doing honest work. Each night she wrote one decision for the next day on a sticky note by the kettle. On Monday it was “ask Leo about his game, and listen”. On Tuesday it was “walk to the station instead of taking the bus”. On Wednesday she forgot entirely, felt the old voice call her hopeless, and wrote Thursday’s note anyway. By the end of the month she had kept about three in four. Her life did not look dramatically different, but she felt more like the person she had described in her values.' },
      practice: [
        'Choose one value from your list and write one decision you can finish today that points in its direction.',
        'Turn it into an if–then plan by naming exactly when and where you will do it.',
        'Tonight, mark whether you did it, and write tomorrow’s decision before you go to sleep.',
      ],
      reflection: 'What is one small thing you could do today that the person you want to be would do?',
      question: 'Which daily decision best fits the idea of committed action?',
      options: [
        'Promise yourself to become a completely different person starting Monday.',
        'Walk for 15 minutes after lunch today, because you value caring for your body.',
        'Wait until you feel motivated before doing anything.',
      ], correct: 1,
      feedback: 'Committed action is a specific, doable step chosen because of a value. It does not require a big transformation or waiting for the right feeling.',
      takeaway: 'One small decision a day, pointed in the right direction, adds up to a life.',
      sources: ['meaning-act-values', 'if-then-plans', 'habits', 'monitoring'],
      visual: { kind: 'cycle', title: 'The daily values loop', center: 'Your direction',
        nodes: [
          { label: 'Value', text: 'Pick one value you care about today.' },
          { label: 'Decide', text: 'Choose one small action and when you will do it.' },
          { label: 'Act', text: 'Do it, even if doubt or tiredness comes along.' },
          { label: 'Notice', text: 'Record what happened, without judging yourself.' },
          { label: 'Adjust', text: 'Make tomorrow’s step easier, harder or different.' },
        ],
        note: 'Our own loop, based on committed action in ACT, if–then planning and progress monitoring.' },
      technique: { name: 'Committed action step', origin: 'Acceptance and Commitment Therapy · committed action, as described by the Association for Contextual Behavioral Science',
        steps: [
          'Choose one value and one area of life where you want to act on it.',
          'Set a small, concrete goal that serves that value and can be done today or this week.',
          'Name the inner barriers you expect, such as doubt, boredom or fear.',
          'Decide how you will act while those feelings are present, instead of waiting for them to leave.',
          'Take the step, then choose the next one, slowly building a larger pattern.',
        ],
        evidence: 'Committed action is one of ACT’s six core processes, and the planning part draws on well-studied tools such as if–then plans. This simplified sequence has not been tested on its own.',
        sourceId: 'meaning-act-values' },
      photo: { id: '1472214103451-9374bd1c798e', alt: 'A green meadow with trees in soft light' } },
  ],
};
