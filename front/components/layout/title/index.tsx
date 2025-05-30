import clsx from "clsx"
import React from "react"

interface TitleProps extends React.PropsWithChildren {
  type: "h1" | "h2" | "h3"
  className?: string
}

const index = ({ children, type, className }: TitleProps) => {
  const Tag = type

  const style =
    type === "h1"
      ? "text-4xl font-semibold text-primary"
      : type === "h2"
      ? "text-2xl font-semibold text-secondary"
      : undefined
  return <Tag className={clsx(style, className)}>{children}</Tag>
}

export default index
