interface EthereumIconProps {
  className?: string
  isPink?: boolean
  isLight?: boolean
}

const EthereumIcon = ({ className, isPink, isLight }: EthereumIconProps) => {
  if (isLight)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m12 1.75l-6.25 10.5L12 16l6.25-3.75zM5.75 13.5L12 22.25l6.25-8.75L12 17.25z"
        />
      </svg>
    )
  if (isPink)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256"
        height="417"
        viewBox="0 0 256 417"
        className={className}
      >
        <path
          fill="#f762c4"
          d="m127.961 0l-2.795 9.5v275.668l2.795 2.79l127.962-75.638z"
        />
        <path fill="#993978" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
        <path
          fill="#f762c4"
          d="m127.961 312.187l-1.575 1.92v98.199l1.575 4.601l128.038-180.32z"
        />
        <path fill="#993978" d="M127.962 416.905v-104.72L0 236.585z" />
        <path
          fill="#141414"
          d="m127.961 287.958l127.96-75.637l-127.96-58.162z"
        />
        <path fill="#393939" d="m.001 212.321l127.96 75.637V154.159z" />
      </svg>
    )
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="256"
      height="417"
      viewBox="0 0 256 417"
      className={className}
    >
      <path
        fill="#343434"
        d="m127.961 0l-2.795 9.5v275.668l2.795 2.79l127.962-75.638z"
      />
      <path fill="#8c8c8c" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path
        fill="#3c3c3b"
        d="m127.961 312.187l-1.575 1.92v98.199l1.575 4.601l128.038-180.32z"
      />
      <path fill="#8c8c8c" d="M127.962 416.905v-104.72L0 236.585z" />
      <path fill="#141414" d="m127.961 287.958l127.96-75.637l-127.96-58.162z" />
      <path fill="#393939" d="m.001 212.321l127.96 75.637V154.159z" />
    </svg>
  )
}

export default EthereumIcon
