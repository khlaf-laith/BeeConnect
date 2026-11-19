import { Select } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ChangeEvent } from 'react'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const locale = router.locale ?? router.defaultLocale ?? 'en'

  const changeLanguage = (event: ChangeEvent<HTMLSelectElement>) => {
    void router.push(router.pathname, router.asPath, {
      locale: event.target.value,
    })
  }

  return (
    <Select
      aria-label={t('language')}
      className={className}
      value={locale}
      onChange={changeLanguage}
      dir="ltr"
      variant="outline"
      rounded="full"
      textAlign="center"
      width="auto"
      size="sm"
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="ar">العربية</option>
    </Select>
  )
}
