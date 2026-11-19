import MarketingLayout from '@/components/MarketingLayout'
import styles from '@/styles/Marketing.module.css'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { FormEvent, useState } from 'react'
import { FiHeart, FiMail, FiMessageCircle, FiSend, FiUsers } from 'react-icons/fi'
import { toast } from 'react-toastify'

export default function AboutPage() {
  const { t } = useTranslation('marketing')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contactEmail) {
      toast.info(t('contactNotConfigured'))
      return
    }

    const subject = encodeURIComponent(t('emailSubject', { name: form.name }))
    const body = encodeURIComponent(
      `${t('emailName')}: ${form.name}\n${t('emailAddress')}: ${form.email}\n\n${
        form.message
      }`
    )
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    <MarketingLayout>
      <Head>
        <title>{t('aboutPageTitle')}</title>
        <meta name="description" content={t('aboutPageDescription')} />
      </Head>

      <section className={styles.teamHero}>
        <div className={styles.teamHeroContent}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            {t('aboutEyebrow')}
          </span>
          <h1>{t('aboutHeading')} 🐝</h1>
          <p>{t('aboutDescription')}</p>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>{t('communityKicker')}</span>
          <h2>{t('communityHeading')}</h2>
          <p>{t('communityDescription')}</p>
        </div>
        <div className={styles.teamGrid}>
          <article className={styles.teamCard}>
            <span className={styles.teamAvatar}>
              <FiUsers />
            </span>
            <h2>{t('talentGroupTitle')}</h2>
            <p>{t('talentGroupDescription')}</p>
          </article>
          <article className={styles.teamCard}>
            <span className={`${styles.teamAvatar} ${styles.teamAvatarBlue}`}>
              <FiMessageCircle />
            </span>
            <h2>{t('professionalGroupTitle')}</h2>
            <p>{t('professionalGroupDescription')}</p>
          </article>
          <article className={styles.teamCard}>
            <span className={`${styles.teamAvatar} ${styles.teamAvatarCoral}`}>
              <FiHeart />
            </span>
            <h2>{t('employerGroupTitle')}</h2>
            <p>{t('employerGroupDescription')}</p>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.valuesSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionKicker}>{t('valuesKicker')}</span>
            <h2>{t('valuesHeading')}</h2>
          </div>
          <div className={styles.valuesGrid}>
            <article className={styles.valueCard}>
              <FiUsers />
              <div>
                <h3>{t('communityFirstTitle')}</h3>
                <p>{t('communityFirstDescription')}</p>
              </div>
            </article>
            <article className={styles.valueCard}>
              <FiHeart />
              <div>
                <h3>{t('opportunitiesForAllTitle')}</h3>
                <p>{t('opportunitiesForAllDescription')}</p>
              </div>
            </article>
            <article className={styles.valueCard}>
              <FiMessageCircle />
              <div>
                <h3>{t('meaningfulConnectionsTitle')}</h3>
                <p>{t('meaningfulConnectionsDescription')}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.contactSection} id="contact">
        <div className={styles.contactInner}>
          <div className={styles.contactCopy}>
            <span className={styles.sectionKicker}>{t('contactKicker')}</span>
            <h2>{t('contactHeading')}</h2>
            <p>{t('contactDescription')}</p>
            <div className={styles.contactDecoration} aria-hidden="true">
              🐝
            </div>
          </div>
          <form className={styles.contactForm} onSubmit={sendMessage}>
            <label>
              {t('contactName')}
              <input
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label>
              {t('contactEmail')}
              <input
                autoComplete="email"
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label>
              {t('contactMessage')}
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
              />
            </label>
            <button className={styles.contactSubmit} type="submit">
              <FiSend /> {t('sendMessage')}
            </button>
            <p className={styles.contactHint}>
              <FiMail /> {t('contactHint')}
            </p>
          </form>
        </div>
      </section>
    </MarketingLayout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'marketing'])),
  },
})
