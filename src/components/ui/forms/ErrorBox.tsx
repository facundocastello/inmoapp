import { FieldErrors } from 'react-hook-form'

export default function ErrorBox({ errors }: { errors: FieldErrors }) {
  return (
    errors && (
      <div className={styles.error}>
        {Object.entries(errors).map(([key, error]) => (
          <div key={key}>
            {key}: {error?.message?.toString()}
          </div>
        ))}
      </div>
    )
  )
}

const styles = {
  error: 'text-red-500',
}
