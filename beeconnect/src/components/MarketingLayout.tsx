import BeeLogo from '@/components/BeeLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import styles from '@/styles/Marketing.module.css'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('marketing')
  const router = useRouter()
  const isArabic = router.locale === 'ar'

  return (
    <div className={styles.page} dir={isArabic ? 'rtl' : 'ltr'} lang={router.locale}>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label={t('navigation')}>
          <Link className={styles.brand} href="/" aria-label={t('homeLabel')}>
            <BeeLogo className={styles.brandMark} />
            <span>BeeConnect</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/#features">{t('featuresLink')}</Link>
            <Link href="/#how-it-works">{t('howItWorksLink')}</Link>
            <Link href="/about">{t('aboutLink')}</Link>
          </div>
          <div className={styles.navActions}>
            <LanguageSwitcher className={styles.languageSwitcher} />
            <Link className={styles.loginLink} href="/login">
              {t('loginLink')}
            </Link>
            <Link className={styles.navCta} href="/register">
              {t('registerLink')}
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link className={styles.brand} href="/">
            <BeeLogo className={styles.brandMark} />
            <span>BeeConnect</span>
          </Link>
          <p>{t('footerTagline')}</p>
          <div className={styles.footerLinks}>
            <Link href="/about">{t('aboutLink')}</Link>
            <Link href="/login">{t('loginLink')}</Link>
            <Link href="/register">{t('registerLink')}</Link>
          </div>
          <small>© {new Date().getFullYear()} BeeConnect</small>
        </div>
      </footer>
    </div>
  )
}
