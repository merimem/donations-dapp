import { Link } from "@remix-run/react"
import React from "react"
import logo from "../../../public/logo.png"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ROUTES } from "~/utils/routes/routes.constants"
import { UserCircleIcon } from "@heroicons/react/24/solid"

const Navbar = () => {
  const [theme, setTheme] = React.useState("dark")
  const { isConnected } = useAccount()
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  React.useEffect(() => {
    document &&
      document.querySelector("html") &&
      document.querySelector("html")?.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to={`/projects`}>Projects</Link>
            </li>
            <li>
              <a>Community</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li></li>
          </ul>
        </div>
        <Link className="btn btn-ghost text-xl" to="/">
          <img alt="logo-footer" src={logo} className="w-16 h-16" />
          Chain4Good
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex sm:hidden md:hidden">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to={`/projects`}>Projects</Link>
          </li>
          {isConnected && (
            <li>
              <Link to={ROUTES.POOLS}>Pools</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end gap-2 ">
        {isConnected ? (
          <ul className="menu menu-horizontal gap-4">
            <li>
              <Link to={ROUTES.PROFILE} className="p-2">
                <UserCircleIcon className="h-5 w-5" />
                My Profile
              </Link>
            </li>
            <li>
              <ConnectButton showBalance={false} />
            </li>
          </ul>
        ) : (
          <ul className="menu menu-horizontal gap-4">
            <li>
              <Link className="btn btn-secondary" to="/connect/association">
                Association
              </Link>
            </li>
            <Link className="btn btn-accent" to="/connect/donator">
              Donate
            </Link>
          </ul>
        )}
        <input
          type="checkbox"
          value="synthwave"
          className="toggle theme-controller"
          onClick={toggleTheme}
        />
      </div>
    </div>
  )
}

export default Navbar
