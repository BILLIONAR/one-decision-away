import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * Edición en español de «Erteleme» (procrastination), traducida de la edición
 * en inglés. Los ids de lecciones, el número de prácticas y la posición de las
 * respuestas correctas coinciden con las demás ediciones; las fuentes
 * traducidas conservan sus ids. El estudio de Ariely y Wertenbroch (2002) sobre
 * plazos autoimpuestos fue retractado el 2 de septiembre de 2026 y no se cita
 * a propósito. Las fuentes base compartidas 'mcii', 'self-compassion' y
 * 'monitoring' se traducen en ./confidence.ts. Las fuentes nuevas
 * (septiembre de 2026) llevan el prefijo 'procrastination-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'procrastination-interventions', title: 'van Eerde y Klingsieck · 2018 · Metaanálisis de intervenciones contra la procrastinación', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1747938X18300472', type: 'research', finding: 'Un metaanálisis que reunió 24 estudios (N = 1,173) encontró una gran reducción de la procrastinación tras las intervenciones (efecto promedio antes–después −1.07); la reducción se mantuvo en las mediciones de seguimiento, y los resultados más sólidos vinieron de la terapia cognitivo-conductual.', limitation: 'Como el valor se calculó a partir de diferencias antes–después y no frente a un grupo de control, el efecto puede parecer mayor de lo que es; solo se leyó el resumen, y este curso de ODA no ha sido puesto a prueba.' },
  { id: 'task-aversiveness', title: 'Steel · 2007 · Metaanálisis de las causas de la procrastinación', url: 'https://studypedia.au.dk/fileadmin/www.studiemetro.au.dk/Procrastination_2.pdf', type: 'research', finding: 'En un metaanálisis basado en 691 correlaciones, la procrastinación se relacionó con que la tarea resulte aversiva (r = 0.40), el bajo autocontrol (r = −0.58), la baja autoeficacia (r = −0.38) y la impulsividad (r = 0.41), pero casi nada con la intención de trabajar (r = 0.03). Steel estima que la procrastinación afecta de forma crónica a alrededor de 15–20% de los adultos y que entre 80% y 95% de los estudiantes universitarios procrastina en algún grado. Propone la teoría de la motivación temporal: el atractivo de una tarea crece con lo probable que parezca el éxito (expectativa) y con lo gratificante que sea (valor), y disminuye cuanto más lejos está la recompensa (demora) y cuanto más sensible es una persona a la demora.', limitation: 'Los hallazgos son correlacionales y no muestran causa y efecto; en el PDF que se leyó se habían perdido los signos menos, así que la dirección de las relaciones se dedujo de la redacción del texto. La teoría de la motivación temporal es un modelo que encaja con estos hallazgos, no un tratamiento probado.' },
  { id: 'mood-repair', title: 'Sirois y Pychyl · 2013 · Procrastinación y reparación del estado de ánimo', url: 'https://eprints.whiterose.ac.uk/91793/1/Compass%20Paper%20revision%20FINAL.pdf', type: 'research', finding: 'Esta revisión teórica explica la procrastinación como un intento de aliviar, en el momento, el malestar que crea una tarea aversiva, y sostiene que el costo se traslada al yo del futuro; un pequeño análisis que reporta encontró la procrastinación ligada a una baja autocompasión (r = −0.31).', limitation: 'Es una revisión narrativa sin datos nuevos, y el valor r = −0.31 proviene de un estudio aún no publicado en ese momento; se leyó la versión aceptada del autor.' },
  { id: 'self-forgiveness', title: 'Wohl, Pychyl y Bennett · 2010 · Autoperdón y procrastinación', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0191886910000474', type: 'research', finding: 'Entre 119 estudiantes de primer año seguidos durante dos exámenes parciales, quienes se perdonaron más por haber procrastinado en el primer examen procrastinaron menos al prepararse para el segundo, y una reducción de los sentimientos negativos explicó ese vínculo.', limitation: 'El estudio es correlacional, no experimental; se hizo en un solo curso y grupo de estudiantes, y de las 312 personas de la primera medición solo 119 quedaron en el análisis.' },
  { id: 'mcii-procrastination', title: 'Zhou et al. · 2026 · Un experimento sobre WOOP (MCII) y la procrastinación', url: 'https://www.sciencedirect.com/science/article/pii/S0001691825014829', type: 'research', finding: 'En un estudio aleatorizado con 81 estudiantes universitarios, el grupo que usó WOOP (Wish, Outcome, Obstacle, Plan; deseo, resultado, obstáculo, plan) encontró sus tareas menos aversivas y empezó su tarea en 58.8% de los días; en el grupo de control, que solo pensaba en positivo, la cifra fue 47.3%.', limitation: 'Un estudio pequeño hecho en una sola universidad, con una semana de seguimiento y sin preinscripción (tasa de abandono de 19.8%); este curso de ODA no ha sido puesto a prueba.' },
  { id: 'if-then-plans', title: 'Gollwitzer y Sheeran · 2006 · Metaanálisis de los planes «si… entonces…»', url: 'https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021', type: 'research', finding: 'En 94 pruebas independientes, los planes «Si … pasa, entonces yo …» que responden de antemano cuándo, dónde y cómo actuar mostraron un efecto positivo de mediano a grande sobre el logro de metas (d = 0.65).', limitation: 'Solo se leyó el resumen; no se revisaron los análisis más recientes que corrigen el sesgo de publicación, por lo que el efecto real puede ser menor, y el trabajo no es específico de la procrastinación.' },
  { id: 'procrastination-pychyl-start', title: 'Timothy A. Pychyl · 2008 · «Just get started» (Psychology Today, blog Don’t Delay)', url: 'https://www.psychologytoday.com/us/blog/dont-delay/200803/just-get-started', type: 'guidance', finding: 'El investigador de la procrastinación Tim Pychyl describe datos de muestreo de experiencias de su laboratorio: las tareas que la gente calificaba como muy estresantes y desagradables mientras las evitaba se sentían mucho menos aversivas una vez que realmente empezaban, y quienes hacían aunque fuera un inicio parcial se sentían más en control y más optimistas al día siguiente. También señala que la creencia «mañana tendré más ganas» rara vez se cumple.', limitation: 'Una entrada de blog que resume la investigación del propio autor para el público general, no un artículo revisado por pares; el propio Pychyl presenta empezar como un primer paso, no como una solución completa.' },
  { id: 'procrastination-pomodoro', title: 'Francesco Cirillo · La Técnica Pomodoro (sitio oficial)', url: 'https://www.pomodorotechnique.com/francesco-cirillo/', type: 'technique', finding: 'Cirillo creó la técnica en la década de 1980 mientras le costaba concentrarse en sus estudios universitarios, usando un temporizador de cocina con forma de tomate («pomodoro» es tomate en italiano); su primer experimento fue ver si podía estudiar solo dos minutos sin interrupción. La técnica se enseña ampliamente como bloques de 25 minutos de concentración separados por descansos cortos. Cirillo subraya que el objetivo no es acumular pomodoros, sino tomar conciencia de lo que ocurre en tu mente mientras trabajas.', limitation: 'Es el sitio del propio creador, no una evaluación independiente; la técnica en su conjunto no se ha puesto a prueba en ensayos controlados. La duración exacta de los bloques y los descansos son convenciones, no hallazgos de investigación.' },
  { id: 'procrastination-pomodoro-breaks', title: 'Biwer et al. · 2023 · Descansos «Pomodoro» frente a descansos autorregulados', url: 'https://cris.maastrichtuniversity.nl/en/publications/understanding-effort-regulation-comparing-pomodoro-breaks-and-sel/', type: 'research', finding: '87 estudiantes universitarios neerlandeses estudiaron con descansos elegidos por ellos (n = 35), con descansos de 6 minutos cada 24 minutos («Pomodoro», n = 25) o con descansos de 3 minutos cada 12 minutos (n = 27). Quienes eligieron sus descansos estudiaron y descansaron en tramos más largos, pero reportaron más fatiga y distracción y menos concentración y motivación. La finalización de la tarea y el esfuerzo mental no difirieron de forma relevante; los autores concluyen que los descansos fijos tuvieron beneficios en el ánimo y parecieron más eficientes.', limitation: 'Solo se leyó el resumen. Un estudio pequeño de estudio individual en una sola sesión con estudiantes universitarios; puso a prueba horarios de descanso, no la procrastinación directamente, y los grupos eran pequeños.' },
];

