'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import React from 'react'

type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
type ColorType = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error'

type Styles = {
  container: string
  header: string
  title: string
  section: string
  sectionTitle: string
  colorGrid: string
  colorCard: string
  colorLabel: string
} & {
  [K in `${ColorType}${ColorShade}`]: string
}

export default function DesignTest() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Design System Test</h1>
        <ThemeToggle />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Primary Colors</h2>
        <div className={styles.colorGrid}>
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className={styles.colorCard}>
              <div className={styles[`primary${shade}` as keyof Styles]} />
              <span className={styles.colorLabel}>{shade}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Secondary Colors</h2>
        <div className={styles.colorGrid}>
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className={styles.colorCard}>
              <div className={styles[`secondary${shade}` as keyof Styles]} />
              <span className={styles.colorLabel}>{shade}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Neutral Colors</h2>
        <div className={styles.colorGrid}>
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className={styles.colorCard}>
              <div className={styles[`neutral${shade}` as keyof Styles]} />
              <span className={styles.colorLabel}>{shade}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Status Colors</h2>
        <div className={styles.colorGrid}>
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <React.Fragment key={`success-${shade}`}>
              <div key={`success-${shade}`} className={styles.colorCard}>
                <div className={styles[`success${shade}` as keyof Styles]} />
                <span className={styles.colorLabel}>Success {shade}</span>
              </div>
              <div key={`warning-${shade}`} className={styles.colorCard}>
                <div className={styles[`warning${shade}` as keyof Styles]} />
                <span className={styles.colorLabel}>Warning {shade}</span>
              </div>
              <div key={`error-${shade}`} className={styles.colorCard}>
                <div className={styles[`error${shade}` as keyof Styles]} />
                <span className={styles.colorLabel}>Error {shade}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles: Styles = {
  container: "min-h-screen bg-background-100 p-8 text-neutral-900",
  header: "mb-8 flex items-center justify-between",
  title: "text-3xl font-bold",
  section: "mb-12",
  sectionTitle: "mb-4 text-xl font-semibold",
  colorGrid: "grid grid-cols-3 gap-4 md:grid-cols-6 lg:grid-cols-9",
  colorCard: "flex flex-col items-center gap-2",
  colorLabel: "text-sm",
  // Primary colors
  primary100: "h-16 w-16 rounded-lg shadow-md bg-primary-100",
  primary200: "h-16 w-16 rounded-lg shadow-md bg-primary-200",
  primary300: "h-16 w-16 rounded-lg shadow-md bg-primary-300",
  primary400: "h-16 w-16 rounded-lg shadow-md bg-primary-400",
  primary500: "h-16 w-16 rounded-lg shadow-md bg-primary-500",
  primary600: "h-16 w-16 rounded-lg shadow-md bg-primary-600",
  primary700: "h-16 w-16 rounded-lg shadow-md bg-primary-700",
  primary800: "h-16 w-16 rounded-lg shadow-md bg-primary-800",
  primary900: "h-16 w-16 rounded-lg shadow-md bg-primary-900",
  // Secondary colors
  secondary100: "h-16 w-16 rounded-lg shadow-md bg-secondary-100",
  secondary200: "h-16 w-16 rounded-lg shadow-md bg-secondary-200",
  secondary300: "h-16 w-16 rounded-lg shadow-md bg-secondary-300",
  secondary400: "h-16 w-16 rounded-lg shadow-md bg-secondary-400",
  secondary500: "h-16 w-16 rounded-lg shadow-md bg-secondary-500",
  secondary600: "h-16 w-16 rounded-lg shadow-md bg-secondary-600",
  secondary700: "h-16 w-16 rounded-lg shadow-md bg-secondary-700",
  secondary800: "h-16 w-16 rounded-lg shadow-md bg-secondary-800",
  secondary900: "h-16 w-16 rounded-lg shadow-md bg-secondary-900",
  // Neutral colors
  neutral100: "h-16 w-16 rounded-lg shadow-md bg-neutral-100",
  neutral200: "h-16 w-16 rounded-lg shadow-md bg-neutral-200",
  neutral300: "h-16 w-16 rounded-lg shadow-md bg-neutral-300",
  neutral400: "h-16 w-16 rounded-lg shadow-md bg-neutral-400",
  neutral500: "h-16 w-16 rounded-lg shadow-md bg-neutral-500",
  neutral600: "h-16 w-16 rounded-lg shadow-md bg-neutral-600",
  neutral700: "h-16 w-16 rounded-lg shadow-md bg-neutral-700",
  neutral800: "h-16 w-16 rounded-lg shadow-md bg-neutral-800",
  neutral900: "h-16 w-16 rounded-lg shadow-md bg-neutral-900",
  // Success colors
  success100: "h-16 w-16 rounded-lg shadow-md bg-success-100",
  success200: "h-16 w-16 rounded-lg shadow-md bg-success-200",
  success300: "h-16 w-16 rounded-lg shadow-md bg-success-300",
  success400: "h-16 w-16 rounded-lg shadow-md bg-success-400",
  success500: "h-16 w-16 rounded-lg shadow-md bg-success-500",
  success600: "h-16 w-16 rounded-lg shadow-md bg-success-600",
  success700: "h-16 w-16 rounded-lg shadow-md bg-success-700",
  success800: "h-16 w-16 rounded-lg shadow-md bg-success-800",
  success900: "h-16 w-16 rounded-lg shadow-md bg-success-900",
  // Warning colors
  warning100: "h-16 w-16 rounded-lg shadow-md bg-warning-100",
  warning200: "h-16 w-16 rounded-lg shadow-md bg-warning-200",
  warning300: "h-16 w-16 rounded-lg shadow-md bg-warning-300",
  warning400: "h-16 w-16 rounded-lg shadow-md bg-warning-400",
  warning500: "h-16 w-16 rounded-lg shadow-md bg-warning-500",
  warning600: "h-16 w-16 rounded-lg shadow-md bg-warning-600",
  warning700: "h-16 w-16 rounded-lg shadow-md bg-warning-700",
  warning800: "h-16 w-16 rounded-lg shadow-md bg-warning-800",
  warning900: "h-16 w-16 rounded-lg shadow-md bg-warning-900",
  // Error colors
  error100: "h-16 w-16 rounded-lg shadow-md bg-error-100",
  error200: "h-16 w-16 rounded-lg shadow-md bg-error-200",
  error300: "h-16 w-16 rounded-lg shadow-md bg-error-300",
  error400: "h-16 w-16 rounded-lg shadow-md bg-error-400",
  error500: "h-16 w-16 rounded-lg shadow-md bg-error-500",
  error600: "h-16 w-16 rounded-lg shadow-md bg-error-600",
  error700: "h-16 w-16 rounded-lg shadow-md bg-error-700",
  error800: "h-16 w-16 rounded-lg shadow-md bg-error-800",
  error900: "h-16 w-16 rounded-lg shadow-md bg-error-900"
} 