import type { CourseSource, GuidedCourse } from '../../courses';

/**
 * Edición en español de «Özgüven» (confidence), traducida de la edición en
 * inglés. Los ids de lecciones, el número de prácticas y la posición de las
 * respuestas correctas coinciden con las demás ediciones. Este archivo también
 * lleva las versiones en español de las fuentes base compartidas 'mcii',
 * 'self-compassion' y 'monitoring' (mismos ids). 'bandura-self-efficacy' se
 * traduce en ./turning-day.ts. Las fuentes nuevas (septiembre de 2026) llevan
 * el prefijo 'confidence-'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'mcii', title: 'Wang, Wang y Gai · 2021 · Metaanálisis sobre el logro de metas', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.565202/full', type: 'research', finding: '21 estudios, 15,907 participantes: contrastar una meta con el obstáculo real junto con un plan «si… entonces…» mostró un efecto promedio de pequeño a mediano (g = 0.336).', limitation: 'Es posible que haya sesgo de publicación; los resultados varían según la persona y la situación. La eficacia de este curso de ODA no ha sido puesta a prueba.' },
  { id: 'self-compassion', title: 'Han y Kim · 2023 · Metaanálisis de intervenciones de autocompasión', url: 'https://pubmed.ncbi.nlm.nih.gov/37362192/', type: 'research', finding: 'En 56 ensayos aleatorizados, las intervenciones de autocompasión mostraron efectos promedio a corto plazo de pequeños a medianos sobre el estrés, la ansiedad y los síntomas depresivos.', limitation: 'El riesgo general de sesgo era alto; los datos sobre comparaciones activas y sobre la aplicación en línea son más limitados. El resumen que se revisó no prueba un efecto terapéutico para este ejercicio.' },
  { id: 'monitoring', title: 'Harkin et al. · 2016 · Metaanálisis del monitoreo del progreso', url: 'https://pubmed.ncbi.nlm.nih.gov/26479070/', type: 'research', finding: '138 estudios experimentales, 19,951 personas: las intervenciones que aumentaron el monitoreo del progreso mostraron un beneficio promedio para el logro de metas (d = 0.40). El beneficio fue mayor cuando el progreso se informaba a otras personas o se hacía público y cuando se registraba físicamente.', limitation: 'Se reunieron metas y métodos de monitoreo muy distintos. No necesitas compartir tus notas privadas; la pantalla de seguimiento que se usa aquí no se ha puesto a prueba por separado. Se revisó el resumen.' },
  { id: 'confidence-fear-ladder', title: 'Psychology Tools · Escalera del miedo (jerarquía de exposición)', url: 'https://www.psychologytools.com/resource/fear-ladder', type: 'guidance', finding: 'Un recurso para clínicos que describe la escalera del miedo usada en la terapia cognitivo-conductual para la ansiedad: identificar el miedo, enumerar las situaciones temidas, asignar a cada una una calificación del miedo previsto, ordenarlas de la menos a la más atemorizante y empezar la exposición gradual por los escalones más bajos, subiendo con el tiempo. Señala que el ritmo debe ajustarse si la persona se siente abrumada y que normalmente son los terapeutas quienes guían el proceso.', limitation: 'Es una guía práctica para clínicos, no un estudio; describe cómo se hace la exposición en terapia y no pone a prueba una versión de autoayuda. Este curso usa la idea solo para retos cotidianos y seguros.' },
  { id: 'confidence-five-second-rule', title: 'Mel Robbins · La regla de los 5 segundos (2017) · episodio del pódcast «Motivation is garbage»', url: 'https://www.melrobbins.com/episode/episode-3/', type: 'technique', finding: 'Robbins describe contar hacia atrás «5, 4, 3, 2, 1» y luego moverte, para actuar en la breve ventana entre un impulso y el momento en que el miedo, las excusas y la duda te convencen de no hacerlo. Sostiene que primero viene la acción y la motivación llega después.', limitation: 'Es la página del pódcast de la propia autora. No encontramos ningún estudio controlado de la regla de los 5 segundos en sí; la evidencia son sobre todo historias personales. Su núcleo útil, una señal clara que inicia una acción pequeña y planeada, coincide con la planificación «si… entonces…».' },
];

export const COURSE: GuidedCourse = {
  id: 'confidence', title: 'Confianza', subtitle: 'Un paso, aunque tengas miedo.',
  description: 'Nota a tu crítico interior, elige un experimento seguro y avanza apoyándote en tu propio esfuerzo.',
  scope: 'Práctica de valentía cotidiana y autocompasión. No es terapia de exposición para situaciones peligrosas, trauma o ansiedad intensa; para esos casos, trabaja con un profesional capacitado.',
  outcome: 'Un paso de valentía que te quede bien y un plan para volver a intentarlo.',
  photo: { id: '1756244834590-b1a32e94df40', alt: 'Mujer contemplando un lago de montaña al amanecer' },
  lessons: [
    { id: 'confidence-1', title: 'Nombra el miedo, no a ti mismo', minutes: 6,
      goal: 'Separa un sentimiento del veredicto que dictas sobre ti mismo.',
      reading: ['«Me pongo nervioso cuando hablo» describe una experiencia. «No soy suficiente» es un veredicto que se extiende por toda tu vida. Hoy, sin intentar demostrar ni refutar la segunda frase, describiremos con más concreción lo que te pasa: dónde estás, qué haces y qué sientes. Una descripción te da algo con qué trabajar; un veredicto solo te da algo que cargar. Una situación se puede cambiar paso a paso, pero un veredicto es difícil de cambiar.', 'Elige una situación segura y pequeña, como compartir una idea en una reunión. El miedo no necesita desaparecer para que esta lección funcione; solo estás practicando una manera más precisa de describirlo. Si una situación es realmente peligrosa, poner un límite y pedir ayuda también son decisiones valientes. La valentía no consiste en meterte en el peligro; consiste en elegir un paso adecuado para ti, a un ritmo que puedas manejar, con apoyo cuando lo necesites.'],
      practice: ['Describe en una frase una situación segura de la que te has contenido últimamente.', 'Nota la etiqueta que te has pegado y reformúlala como «En esta situación, siento …».', 'Dite a ti mismo, en voz alta o en silencio, la respuesta comprensiva que le darías a un amigo cercano.'],
      reflection: '¿Cuál fue tu frase más justa sobre ti mismo?', question: '¿Cuál separa la situación de tu identidad?', options: ['Siempre fracaso.', 'Me puse tenso en esta conversación; puedo preparar una frase corta.', 'Nunca debería volver a ponerme tenso.'], correct: 1,
      feedback: 'Nombrar una situación concreta abre espacio para un siguiente paso que sí puede cambiar. Un sentimiento no es un resumen de quién eres.', takeaway: 'El miedo es una experiencia, no la totalidad de ti.', sources: ['self-compassion', 'bandura-self-efficacy'],
      visual: { kind: 'compare', title: 'De una etiqueta a una descripción',
        left: { label: 'Etiqueta', items: ['No soy suficiente.', 'Siempre fracaso.', 'Yo soy así.'] },
        right: { label: 'Descripción de la situación', items: ['Me pongo nervioso cuando hablo.', 'Me puse tenso en esta conversación.', 'Me contengo al compartir ideas en las reuniones.'] },
        note: 'Las frases de la derecha no niegan el sentimiento; abren espacio para un siguiente paso que sí puede cambiar.' },
      deeper: [
        { heading: 'Por qué las etiquetas se pegan tanto', paragraphs: [
          'Una etiqueta es eficiente. «Soy malo para hablar» te ahorra el esfuerzo de mirar cada situación, y además parece protegerte: si ya esperas fracasar, nada puede sorprenderte. El costo es que una etiqueta no tiene asidero. No puedes practicar «no ser inútil», pero sí puedes practicar «decir una frase en la reunión del lunes».',
          'Hablarte como le hablarías a un amigo no es un truco para sentirte bien. Las intervenciones de autocompasión mostraron reducciones a corto plazo de pequeñas a medianas en el estrés y la ansiedad en 56 ensayos aleatorizados, aunque los estudios tenían un riesgo general de sesgo alto. Una voz interior más serena y más justa deja más espacio para ver lo que realmente pasó.',
        ],
          visual: { kind: 'table', title: 'Reescribir una etiqueta como una situación', columns: ['Etiqueta', 'Situación + sentimiento', 'Posible siguiente paso'],
            rows: [
              ['Soy torpe.', 'En fiestas con desconocidos, me siento en tensión.', 'Preparar una pregunta para hacerle a alguien'],
              ['Soy un cobarde.', 'Me contuve cuando mi jefa no estuvo de acuerdo conmigo.', 'Escribir el punto que quería plantear'],
              ['Soy un desastre en esto.', 'En mi primer intento de la presentación, perdí el hilo.', 'Practicar la apertura dos veces en voz alta'],
            ],
            note: 'La columna del medio es honesta con el sentimiento; la de la derecha le da adónde ir.' } },
        { heading: 'El papel de tu cuerpo', paragraphs: [
          'Albert Bandura incluyó el estado del cuerpo entre las cuatro fuentes de la autoeficacia, tu creencia de que puedes hacer algo. Un corazón acelerado, la boca seca o una voz temblorosa pueden leerse fácilmente como pruebas: «Ves, no puedo con esto». Pero un corazón que late fuerte también puede significar simplemente que algo te importa. Es información sobre el momento, no un veredicto sobre tu capacidad.',
          'Así que, al describir la situación, puedes incluir el cuerpo sin dejar que decida: «Mi corazón latía con fuerza y aun así dije mi frase». Las dos partes son verdad, y juntas cuentan una historia muy distinta de «era un manojo de nervios».',
        ] },
      ],
      example: { title: 'Olivia, 33 años, técnica de laboratorio', text: 'En las reuniones de equipo Olivia casi no hablaba, y después pensaba: «Simplemente no soy una persona segura». El martes por la noche probó el ejercicio. La situación segura: la reunión semanal del laboratorio, cuando su supervisor pide comentarios. La etiqueta: «Soy un desastre en grupo». La reescribió: «En la reunión semanal, cuando todos me miran, siento que la cara se me pone caliente y me quedo paralizada». Luego se preguntó qué le diría a su amiga Mei en esa misma situación, y escribió: «Mucha gente se paraliza cuando todos los ojos están puestos en ella. Tú conoces tu trabajo». En la siguiente reunión no cambió nada. Pero cuando la cara se le puso caliente, pensó «ahí está el calor» en lugar de «ahí está la prueba», y eso se sintió un poco más liviano.' },
      photo: { id: '1579017308347-e53e0d2fc5e9', alt: 'Persona escribiendo a mano en un cuaderno abierto' } },
    { id: 'confidence-2', title: 'La forma más pequeña de valentía', minutes: 7,
      goal: 'Convierte una meta que se siente difícil en un experimento seguro y posible.',
      reading: ['«Hablaré con soltura frente a todos» puede ser una expectativa grande y vaga. El experimento de hoy podría ser solo preparar una pregunta, o contarle tu idea a una persona de confianza. Ser pequeño no lo hace poco importante. Los experimentos pequeños son la manera de reunir evidencia de que la versión más grande también podría ser posible, y cada uno te enseña algo sobre lo que te ayuda y lo que se interpone. El paso solo tiene que ser real, no impresionante.', 'Conserva el control del paso que elijas. Si la incomodidad sube demasiado, puedes parar, elegir un paso más pequeño o pedir apoyo. No necesitas competir con este curso para forzarte. La idea no es demostrar que puedes aguantarlo todo, sino aprender que puedes actuar mientras todavía hay algo de miedo. Un paso ligeramente incómodo pero claramente posible suele ser del tamaño justo para empezar.'],
      practice: ['Piensa en una versión fácil, una intermedia y una difícil de aquello de lo que te contienes.', 'Elige la versión más pequeña que puedas probar con seguridad hoy y decide dónde la harás.', 'Haz el experimento que elegiste, o termina la preparación concreta para un momento adecuado.'], reflection: '¿Qué pequeño experimento te conviene ahora?', question: '¿Qué elección es más útil para un primer paso?', options: ['Tengo que hacer el más difícil.', 'Esperar de forma vaga hasta que el miedo desaparezca por completo.', 'Elegir un experimento pequeño y concreto dentro de mis propios límites.'], correct: 2,
      feedback: 'El objetivo no es vencer tu mayor miedo, sino poder elegir una conducta que te convenga. No necesitas ponerte en peligro.', takeaway: 'A veces la valentía es una sola frase.', sources: ['mcii', 'self-compassion', 'confidence-fear-ladder', 'bandura-self-efficacy'],
      visual: { kind: 'table', title: 'Tres versiones de la misma tarea', columns: ['Versión', 'Experimento de ejemplo'],
        rows: [
          ['Fácil', 'Preparar una pregunta de antemano'],
          ['Intermedia', 'Contarle tu idea a una persona de confianza'],
          ['Difícil', 'Hablar frente a todos'],
          ['Tu tarea', 'Fácil: … / Intermedia: … / Difícil: …'],
        ],
        note: 'Elige la versión más pequeña que puedas probar con seguridad hoy. Si la incomodidad sube demasiado, puedes parar o hacer el paso más pequeño.' },
      deeper: [
        { heading: 'De tres versiones a una escalera', paragraphs: [
          'El ejercicio fácil–intermedio–difícil es una versión pequeña de una herramienta que usan los terapeutas llamada escalera del miedo, o jerarquía de exposición. Enumeras situaciones ligadas a un miedo, calculas qué tan atemorizante sería cada una y las ordenas de menos a más. Luego empiezas cerca de la base y subes solo cuando un paso empieza a sentirse manejable. En la terapia cognitivo-conductual para la ansiedad, este enfoque gradual es una herramienta central.',
          'Para la confianza cotidiana, la misma forma funciona a menor escala. Basta una calificación de 0 (sin miedo) a 10 (lo máximo que puedas imaginar). Apunta tus primeros experimentos a los peldaños que se sientan como un 3 o un 4: incómodos pero posibles. Si un paso resulta ser un 9, no es un fracaso; te dice que añadas un peldaño por debajo.',
        ],
          visual: { kind: 'steps', title: 'Una escalera de confianza de ejemplo: hablar en el trabajo',
            steps: [
              { label: 'Miedo 2', text: 'Escribir un comentario antes de la reunión.' },
              { label: 'Miedo 4', text: 'Compartir el comentario con un colega después.' },
              { label: 'Miedo 5', text: 'Hacer una pregunta en una reunión pequeña.' },
              { label: 'Miedo 7', text: 'Dar tu opinión en la reunión de todo el equipo.' },
              { label: 'Miedo 9', text: 'Presentar una breve actualización a todo el departamento.' },
            ],
            note: 'Sube solo cuando el peldaño actual se sienta manejable. Si la ansiedad es intensa o tiene raíz en un trauma, construye y sube una escalera con un terapeuta capacitado.' } },
        { heading: 'Por qué hacer supera a esperar', paragraphs: [
          'Albert Bandura consideraba las experiencias de logro, lo que realmente has hecho, como la fuente más fuerte de la creencia de que puedes hacer algo. Observar a otros, las palabras de ánimo y un cuerpo tranquilo también ayudan, pero ninguno tiene el peso de tu propia experiencia. Esperar a que el miedo se vaya se salta justo lo que lo reduciría.',
          'Por eso también el paso debe ser tuyo. Un experimento al que alguien te empuja, o uno que va mucho más allá de lo que puedes manejar, tiene más probabilidades de terminar en huida que en aprendizaje. Un paso que elegiste, a un nivel que puedes terminar, te deja una evidencia en la que puedes confiar.',
        ] },
      ],
      example: { title: 'Ben, 24 años, dependiente en una tienda', text: 'Ben quería pedirle más horas a su jefe, pero se quedaba paralizado. Dibujó tres casillas. Difícil: pedirlo en persona en el piso de ventas. Intermedio: mandar un mensaje corto pidiendo cinco minutos para hablar. Fácil: escribir exactamente qué quería y por qué. Lo fácil casi le parecía hacer trampa, pero lo hizo en su hora de almuerzo, sentado en la sala del personal: «Quisiera cuatro horas más a la semana, de preferencia los sábados; he cubierto dos veces este mes». Calificó el paso intermedio con un 6 y decidió esperar un día. El jueves mandó el mensaje. Tenía las manos frías al presionar enviar. El jefe respondió: «Claro, el viernes después del cierre». La conversación en sí todavía estaba por delante, pero ahora tenía dos pasos ya dados.' },
      photo: { id: '1635895752485-99ba511c07e1', alt: 'Piedras para cruzar el agua al atardecer' } },
    { id: 'confidence-3', title: 'Separa la predicción de lo que pasó', minutes: 8,
      goal: 'Evalúa un experimento con la observación y no con el juicio.',
      reading: ['Antes de una conversación, la mente puede producir muchos escenarios, casi todos desagradables. Después de un experimento, también es fácil recordar solo el momento en que sentiste vergüenza. En esta lección, piensa en lo que habría visto una cámara: la frase que dijiste, la respuesta que recibiste, la ayuda que pediste. Una cámara no sabe lo que pensaba la gente; solo registra lo que pasó. Esa limitación es justo lo que la hace útil aquí.', 'Por ejemplo, «Me tembló la voz, pero hice mi pregunta» contiene dos hechos a la vez. La confianza se vuelve frágil cuando depende de que cada experimento sea impecable; aquí, tu medida del éxito es intentar la conducta que elegiste. Llevar un breve registro de lo que realmente hiciste te da algo más confiable que el recuerdo de cómo se sintió. Con el tiempo, esos registros se suman en una evidencia que tu crítico interior no puede descartar con facilidad.'],
      practice: ['Recuerda la predicción que tenías antes de tu pequeño experimento.', 'Escribe o nombra en silencio dos observaciones de lo que realmente pasó; separa la lectura de mentes de la observación.', 'Si no lo intentaste, anótalo con honestidad y haz más pequeño tu próximo experimento.'], reflection: '¿Qué fue distinto de tu predicción?', question: '¿Cuál es información observable?', options: ['Todos pensaron que yo era ridículo.', 'Hice mi pregunta y una persona respondió.', 'Yo soy así.'], correct: 1,
      feedback: 'En lugar de suponer lo que pensaron los demás, registra lo que se vio y se oyó. Este registro no es una calificación de tu desempeño.', takeaway: 'Toma una pieza de información del experimento de hoy.', sources: ['monitoring', 'bandura-self-efficacy'],
      visual: { kind: 'compare', title: '¿Qué habría visto una cámara?',
        left: { label: 'Predicción', items: ['Todos se rieron de mí.', 'Todos notaron que estaba tenso.', 'Yo soy así.'] },
        right: { label: 'Observación', items: ['Hice mi pregunta.', 'Una persona respondió.', 'Me tembló la voz, pero hice mi pregunta.'] },
        note: 'En lugar de suponer lo que pensaron los demás, registra lo que se vio y se oyó. Este registro no es una calificación de tu desempeño.' },
      deeper: [
        { heading: 'Las cuatro fuentes de Bandura, aplicadas a tu experimento', paragraphs: [
          'Bandura describió cuatro fuentes que alimentan la autoeficacia: las experiencias de logro, observar a otros, las palabras de ánimo de los demás y el estado de tu cuerpo. Cada experimento que pruebes puede apoyarse en las cuatro, pero solo si las notas. Un registro al estilo de una cámara ayuda con la primera y más poderosa: convierte un recuerdo borroso en un claro «hice esto».',
          'Bandura también escribió que una creencia construida con éxitos repetidos se sacude menos ante el contratiempo ocasional. Por eso el registro importa más que cualquier resultado aislado. Una conversación torpe, frente a cinco registradas que salieron bien, se ve como lo que es: un dato.',
        ],
          visual: { kind: 'table', title: 'Cuatro fuentes de autoeficacia en un experimento de valentía', columns: ['Fuente', 'Qué buscar después de tu experimento'],
            rows: [
              ['Experiencia de logro', '¿Qué hice realmente? Escribe la conducta, no la nota.'],
              ['Observar a otros', '¿Vi a alguien más hacer algo parecido, de forma imperfecta, y salir adelante?'],
              ['Palabras de ánimo', '¿Alguien respondió con amabilidad, o puedo decirme una frase justa?'],
              ['Estado del cuerpo', '¿El nerviosismo llegó a un pico y luego se calmó? ¿Cuándo?'],
            ],
            note: 'Bandura consideró la experiencia de logro como la fuente más poderosa. Esta tabla es una ayuda para reflexionar, no un plan de tratamiento.' } },
        { heading: 'La trampa de repetir la escena', paragraphs: [
          'Después de un momento social, muchas personas lo repasan una y otra vez, acercándose a un segundo incómodo. Cada repaso parece aprendizaje, pero sobre todo refuerza la predicción con la que empezaste. La pregunta de la cámara interrumpe esto: pide dos observaciones y luego te deja parar.',
          'Llevar un registro escrito del progreso se asoció con un mejor logro de metas en un amplio metaanálisis, y registrarlo físicamente se asoció con un beneficio mayor. Repasar la escena no es un registro. Un registro es breve, factual y terminado; puedes cerrar el cuaderno.',
        ] },
      ],
      example: { title: 'Lucas, 30 años, desarrollador de software', text: 'Lucas había hecho una pregunta en la ronda de preguntas de una conferencia, su experimento de la semana. Al salir, su mente ya lo estaba repasando: se le había quebrado la voz, y seguro todos lo habían notado. Esa noche abrió sus notas y escribió su predicción de antes: «Voy a tropezar, el ponente será displicente, la gente me mirará fijamente». Luego, dos observaciones de cámara: «Pregunté por el calendario de la migración. El ponente dijo que era una buena pregunta y respondió durante cerca de un minuto». Añadió: «Se me quebró la voz en la primera palabra». Al leer las tres líneas juntas, el quiebre se veía pequeño al lado del resto. Escribió una línea más para la próxima vez: «El mismo tipo de pregunta, en una sesión más pequeña».' },
      photo: { id: '1572020487535-31e268b25e21', alt: 'Hombre tomando notas en un cuaderno' } },
    { id: 'confidence-4', title: 'Una frase de apoyo para tu voz interior', minutes: 6,
      goal: 'Después de un error, háblate de una manera que sea a la vez honesta y útil.',
      reading: ['Decir «No pasó nada» quizá no te convenza. «Fue difícil; aun así intenté decir una frase» puede ser más realista. Ser amable contigo no significa renunciar a la responsabilidad. Puedes ser cálido y honesto a la vez, como un buen entrenador con un jugador después de un partido difícil: claro sobre lo que salió mal y claramente del lado del jugador. Esa combinación es lo que hace que el siguiente intento se sienta posible.', 'Si hubo un error, elige la parte que se puede arreglar. Disculparte con alguien, revisar de nuevo la información o preparar una nota para la próxima reunión son opciones concretas. Menospreciarte no reemplaza estos pasos; normalmente solo los hace más difíciles de dar, porque añade vergüenza a una situación que ya se siente incómoda. Una reparación, aunque sea pequeña, convierte el error en algo que ya atendiste y no en algo que sigues cargando.'],
      practice: ['Nota la frase dura en tu mente; no tienes que seguir releyéndola.', 'Reconoce la situación diciendo: «Esto fue difícil para mí».', 'Luego añade un paso de apoyo o de reparación.'], reflection: '¿Qué frase te gustaría decirte en tu próximo momento difícil?', question: '¿Cómo podría sonar una voz interior de apoyo?', options: ['Cometí un error; puedo ver qué parte arreglar.', 'Si cometí un error, no valgo nada.', 'Soy perfecto en cada situación.'], correct: 0,
      feedback: 'La primera frase protege tanto tu responsabilidad como tu humanidad. El apoyo realista no necesita afirmaciones exageradas.', takeaway: 'Ser justo contigo puede hacer más fácil volver a intentarlo.', sources: ['self-compassion', 'bandura-self-efficacy', 'self-forgiveness'],
      visual: { kind: 'steps', title: 'De una voz interior dura a una frase de apoyo',
        steps: [
          { label: 'Nota', text: 'Ve la frase dura; no tienes que seguir releyéndola.' },
          { label: 'Reconoce', text: '«Esto fue difícil para mí».' },
          { label: 'Habla con justicia', text: '«Cometí un error; puedo ver qué parte arreglar».' },
          { label: 'Un paso', text: 'Disculparte, revisar la información o preparar una nota.' },
        ],
        note: 'Ser amable contigo no es renunciar a la responsabilidad; tampoco hacen falta afirmaciones exageradas.' },
      deeper: [
        { heading: 'Qué muestra la investigación sobre la autocompasión', paragraphs: [
          'En 56 ensayos aleatorizados, las intervenciones de autocompasión mostraron reducciones a corto plazo de pequeñas a medianas en el estrés, la ansiedad y los síntomas depresivos. Es un efecto real pero modesto, y los estudios tenían un riesgo general de sesgo alto, así que es justo tomar el hallazgo con ligereza. También encaja con un estudio sobre procrastinación en el que los estudiantes que se perdonaron más por haber postergado un examen procrastinaron menos antes del siguiente.',
          'Una forma útil de verlo es que la dureza y la amabilidad apuntan a lo mismo, hacerlo mejor la próxima vez, pero la dureza añade miedo encima, y el miedo tiende a hacer que el siguiente intento se sienta más arriesgado. Una frase justa y cálida deja la lección en su sitio y quita la amenaza extra.',
        ] },
        { heading: 'Por qué las afirmaciones exageradas pueden salir mal', paragraphs: [
          'Bandura contaba las palabras de ánimo entre las fuentes de la autoeficacia, pero las veía más débiles que tu propia experiencia. Decirte «soy increíble en todo» justo después de un tropiezo choca con lo que acabas de vivir, y eso puede hacer difícil creerlo.',
          'El apoyo realista trabaja con la evidencia y no contra ella. Nombra lo que pasó, reconoce el esfuerzo y señala un siguiente paso. Compara las dos columnas de abajo y nota cuáles podrías creer de verdad en un mal día.',
        ],
          visual: { kind: 'compare', title: '¿Exageración o apoyo realista?',
            left: { label: 'Exageración', items: ['«Soy perfecto y nada salió mal».', '«Nunca volveré a cometer ese error».', '«A todos les encantó».'] },
            right: { label: 'Apoyo realista', items: ['«Fue difícil, y aun así lo hice».', '«Sé qué parte arreglar la próxima vez».', '«Una persona pareció interesada; es un comienzo».'] },
            note: 'El ánimo es más creíble cuando coincide con lo que realmente pasó.' } },
      ],
      example: { title: 'Fátima, 42 años, administradora escolar', text: 'Fátima envió un correo a los padres con la fecha equivocada de la excursión escolar. Cuando un padre respondió señalándolo, se le hundió el estómago y empezó la voz de siempre: «¿Cómo pudiste ser tan descuidada? Todos pensarán que no puedes hacer tu trabajo». Notó la frase y no discutió con ella. Dijo en voz baja: «Esto fue difícil. Me equivoqué con la fecha». Luego vino la parte justa: «Puedo arreglarlo en una hora». Envió una corrección breve a todos los padres, le agradeció al que se había dado cuenta y añadió una revisión de fechas a su plantilla de correo. La vergüenza se quedó toda la tarde. Pero había gastado su energía en la reparación y no en el veredicto.' },
      photo: { id: '1573497491208-6b1acb260507', alt: 'Dos mujeres sentadas a una mesa conversando' } },
    { id: 'confidence-5', title: 'Tu propio plan de valentía', minutes: 8,
      goal: 'Elige un experimento, una fuente de apoyo y una revisión para la semana que viene.',
      reading: ['Terminar este curso no significa que tus miedos se acabarán. Ahora puedes usar juntos nombrar el sentimiento, reducir el paso y reunir información de un experimento. Estas tres herramientas funcionan mejor como rutina: nombrar, reducir, probar, registrar y luego elegir el siguiente paso según lo que aprendiste. Puede que el miedo siga apareciendo cada vez; la diferencia es que ahora tienes una manera de avanzar con él y no de esperar a que se vaya.', 'Incluye descanso y apoyo en tu plan. Un día sin experimento no borra todo tu progreso. Cambiar un paso que no te funciona es tomarte en serio tu propia vida. Un plan que se ajusta a tu semana real, con sus noches de cansancio y sus días ocupados, te llevará más lejos que un plan ideal que no puedes mantener. Decide de antemano con quién podrías hablar si un paso resulta más difícil de lo esperado.'],
      practice: ['Decide una conducta segura que probarás en los próximos días y cuándo.', 'Arma un plan de arranque: «Si quiero contenerme y postergarlo, primero voy a …».', 'Elige una revisión de dos minutos después de tu experimento y una fuente de apoyo a la que puedas acudir si hace falta.'], reflection: '¿Qué paso eliges dar, aunque tengas miedo?', question: '¿Y si el plan no funciona?', options: ['Debería criticarme con más dureza.', 'Debería revisar el paso y las condiciones, y pedir apoyo si hace falta.', 'Demuestra que nunca podré cambiar.'], correct: 1,
      feedback: 'Que un plan funcione depende de las condiciones. Revisarlo es una parte normal del proceso.', takeaway: 'Aun con miedo, puedes elegir un paso que te quede bien.', sources: ['mcii', 'monitoring', 'self-compassion', 'confidence-five-second-rule', 'confidence-fear-ladder'],
      visual: { kind: 'table', title: 'Plantilla del plan de valentía', columns: ['Parte del plan', 'Tu respuesta'],
        rows: [
          ['Experimento', 'Una conducta segura y cuándo: …'],
          ['Plan de arranque', '«Si quiero postergarlo, primero voy a ….»'],
          ['Revisión', 'Dos minutos después del experimento: ¿qué pasó?'],
          ['Apoyo', 'Alguien a quien puedes acudir si hace falta: …'],
          ['Descanso', 'Cuándo tomarás una pausa: …'],
        ],
        note: 'Un día sin experimento no borra tu progreso. Puedes cambiar un paso que no esté funcionando.' },
      deeper: [
        { heading: 'La regla de los 5 segundos, con honestidad', paragraphs: [
          'Mel Robbins popularizó un movimiento sencillo para el momento de la duda: contar hacia atrás desde cinco y, al llegar a uno, moverte físicamente hacia la acción. Su idea es que hay una breve ventana entre un impulso y la avalancha de razones para no actuar, y que la cuenta regresiva ayuda a aprovecharla. A muchas personas les resulta un empujoncito útil.',
          'Conviene ser claros con la evidencia: no encontramos un estudio controlado de la regla de los 5 segundos en sí, y el respaldo viene sobre todo de historias personales. Su núcleo útil se parece mucho a un plan «si… entonces…» con una señal incorporada: «Si noto que estoy dudando, entonces cuento hacia atrás y doy la primera acción pequeña». Usada así, para un paso que ya elegiste y que es seguro, es un experimento de bajo costo.',
        ] },
        { heading: 'Mantener viva la escalera', paragraphs: [
          'La confianza tiende a crecer de forma despareja. Algunas semanas subirás un peldaño; otras te quedarás donde estás o bajarás porque la vida se puso pesada. Una breve revisión semanal te mantiene honesto sin convertirla en una calificación. Los registros escritos se asociaron con un beneficio mayor en la investigación sobre monitoreo del progreso, así que unas pocas líneas en papel valen los dos minutos.',
          'Usa la revisión para elegir el siguiente peldaño, no para juzgar el anterior. Si un paso se sintió como un 3 dos veces seguidas, puede ser hora de subir. Si se sintió como un 8, añade un paso más pequeño por debajo. De cualquier manera, estás aprendiendo cómo funciona tu valentía.',
        ],
          visual: { kind: 'table', title: 'Revisión semanal de dos minutos', columns: ['Pregunta', 'Respuesta de ejemplo'],
            rows: [
              ['¿Qué intenté?', 'Hice una pregunta en la reunión pequeña.'],
              ['¿Qué tan aterrador fue, de 0 a 10?', 'Antes: 6. Después: 3.'],
              ['¿Qué vio una cámara?', 'Pregunté; mi jefa lo anotó.'],
              ['¿Siguiente peldaño?', 'El mismo paso una vez más, luego un comentario en la reunión de todo el equipo.'],
            ],
            note: 'Las calificaciones sirven para elegir el siguiente paso, no para ponerte nota.' } },
      ],
      example: { title: 'Rosa, 57 años, vuelve al trabajo después de años en casa', text: 'Rosa quería presentarse a los otros voluntarios de la biblioteca, pero cada semana entraba sin hacer ruido, ordenaba libros y se iba. Su plan: el sábado, saludar y decir su nombre a un voluntario. Plan de arranque: «Si quiero escabullirme, primero cuento desde cinco y digo ‘Hola, soy Rosa’». Apoyo: su hija, que la llamaría el sábado por la noche. El sábado se sorprendió yendo hacia el cuarto del fondo. Contó, se dio la vuelta y se lo dijo a la mujer del mostrador de devoluciones. La mujer sonrió, dijo su propio nombre y volvió a su trabajo. Eso fue todo. En su revisión de dos minutos Rosa escribió: «Miedo antes: 7. Después: 3. Siguiente: preguntarle a alguien cuánto tiempo lleva de voluntario».' },
      technique: { name: 'La regla de los 5 segundos', origin: 'Mel Robbins · The 5 Second Rule (2017)',
        steps: [
          'Elige de antemano una acción segura y pequeña que quieras dar, como hacer tu pregunta en la reunión.',
          'Nota el momento en que empiezas a dudar: una pausa, una excusa, un impulso repentino de hacer otra cosa.',
          'Cuenta hacia atrás en silencio: 5, 4, 3, 2, 1.',
          'En el «1», da el primer movimiento físico hacia la acción: levanta la mano, ponte de pie, presiona llamar.',
          'Después, escribe una línea sobre lo que hiciste y decide si volverás a usar la cuenta regresiva.',
        ],
        evidence: 'No encontramos investigación controlada sobre la regla de los 5 segundos en sí; el respaldo son sobre todo historias personales. Su núcleo funcional, una señal clara ligada a una acción pequeña elegida de antemano, se parece a la planificación «si… entonces…», que sí tiene respaldo en la investigación. Úsala solo para pasos que sean seguros y que hayas elegido, no para forzarte a atravesar un peligro real o una ansiedad intensa.',
        sourceId: 'confidence-five-second-rule' },
      photo: { id: '1748609422318-7301636fb625', alt: 'Mano escribiendo un plan en un cuaderno con casillas de verificación' } },
  ],
};
