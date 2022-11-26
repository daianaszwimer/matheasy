import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

export function ErrorBoundary() {
  //const caught = useCatch();
  return (
    <div className="font-light text-xl flex flex-col items-center space-y-1">
      <p>¡Ups! Algo falló</p>
      <p>No te preocupes, no es tu culpa!</p>
      <Link to="/" className="underline" reloadDocument>Hacé click acá para volver al Inicio</Link>
    </div>
  );
}

export default function History() {
  let [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    let _history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    setHistory(_history);
  }, []);
  return (
    <>
      <h1 className="text-2xl md:text-3xl text-white text-center">
        <span className="mr-2" aria-hidden>&#128214;</span>
        Historial de enunciados
      </h1>
      {history.length > 0 ?
        (
          <>
            <h2 className="text-base md:text-xl text-white text-center">
              ¡Hacé click en el enunciado que quieras resolver!
            </h2>
            <ul className="space-y-6 list-['\27A1\fe0f'] ml-2 md:ml-0">
              {history.slice().reverse().map(element => (
                <li key={element} className="pl-2">
                  <Link className="underline" to={`/?index&text=${encodeURI(element?.replaceAll("%", "%25")?.replaceAll("+", "%2B")?.replaceAll("=", "%3D"))}&h`}>{element}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h2 className="text-xl text-white text-center">
            ¡Nada por aquí! Cuando resuelvas tu primer ejercicio{" "}
            va a aparecer esta sección
          </h2>
        )
      }
    </>
  );
}