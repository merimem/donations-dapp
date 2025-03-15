import clsx from "clsx"
import { ReactNode } from "react"

interface HeroProps {
  title: string
  backroungImageUrl: string
  description: string
  button?: ReactNode
  className?: string
}

const index = ({
  title,
  backroungImageUrl,
  description,
  button,
  className,
}: HeroProps) => {
  return (
    <div className={clsx(className, "hero ")}>
      <div className="hero-content flex-col lg:flex-row-reverse">
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

export default index
