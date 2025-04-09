import { PageForm } from '@/components/admin/pages/PageForm'
import { getUsers } from '@/lib/actions/user'

export default async function NewPagePage() {
  const users = await getUsers()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Page</h1>
      <PageForm users={users} />
    </div>
  )
}

const styles = {
  container: 'max-w-2xl mx-auto',
  title: 'text-2xl font-semibold text-primary-900 mb-6',
}
