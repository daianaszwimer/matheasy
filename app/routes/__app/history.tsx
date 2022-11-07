import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

export default function History() {
  let [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    let _history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    setHistory(_history);
  }, []);
  return (<>
    <h1 className="text-2xl md:text-3xl text-white text-center">
      <span className="mr-2" aria-hidden>&#128214;</span>
      Historial de enunciados
    </h1>
    {history.length > 0 ?
      <>
        <h2 className="text-base md:text-xl text-white text-center">
          ¡Hacé clic en el enunciado que quieras repasar!
        </h2>
        <ul className="space-y-6 list-['\27A1\fe0f']">
          {history.reverse().map(element => (
            <li key={element} className="pl-2">
              <Link className="underline" to={`/?index&text=${encodeURI(element.replaceAll("%", "%25").replaceAll("+", "%2B").replaceAll("=", "%3D"))}&h`}>{element}</Link>
            </li>
          ))}
        </ul>
      </> :
      <h2 className="text-xl text-white text-center">
        ¡Nada por aquí! A medida que resuelvas ejercicios tu historial crecerá
      </h2>}
  </>);
}