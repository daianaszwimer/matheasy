import icon from "~/assets/icon.png";
import { Link, Outlet } from "@remix-run/react";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;700&display=swap",
    },
  ];
}

export default function App() {
  return (
    <div className="bg-gray-900 font-['Comfortaa'] text-white">
      <nav className="bg-slate-800 border-b-2 border-gray-700">
        <ul className="flex gap-6 px-3">
          <li className="flex"><Link className="p-4" to="/">Inicio</Link></li>
          <li className="flex"><Link className="p-4" to="/faq">Preguntas Frecuentes</Link></li>
          <li className="flex"><Link className="p-4" to="/history">Historial de Enunciados</Link></li>
        </ul>
      </nav>
      <main className="min-h-[calc(100vh_-_32px_-_16px_-_16px_-_56px)] space-y-6 flex-col pt-10 p-5 sm:max-w-2xl sm:mx-auto">
        <Outlet/>
      </main>

      <footer className="bg-slate-800 flex justify-center space-x-3 items-center border-t-2 border-gray-700 py-4">
        <img src={icon} alt="" className="h-8"/>
        <span className="text-white font-medium">MathEasy © 2022</span>
      </footer>
    </div>
  );
}