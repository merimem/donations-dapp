import clsx from "clsx"
import React from "react"

interface TitleProps extends React.PropsWithChildren {
  type: "h1" | "h2" | "h3"
}

const index = ({ children, type }: TitleProps) => {
  const Tag = type

  const style = type === "h1" ? "text-lg font-semibold text-primary" : undefined
  return <Tag className={clsx(style)}>{children}</Tag>
}

export default index
