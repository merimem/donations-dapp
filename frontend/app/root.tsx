import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"

import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import "./tailwind.css"
import { Providers } from "./utils/Providers"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-base-300">
        <Providers>
          <Navbar />
          <div className="mx-6 mt-4">{children}</div>
          <ScrollRestoration />
          <Scripts />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
