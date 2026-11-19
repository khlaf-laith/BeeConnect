import MarketingLayout from '@/components/MarketingLayout'
import styles from '@/styles/Marketing.module.css'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import Link from 'next/link'
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiMessageCircle,
  FiSearch,
  FiStar,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi'

export default function LandingPage() {
  const { t } = useTranslation('marketing')
  const features = [
    {
      icon: FiUsers,
      title: t('featureConnectionsTitle'),
      description: t('featureConnectionsDescription'),
    },
    {
      icon: FiBriefcase,
      title: t('featureOpportunitiesTitle'),
      description: t('featureOpportunitiesDescription'),
    },
    {
      icon: FiMessageCircle,
      title: t('featureCommunicationTitle'),
      description: t('featureCommunicationDescription'),
    },
    {
      icon: FiTrendingUp,
      title: t('featureGrowthTitle'),
      description: t('featureGrowthDescription'),
    },
  ]

  return (
    <MarketingLayout>
      <Head>
        <title>{t('landingTitle')}</title>
        <meta name="description" content={t('landingDescription')} />
      </Head>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              {t('communityEyebrow')}
            </div>
            <h1 className={styles.heroTitle}>
              {t('heroTitleFirst')}
              <br />
              {t('heroTitleSecond')}
              <span>{t('heroTitleHighlight')}</span>
            </h1>
            <p className={styles.heroDescription}>{t('heroDescription')}</p>
            <div className={styles.heroActions}>
              <Link className={styles.buttonPrimary} href="/register">
                {t('startJourney')} <FiArrowLeft />
              </Link>
              <Link className={styles.buttonOutline} href="/about">
                {t('discoverBeeConnect')}
              </Link>
            </div>
            <div className={styles.heroNote}>
              <span>
                <FiCheck />
              </span>
              {t('profileNetworkOpportunities')}
            </div>
          </div>

          <div className={styles.heroArt} aria-label={t('professionalNetwork')}>
            <div className={styles.heroOrb} />
            <div className={`${styles.floatingBadge} ${styles.badgeTop}`}>
              <FiBriefcase />
              {t('newProfessionalOpportunities')}
            </div>
            <div className={styles.networkCard}>
              <div className={styles.networkHeader}>
                <span className={styles.networkTitle}>
                  {t('professionalNetwork')}
                </span>
                <span className={styles.networkStatus}>{t('growsEveryDay')}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.avatar}>{t('talentInitial')}</span>
                <span className={styles.profileText}>
                  <strong>{t('talentedPeople')}</strong>
                  <small>{t('communityDesigners')}</small>
                </span>
                <FiUsers className={styles.connectIcon} />
              </div>
              <div className={styles.profileRow}>
                <span className={`${styles.avatar} ${styles.avatarBlue}`}>
                  {t('opportunityInitial')}
                </span>
                <span className={styles.profileText}>
                  <strong>{t('opportunitiesForSkills')}</strong>
                  <small>{t('newJobsProjects')}</small>
                </span>
                <FiSearch className={styles.connectIcon} />
              </div>
              <div className={styles.profileRow}>
                <span className={`${styles.avatar} ${styles.avatarPink}`}>
                  {t('connectionInitial')}
                </span>
                <span className={styles.profileText}>
                  <strong>{t('connectionsOpenDoors')}</strong>
                  <small>{t('directConversations')}</small>
                </span>
                <FiMessageCircle className={styles.connectIcon} />
              </div>
            </div>
            <div className={`${styles.floatingBadge} ${styles.badgeBottom}`}>
              <FiStar />
              {t('nextStepStartsHere')}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionKicker}>{t('featuresKicker')}</span>
            <h2>{t('featuresHeading')}</h2>
            <p>{t('featuresDescription')}</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(({ icon: Icon, title, description }) => (
              <article className={styles.featureCard} key={title}>
                <span className={styles.featureIcon}>
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.steps}`} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionKicker}>{t('stepsKicker')}</span>
            <h2>{t('stepsHeading')}</h2>
          </div>
          <div className={styles.stepGrid}>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>{t('stepOne')}</span>
              <h3>{t('stepProfileTitle')}</h3>
              <p>{t('stepProfileDescription')}</p>
            </article>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>{t('stepTwo')}</span>
              <h3>{t('stepDiscoverTitle')}</h3>
              <p>{t('stepDiscoverDescription')}</p>
            </article>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>{t('stepThree')}</span>
              <h3>{t('stepApplyTitle')}</h3>
              <p>{t('stepApplyDescription')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionInner} ${styles.callout}`}>
          <div>
            <h2>{t('calloutHeading')}</h2>
            <p>{t('calloutDescription')}</p>
          </div>
          <Link className={styles.buttonLight} href="/register">
            {t('calloutButton')} <FiArrowLeft />
          </Link>
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
