import clsx from "clsx"

interface CardProps {
  imageUrl?: string
  textBtn?: string
  title: string
  description: string
  className?: string
  imageClassName?: string
}

const index = ({
  imageUrl,
  title,
  description,
  textBtn,
  className,
  imageClassName,
}: CardProps) => {
  return (
    <div className={clsx(className, "card bg-base-100 shadow-sm")}>
      {imageUrl && (
        <figure>
          <img src={imageUrl} alt="Album" className={clsx(imageClassName)} />
        </figure>
      )}
      <div className="card-body">
        <h2 className="card-title font-bold capitalize text-xl">{title}</h2>
        <p className="italic">{description}</p>
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
