import { UserForm } from '@/components/admin/users/UserForm'
import { getUser } from '@/lib/actions/user'

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getUser((await params).id)

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit User</h1>
      </div>
      {user ? <UserForm initialData={user} /> : <div>User not found</div>}
    </>
  )
}

const styles = {
  header: 'mb-6',
  title: 'text-2xl font-semibold text-primary-900',
}
