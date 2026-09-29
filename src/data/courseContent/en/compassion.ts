import type { CourseSource, GuidedCourse } from '../../courses';

// English edition (primary). New course, September 2026. See docs/COURSE_WRITING_GUIDE.md.
/*
 * Shared sources cited without redefinition: 'self-compassion' (Han & Kim 2023, confidence.ts),
 * 'state-self-compassion-motivation' (Breines & Chen 2012, state.ts) and 'meditation-lovingkindness'
 * (Zeng et al. 2015, meditation edition; its numbers are used in the lesson 4 chart).
 *
 * VERIFICATION PENDING (2026-09-28): only https://self-compassion.org/what-is-self-compassion/ could be
 * opened while writing; the web-fetch limit was reached and the sandbox blocks direct access. Re-open and
 * re-check before release: compassion-mindful-self-compassion-rct, compassion-ferrari,
 * compassion-gilbert-cft, compassion-tangney-moral-emotions, compassion-brown-shame-resilience and the
 * three technique sources. No numbers from these sources are used in charts. The seven photo ids also
 * were checked by eye on 29 Sep 2026 (all load; alt texts corrected).
 */
export const SOURCES: CourseSource[] = [
  { id: 'compassion-neff-definition', title: 'Kristin Neff · What is self-compassion? (self-compassion.org)', url: 'https://self-compassion.org/what-is-self-compassion/', type: 'guidance', finding: 'Neff defines self-compassion as offering yourself the warmth and understanding you would offer a struggling friend, with three components: self-kindness versus self-judgment, common humanity versus isolation, and mindfulness versus over-identification. She distinguishes tender self-compassion (comforting and accepting yourself) from fierce self-compassion (acting to protect yourself, set boundaries, pursue goals or leave harmful situations), and separates self-compassion from self-esteem, self-pity and self-indulgence.', limitation: 'A definition written by the researcher who developed the concept, not a study; it explains the model rather than testing it. The page was read.' },
  { id: 'compassion-neff-exercises', title: 'Kristin Neff · Self-Compassion (2011) and self-compassion exercises (self-compassion.org)', url: 'https://self-compassion.org/', type: 'technique', finding: 'Neff offers practical exercises for building self-compassion, including asking how you would treat a friend, the self-compassion break (acknowledge the pain, recall common humanity, offer kindness, often with supportive touch), a self-compassion journal, and writing a letter to yourself from the perspective of an unconditionally loving friend.', limitation: 'Practice guidance from the developer of the concept. The individual exercises have not each been tested in trials; the evidence comes from programs that combine them.' },
  { id: 'compassion-mindful-self-compassion-rct', title: 'Neff & Germer · 2013 · A pilot study and randomized controlled trial of the Mindful Self-Compassion program (Journal of Clinical Psychology)', url: 'https://doi.org/10.1002/jclp.21923', type: 'research', finding: 'In a randomized trial with community adults, the eight-week Mindful Self-Compassion program led to larger increases in self-compassion, mindfulness, compassion for others and life satisfaction, and larger decreases in depression, anxiety, stress and emotional avoidance, than a waitlist control. Gains were maintained at six-month and one-year follow-ups, and more practice was linked to larger gains in self-compassion.', limitation: 'A small trial run by the program’s developers, compared with a waitlist rather than an active alternative, with mostly self-report measures. It tests the whole program, not single exercises.' },
  { id: 'compassion-ferrari', title: 'Ferrari et al. · 2019 · Self-compassion interventions and psychosocial outcomes: a meta-analysis of RCTs (Mindfulness)', url: 'https://doi.org/10.1007/s12671-019-01134-6', type: 'research', finding: 'Pooling 27 randomized controlled trials of self-compassion interventions, the meta-analysis found improvements across a range of psychosocial outcomes, including self-compassion itself, rumination, self-criticism, stress, depression and anxiety.', limitation: 'Many included trials were small and varied in format, population and control condition; most outcomes were self-reported and follow-up periods were short.' },
  { id: 'compassion-gilbert-cft', title: 'Gilbert · 2014 · The origins and nature of compassion focused therapy (British Journal of Clinical Psychology)', url: 'https://doi.org/10.1111/bjc.12043', type: 'research', finding: 'Gilbert describes how compassion-focused therapy (CFT) was developed for people with high shame and self-criticism who could understand therapy’s logic but struggled to feel reassured or safe. It builds on a model of three interacting emotion regulation systems: threat and protection, drive and resource-seeking, and soothing, contentment and affiliation.', limitation: 'A theoretical and clinical review rather than a trial. The three-systems model is a simplified clinical framework, and evidence for CFT as a therapy is still developing.' },
  { id: 'compassion-gilbert-mind', title: 'Paul Gilbert · The Compassionate Mind (2009) and the Compassionate Mind Foundation', url: 'https://www.compassionatemind.co.uk/', type: 'technique', finding: 'Gilbert’s compassionate mind training includes soothing rhythm breathing (slowing the breath to a steady, comfortable rhythm) and imagining your compassionate self, a wise, strong and caring version of you, as ways to activate the soothing system.', limitation: 'Practice guidance from the developer of CFT and his foundation. These exercises are usually taught within therapy or structured training and have not been tested here as standalone self-help.' },
  { id: 'compassion-tangney-moral-emotions', title: 'Tangney, Stuewig & Mashek · 2007 · Moral emotions and moral behavior (Annual Review of Psychology)', url: 'https://doi.org/10.1146/annurev.psych.56.091103.070145', type: 'research', finding: 'The review distinguishes shame, a painful focus on the whole self, from guilt, a focus on a specific behavior. Guilt-proneness is linked with empathy and reparative action, while shame-proneness is linked with hiding, denial, defensive anger, blaming others and psychological symptoms.', limitation: 'Mostly correlational research on dispositions (being shame-prone or guilt-prone); it does not show that switching from shame to guilt in a single moment changes outcomes.' },
  { id: 'compassion-brown-shame-resilience', title: 'Brown · 2006 · Shame resilience theory: a grounded theory study on women and shame (Families in Society)', url: 'https://doi.org/10.1606/1044-3894.3483', type: 'research', finding: 'Based on interviews with women, the study describes shame resilience along four continua: recognizing shame and understanding its triggers, practicing critical awareness, reaching out to others, and speaking shame.', limitation: 'Qualitative, theory-building research with women only; it describes patterns but does not test whether practicing the four elements reduces shame.' },
  { id: 'compassion-brown-practice', title: 'Brené Brown · I Thought It Was Just Me (2007) and brenebrown.com', url: 'https://brenebrown.com/', type: 'technique', finding: 'Brown distinguishes shame (a painful feeling that you are flawed and unworthy) from guilt (discomfort about something you did) and presents shame resilience as a set of skills: recognizing shame and its triggers, reality-checking the messages behind it, reaching out, and speaking about shame.', limitation: 'A popular book and website built on the author’s qualitative research; the practices have not been tested as an intervention.' },
];

