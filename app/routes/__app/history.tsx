import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

export default function History() {
  let [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    let _history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    setHistory(_history);
  }, []);
  return (<>
    <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
      Historial de enunciados
    </h1>
    {history.length > 0 ?
      <>
        <h2 className="text-md md:text-xl font-bold text-white text-center">
          ¡Hacé clic en el enunciado que quieras repasar!
        </h2>
        <ul className="list-disc space-y-6">
          {history.reverse().map(element => (
            <li key={element}>
              <Link className="underline" to={`/?text=${encodeURI(element.replace("+", "%2B"))}`}>{element}</Link>
            </li>
          ))}
        </ul>
      </> :
      <h2 className="text-xl font-bold text-white text-center">
        ¡Nada por aquí! A medida que resuelvas ejercicios tu historial crecerá
      </h2>}
  </>);
}