import icon from "~/assets/icon.png";
import { NavLink, Outlet } from "@remix-run/react";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;700&display=swap"
    }
  ];
}

function Link({ to, text, reload = false }:
 {to: string, text: string, reload?: boolean}) {
  return (
    <NavLink
      className={({ isActive }) =>
        isActive ? "p-4 pb-3.5 border-b-2 border-white" : "p-4"
      }
      to={to}
      reloadDocument={reload}
    >
      {text}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="bg-gray-900 font-['Comfortaa'] text-white main-background bg-repeat overflow-hidden">
      <nav className="bg-slate-800">
        <ul className="flex gap-2 md:gap-6 px-3 items-center">
          <li className="flex"><Link to="/" text="Inicio" reload/></li>
          <li className="flex"><Link to="/history" text="Historial" reload/></li>
          <li className="flex"><Link to="/faq" text="Ayuda" reload/></li>
        </ul>
      </nav>
      <main className="min-h-[calc(100vh_-_32px_-_16px_-_16px_-_56px)] md:space-y-6 space-y-4 flex-col md:pt-10 pt-7 p-5 lg:px-0 sm:max-w-3xl sm:mx-auto">
        <Outlet/>
      </main>

      <footer className="bg-slate-800 flex justify-center space-x-3 items-center border-t-2 border-gray-700 py-4">
        <img src={icon} alt="" className="h-8"/>
        <span className="text-white font-medium">MathEasy © 2022</span>
      </footer>
    </div>
  );
}