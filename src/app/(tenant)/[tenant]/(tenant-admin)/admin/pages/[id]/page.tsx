import { redirect } from 'next/navigation'

import { ContentForm } from '@/components/admin/pages/ContentForm'
import { PageForm } from '@/components/admin/pages/PageForm'
import { getContentByPage } from '@/lib/actions/tenant/content'
import { getPage } from '@/lib/actions/tenant/page'
import { getUsers } from '@/lib/actions/user'

interface EditPagePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const { id } = await params
  const [page, users, content] = await Promise.all([
    getPage(id),
    getUsers(),
    getContentByPage(id),
  ])

  if (!page) {
    redirect('/admin/pages')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Page</h1>

      <div className={styles.contentSection}>
        <div className={styles.pageDetails}>
          <h2 className={styles.sectionTitle}>Page Details</h2>
          <PageForm
            id={id}
            users={users}
            initialData={{
              title: page.title,
              slug: page.slug,
              isActive: page.isActive,
              isFeatured: page.isFeatured,
              isHome: page.isHome,
              authorId: page.authorId,
            }}
          />
        </div>

        <div className={styles.pageContent}>
          <h2 className={styles.sectionTitle}>Page Content</h2>
          <ContentForm initialData={content || []} pageId={id} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: 'max-w-4xl mx-auto',
  title: 'text-2xl font-semibold text-primary-900 mb-6',
  contentSection: 'space-y-8',
  pageDetails: 'bg-primary-200 p-6 rounded-lg shadow',
  pageContent: 'bg-primary-200 p-6 rounded-lg shadow',
  sectionTitle: 'text-lg font-medium text-primary-900 mb-4',
}
