import clsx from "clsx"
import { PropsWithChildren, ReactNode } from "react"

interface HeroProps extends PropsWithChildren {
  title: string
  backroungImageUrl: string
  description: ReactNode
  button?: ReactNode
  className?: string
  direction?: "vertical" | "horizontal"
}

const Hero = ({
  title,
  backroungImageUrl,
  description,
  button,
  className,
  direction = "horizontal",
  children,
}: HeroProps) => {
  if (direction === "vertical")
    return (
      <div className="hero bg-base-200 ">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <img
              src={backroungImageUrl}
              className="max-w-lg rounded-lg "
              alt="pool pic"
            />
            <h1 className="text-5xl font-bold mb-4">{title}</h1>
            <p className="py-6">{description}</p>
            {children}
            {button}
          </div>
        </div>
      </div>
    )

  return (
    <div className={clsx(className, "hero bg-base-200 ")}>
      <div className={clsx("hero-content flex-col lg:flex-row-reverse")}>
        <img
          src={backroungImageUrl}
          className="max-w-sm rounded-lg "
          alt="donation pic"
        />
        <div>
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="py-6">{description}</p>
          {button}
        </div>
      </div>
    </div>
  )
}

export default Hero
