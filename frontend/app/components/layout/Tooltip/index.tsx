import { PropsWithChildren } from "react"

interface TooltipProps extends PropsWithChildren {
  dataTip: string
}

const Tooltip = ({ children, dataTip }: TooltipProps) => {
  return (
    <div className="tooltip" data-tip={dataTip}>
      {children}
    </div>
  )
}

export default Tooltip