export const COURSE: GuidedCourse = {
  id: 'procrastination', title: 'Procrastinación', subtitle: 'No es pereza, es un sentimiento.',
  description: 'Nota el sentimiento que hay detrás de dejar las cosas para después, reduce la tarea, ata un plan a tu obstáculo real y vuelve después de procrastinar sin castigarte.',
  scope: 'Entrenamiento de habilidades para la procrastinación cotidiana; no es terapia. Si la procrastinación viene acompañada de ansiedad intensa, un estado de ánimo bajo que se prolonga o dificultades de atención y afecta claramente tu vida, puedes buscar el apoyo de un profesional.',
  outcome: 'Una tarea reducida, un plan «si… entonces…» y una frase para volver después de haber procrastinado.',
  photo: { id: '1758598304525-c2bc7aada66d', alt: 'Mujer trabajando con una laptop en un escritorio rodeado de plantas' },
  lessons: [
    { id: 'procrastination-1', title: 'El sentimiento detrás de dejar las cosas para después', minutes: 7,
      goal: 'Nombra el sentimiento que te despierta una tarea que has estado postergando.',
      reading: ['Dejar las cosas para después normalmente no es pereza. En una amplia revisión de la investigación, las personas que procrastinaban no tenían menos intención de trabajar que las demás; donde les costaba era en convertir la intención en acción. Según la misma revisión, entre 80% y 95% de los estudiantes universitarios procrastina en algún grado, y para un 15–20% estimado de los adultos es un problema crónico. No eres la única persona que vive con esto, y dice poco sobre tu carácter.', 'Cuanto más aburrida, poco clara o preocupante nos parece una tarea, más tendemos a postergarla. Una explicación, desarrollada por los investigadores Fuschia Sirois y Tim Pychyl, es que cuando procrastinamos, lo que evitamos no es la tarea en sí, sino el sentimiento que nos despierta: sentimos alivio en el momento y nuestro yo posterior paga el precio. Hoy intentaremos notar ese sentimiento sin juzgarlo. Ponerle nombre es el primer paso para manejarlo de otra manera.'],
      practice: ['Elige una tarea que has estado postergando desde hace un tiempo.', 'Cuando pienses en la tarea, nombra lo que sientes en una o dos palabras: temor, preocupación, incertidumbre u otra cosa.', 'Considera qué parte de la tarea despierta este sentimiento; no intentes resolverlo, solo anótalo.'],
      reflection: '¿Cuál es el sentimiento que de verdad hace difícil esta tarea para ti?', question: 'Según esta lección, ¿qué explica mejor la procrastinación?', options: ['Las personas que procrastinan en realidad no quieren trabajar.', 'Alejarse, en el momento, de un sentimiento desagradable que despierta la tarea.', 'La procrastinación es un rasgo de carácter que nunca cambia.'], correct: 1,
      feedback: 'Encontrar una tarea aversiva se relacionó con la procrastinación, mientras que la falta de intención casi no se relacionó. No son pruebas de causa y efecto, pero pueden suavizar la manera en que te ves a ti mismo.', takeaway: 'Lo que postergas suele ser un sentimiento, no una prueba de que eres perezoso.', sources: ['task-aversiveness', 'mood-repair', 'procrastination-pychyl-start'],
      visual: { kind: 'bars', title: 'Qué tan fuerte se relaciona cada factor con la procrastinación', sourceId: 'task-aversiveness',
        bars: [
          { label: 'Autocontrol (inverso)', value: 0.58, display: 'r = −0.58' },
          { label: 'Encontrar la tarea aversiva', value: 0.40, display: 'r = 0.40' },
          { label: 'Autoeficacia (inversa)', value: 0.38, display: 'r = −0.38' },
          { label: 'Intención de trabajar', value: 0.03, display: 'r = 0.03' },
        ],
        note: 'Las barras muestran la fuerza de cada relación con la procrastinación; un signo menos significa que la procrastinación sube cuando bajan el autocontrol o la autoeficacia. Son correlaciones y no muestran causa y efecto.' },
      deeper: [
        { heading: 'La visión de Tim Pychyl: un problema de sentimientos, no de tiempo', paragraphs: [
          'El psicólogo Tim Pychyl, investigador de la procrastinación desde hace mucho, la describe como una forma de regular las emociones que sale mal. Una tarea nos hace sentir ansiedad, aburrimiento, frustración o inseguridad. Postergarla trae un alivio rápido, así que evitar empieza a parecer una solución. Pero la tarea no desaparece; vuelve más tarde, a menudo más grande, con estrés extra y autorreproche pegados.',
          'En una revisión con Fuschia Sirois, Pychyl describe esto como un intercambio entre dos versiones de ti: el yo del presente recibe el alivio y el yo del futuro recibe la cuenta. Visto así, una app de pendientes o un horario más estricto ayudarán solo hasta cierto punto. Ayuda más aprender a notar el sentimiento, tolerarlo un ratito y dar de todos modos una pequeña acción.',
        ],
          visual: { kind: 'cycle', title: 'El ciclo de la procrastinación', center: 'Alivio a corto plazo, costo a largo plazo',
            nodes: [
              { label: 'Tarea', text: 'Una tarea que se siente poco clara, aburrida o amenazante.' },
              { label: 'Sentimiento', text: 'Sube el temor, la preocupación o la frustración.' },
              { label: 'Evitación', text: 'Cambias a algo más fácil.' },
              { label: 'Alivio', text: 'El malestar se calma por ahora.' },
              { label: 'Regreso', text: 'La tarea vuelve, ahora con presión extra y autorreproche.' },
            ],
            note: 'Una descripción de la visión de la reparación del ánimo (Sirois y Pychyl), no un modelo medido. Romper el ciclo suele empezar por notar el sentimiento.' } },
        { heading: 'Qué dicen los números y qué no', paragraphs: [
          'En la amplia revisión de Piers Steel, la procrastinación se vinculó con fuerza a encontrar aversiva una tarea y a la impulsividad, y casi nada a cuánto pretendían trabajar las personas. Steel estima que la procrastinación es un problema crónico para cerca de 15–20% de los adultos. Son correlaciones: no prueban que las tareas aversivas causen la procrastinación, pero señalan dónde vale la pena mirar.',
          'Lo alentador es lo que los números dejan fuera. Querer trabajar no es la pieza que falta, así que no necesitas «quererlo más». El sentimiento alrededor de la tarea, el tamaño del primer paso y el plan para el momento difícil se pueden cambiar, y las próximas lecciones trabajan justo eso.',
        ] },
      ],
      example: { title: 'Sofía, 31 años, coordinadora de marketing', text: 'Sofía llevaba tres semanas evitando su informe de gastos. Solía decirse que «simplemente era mala para lo administrativo». Durante una pausa para el café, probó el ejercicio: abrió el correo con la plantilla del informe y se detuvo a notar qué pasaba. La palabra que llegó fue «temor», y debajo de ella, «vergüenza». La parte que lo disparaba no era la hoja de cálculo; eran los recibos arrugados en su bolso, algunos probablemente perdidos. Escribió en una nota adhesiva: «Temor + vergüenza, por los recibos que faltan». Ese día no empezó el informe. Pero «mala para lo administrativo» se había convertido en un sentimiento concreto sobre una parte concreta, y eso se sentía como algo con lo que podía trabajar.' },
      photo: { id: '1552360708-ebcdf76845ac', alt: 'Mujer sentada junto a una ventana, sumida en sus pensamientos' } },
    { id: 'procrastination-2', title: 'Reduce la tarea, encuentra el primer movimiento', minutes: 6,
      goal: 'Convierte la tarea que estás postergando en un primer movimiento tan pequeño y concreto que no se sienta pesado.',
      reading: ['«Preparar la presentación» o «limpiar la casa» no te dice por dónde empezar. La incertidumbre puede hacer que una tarea se sienta más pesada de lo que es, porque tu mente intenta sostener todo a la vez sin saber qué parte va primero. «Abrir el documento y escribir tres títulos», en cambio, es un comienzo que puedes ver. Ser pequeño no lo hace poco importante. Un primer movimiento lo bastante concreto como para imaginarlo suele marcar la diferencia entre pensar en una tarea y hacerla.', 'Se encontró que la sensación de «puedo hacer esto», que los psicólogos llaman autoeficacia, se relaciona de forma inversa con la procrastinación: cuanto más baja era, más tendían las personas a postergar. Creemos que los primeros pasos pequeños y alcanzables pueden alimentar esa sensación; es una inferencia, no un hallazgo directo. Después de dar el primer movimiento, no tienes que continuar; detenerte también es una opción. El objetivo de hoy es simplemente descubrir que la tarea tiene una puerta, y cruzarla una vez.'],
      practice: ['Escribe o di en una frase la tarea que elegiste en la lección anterior.', 'Divide la tarea en tres partes pequeñas; empieza la primera con un verbo claro como abrir, escribir, llamar o elegir.', 'Si la primera parte todavía se siente pesada, redúcela a una versión de dos minutos y pruébala ahora.'],
      reflection: '¿Cuál fue el primer movimiento más pequeño para tu tarea?', question: '¿Cuál es un primer movimiento concreto?', options: ['Ser más disciplinado esta semana.', 'Terminar el proyecto lo antes posible.', 'Abrir el archivo del informe y escribir el primer título.'], correct: 2,
      feedback: 'Un verbo y un objeto concretos te muestran por dónde empezar. No necesitas resolver la tarea grande de una sola vez.', takeaway: 'Para empezar no necesitas ver toda la tarea, solo su primer movimiento.', sources: ['task-aversiveness', 'procrastination-pychyl-start', 'procrastination-pomodoro', 'procrastination-pomodoro-breaks'],
      visual: { kind: 'steps', title: 'De la tarea grande al primer movimiento',
        steps: [
          { label: 'Tarea grande', text: 'Preparar la presentación.' },
          { label: 'Partes', text: 'Elegir un tema, buscar fuentes, escribir las diapositivas.' },
          { label: 'Primera parte', text: 'Elegir el tema de la presentación.' },
          { label: 'Primer movimiento', text: 'Abrir un documento en blanco y escribir tres temas posibles.' },
        ],
        note: 'Si el primer movimiento todavía se siente pesado, redúcelo un paso más.' },
      deeper: [
        { heading: 'Por qué empezar cambia el sentimiento', paragraphs: [
          'Tim Pychyl describe un patrón de la investigación de su laboratorio: las tareas que la gente calificaba como muy estresantes y desagradables mientras las evitaba se sentían mucho menos desagradables una vez que realmente habían empezado. Quienes hacían aunque fuera un inicio parcial también se sentían más en control y más esperanzados al día siguiente. El temor vive sobre todo en la espera.',
          'También señala una trampa común: «mañana tendré más ganas de hacerlo». El ánimo de mañana rara vez resulta mejor. Un primer movimiento diminuto no espera al ánimo adecuado; cambia el ánimo al darte una experiencia distinta de la tarea.',
        ] },
        { heading: 'Trabajar en bloques cortos y cronometrados', paragraphs: [
          'Francesco Cirillo desarrolló la Técnica Pomodoro en la década de 1980, siendo un estudiante que no lograba concentrarse. Su primer experimento fue modesto: ¿podía estudiar solo dos minutos sin interrupción? De ahí la técnica creció hasta convertirse en bloques cronometrados de trabajo concentrado, que suelen enseñarse de 25 minutos, separados por descansos cortos.',
          'Un pequeño estudio comparó horarios de descanso en 87 estudiantes universitarios. Quienes tomaron descansos fijos (6 minutos cada 24, o 3 cada 12) reportaron menos fatiga y distracción y más concentración y motivación que quienes eligieron sus propios descansos, y sacaron una cantidad de trabajo similar. Fue una sola sesión con una muestra pequeña, así que tómalo como una pista, no como una regla. La duración de bloque que te convenga puede ser mucho más corta al principio.',
        ],
          visual: { kind: 'table', title: 'Tres maneras de tomar descansos (Biwer et al. 2023)', columns: ['Horario de descansos', 'Estudiantes', 'Qué reportaron'],
            rows: [
              ['Descansos elegidos por ellos', '35', 'Tramos más largos; más fatiga y distracción, menos concentración y motivación'],
              ['6 min cada 24 min', '25', 'Mejores medidas de ánimo; finalización de la tarea similar'],
              ['3 min cada 12 min', '27', 'Mejores medidas de ánimo; finalización de la tarea similar'],
            ],
            note: 'Un pequeño estudio de una sola sesión de estudio individual. Puso a prueba horarios de descanso, no la procrastinación directamente.' } },
      ],
      example: { title: 'Kevin, 45 años, traductor freelance', text: 'Kevin tenía que traducir un contrato de 20 páginas y había pasado dos mañanas «preparándose» al contestar correos. La tercera mañana escribió la tarea como «traducir el contrato» y la dividió en partes: leerlo completo, armar un glosario, traducir la sección uno. Incluso «leerlo completo» se sentía pesado, así que lo redujo: abrir el archivo y leer la primera página. Puso un temporizador de cocina de diez minutos, porque 25 le parecían demasiado. Cuando sonó, había leído tres páginas y anotado cuatro términos difíciles. Tomó un descanso de cinco minutos, se preparó un té y volvió a poner el temporizador. El contrato seguía siendo largo, pero ya no era un muro; era una pila de páginas, y él había movido algunas.' },
      technique: { name: 'La Técnica Pomodoro', origin: 'Francesco Cirillo · The Pomodoro Technique (desarrollada en la década de 1980)',
        steps: [
          'Elige una tarea, o el primer movimiento de una tarea más grande, y anótala.',
          'Pon un temporizador para un bloque de concentración; 25 minutos es la duración clásica, pero empieza con 10 o incluso 2 si eso te resulta más seguro.',
          'Trabaja solo en esa tarea hasta que suene el temporizador; si aparece otro pensamiento, anótalo en papel y vuelve.',
          'Cuando suene el temporizador, toma un descanso corto de unos cinco minutos lejos de la pantalla.',
          'Después de unos cuantos bloques, toma un descanso más largo y observa qué te distrajo para poder planearlo la próxima vez.',
        ],
        evidence: 'La Técnica Pomodoro en su conjunto no se ha puesto a prueba en ensayos controlados. Un pequeño estudio encontró que los descansos fijos al estilo Pomodoro se asociaron con mejor ánimo y un rendimiento similar frente a los descansos elegidos por uno mismo, pero no midió la procrastinación. Toma los tiempos como un punto de partida que ajustar, no como una regla.',
        sourceId: 'procrastination-pomodoro' },
      photo: { id: '1448387473223-5c37445527e7', alt: 'Un pie pisando el primer escalón' } },
    { id: 'procrastination-3', title: 'Ata un plan a tu obstáculo real', minutes: 8,
      goal: 'Aplica el deseo, el obstáculo y un plan «si… entonces…» a la tarea que estás postergando.',
      reading: ['Imaginar solo un resultado feliz puede no bastar para ponerte en marcha; incluso puede resultar tan agradable que el impulso de actuar se apague. En un método llamado WOOP, desarrollado por la psicóloga Gabriele Oettingen, primero piensas en lo que quieres y en lo que te traería, y luego miras el obstáculo real que te frena desde dentro. En el último paso atas una respuesta al obstáculo: «Si … pasa, entonces yo …». El plan une un momento que puedes reconocer con una acción pequeña.', 'En un pequeño experimento con 81 estudiantes, quienes usaron WOOP encontraron sus tareas menos aversivas y empezaron en una mayor proporción de días que los estudiantes que solo pensaban en positivo. Fue un estudio de una semana en una sola universidad, no una respuesta definitiva. Un conjunto más amplio de investigación sobre los planes «si… entonces…» en general apunta en la misma dirección, con efectos promedio de medianos a grandes que pueden reducirse al tener en cuenta el sesgo de publicación. Aun así, el método es fácil de probar y cuesta poco: unos minutos y una frase.'],
      practice: ['Deseo y resultado: piensa en lo que quieres esta semana respecto a la tarea que estás postergando y en lo que te daría si ocurriera.', 'Obstáculo: nombra el obstáculo interno que más te frena, por ejemplo «agarrar mi teléfono» o «sentir que no soy suficiente».', 'Plan: completa la frase «Si pasa [obstáculo], entonces yo [acción pequeña]» y ensáyala una vez en tu mente.'],
      reflection: '¿Cuál es tu frase «si… entonces…»?', question: '¿Qué distingue a WOOP de simplemente pensar en positivo?', options: ['Ver el obstáculo real y atarle una respuesta concreta.', 'Imaginar el éxito con la mayor viveza posible.', 'Intentar no pensar nunca en los obstáculos.'], correct: 0,
      feedback: 'En este enfoque, el obstáculo no se ignora; se convierte en un plan. Los efectos en la investigación son promedios y pueden variar de una persona a otra.', takeaway: 'Ve tu obstáculo y prepara una pequeña respuesta para él.', sources: ['mcii-procrastination', 'if-then-plans', 'mcii', 'task-aversiveness', 'oettingen-woop-method'],
      visual: { kind: 'bars', title: 'Proporción de días en que las personas empezaron su tarea', sourceId: 'mcii-procrastination',
        bars: [
          { label: 'WOOP (deseo, resultado, obstáculo, plan)', value: 58.8, display: '58.8%' },
          { label: 'Solo pensamiento positivo', value: 47.3, display: '47.3%' },
        ],
        note: '81 estudiantes universitarios, una semana de seguimiento. Un solo estudio pequeño; no garantiza el mismo resultado para ti.' },
      deeper: [
        { heading: 'La teoría de la motivación temporal de Piers Steel', paragraphs: [
          'Piers Steel reúne la investigación sobre la procrastinación en una sola idea, la teoría de la motivación temporal. Una tarea te atrae más cuando esperas tener éxito en ella (expectativa) y cuando te importa o te gratifica (valor). Te atrae menos cuando la recompensa está lejos (demora) y cuando te dejas influir más fácilmente por lo que tienes a la mano (impulsividad). Un informe que vence en tres semanas compite mal con un video que te recompensa ahora mismo.',
          'Lo útil es que cada pieza sugiere una palanca. Puedes subir la expectativa reduciendo la tarea, subir el valor vinculándola con lo que te importa, acortar la demora con puntos de control más cercanos y pequeñas recompensas, y reducir la impulsividad poniendo las distracciones fuera de tu alcance. WOOP y los planes «si… entonces…» trabajan sobre todo en la última: deciden de antemano qué harás cuando llegue el tirón.',
        ],
          visual: { kind: 'table', title: 'Cuatro palancas de la teoría de la motivación temporal', columns: ['Factor', 'Qué significa', 'Algo para probar'],
            rows: [
              ['Expectativa', 'Qué tan seguro te sientes de poder hacerlo', 'Reduce la tarea hasta que el éxito se sienta probable'],
              ['Valor', 'Cuánto te importa o te gratifica', 'Escribe una línea sobre por qué te importa'],
              ['Demora', 'Qué tan lejos está la recompensa', 'Fija un punto de control más cercano con una pequeña recompensa'],
              ['Impulsividad', 'Qué tan fuerte tiran las tentaciones cercanas', 'Haz un plan «si… entonces…» y aleja la distracción'],
            ],
            note: 'Basado en el modelo de Steel, que encaja con hallazgos correlacionales; es una forma de pensar, no un tratamiento probado.' } },
        { heading: 'Errores comunes con los planes «si… entonces…»', paragraphs: [
          'El «si» suele ser demasiado vago. «Si no tengo ganas» es cierto casi todo el tiempo, así que no puede funcionar como una señal clara. «Si agarro el teléfono después de sentarme en mi escritorio» es un momento que reconocerás cuando ocurra.',
          'El «entonces» suele ser demasiado grande. «Entonces trabajaré dos horas» pide justo el esfuerzo que el obstáculo está bloqueando. «Entonces primero escribiré una frase» es lo bastante pequeño como para ocurrir incluso cuando el sentimiento es fuerte. Un plan para tu obstáculo más común es mejor que cinco planes que no recordarás.',
        ] },
      ],
      example: { title: 'Grace, 26 años, estudiante de posgrado', text: 'Grace quería terminar la revisión de literatura de su tesis esta semana; si lo lograba, podría dejar de sentirse culpable cada fin de semana. Cuando buscó el obstáculo, no era el tiempo. Era el momento después de abrir el documento, cuando sentía que no sabía lo suficiente y buscaba su teléfono. Su plan: «Si busco mi teléfono después de abrir el documento, entonces lo guardo en el cajón y escribo una frase sobre el primer artículo». Lo ensayó una vez en el autobús. El martes se sorprendió con el teléfono ya en la mano, se rio un poco y lo guardó en el cajón. La frase que escribió salió torpe. Escribió una segunda de todos modos.' },
      photo: { id: '1553044020-8c90843adf96', alt: 'Notas adhesivas amarillas y un bolígrafo' } },
    { id: 'procrastination-4', title: 'Después de procrastinar: perdónate', minutes: 7,
      goal: 'Después de postergar algo, forma una frase que sea a la vez indulgente y responsable en lugar de atacarte.',
      reading: ['Después de procrastinar, es fácil decirte: «Lo hiciste otra vez; nunca vas a cambiar». Esa voz dura puede parecer que te mantiene a raya, pero quizá no haga más fácil el siguiente comienzo. Puede hacer que la tarea se sienta aún más aversiva, y una tarea aversiva es justo la que evitamos. En un estudio con estudiantes universitarios de primer año, quienes se perdonaron más por haber procrastinado antes del primer examen procrastinaron menos al prepararse para el segundo.', 'Ese estudio no fue experimental; no prueba que el perdón reduzca la procrastinación. El vínculo se explicó por una reducción de los sentimientos negativos: los estudiantes que se perdonaron se sintieron menos mal con la materia, y eso pareció facilitar acercarse a ella. Perdonarte no significa ignorar lo que pasó. Significa decir: «Lo postergué; es humano. La próxima vez lo haré de otra manera». Las dos mitades importan: la amabilidad y el siguiente paso.'],
      practice: ['Recuerda brevemente un momento reciente en que postergaste algo y nota qué te dijiste a ti mismo.', 'Dite la frase comprensiva que le dirías a un amigo en la misma situación.', 'Luego decide una cosa concreta que harás de otra manera la próxima vez.'],
      reflection: '¿Qué frase indulgente pero responsable te gustaría decirte?', question: '¿Qué significa perdonarte en esta lección?', options: ['Tratar lo ocurrido como algo sin importancia y no cambiar nada.', 'Darte permiso para seguir procrastinando.', 'Aceptar lo que pasó y elegir el siguiente paso.'], correct: 2,
      feedback: 'Perdonar no es soltar la responsabilidad. En lugar de castigarte, puede facilitar que te dirijas a la parte que sí puedes arreglar.', takeaway: 'Procrastinaste; eso no te define. El siguiente paso sigue siendo tuyo.', sources: ['self-forgiveness', 'mood-repair', 'self-compassion'],
      visual: { kind: 'compare', title: 'Tu voz interior después de procrastinar',
        left: { label: 'Atacarte', items: ['«Soy un perezoso, y ya».', 'Convierte un momento en toda tu identidad.', 'Puede hacer que la tarea se sienta aún más aversiva.'] },
        right: { label: 'Perdonarte', items: ['«Lo postergué; es humano».', 'Acepta lo ocurrido y mantiene la responsabilidad.', 'Deja espacio para el siguiente paso pequeño.'] },
        note: 'Perdonar no significa ignorar lo que pasó ni seguir igual.' },
      deeper: [
        { heading: 'Qué encontró el estudio sobre el autoperdón', paragraphs: [
          'Michael Wohl, Tim Pychyl y Shannon Bennett siguieron a estudiantes de primer año a lo largo de dos exámenes parciales. Después del primer examen, los estudiantes reportaron cuánto habían procrastinado y cuánto se habían perdonado por ello. Quienes se perdonaron más procrastinaron menos antes del segundo examen, y el vínculo pasaba por sentirse menos negativos hacia la materia.',
          'El estudio tiene límites reales: fue correlacional, se hizo en un solo curso y solo 119 de los 312 estudiantes que empezaron quedaron en el análisis final. Por eso no puede probar que el perdón cause menos procrastinación. Pero encaja con la visión de la reparación del ánimo: si la procrastinación es una manera de escapar de los malos sentimientos, apilar más malos sentimientos encima difícilmente ayudará. La investigación sobre autocompasión, en términos más amplios, muestra beneficios a corto plazo de pequeños a medianos para el estrés y la ansiedad.',
        ] },
        { heading: 'Un guion de perdón en tres partes', paragraphs: [
          'El autoperdón puede sentirse vago, así que ayuda tener las palabras listas. Las tres partes de abajo mantienen juntas la honestidad y la amabilidad. Dilas en silencio o escríbelas; la redacción exacta es tuya.',
          'Si la voz dura vuelve mientras haces esto, es normal. No necesitas discutir con ella ni silenciarla. Simplemente nótala («ahí está otra vez el crítico») y vuelve al guion.',
        ],
          visual: { kind: 'steps', title: 'Perdona y vuelve',
            steps: [
              { label: 'Nómbralo', text: '«Esta semana volví a postergar el informe».' },
              { label: 'Hazlo humano', text: '«Se sentía poco claro y estresante; muchas personas evitan tareas así».' },
              { label: 'Asume la responsabilidad', text: '«Aun así me importa, y puedo arreglar una parte».' },
              { label: 'Elige el siguiente paso', text: '«Mañana a las 9 abro el archivo y escribo el primer título».' },
            ],
            note: 'Aquí, perdonar significa soltar el ataque, no soltar la tarea.' } },
      ],
      example: { title: 'Daniel, 36 años, gerente de proyectos', text: 'Daniel le había prometido a su equipo un borrador del presupuesto para el viernes, y el viernes por la tarde seguía siendo una página en blanco. Camino a casa oyó la voz de siempre: «Siempre haces esto. Todos verán que no puedes manejar nada». Cuando estacionó, se sentía demasiado pesado como para abrir siquiera la laptop. Sentado en el auto, probó el guion. «No hice el borrador. Se sentía vago y seguí evitándolo; eso les pasa a las personas. Aun así importa, y puedo arreglar una parte». Luego el paso: un correo a su equipo diciendo que el borrador llegaría el lunes al mediodía, y una nota para abrir el archivo a las 8:30. El lunes, empezar se sintió menos como enfrentar un veredicto.' },
      photo: { id: '1778958619388-b529cc4e78e8', alt: 'Joven tomando té junto a una ventana' } },
    { id: 'procrastination-5', title: 'Tu propio plan contra la procrastinación', minutes: 8,
      goal: 'Arma un experimento de una semana con un primer movimiento, un plan, una revisión y, si quieres, plazos intermedios.',
      reading: ['En los estudios sobre intervenciones contra la procrastinación, esta bajó claramente tras la intervención, y la caída se mantuvo en las mediciones de seguimiento. Este valor se calculó a partir de diferencias antes–después y no frente a un grupo de control, así que el efecto puede parecer mayor de lo que es. Los resultados más sólidos vinieron de la terapia cognitivo-conductual impartida por profesionales, y este curso no es terapia. Lo que puede ofrecer es un pequeño experimento personal armado con las herramientas que has practicado: un primer movimiento, un plan y una revisión.', 'Dividir una tarea grande en varios plazos intermedios en tu calendario, fijándote puntos de control suaves, es una idea que vale la pena probar. Pero un estudio muy citado sobre esto fue retractado, y no hemos revisado evidencia sólida que lo reemplace. Así que piensa en los plazos intermedios no como un método probado, sino como un experimento que observas en ti mismo. Si un punto de control te ayuda a empezar, consérvalo; si solo añade presión y culpa, déjalo sin dramas.'],
      practice: ['Escribe tu tarea siguiendo las filas de la tabla: primer movimiento, hora y lugar, plan «si… entonces…».', 'Si quieres, añade unas cuantas fechas intermedias a la tarea grande; piénsalas no como reglas estrictas, sino como recordatorios suaves para ti.', 'Al final de la semana, dedica dos minutos a revisar qué funcionó y qué vas a cambiar.'],
      reflection: '¿Qué parte de tu plan conservarás y cuál cambiarás?', question: '¿Cuál es el enfoque más honesto respecto a los plazos que te pones a ti mismo?', options: ['Es un método probado que sin duda funciona.', 'Vale la pena probarlo pero con evidencia limitada; observa cómo te funciona.', 'Nunca funciona y jamás debería probarse.'], correct: 1,
      feedback: 'Probar un método con evidencia limitada está bien; lo que importa es observar con honestidad cómo te funciona. Si la procrastinación afecta claramente tu vida, puedes buscar el apoyo de un profesional.', takeaway: 'Mantén tu plan pequeño, pruébalo, revísalo y pide apoyo cuando lo necesites.', sources: ['procrastination-interventions', 'if-then-plans', 'monitoring', 'task-aversiveness'],
      visual: { kind: 'table', title: 'Plan semanal contra la procrastinación', columns: ['Paso', 'Ejemplo', 'Tu plan'],
        rows: [
          ['Primer movimiento', 'Abrir el documento y escribir tres títulos', '…'],
          ['Hora y lugar', 'Martes 9:00, mesa de la cocina', '…'],
          ['Si… entonces', 'Si agarro el teléfono, primero escribo una frase', '…'],
          ['Plazo intermedio (experimento)', 'Jueves: primer borrador', '…'],
          ['Revisión', 'Domingo por la noche, dos minutos', '…'],
        ],
        note: 'Los plazos intermedios son un experimento con evidencia limitada; cámbialos o déjalos si no ayudan.' },
      deeper: [
        { heading: 'Ajustar las herramientas a tu tipo de bloqueo', paragraphs: [
          'La procrastinación no se ve igual cada vez, y las herramientas de este curso se ajustan a distintas versiones de ella. Cuando una tarea se siente sin forma, lo que más ayuda es reducirla. Cuando un momento concreto te descarrila una y otra vez, encaja un plan «si… entonces…». Cuando la recompensa está lejos, un punto de control más cercano acorta la demora, justo lo que el modelo de Steel predice que debería ayudar.',
          'No necesitas todas a la vez. Elige una o dos que coincidan con tu manera de bloquearte, pruébalas durante una semana y mira qué pasó. Llevar registro de lo que hiciste, aunque sea con una simple marca, se asoció con un mejor avance hacia las metas en un amplio metaanálisis, y le da a tu revisión semanal algo real que mirar.',
        ],
          visual: { kind: 'table', title: '¿Qué herramienta para qué tipo de bloqueo?', columns: ['Si la tarea se siente…', 'Prueba', 'De la lección'],
            rows: [
              ['Pesada y temible', 'Nombra el sentimiento y luego un primer movimiento de dos minutos', '1 y 2'],
              ['Sin forma o enorme', 'Divídela en partes y usa un verbo concreto', '2'],
              ['Bien hasta cierto momento', 'Un plan «si… entonces…» para ese momento', '3'],
              ['Lejana y fácil de ignorar', 'Un punto de control más cercano con una pequeña recompensa', '5'],
              ['Arruinada porque ya la postergaste', 'El guion del perdón y luego un paso', '4'],
            ],
            note: 'Un menú, no una lista de verificación. Una o dos herramientas que te sirvan bastan para una semana.' } },
        { heading: 'Cuándo buscar más apoyo', paragraphs: [
          'Los resultados más sólidos de la investigación sobre intervenciones vinieron de la terapia cognitivo-conductual con un profesional capacitado. Vale la pena saberlo, porque parte de la procrastinación está enredada con cosas que un curso breve no puede abordar, como una ansiedad persistente, la depresión o dificultades de atención como el TDAH.',
          'Algunas señales de que puede ser momento de hablar con un médico o terapeuta son: que postergar te está costando empleos, calificaciones, relaciones o salud; que los sentimientos alrededor de las tareas son intensos o constantes; o que has probado varios enfoques y nada se mueve. Pedir ayuda en ese punto no es un fallo de fuerza de voluntad. Es elegir una herramienta más fuerte para un problema más difícil.',
        ] },
      ],
      example: { title: 'Nadia, 29 años, técnica veterinaria que postula a la universidad', text: 'El ensayo de postulación de Nadia vencía en tres semanas, y se conocía: empezaría la noche anterior. El domingo llenó el plan. Primer movimiento: abrir un documento y anotar tres momentos que le hicieron querer esta carrera. Hora y lugar: martes 7 p. m., mesa de la cocina, después de la cena. Si… entonces: «Si empiezo a releer correos viejos, primero escribo una frase». Como experimento, fijó dos fechas intermedias: borrador el próximo domingo y una amiga que lo leyera el miércoles siguiente. El martes salió bien. El jueves se lo saltó por completo. En su revisión de dos minutos del domingo anotó que la fecha de la amiga la había empujado más que la suya, así que adelantó tres días la lectura de la amiga.' },
      photo: { id: '1506784983877-45594efa4cbe', alt: 'Taza de café sobre una agenda abierta' } },
  ],
};
