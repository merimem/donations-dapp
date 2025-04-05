import React, { ReactNode } from "react"

interface StatsProps {
  title: ReactNode
  value: ReactNode
  button?: ReactNode
}

const Stats = ({ title, value, button }: StatsProps) => {
  const defaultBtn = (
    <button className="btn btn-xs btn-success">Add funds</button>
  )
  return (
    <div className="stats bg-base-100 border border-base-300 mx-0 my-auto">
      <div className="stat">
        <div className="stat-title">{title}</div>
        <div className="stat-value flex">{value}</div>
        {button && <div className="stat-actions">{button}</div>}
      </div>
    </div>
  )
}

export default Stats
