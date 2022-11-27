import icon from "~/assets/icon.png";
import { NavLink, Outlet, useLocation } from "@remix-run/react";

function NavItem({ to, text }:
 {to: string, text: string}) {
  return (
    <NavLink
      className={({ isActive }) =>
        isActive ? "p-4 pb-3.5 border-b-2 border-white font-medium" : "my-0.5 py-3.5 px-4 transition-colors hover:bg-gray-700 rounded-md"
      }
      to={to}
    >
      {text}
    </NavLink>
  );
}

export default function App() {
  let location = useLocation();

  return (
    <div className="bg-gray-900 font-['Nunito'] text-white main-background bg-repeat overflow-hidden">
      <nav className="bg-slate-800">
        <ul className="flex gap-2 md:gap-6 px-3 items-center">
          <li className="flex">
            <NavLink
              className={({ isActive }) =>
                isActive ? "p-3.5 pb-3 border-b-2 border-white font-medium" : "my-0.5 py-3 px-3.5 transition-colors hover:bg-gray-700 rounded-md"
              }
              to="/"
              reloadDocument={location.pathname === "/"}
            >
              <img width={28} src={icon} alt="Logo de MathEasy"/>
            </NavLink>
          </li>
          <li className="flex">
            <NavItem to="/history" text="Historial"/>
          </li>
          <li className="flex">
            <NavItem to="/faq" text="Ayuda"/>
          </li>
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