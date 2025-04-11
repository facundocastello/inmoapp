import { useEffect, useState } from 'react'

export const LoadingMessage = ({
  infinite = false,
  messages,
  customMessage = 'This may take one or two minutes',
  time = 5000,
}: {
  infinite?: boolean
  messages: string[]
  customMessage?: string
  time?: number
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentMessageIndex((prev) => {
          if (prev === messages.length - 1) {
            if (infinite) {
              clearInterval(interval)
              return prev
            }
            return 0
          }
          return prev + 1
        })
        setIsVisible(true)
      }, 500)
    }, time)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.flex}>
        <div className={styles.icon}>
          <div className={styles.iconPulse} />
          <div className={styles.iconSpin} />
        </div>
        <p
          className={`${styles.message} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
          {messages[currentMessageIndex]}
        </p>
        <p className={styles.subMessage}>{customMessage}</p>
      </div>
    </div>
  )
}

const styles = {
  container:
    'fixed inset-0 flex items-center justify-center bg-primary-100/80 backdrop-blur-sm z-100',
  message:
    'mt-5 text-xl text-primary-900 font-bold transition-all duration-500',
  subMessage: 'text-xs text-primary-900',
  icon: 'relative h-12 w-12',
  iconPulse:
    'absolute inset-0 animate-ping rounded-full border-4 border-primary/20',
  iconSpin:
    'absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent',
  flex: 'flex flex-col items-center gap-6',
}
