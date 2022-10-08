export default function FAQ() {
  let content = [
    {
      question: "¿Qué es MathEasy?",
      answer: () => <p>MathEasy es una plataforma que tiene el fin de ayudarte en tu aprendizaje de las matemáticas. Nace como idea del Proyecto Final de estudiantes de la UTN FRBA, teniendo en mente proporcionar una herramienta más de estudio y hacer la experiencia de aprendizaje más amena (en criollo, es lo que nos hubiese gustado tener cuando estudiamos esa materia <span aria-hidden>&#128540;</span>).</p>
    },
    {
      question: "¿Cómo se usa MathEasy?",
      answer: () => <><p>En la pantalla de Inicio encontrarás un área de texto donde podés escribir el enunciado matemático (¡sí, tal cual te lo dió tu profe! <span aria-hidden>&#128588;</span>). Una vez lo hayas escrito, podrás hacer clic en el botón "Calcular" para obtener la expresión matemática correspondiente a tu ejercicio.</p><p>Si esta expresión se corresponde con una función 📈, podrás obtener su análisis: dominio, imagen, raíces y ordenada al origen.</p><p>Si esta expresión se corresponde con una ecuación o inecuación <span aria-hidden>&#129518;</span>, podrás obtener la resolución paso a paso de la misma.</p><p>En ambos casos, ¡tendrás la opción de obtener ejercicios parecidos para seguir practicando! <span aria-hidden>&#128679;</span> Esta funcionalidad todavía se encuentra en construcción.</p></>
    },
    {
      question: "¿Qué enunciados entiende MathEasy?",
      answer: () => <>
        <p>MathEasy es bastante inteligente por lo que entiende casi cualquier enunciado matemático <span aria-hidden>&#128526;</span>. Te dejamos algunos ejemplos:
        </p>
        <p>- Resolvé la siguiente inecuación: (163 + (x + 9)) * 10 {">"}= 91.
        </p>
        <p>- Despejar x de la siguiente ecuación: x + 8 = 9.
        </p>
        <p>- ¿Cuál es el número que duplicado, sumado 8, todo esto último dividido 16 es menor a cien? </p><p>- Realizá el análisis de la función f(x) = 8x + 15.</p><p>- Indicá el dominio e imagen de la función que pasa por los puntos (2;6) y (3;4).</p><p>- Analizá la parábola que tiene su vértice en (1,2) y pasa por el punto (2,4).</p><p>- Realizá el análisis de la parábola que pasa por los puntos (1;2), (2;5) y (3;6).</p></>
    },
    {
      question: "¿Por qué MathEasy no resuelve algunos enunciados?",
      answer: () => <><p>Si bien dijimos que MathEasy es bastante inteligente, todavía hay enunciados que no entiende y por lo tanto no puede clasificar de qué tema son para resolverlos. <span aria-hidden>&#128517;</span></p><p>También hay que tener cuidado en cómo se escriben algunas expresiones matemáticas para que pueda entenderlas:</p><p>- Los símbolos permitidos son ^ (potencia), * (multiplicación), / (división), + (suma) y - (resta).</p><p>- Para decir que una incógnita está siendo multiplicada debemos escribir, por ejemplo, 2*x o x*2 pero no x2 o 2x.</p><p>Por último, puede existir el caso en que MathEasy sí sepa de qué tema se trata el enunciado pero no pueda resolverlo 😔. ¡No te preocupes! Además de decirte el tema matemático del enunciado, te ofrecerá información conceptual del mismo para que puedas resolverlo por tu cuenta. <span aria-hidden>&#128218;</span></p></>
    },
    {
      question: "¿Se guardan los enunciados que ya consulté?",
      answer: () => <><p>En la sección Historial podrás hacer clic en los enunciados que ya consultaste <span aria-hidden>&#128521;</span>. Esta acción te llevará a la pantalla de Inicio y solo tendrás que apretar el botón "Calcular" para volver a obtener la expresión matemática.</p></>
    },
    {
      question: "¿Qué se guarda en el historial?",
      answer: () => <><p>En "Historial" guardamos los últimos 10 enunciados que calculaste en el navegador con MathEasy.</p><p>El historial se guarda de manera local, si por ejemplo usas MathEasy en la computadora y el celular, no podrás ver el historial del celular en la computadora o viceversa.</p><p>En MathEasy no guardamos ningún dato tuyo <span aria-hidden>&#128521;</span></p></>
    },
    {
      question: "¿Puedo compartir mis resultados?",
      answer: () => <><p>¡Sí! Desde MathEasy creemos que el aprendizaje junto a otras personas es mucho más enriquecedor <span aria-hidden>&#129730;</span>. Por eso podrás hacer clic en "¡Copiá el link al ejercicio y compartilo!" para enviarselo a quien quieras.</p></>
    },
    {
      question: "¿Es posible acceder desde cualquier dispositivo?",
      answer: () => <><p>¡Sí! Podrás usar MathEasy desde cualquier dispositivo que cuente con un navegador y acceso a internet. <span aria-hidden>&#128241; &#128187;</span></p></>
    },
    {
      question: "¿Cómo funciona MathEasy?",
      answer: () => <><p>¡Magia! <span aria-hidden>&#129668;</span> Son las artes oscuras de la Inteligencia Artificial (en realidad es una disciplina de las Ciencias de la Computación <span aria-hidden>&#129323;</span>), que intenta replicar y desarrollar la inteligencia y sus procesos implícitos a través de computadoras. Si bien la Inteligencia Artificial la encontramos en el día a día en diferentes ámbitos (desde los autos que se manejan solos <span aria-hidden>&#128663;</span> hasta en el algoritmo que no deja de mostrarnos videos de gatitos en las redes sociales <span aria-hidden>&#128008;</span>), en esta ocasión se encuentra en la habilidad de predecir el tema matemático del enunciado que reciba para así poder armar la expresión matemática que corresponde.</p></>
    }
  ];

  return (<>
    <h1 className="text-2xl md:text-3xl text-white text-center">
      <span className="mr-2" aria-hidden>&#129300;</span>
      Preguntas frecuentes
    </h1>
    <ul className="list-disc space-y-6">
      {content.map(element => (
        <li key={element.question} className="space-y-2">
          <h3 className="text-lg font-semibold">{element.question}</h3>
          {element.answer()}
        </li>
      ))}
    </ul>
  </>)
  ;
}