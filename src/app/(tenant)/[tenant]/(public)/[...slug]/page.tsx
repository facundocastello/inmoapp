import { notFound } from 'next/navigation'

import { cachedGetPageBySlug } from '@/lib/actions/tenant/page'

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const slug = (await params).slug
  const page = await cachedGetPageBySlug(`/${slug.join('/')}`)

  if (!page) notFound()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{page.title}</h1>
      {page.content.map((content) => (
        <div key={content.id} className={styles.content}>
          <h1>{content.title}</h1>
          <div className={styles.content}>{content.body}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: 'container mx-auto px-4 py-8 bg-secondary-100',
  title: 'text-4xl font-bold mb-6',
  content: 'prose max-w-none',
}
