import icon from "~/assets/icon.png";

let content = [
  {
    question: "¿Qué es MathEasy?",
    answer: "MathEasy es una plataforma que tiene el fin de ayudarte en tu aprendizaje de las matemáticas. Nace como idea del Proyecto Final de estudiantes de la UTN FRBA, teniendo en mente proporcionar una herramienta más estudio y hacer la experiencia de aprendizaje más amena (en criollo, es lo que nos hubiese gustado tener cuando estudiamos esa materia 😜)."
  },
  {
    question: "¿Cómo se usa Matheasy?",
    answer: "En la pantalla de Inicio encontrarás un área de texto donde podés escribir el enunciado matemático (¡sí, tal cual te lo dió tu profe! 🙌). Una vez lo hayas escrito, podrás hacer clic en el botón “Calcular” para obtener la expresión matemática correspondiente a tu ejercicio.\nSi esta expresión se corresponde con una función 📈, podrás ver su análisis: dominio, imagen, raíces y ordenada al origen.\nSi esta expresión se corresponde con una ecuación o inecuación 🧮, podrás ver la resolución paso a paso de la misma.\nEn ambos casos, ¡tendrás la opción de ver ejercicios parecidos para seguir practicando! 🚧 Esta funcionalidad todavía se encuentra en construcción."
  },
  {
    question: "¿Qué enunciados entiende MathEasy?",
    answer: "MathEasy es bastante inteligente por lo que entiende casi cualquier enunciado matemático 😎. Te dejamos unos ejemplos:\n- Resolvé la siguiente inecuación: (163 + (x + 9)) * 10 >= 91.\n- Despejar x de la siguiente ecuación: x + 8 = 9.\n- ¿Cuál es el número que duplicado, sumado 8, todo esto último dividido 16 es menor a cien? \n- Realizá el análisis de la función f(x) = 8x + 15.\n- Indicá el dominio e imagen de la función que pasa por los puntos (2;6) y (3;4).\n- Analizá la parábola que tiene su vértice en (1,2) y pasa por el punto (2,4).\n- Realizá el análisis de la parábola que pasa por los puntos (1;2), (2;5) y (3;6)."
  },
  {
    question: "¿Por qué MathEasy no resuelve algunos enunciados?",
    answer: "Si bien dijimos que MathEasy es bastante inteligente, todavía hay enunciados que no entiende y por lo tanto no puede clasificar de qué tema son para resolverlos 😅.\nTambién hay que tener cuidado en cómo se escriben algunas expresiones matemáticas para que pueda entenderlas:\nTODO LISTA\nPor último, puede existir el caso en que MathEasy sí sepa de qué tema se trata el enunciado pero no pueda resolverlo 😔. ¡Pero no te preocupes! Además de decirte el tema matemático del enunciado, te ofrecerá información conceptual del mismo para que puedas encararlo por tu cuenta. 📚"
  },
  {
    question: "¿Se guardan los enunciados que ya consulté?",
    answer: "En la sección Historial podrás hacer clic en los enunciados que ya consultaste. Este paso te llevará a la pantalla de Inicio y solo tendrás que apretar el botón “Calcular” para volver a obtener la expresión matemática. 😉"
  },
  {
    question: "¿Puedo compartir mis resultados?",
    answer: "¡Sí! Desde MathEasy creemos que el aprendizaje junto a otras personas es mucho más enriquecedor 👥. Por eso podrás hacer clic en “¡Copiá el link al ejercicio y compartilo!” para enviarselo a quien quieras."
  },
  {
    question: "¿Es posible acceder desde cualquier dispositivo?",
    answer: "¡Sí! Podrás usar MathEasy desde cualquier dispositivo con acceso a internet. 📱💻"
  },
  {
    question: "¿Cómo funciona MathEasy?",
    answer: "¡Magia! 🪄 Son las artes oscuras de la Inteligencia Artificial (en realidad es una disciplina de las Ciencias de la Computación 🤭), que intenta replicar y desarrollar la inteligencia y sus procesos implícitos a través de computadoras. Si bien la Inteligencia Artificial la encontramos en el día a día en diferentes ámbitos (desde los autos que se manejan solos 🚗 hasta en el algoritmo que no deja de mostrarnos videos de gatitos en las redes sociales 🐈), en esta ocasión se encuentra en la habilidad de predecir el tema matemático del enunciado que reciba para así poder armar la expresión matemática que corresponde."
  }
];

export default function FAQ() {
  return (<>
    <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
      Preguntas frecuentes
    </h1>
    <ul className="list-disc space-y-6">
      {content.map(element => (
        <li key={element.question} className="space-y-2">
          <h3 className="text-lg font-semibold">{element.question}</h3>
          <p className="text-md">{element.answer}</p>
        </li>
      ))}
    </ul>
  </>)
  ;
}