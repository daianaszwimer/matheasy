import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

export default function History() {
  let [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    let _history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    setHistory(_history);
  }, []);
  return (<>
    <h1 className="text-3xl font-bold text-white text-center">
      Historial de enunciados
    </h1>
    <h2 className="text-xl font-bold text-white text-center">
      Hacé click en el enunciado que quieras ver
    </h2>
    <ul className="list-disc space-y-6">
      {history.map(element => (
        <li key={element}>
          <Link className="underline" to={`/?text=${encodeURI(element)}`}>{element}</Link>
        </li>
      ))}
    </ul>
  </>);
}