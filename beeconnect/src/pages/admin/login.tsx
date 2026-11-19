import Layout from '@/components/Layout'
import {
  Button,
  Flex,
  Heading,
  Input,
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
import { loginApi } from '../api/api'

const AdminLogin = () => {
  const { t } = useTranslation('common')
  const { toggleColorMode } = useColorMode()
  const formBackground = useColorModeValue('gray.100', 'gray.700')
  const placeholderBackground = useColorModeValue('gray.200', 'gray.600')
  const toggleTheme = useColorModeValue('🌙', '💡')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const router = useRouter()

  const submitForm = async () => {
    if (!(credentials.email && credentials.password)) {
      toast(t('pleaseFillAllFields'))
      return
    }

    try {
      const response = await loginApi(credentials)
      if (response.data.user?.type !== 'admin') {
        toast(t('adminAccessDenied'))
        return
      }

      const token = response.data.access_token
      if (typeof token !== 'string' || !token) {
        toast(t('adminLoginFailed'))
        return
      }

      localStorage.setItem('jwt', token)
      await router.replace('/admin')
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.status === 401
          ? t('fillCorrectly')
          : axios.isAxiosError(error) && error.response?.status === 429
          ? t('authRateLimited')
          : error instanceof Error
          ? error.message
          : t('adminLoginFailed')
      toast(message)
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
          width={{ base: 'calc(100% - 32px)', sm: '420px' }}
        >
          <Flex justifyContent="flex-end" mb={3}>
            <LanguageSwitcher />
          </Flex>
          <Heading mb={6}>
            <Link href="/">
              <BeeLogo /> BeeConnect
            </Link>
          </Heading>
          <Heading size="md" mb={6}>
            {t('adminSignIn')}
          </Heading>
          <Input
            data-testid="admin-email"
            placeholder={t('email')}
            variant="filled"
            mb={3}
            type="email"
            autoComplete="username"
            background={placeholderBackground}
            value={credentials.email}
            onChange={(event) =>
              setCredentials({ ...credentials, email: event.target.value })
            }
          />
          <Input
            data-testid="admin-password"
            placeholder={t('password')}
            variant="filled"
            mb={6}
            type="password"
            autoComplete="current-password"
            background={placeholderBackground}
            value={credentials.password}
            onChange={(event) =>
              setCredentials({ ...credentials, password: event.target.value })
            }
          />
          <Button
            data-testid="admin-sign-in"
            colorScheme="blue"
            mb={4}
            onClick={submitForm}
          >
            {t('signIn')}
          </Button>
          <Text textAlign="center" mb={3}>
            <Link href="/admin/setup">{t('adminSetupLink')}</Link>
          </Text>
          <Text textAlign="center" mb={4}>
            <Link href="/login">{t('signInAsUser')}</Link>
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

export default AdminLogin
