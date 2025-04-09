import { getAllPages, getHomepage } from '@/lib/actions/tenant/page'

export default async function HomePage() {
  const homepage = await getHomepage()
  const pages = await getAllPages()

  if (homepage) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{homepage.title}</h1>
        {homepage.content.map((content) => (
          <div key={content.id} className={styles.prose}>
            <h1>{content.title}</h1>
            <div className={styles.prose}>{content.body}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome</h1>
      <div className={styles.grid}>
        {pages.map((page) => (
          <div key={page.id} className={styles.pageCard}>
            <h2 className={styles.pageTitle}>
              <a href={`/${page.slug}`} className={styles.pageLink}>
                {page.title}
              </a>
            </h2>
            {page.content.map((content) => (
              <div key={content.id} className={styles.prose}>
                <h1>{content.title}</h1>
                <div className={styles.prose}>{content.body}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: 'container mx-auto px-4 py-8',
  title: 'text-4xl font-bold mb-6',
  prose: 'prose max-w-none',
  grid: 'grid gap-6',
  pageCard: 'border rounded-lg p-6',
  pageTitle: 'text-2xl font-semibold mb-2',
  pageLink: 'hover:underline',
}
