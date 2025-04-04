import clsx from "clsx"
import { ReactNode } from "react"

interface CardProps {
  imageUrl?: string
  textBtn?: string
  title?: string
  description?: ReactNode
  className?: string
  imageClassName?: string
  onClick?: () => void
}

const index = ({
  imageUrl,
  title,
  description,
  textBtn,
  className,
  imageClassName,
  onClick,
}: CardProps) => {
  return (
    <div
      className={clsx(className, "card-hover card bg-base-100 shadow-sm")}
      onClick={onClick}
    >
      {imageUrl && (
        <figure>
          <img src={imageUrl} alt="Album" className={clsx(imageClassName)} />
        </figure>
      )}
      <div className="card-body dark:bg-gradient-to-t dark:from-black/80 dark:to-transparent">
        <h2 className="card-title font-bold capitalize text-xl">{title}</h2>
        <div className="italic">{description}</div>
        {textBtn && (
          <div className="card-actions justify-end">
            <button className="btn btn-primary ">{textBtn}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default index
