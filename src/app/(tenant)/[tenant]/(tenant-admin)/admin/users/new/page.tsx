import { UserForm } from '@/components/admin/users/UserForm'

export default function NewUserPage() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Create User</h1>
      </div>
      <UserForm />
    </>
  )
}

const styles = {
  header: 'mb-6',
  title: 'text-2xl font-semibold text-primary-900',
}