export const COURSE: GuidedCourse = {
  id: 'compassion',
  title: 'Self-Compassion',
  subtitle: 'Treat yourself like someone you love, and still own your mistakes',
  description: 'What if the voice in your head could be honest and on your side at the same time? This course explores what research and practice say about self-compassion, and how it can make taking responsibility easier, not harder.',
  scope: 'For adults who are hard on themselves after mistakes, setbacks or painful moments. It is education and self-practice, not therapy. If you live with trauma, abuse, or shame that is persistent or overwhelming, please work with a qualified professional; self-compassion exercises can sometimes stir up old pain. If you are in crisis or thinking about harming yourself, contact your local emergency number now.',
  outcome: 'A clear picture of what self-compassion is and is not, a two-minute self-compassion break for hard moments, a way to read your threat, drive and soothing systems, a plan for the next time shame hits, and a compassionate letter that ends in one concrete, accountable step.',
  photo: { id: '1470252649378-9c29740c9fa8', alt: 'A quiet field in warm evening light' },
  lessons: [
    { id: 'compassion-1', title: 'Compassion is not weakness', minutes: 8,
      goal: 'See why being kind to yourself after a failure can support, rather than undermine, doing better.',
      reading: [
        'Many people believe their inner critic is what keeps them in line. If they stopped being hard on themselves, the thinking goes, they would become lazy, careless or selfish. Psychologist Kristin Neff, who developed the modern research on this topic, describes self-compassion very differently: giving yourself the same warmth and understanding you would offer a good friend who is struggling. That does not mean pretending nothing went wrong. A good friend notices the mistake too. They just do not add contempt on top of it, and they stay on your side while you work out what to do next.',
        'Research suggests this kindness is not the soft option it looks like. In a set of experiments by Juliana Breines and Serena Chen, people who were encouraged to take a self-compassionate view of a weakness, a moral mistake or a failed test became more motivated to improve. They were more likely to believe the weakness could change and more willing to make amends, and after failing a test they spent longer studying for the next one. The comparison groups, including one that received a boost to self-esteem, did not show the same pattern. Harshness can feel like responsibility. Often it just adds fear.',
      ],
      deeper: [
        { heading: 'Why the critic feels so useful', paragraphs: [
          'Self-criticism often starts as protection. If you criticize yourself first, nobody else can surprise you with it, and the sting feels like proof that you care. The trouble is what fear does to effort. When a mistake means an attack, the easiest way to avoid the attack is to avoid looking at the mistake: excuses, blaming someone else, or not trying again.',
          'Self-compassion lowers the cost of looking. When the response to a failure is support rather than punishment, it becomes safer to admit what happened and study it. That is the logic behind Breines and Chen’s findings, and it is why this course keeps pairing kindness with accountability.',
        ],
          visual: { kind: 'table', title: 'Common beliefs about self-compassion', columns: ['Common belief', 'What the evidence and definitions suggest'],
            rows: [
              ['It will make me lazy.', 'In lab experiments it increased effort to improve, such as more study time after a failed test.'],
              ['It is just self-esteem.', 'Self-esteem depends on feeling good or special compared with others; self-compassion does not have to be earned.'],
              ['It is self-pity.', 'Self-pity gets stuck in why me; self-compassion remembers that everyone struggles.'],
              ['It lets me off the hook.', 'Its fierce side includes setting boundaries and pursuing goals.'],
            ],
            note: 'Summarized from Breines & Chen (2012) and Kristin Neff’s definitions.' } },
        { heading: 'What the research says, and what it does not', paragraphs: [
          'Across 56 randomized trials, self-compassion programs showed small-to-medium short-term reductions in stress, anxiety and depressive symptoms, although the overall risk of bias in those studies was high. A separate meta-analysis of 27 randomized trials found improvements in outcomes such as rumination, self-criticism, stress and depression. These are real but modest effects, mostly measured over weeks or months.',
          'Breines and Chen mostly studied university students and measured motivation in the short term. So the honest claim is not that self-compassion guarantees success. It is that kindness and high standards do not have to be enemies.',
        ] },
      ],
      example: { title: 'Daniel, 34, project manager', text: 'Daniel missed a deadline on a client report because he had underestimated how long the data cleaning would take. On the train home his head ran the usual script: sloppy, unprofessional, you always do this. He noticed he was also drafting excuses to send his boss. He tried a different question: what would he say to a colleague in the same spot? Probably that this was a real miss, that it happens to good people, and that the useful thing now was a new date and a better estimate next time. He typed that into his phone. The next morning he told his boss plainly what had happened, gave a realistic date and added a buffer line to his planning template. The report went out two days late. The template change stayed.' },
      practice: [
        'Write down, word for word, the last harsh thing you said to yourself after a mistake.',
        'Rewrite it the way you would say it to a good friend in the same situation, keeping the facts but dropping the contempt.',
        'Add one sentence that names a concrete next step, so the kind version still points toward doing better.',
      ],
      reflection: 'What do you fear would happen if you stopped being hard on yourself?',
      question: 'In Breines and Chen’s experiments, what happened when people took a self-compassionate view of a failure?',
      options: [
        'They became more motivated to improve, for example studying longer after a failed test.',
        'They stopped caring about the result.',
        'They felt better but made no more effort than anyone else.',
      ], correct: 0,
      feedback: 'Compared with self-esteem boosting or neutral conditions, self-compassion increased motivation to improve and to make amends. Kindness lowered the fear of looking at the mistake.',
      takeaway: 'You can hold a high standard and still be on your own side.',
      sources: ['state-self-compassion-motivation', 'compassion-neff-definition', 'compassion-neff-exercises', 'self-compassion', 'compassion-ferrari'],
      visual: { kind: 'compare', title: 'After a mistake: inner critic or inner coach?',
        left: { label: 'Inner critic', items: ['Attacks the person: I am useless.', 'Makes looking at the mistake painful, so you avoid it.', 'Adds fear to the next attempt.'] },
        right: { label: 'Compassionate coach', items: ['Names the behavior: that estimate was off.', 'Makes it safe to study what happened.', 'Points to one next step.'] },
        note: 'Our own summary of the contrast between self-judgment and self-kindness.' },
      technique: { name: 'How would you treat a friend?', origin: 'Kristin Neff · Self-Compassion (2011)',
        steps: [
          'Think of a time a close friend felt bad about a mistake or a struggle, and recall how you responded, including your words and your tone.',
          'Now think of a time you felt bad about yourself, and recall how you responded to yourself.',
          'Notice the difference between the two responses and ask yourself what drives it.',
          'Write down how you might respond to yourself if you treated yourself the way you treat that friend.',
          'Try that response the next time you struggle, and notice what changes.',
        ],
        evidence: 'This reflection exercise has not been tested on its own. It targets the core of self-compassion as Neff defines it, and self-compassion programs that include exercises like it show small-to-medium short-term benefits in randomized trials.',
        sourceId: 'compassion-neff-exercises' },
      photo: { id: '1474418397713-7ede21d49118', alt: 'A person sitting on a rock, watching the sun rise over the mountains' } },

    { id: 'compassion-2', title: 'The three parts', minutes: 9,
      goal: 'Learn Neff’s three components of self-compassion and spot the one you most often miss.',
      reading: [
        'Neff describes self-compassion as three parts working together. The first is self-kindness instead of self-judgment: being warm and supportive toward yourself when you struggle, rather than cold and cutting. The second is common humanity instead of isolation: remembering that suffering and imperfection are part of being human, not proof that something is uniquely wrong with you. The third is mindfulness instead of over-identification: seeing a painful feeling clearly, without pushing it away and without letting it swallow everything else. Each part has an opposite that most of us know well, and each one supports the other two.',
        'The parts are easiest to see when one is missing. Kindness without mindfulness can turn into rushing to feel better before you have even admitted what hurts. Mindfulness without common humanity can leave you seeing your pain clearly but feeling utterly alone in it. Common humanity without kindness can sound like a shrug: everyone fails, so what. Together they sound more like this: this is painful, other people have been here too, and I can treat myself decently while I deal with it. You do not need to feel all three strongly. Noticing which one is weakest for you is a useful start.',
      ],
      deeper: [
        { heading: 'What self-compassion is not', paragraphs: [
          'Neff separates self-compassion from three look-alikes. Self-esteem depends on judging yourself positively, often by feeling special or above average, so it tends to disappear exactly when you fail. Self-pity focuses on your own troubles and forgets that other people have them too. Self-indulgence trades long-term wellbeing for short-term pleasure. Self-compassion, in her account, offers a steadier sense of worth that does not have to be won.',
        ],
          visual: { kind: 'compare', title: 'Two different questions',
            left: { label: 'Self-esteem asks', items: ['Am I better than others?', 'Did I succeed this time?', 'Am I good enough to deserve respect?'] },
            right: { label: 'Self-compassion asks', items: ['What do I need right now?', 'What would help me learn from this?', 'How can I care for myself while I fix it?'] },
            note: 'Our own illustration of the distinction Kristin Neff draws.' } },
        { heading: 'Common mistakes', paragraphs: [
          'The first mistake is treating self-compassion as a feeling you must produce. You do not have to feel warm; the intention to be kind already counts. The second is using the three parts to dodge responsibility, for example by saying everyone makes mistakes and then not repairing the one you made. Common humanity is meant to reduce isolation, not to dissolve accountability.',
          'The third mistake is expecting it to feel natural straight away. If you have spoken to yourself harshly for years, kindness can feel awkward or even uncomfortable at first. Keep the practice short and light, and treat the awkwardness as part of learning something new.',
        ] },
      ],
      example: { title: 'Aisha, 27, junior doctor', text: 'After a long shift, Aisha sat down with a notebook. Earlier that day she had missed a drug interaction that the pharmacist caught. Her first line was pure judgment: dangerous, should never have qualified. Underneath she wrote the three parts. Mindfulness: I feel scared and ashamed, and my chest is tight. Common humanity: interaction errors are a known risk, which is exactly why pharmacists double-check, and colleagues she respected had told her about their own near misses. Kindness: I am tired, and this hurts because I care about my patients. Then she added what she would do: read up on that class of drugs and ask her supervisor how the team flags these interactions. She did not feel great. She did sleep, and she did both things the next day.' },
      practice: [
        'Recall a recent difficult moment and write one sentence for each part: what you feel, who else has faced something like it, and one kind thing you can say to yourself.',
        'Mark the sentence that was hardest to write; that part is your practice edge for this week.',
        'Before the day ends, use that hardest part once more in a small moment of stress.',
      ],
      reflection: 'Which of the three opposites is most familiar to you: self-judgment, isolation, or being swallowed by the feeling?',
      question: 'Which set lists Neff’s three components of self-compassion?',
      options: [
        'Self-kindness, common humanity and mindfulness.',
        'Self-esteem, positive thinking and confidence.',
        'Self-discipline, perfectionism and resilience.',
      ], correct: 0,
      feedback: 'Neff pairs each part with an opposite: self-kindness with self-judgment, common humanity with isolation, and mindfulness with over-identification.',
      takeaway: 'This hurts, I am not alone in it, and I can be kind to myself while I deal with it.',
      sources: ['compassion-neff-definition', 'compassion-neff-exercises', 'self-compassion'],
      visual: { kind: 'table', title: 'Three parts and their opposites', columns: ['Part', 'Its opposite', 'What it can sound like'],
        rows: [
          ['Self-kindness', 'Self-judgment', 'This is hard, and I am doing my best with it.'],
          ['Common humanity', 'Isolation', 'Other people struggle with this too.'],
          ['Mindfulness', 'Over-identification', 'I notice that I feel ashamed right now.'],
        ],
        note: 'Components from Kristin Neff; the example sentences are our own.' },
      technique: { name: 'Self-compassion journal', origin: 'Kristin Neff · Self-Compassion (2011)',
        steps: [
          'At the end of the day, write down anything that made you feel bad, anything you judged yourself for, or any difficult experience.',
          'For mindfulness, name the feelings as they are, without drama and without dismissing them.',
          'For common humanity, write how this experience connects you with other people who have felt the same.',
          'For self-kindness, write a few understanding, supportive words to yourself, in the tone you would use with a friend.',
          'Keep it short; a few lines each evening is enough.',
        ],
        evidence: 'The journal has not been tested on its own. The evidence is for self-compassion programs as a whole, which show small-to-medium short-term benefits in randomized trials.',
        sourceId: 'compassion-neff-exercises' },
      photo: { id: '1529156069898-49953e39b3ac', alt: 'Friends sitting arm in arm, seen from behind' } },

    { id: 'compassion-3', title: 'The self-compassion break', minutes: 8,
      goal: 'Learn a two-minute practice for the moment something hurts.',
      reading: [
        'The self-compassion break is Neff’s short practice for the moment itself: the email you regret sending, the bad news, the argument that just ended. It follows the three parts in order. First you acknowledge that this is a moment of suffering, in plain words, such as this hurts or this is stressful. Then you remind yourself that struggle is part of life and that other people feel this way too. Finally you offer yourself some kindness, often with a hand on your heart or another gentle touch, and ask what you need to hear right now.',
        'The words matter less than the direction. Some people find the idea of a moment of suffering too dramatic and prefer something like ouch, this is hard. Others dislike the hand on the chest and rest a hand on their arm instead, or simply breathe out slowly. The point is to turn toward the pain instead of away from it, to loosen the sense of being the only one, and to add warmth. The practice takes about two minutes. It is not meant to fix the problem, but it can steady you enough to face it.',
      ],
      deeper: [
        { heading: 'Why supportive touch?', paragraphs: [
          'Neff suggests supportive touch because warm, gentle contact is one of the most basic ways people are soothed, from infancy on. You do not have to believe in it for it to be worth trying. Many people find that a hand on the chest or a gentle squeeze of their own arm makes kind words feel less abstract.',
          'If touch does not feel safe or pleasant for you, skip it. The practice works through attention and tone, not through any particular gesture.',
        ],
          visual: { kind: 'compare', title: 'Meeting a painful moment',
            left: { label: 'Turning away', items: ['Distract, scroll or push through without noticing.', 'Tell yourself you should not feel this way.', 'Replay what you did wrong.'] },
            right: { label: 'Turning toward', items: ['Name it: this is hard.', 'Remember that others feel this too.', 'Offer one kind sentence or gesture.'] },
            note: 'Our own summary of the logic of the self-compassion break.' } },
        { heading: 'What the research says', paragraphs: [
          'The self-compassion break is part of Mindful Self-Compassion, an eight-week program developed by Neff and psychologist Christopher Germer. In their randomized trial with community adults, people who took the program showed larger increases in self-compassion, mindfulness, compassion for others and life satisfaction, and larger decreases in depression, anxiety and stress, than people on a waitlist. The gains were still there six months and one year later.',
          'It was a small trial, the comparison was a waitlist rather than another active course, and the developers ran it themselves. The two-minute break has not been tested on its own. It is best seen as one practical piece of a program with promising, not definitive, support.',
        ] },
        { heading: 'If it stirs up pain', paragraphs: [
          'Sometimes kindness toward yourself brings old hurt to the surface, the way warmth can make cold hands ache at first. That is not a sign that you are doing it wrong. Make the practice shorter, open your eyes, feel your feet on the floor, or stop and do something ordinary. If painful memories keep flooding in, or they are linked to trauma or abuse, please work with a qualified therapist rather than pushing on alone.',
        ] },
      ],
      example: { title: 'Tomás, 45, bus driver', text: 'Tomás received a formal complaint from a passenger who said he had closed the doors on her. He had not seen her, and he felt sick about it all through his break. Sitting in the depot canteen, he tried the self-compassion break for the first time. He said in his head: this is really stressful. Then: every driver he knew had had a complaint at some point. He rested a hand on his forearm, which felt less odd than his chest, and asked what he needed to hear. The answer was simple: you are careful, and you can tighten your routine. The knot did not vanish, but it loosened. He wrote a calm reply to his supervisor that included one change: an extra mirror check before closing the doors at busy stops.' },
      practice: [
        'Pick a small stress from today and bring it to mind until you feel a little of it in your body.',
        'Say three phrases silently: one that names the pain, one that remembers others feel this too, and one kind wish for yourself.',
        'Add a gentle gesture if it feels right, then write one line about what you need next.',
      ],
      reflection: 'Which words would sound both kind and believable to you in a hard moment?',
      question: 'What is the order of the self-compassion break?',
      options: [
        'Acknowledge the pain, remember common humanity, then offer yourself kindness.',
        'Solve the problem first, then try to feel better about it.',
        'List your achievements until the feeling passes.',
      ], correct: 0,
      feedback: 'The break follows Neff’s three parts: mindfulness of the pain, common humanity, then self-kindness. It steadies you so you can face the problem; it does not replace that step.',
      takeaway: 'Two minutes of turning toward the pain can steady you enough to deal with it.',
      sources: ['compassion-neff-exercises', 'compassion-mindful-self-compassion-rct', 'compassion-neff-definition'],
      visual: { kind: 'steps', title: 'The self-compassion break',
        steps: [
          { label: 'Name it', text: 'This hurts. This is stressful. Ouch.' },
          { label: 'Remember others', text: 'Other people feel this too; I am not alone in it.' },
          { label: 'Offer kindness', text: 'A hand on the heart or arm, and a wish to be kind to yourself.' },
          { label: 'Ask', text: 'What do I need to hear, or do, right now?' },
        ],
        note: 'Retold in our own words from Kristin Neff’s practice; choose phrases that feel natural to you.' },
      technique: { name: 'Self-compassion break', origin: 'Kristin Neff · Self-Compassion (2011); Mindful Self-Compassion program with Christopher Germer',
        steps: [
          'Bring to mind a situation that is causing you stress or pain right now, and let yourself feel a little of it.',
          'Acknowledge the pain in simple words, such as this hurts or this is hard.',
          'Remind yourself that struggle is part of being human and that others feel this way too.',
          'Place a hand on your heart or another comforting spot and feel its warmth.',
          'Offer yourself a kind wish or ask what you need to hear, and say that to yourself.',
        ],
        evidence: 'The break is part of the Mindful Self-Compassion program, which showed benefits over a waitlist in a small randomized trial with follow-up to one year. The short break on its own has not been tested in a trial.',
        sourceId: 'compassion-neff-exercises' },
      photo: { id: '1499209974431-9dddcece7f88', alt: 'A person opening their arms toward the setting sun' } },

    { id: 'compassion-4', title: 'Threat, drive and soothing', minutes: 10,
      goal: 'Use Paul Gilbert’s three-systems model to notice which system is running you, and how to call on soothing.',
      reading: [
        'British psychologist Paul Gilbert developed compassion-focused therapy, or CFT, after noticing that many people with high shame and self-criticism could follow the logic of therapy but still could not feel any warmth or reassurance. His model describes three emotion systems. The threat system detects danger and responds with anxiety, anger or disgust, pushing you to fight, flee or freeze. The drive system seeks rewards and achievements and brings excitement and wanting. The soothing system brings a sense of safeness, contentment and connection when you are neither under threat nor chasing something.',
        'All three are useful. Problems start when they fall out of balance. A harsh inner critic keeps the threat system switched on, and many people try to escape it by overworking the drive system: if I achieve enough, I will finally feel safe. That rarely lasts, because achievement is not what the threat system is waiting for. Gilbert’s idea is that compassion, including compassion toward yourself, strengthens the soothing system, which can calm threat from the inside. Slower breathing, a warm inner voice, the image of a kind face and the feeling of being cared for are all ways in.',
      ],
      deeper: [
        { heading: 'What each system feels like', paragraphs: [
          'It helps to learn the signature of each system in your own body and thoughts. You cannot argue a system into switching off, but you can notice which one is driving and choose what to feed.',
        ],
          visual: { kind: 'table', title: 'The three systems at a glance', columns: ['System', 'Feels like', 'Typical thought', 'What helps'],
            rows: [
              ['Threat', 'Tight chest, racing heart, anger or dread', 'Something is wrong; I am not safe.', 'Slowing down, cues of safety, a kind voice'],
              ['Drive', 'Buzz, wanting, restlessness', 'I need to get or achieve more.', 'Enjoying it, then pausing on purpose'],
              ['Soothing', 'Slower breathing, warmth, ease', 'I am okay right now.', 'Connection, rest, compassion practices'],
            ],
            note: 'Based on Paul Gilbert’s model; the examples are our own simplification.' } },
        { heading: 'What the research says', paragraphs: [
          'The three-systems model is a clinical framework that draws on evolutionary and brain research, not a precise map of brain circuits, and Gilbert presents it as a simplification. Evidence for CFT as a therapy is growing but still early.',
          'Research on warmth practices gives a sense of scale. A meta-analysis of loving-kindness and compassion meditation found that, in randomized studies, these practices increased everyday positive emotions compared with waitlists. Practices centered on loving-kindness showed a clearer effect than those centered on compassion, whose estimate was smaller and not statistically certain.',
        ],
          visual: { kind: 'bars', title: 'Kindness meditation and daily positive emotions',
            bars: [
              { label: 'Loving-kindness focused', value: 0.424, display: 'g = 0.424' },
              { label: 'Compassion focused', value: 0.286, display: 'g = 0.286' },
            ],
            note: 'Standardized effect sizes from a meta-analysis of 24 studies with 1,759 people. The compassion-focused estimate had a confidence interval that included zero, and 38.9% of the studies had a high risk of bias. This is not a test of CFT or of this lesson.',
            sourceId: 'meditation-lovingkindness' } },
      ],
      example: { title: 'Mei, 38, accountant', text: 'In the last week of the quarter, Mei noticed she had answered emails at midnight three nights running. Using Gilbert’s model, she asked which system was running her. Drive, clearly, but underneath it threat: a fear that one missed error would expose her as incompetent. More work was feeding the wrong system. That evening she set a timer for five minutes, slowed her breathing until each out-breath was a little longer than the in-breath, and let the voice in her head sound like the kind manager she once had. It felt silly for the first minute. By the end her shoulders had dropped. She closed the laptop at ten, left a note of three tasks for the morning, and slept better than she had all week.' },
      practice: [
        'Pause three times today and ask which system is loudest right now: threat, drive or soothing.',
        'When it is threat, slow your breathing for one minute, letting each out-breath be a little longer than the in-breath.',
        'Picture a warm, wise presence, real or imagined, and let it say one kind sentence to you.',
      ],
      reflection: 'When your threat system fires, do you usually try to calm it or to outrun it with more achievement?',
      question: 'In Gilbert’s model, which system helps calm the threat system from the inside?',
      options: [
        'The soothing system, fed by safeness, connection and compassion.',
        'The drive system, by achieving more.',
        'The threat system itself, by planning for every danger.',
      ], correct: 0,
      feedback: 'Achievement can distract from threat for a while, but in Gilbert’s model it is the soothing system, built through warmth and connection, that brings a sense of safeness.',
      takeaway: 'You cannot achieve your way out of feeling unsafe, but you can learn to soothe.',
      sources: ['compassion-gilbert-cft', 'compassion-gilbert-mind', 'meditation-lovingkindness'],
      visual: { kind: 'cycle', title: 'Three emotion systems', center: 'Balance',
        nodes: [
          { label: 'Threat', text: 'Detects danger: anxiety, anger, self-criticism. Protects you, but narrows attention.' },
          { label: 'Drive', text: 'Seeks rewards and goals: wanting, excitement, achievement.' },
          { label: 'Soothing', text: 'Safeness, contentment and connection; calms threat and steadies drive.' },
        ],
        note: 'After Paul Gilbert’s compassion-focused therapy. The systems interact, and none of them is bad.' },
      technique: { name: 'Soothing rhythm breathing and the compassionate self', origin: 'Paul Gilbert · The Compassionate Mind (2009)',
        steps: [
          'Sit comfortably with your feet on the floor and let your breathing slow a little, without forcing it.',
          'Let each out-breath be slightly longer than the in-breath, and find a gentle, even rhythm.',
          'Soften your face and, if it helps, allow a slight, friendly expression.',
          'Imagine yourself at your wisest and kindest: calm, strong and caring. Notice how that version of you would sit and speak.',
          'From there, say one sentence to the part of you that is struggling.',
        ],
        evidence: 'These are core exercises in compassion-focused therapy. CFT is a developing approach with early but encouraging evidence; the exercises have not been tested here as standalone self-help, and they are not a substitute for therapy.',
        sourceId: 'compassion-gilbert-mind' },
      photo: { id: '1441974231531-c6227db76b6e', alt: 'Sunlight falling through a calm forest' } },

    { id: 'compassion-5', title: 'Shame and guilt', minutes: 10,
      goal: 'Tell shame from guilt, and use four steps to move through shame instead of hiding.',
      reading: [
        'Researcher Brené Brown draws a simple line between the two. Guilt is about something you did: that was a bad thing to do. Shame is about who you are: I am bad. The distinction builds on research by psychologist June Tangney and colleagues. Guilt focuses on a specific behavior and tends to point toward repair: apologizing, confessing, making things right. Shame targets the whole self. It makes people want to hide, deny or lash out, and in research it is linked with anger, defensiveness and distress rather than with doing better. Guilt can be uncomfortable and still useful. Shame mostly shrinks you.',
        'From her interview research, Brown developed what she calls shame resilience: not avoiding shame, which nobody manages, but moving through it without losing yourself. She describes four elements. Recognize shame and know your triggers, including how it shows up in your body. Practice critical awareness, which means reality-checking the messages and expectations behind the shame. Reach out to someone you trust and tell your story. And speak shame: name it out loud instead of letting it work in silence. Self-compassion supports every step, because it turns a global verdict back into a specific event you can deal with.',
      ],
      deeper: [
        { heading: 'The four elements in practice', paragraphs: [
          'Brown’s study described shame resilience as a set of skills rather than a fixed trait, which means it can be practiced. The steps below retell her four elements in our own words. You do not have to do them in a perfect order; recognizing shame is usually the hardest and most important part.',
        ],
          visual: { kind: 'steps', title: 'Four elements of shame resilience',
            steps: [
              { label: 'Recognize', text: 'Notice the body signals and the situations that trigger shame for you.' },
              { label: 'Reality-check', text: 'Ask whose expectations these are and whether they are realistic.' },
              { label: 'Reach out', text: 'Tell a trusted person what happened, instead of hiding it.' },
              { label: 'Speak shame', text: 'Name the feeling out loud: I feel ashamed about this.' },
            ],
            note: 'After Brené Brown’s shame resilience theory; the wording is ours.' } },
        { heading: 'Why guilt can help and shame rarely does', paragraphs: [
          'In Tangney’s research, people prone to guilt tended to show more empathy and to take reparative action, while people prone to shame were more likely to hide, feel defensive anger and blame others. That does not make guilt pleasant, and heavy guilt about things you did not cause is its own problem. But a clear, proportionate sense of having done something wrong is part of a working conscience.',
          'Self-compassion helps move shame toward healthy guilt. When you do not have to defend your whole worth, you can look at the specific thing you did and decide what repair it calls for.',
        ] },
        { heading: 'When to get more help', paragraphs: [
          'Shame that is persistent, that follows you across many situations, or that is tied to trauma or abuse deserves more than a four-step card. A qualified therapist can help, and compassion-focused therapy was designed with high shame in mind. If shame ever comes with thoughts of harming yourself, contact your local emergency number or a crisis line now.',
        ] },
      ],
      example: { title: 'Jonas, 31, teacher', text: 'Jonas snapped at a student in front of the class, and the boy went quiet for the rest of the lesson. By lunchtime Jonas had slid from I handled that badly to I am a terrible teacher and should not be doing this job. He recognized the familiar heat in his face and the urge to avoid the staffroom. Then he reality-checked: one harsh moment in six years, on a day with too little sleep, did not cancel his whole career. He reached out to a colleague he trusted and told her what had happened. Saying it out loud, he could separate the two things: he was not a bad teacher, but he had done something that needed repair. The next morning he apologized to the student privately and asked how he was doing.' },
      practice: [
        'Recall a recent moment when you felt bad about yourself and write down the exact sentence in your head.',
        'Check whether it is guilt about an action or shame about your whole self, and rewrite any shame sentence as a specific behavior.',
        'Decide whether that behavior needs repair, and if it does, name the smallest honest step, such as an apology or a correction.',
      ],
      reflection: 'Who is one person you could reach out to the next time shame makes you want to hide?',
      question: 'Which statement is guilt rather than shame?',
      options: [
        'I was rude to her, and I need to apologize.',
        'I am a horrible person.',
        'I always ruin everything.',
      ], correct: 0,
      feedback: 'Guilt focuses on a specific behavior and points toward repair. The other two are global verdicts about the self, which is how shame speaks.',
      takeaway: 'Name what you did, not what you are, and repair what you can.',
      sources: ['compassion-brown-shame-resilience', 'compassion-brown-practice', 'compassion-tangney-moral-emotions', 'compassion-gilbert-cft'],
      visual: { kind: 'compare', title: 'Shame or guilt?',
        left: { label: 'Shame', items: ['I am bad.', 'Focuses on the whole self.', 'Pushes you to hide, deny or blame others.', 'Linked with defensive anger and distress.'] },
        right: { label: 'Guilt', items: ['I did something bad.', 'Focuses on a specific action.', 'Pushes you toward apology and repair.', 'Linked with empathy.'] },
        note: 'After June Tangney’s research and Brené Brown’s distinction. Excessive guilt can also be harmful.' },
      technique: { name: 'Shame resilience', origin: 'Brené Brown · I Thought It Was Just Me (2007)',
        steps: [
          'When you feel exposed, small or unworthy, name the feeling to yourself as shame.',
          'Notice where you feel it in your body and what situation set it off.',
          'Reality-check the message: whose expectation is this, and is it realistic?',
          'Reach out to one trusted person and tell them what happened.',
          'Speak about the shame directly, and ask for what you need.',
        ],
        evidence: 'Shame resilience theory comes from qualitative interview research, which describes patterns rather than testing an intervention. The distinction between shame and guilt behind it is well supported by research on moral emotions.',
        sourceId: 'compassion-brown-practice' },
      photo: { id: '1544027993-37dbfe43562a', alt: 'Two hands reaching toward each other' } },

    { id: 'compassion-6', title: 'A letter to yourself, and compassionate accountability', minutes: 12,
      goal: 'Write a compassionate letter about something you regret or dislike in yourself, and turn it into one accountable step.',
      reading: [
        'Neff’s letter exercise asks you to write about something that makes you feel bad about yourself, such as a mistake, a habit or a trait, from the point of view of an imaginary friend who loves you unconditionally. This friend knows all your strengths and weaknesses, including the thing you are struggling with. They understand how your history and circumstances shaped you, and they are kind without being blind. Writing in their voice gives you a little distance from the critic. It also tends to produce a more balanced account of what happened than the one your threat system writes.',
        'A compassionate letter is not an excuse note. The loving friend would also want you to change what harms you or others, and that is where accountability comes in. Neff calls this the fierce side of self-compassion: protecting yourself, setting boundaries and pursuing goals because you care about your wellbeing, not because you reject yourself. Tender self-compassion comforts and accepts; fierce self-compassion acts. So end your letter with the friend asking a practical question: given everything, what is one thing you could do differently, and what support would help you do it?',
      ],
      deeper: [
        { heading: 'How to write the letter', paragraphs: [
          'Take fifteen minutes somewhere private. Write by hand if you can, and do not edit for style. Then put the letter away and read it again later, letting the words land.',
        ],
          visual: { kind: 'steps', title: 'Writing a compassionate letter',
            steps: [
              { label: 'Choose', text: 'Pick one thing you feel bad about, not your whole life story.' },
              { label: 'Imagine', text: 'Picture a friend who loves you unconditionally and knows the full context.' },
              { label: 'Write', text: 'Let them tell you what they understand, what they feel for you and what they hope for you.' },
              { label: 'Ask', text: 'End with one practical change and the support you would need.' },
              { label: 'Reread', text: 'Put it away, reread it later and notice how it lands.' },
            ],
            note: 'Retold in our own words from Kristin Neff’s letter exercise.' } },
        { heading: 'Tender and fierce, together', paragraphs: [
          'Most of us lean toward one side. Some people comfort themselves well but never set a limit; others push hard for change but never rest. Neff’s point is that both are forms of care. A parent who only soothes and a parent who only pushes are each offering half of what a child needs.',
          'Compassionate accountability uses both. It names the harm honestly, feels the discomfort without collapsing into shame, repairs what can be repaired and plans one change. Breines and Chen’s findings fit here: when people met a moral mistake with self-compassion, they were more motivated to make amends and to avoid repeating it.',
        ] },
        { heading: 'What the research says', paragraphs: [
          'The letter is one of the practices taught in the Mindful Self-Compassion program, whose randomized trial found benefits over a waitlist that lasted to the one-year follow-up. A meta-analysis of 27 randomized trials of self-compassion interventions found improvements in outcomes such as rumination, self-criticism, depression and anxiety. The letter itself has not been tested in isolation, and the research base is still made up of mostly small studies, so it is fair to treat it as a promising practice rather than a proven treatment.',
        ] },
      ],
      example: { title: 'Rosa, 52, shop owner', text: 'For years Rosa had hated how she handled money: she avoided opening letters from the bank until they piled up. She wrote a letter to herself from an imaginary friend who knew her well. The friend understood that she had grown up in a house where bills meant shouting, so avoiding them had once kept her safe. The friend also said, gently and clearly, that the pile was hurting her now and that she deserved better than dread. At the end the friend asked for one change. Rosa chose Saturday at nine, coffee in hand, to open every letter from the week, and asked her son to sit with her the first time. She reread the letter a week later. The pile was smaller, and the dread a little quieter.' },
      practice: [
        'Choose one thing about yourself that you feel bad about, and set a timer for fifteen minutes.',
        'Write a letter to yourself from the point of view of a friend who loves you unconditionally and knows the full context.',
        'End the letter with one concrete, accountable change and the support you will ask for, then put that change in your calendar.',
      ],
      reflection: 'Which do you lean on more, tender or fierce self-compassion, and what would the other one add?',
      question: 'What makes self-compassion accountable in this lesson?',
      options: [
        'It combines comfort with honest naming of harm, repair and one concrete change.',
        'It means never feeling bad about anything you do.',
        'It means punishing yourself enough that you never repeat the mistake.',
      ], correct: 0,
      feedback: 'Tender and fierce self-compassion work together: comfort keeps shame from taking over, and fierce care turns the lesson into repair and change.',
      takeaway: 'Love that tells the truth, then helps you do something about it.',
      sources: ['compassion-neff-exercises', 'compassion-neff-definition', 'compassion-mindful-self-compassion-rct', 'compassion-ferrari', 'state-self-compassion-motivation', 'self-compassion'],
      visual: { kind: 'table', title: 'Tender and fierce self-compassion', columns: ['Question', 'Tender', 'Fierce'],
        rows: [
          ['What it does', 'Comforts, soothes, accepts', 'Protects, sets boundaries, pursues goals'],
          ['What it can sound like', 'This is hard, and I am here for you.', 'This is not okay, and I will do something about it.'],
          ['When you may need it', 'You are hurting or grieving.', 'A line has been crossed or a goal matters.'],
          ['Without the other', 'Can drift into avoidance.', 'Can harden into harshness.'],
        ],
        note: 'Tender and fierce self-compassion as described by Kristin Neff; the last row is our own reading.' },
      technique: { name: 'Compassionate letter', origin: 'Kristin Neff · Self-Compassion (2011)',
        steps: [
          'Choose something about yourself that makes you feel inadequate, ashamed or not good enough.',
          'Imagine a friend who loves and accepts you unconditionally, knows all your strengths and weaknesses, and understands your history.',
          'Write a letter to yourself from that friend’s perspective about the thing you are struggling with.',
          'Let the friend acknowledge your pain, remind you that everyone is imperfect, and suggest, kindly, what might help you change.',
          'Put the letter aside, then come back later and read it again slowly.',
        ],
        evidence: 'The letter is part of the Mindful Self-Compassion program, which showed benefits over a waitlist in a small randomized trial. The letter has not been tested on its own.',
        sourceId: 'compassion-neff-exercises' },
      photo: { id: '1455390582262-044cdead277a', alt: 'A hand writing in a notebook with a pen' } },
  ],
};
