import icon from "~/assets/icon.png";
import { NavLink, Outlet } from "@remix-run/react";

function NavItem({ to, text, reload = false }:
 {to: string, text: string, reload?: boolean}) {
  return (
    <NavLink
      className={({ isActive }) =>
        isActive ? "p-4 pb-3.5 border-b-2 border-white font-medium" : "p-4"
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
    <div className="bg-gray-900 font-['Mona Sans'] text-white main-background bg-repeat overflow-hidden">
      <nav className="bg-slate-800">
        <ul className="flex gap-2 md:gap-6 px-3 items-center">
          <li className="flex"><NavItem to="/" text="Inicio" reload/></li>
          <li className="flex"><NavItem to="/history" text="Historial" reload/></li>
          <li className="flex"><NavItem to="/faq" text="Ayuda" reload/></li>
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