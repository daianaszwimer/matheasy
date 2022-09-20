import icon from "~/assets/icon.png";

let content = [
  {
    question: "¿Qué es MathEasy?",
    answer: "MathEasy es un Proyecto Final realizado por alumnos de la UTN FRBA"
  },
  {
    question: "¿Por qué MathEasy no entiende algunos enunciados?",
    answer: "A la hora de desarrollar MathEasy nos encontramos con ciertas limitaciones técnicas y de tiempos dado que nos dedicamos de manera part-time al proyecto"
  },
  {
    question: "¿Qué enunciados entiende MathEasy??",
    answer: "Poner ejemplos"
  },
  {
    question: "¿Cómo funciona MathEasy?",
    answer: "MathEasy analiza los enunciados utilizando Inteligencia Artificial, predice qué tipo de enunciado es y en base a eso, se interpreta y se arma la expresión matemática"
  },
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