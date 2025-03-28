import clsx from "clsx"
import React, { ReactNode } from "react"

interface TimelineItemProps {
  timelineStart?: ReactNode
  timelineMiddle?: ReactNode
  timelineEnd?: ReactNode
  isSelected?: boolean
  index: number
  totalItems: number
}

const TimelineItem = ({
  timelineStart,
  timelineMiddle,
  timelineEnd,
  isSelected,
  index,
  totalItems,
}: TimelineItemProps) => {
  return (
    <li>
      {<hr className={clsx(isSelected && index > 0 && "bg-primary")} />}
      {timelineStart && <div className="timeline-start">{timelineStart}</div>}
      <div className="timeline-middle">
        {isSelected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-primary h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {timelineEnd && (
        <div className="timeline-end timeline-box">{timelineEnd}</div>
      )}
      <hr
        className={clsx(isSelected && index < totalItems - 1 && "bg-primary")}
      />
    </li>
  )
}

interface TimelineProps {
  itemsProps: TimelineItemProps[]
}
const Timeline = ({ itemsProps }: TimelineProps) => {
  return (
    <ul className="timeline p-4">
      {itemsProps.map((items) => (
        <TimelineItem {...items} key={items.index} />
      ))}
    </ul>
  )
}

export default Timeline
