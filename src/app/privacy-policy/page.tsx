import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.backLink}>
            ← Volver
          </Link>
          <h1 className={styles.title}>Política de Privacidad</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Introducción</h2>
            <p className={styles.paragraph}>
              En esta Política de Privacidad explicamos cómo recopilamos,
              utilizamos, procesamos y protegemos su información personal cuando
              utiliza nuestra plataforma InmoApp. Nos comprometemos a proteger
              su privacidad y a manejar sus datos personales con transparencia.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              2. Información que recopilamos
            </h2>
            <p className={styles.paragraph}>
              Podemos recopilar la siguiente información:
            </p>
            <ul className={styles.list}>
              <li>
                Información de registro: nombre, dirección de correo
                electrónico, contraseña.
              </li>
              <li>
                Información de perfil: datos de contacto, información
                profesional.
              </li>
              <li>
                Datos de uso: cómo interactúa con nuestra plataforma,
                preferencias y configuraciones.
              </li>
              <li>
                Información técnica: dirección IP, tipo de navegador,
                dispositivo utilizado.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              3. Cómo utilizamos su información
            </h2>
            <p className={styles.paragraph}>Utilizamos su información para:</p>
            <ul className={styles.list}>
              <li>Proporcionar y mantener nuestros servicios.</li>
              <li>Mejorar y personalizar su experiencia en la plataforma.</li>
              <li>Procesar transacciones y gestionar su cuenta.</li>
              <li>
                Comunicarnos con usted sobre actualizaciones, soporte y otras
                informaciones.
              </li>
              <li>Garantizar la seguridad de nuestros servicios.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Compartición de datos</h2>
            <p className={styles.paragraph}>
              No compartimos su información personal con terceros excepto en las
              siguientes circunstancias:
            </p>
            <ul className={styles.list}>
              <li>Con su consentimiento explícito.</li>
              <li>
                Con proveedores de servicios que nos ayudan a operar la
                plataforma.
              </li>
              <li>
                Cuando sea requerido por ley o para proteger nuestros derechos
                legales.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Seguridad de datos</h2>
            <p className={styles.paragraph}>
              Implementamos medidas de seguridad técnicas y organizativas
              apropiadas para proteger sus datos personales contra el acceso no
              autorizado, la pérdida o la alteración.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Sus derechos</h2>
            <p className={styles.paragraph}>
              Dependiendo de su ubicación, puede tener ciertos derechos
              relacionados con sus datos personales, incluyendo:
            </p>
            <ul className={styles.list}>
              <li>Acceso a sus datos.</li>
              <li>Rectificación de información inexacta.</li>
              <li>Eliminación de sus datos (derecho al olvido).</li>
              <li>Restricción u oposición al procesamiento.</li>
              <li>Portabilidad de datos.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Contacto</h2>
            <p className={styles.paragraph}>
              Si tiene preguntas sobre esta política de privacidad o sobre el
              tratamiento de sus datos, póngase en contacto con nosotros a
              través de:
            </p>
            <p className={styles.paragraph}>
              <strong>Email:</strong> privacy@multitenant.com
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Cambios en esta política</h2>
            <p className={styles.paragraph}>
              Podemos actualizar esta política periódicamente. Le notificaremos
              cualquier cambio significativo mediante un aviso en nuestra
              plataforma o por correo electrónico.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

const styles = {
  page: 'min-h-screen bg-primary-50',
  header: 'border-b border-primary-200 bg-white',
  headerContainer: 'container mx-auto px-4 py-6 flex items-center',
  backLink: 'text-primary-600 hover:text-primary-800 transition-colors mr-4',
  title: 'text-2xl font-bold text-primary-800',
  main: 'container mx-auto px-4 py-10',
  content: 'mx-auto max-w-3xl',
  section: 'mb-8',
  sectionTitle: 'text-xl font-semibold text-primary-800 mb-3',
  paragraph: 'text-primary-700 mb-4',
  list: 'list-disc pl-6 mb-4 text-primary-700 space-y-1',
}
