import Layout from '@/components/Layout'
import {
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BeeLogo from '../../components/BeeLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { setupFirstAdmin } from '../api/api'

const AdminSetup = () => {
  const { t } = useTranslation('common')
  const { toggleColorMode } = useColorMode()
  const formBackground = useColorModeValue('gray.100', 'gray.700')
  const placeholderBackground = useColorModeValue('gray.200', 'gray.600')
  const toggleTheme = useColorModeValue('🌙', '💡')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'male' as 'male' | 'female',
    setupSecret: '',
  })
  const router = useRouter()

  const submitForm = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.setupSecret
    ) {
      toast(t('fillAllFields'))
      return
    }

    if (form.password.length < 12 || form.password.length > 128) {
      toast(t('passwordPolicy'))
      return
    }

    if (form.setupSecret.length < 32) {
      toast(t('adminSetupUnavailable'))
      return
    }

    try {
      const response = await setupFirstAdmin(form)
      const token = response.data.access_token
      if (response.data.user?.type !== 'admin' || typeof token !== 'string') {
        toast(t('adminLoginFailed'))
        return
      }

      localStorage.setItem('jwt', token)
      await router.replace('/admin')
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 403 || error.response?.status === 409)
      ) {
        toast(t('adminSetupUnavailable'))
        return
      }

      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast(t('authRateLimited'))
        return
      }

      toast(error instanceof Error ? error.message : t('adminLoginFailed'))
    }
  }

  return (
    <Layout>
      <Flex minH="100vh" alignItems="center" justifyContent="center" py={8}>
        <Flex
          direction="column"
          background={formBackground}
          p={{ base: 6, md: 12 }}
          rounded={25}
          width={{ base: 'calc(100% - 32px)', sm: '440px' }}
        >
          <Flex justifyContent="flex-end" mb={3}>
            <LanguageSwitcher />
          </Flex>
          <Heading mb={3}>
            <Link href="/">
              <BeeLogo /> BeeConnect
            </Link>
          </Heading>
          <Heading size="md" mb={2}>
            {t('adminSetup')}
          </Heading>
          <Text mb={5}>{t('adminSetupHelp')}</Text>
          <Input
            data-testid="admin-first-name"
            placeholder={t('firstName')}
            variant="filled"
            mb={3}
            autoComplete="given-name"
            background={placeholderBackground}
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
          />
          <Input
            data-testid="admin-last-name"
            placeholder={t('lastName')}
            variant="filled"
            mb={3}
            autoComplete="family-name"
            background={placeholderBackground}
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
          />
          <Input
            data-testid="admin-email"
            placeholder={t('email')}
            variant="filled"
            mb={3}
            type="email"
            autoComplete="email"
            background={placeholderBackground}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Input
            data-testid="admin-password"
            placeholder={t('password')}
            variant="filled"
            mb={3}
            type="password"
            autoComplete="new-password"
            background={placeholderBackground}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <Text fontSize="sm" mb={3}>
            {t('passwordPolicy')}
          </Text>
          <Select
            data-testid="admin-gender"
            mb={3}
            variant="filled"
            background={placeholderBackground}
            value={form.gender}
            onChange={(event) =>
              setForm({
                ...form,
                gender: event.target.value === 'female' ? 'female' : 'male',
              })
            }
          >
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
          </Select>
          <Input
            data-testid="admin-setup-secret"
            placeholder={t('adminSetupSecret')}
            variant="filled"
            mb={6}
            type="password"
            autoComplete="off"
            background={placeholderBackground}
            value={form.setupSecret}
            onChange={(event) =>
              setForm({ ...form, setupSecret: event.target.value })
            }
          />
          <Button
            data-testid="admin-setup-submit"
            colorScheme="blue"
            mb={4}
            onClick={submitForm}
          >
            {t('adminSetup')}
          </Button>
          <Text textAlign="center" mb={4}>
            <Link href="/admin/login">{t('adminSignIn')}</Link>
          </Text>
          <Button
            onClick={toggleColorMode}
            _hover={{ bg: 'transparent' }}
            bg="transparent"
          >
            {toggleTheme}
          </Button>
        </Flex>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminSetup
