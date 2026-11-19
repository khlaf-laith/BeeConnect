/* eslint-disable react-hooks/rules-of-hooks */
import Layout from '@/components/Layout'
import {
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import axios from 'axios'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BeeLogo from '../components/BeeLogo'
import GoogleLogin from '../components/GoogleLogin'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { loginApi } from './api/api'

const login = () => {
  const { t } = useTranslation('common')
  const { toggleColorMode } = useColorMode()
  const formBackground = useColorModeValue('gray.100', 'gray.700')
  const placeholderBackground = useColorModeValue('gray.200', 'gray.600')
  const toggleTheme = useColorModeValue('🌙', '💡')
  const [User, setUser] = useState({ email: '', password: '' })
  const router = useRouter()
  const currentLang = router.locale // => locale string eg. "en"
  const changeEmail = (event: any) => {
    setUser({
      ...User,
      email: event.target.value,
    })
  }
  const changePassword = (event: any) => {
    setUser({
      ...User,
      password: event.target.value,
    })
  }
  const submitForm = async () => {
    if (!(User.email && User.password)) {
      toast(t('pleaseFillAllFields'))
      return
    }

    try {
      const response = await loginApi(User)
      localStorage.setItem('jwt', response.data.access_token)
      toast(t('loggedIn'))
      await router.replace(response.data.user?.type === 'admin' ? '/admin' : '/home')
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
    <>
      <div data-testid="login-page">
        <Layout>
          <Flex height="100vh" alignItems="center" justifyContent="center">
            <Flex direction="column" background={formBackground} p={12} rounded={25}>
              <Flex justifyContent="flex-end" mb={3}>
                <LanguageSwitcher />
              </Flex>
              <Heading mb={6}>
                <Link href="/">
                  <BeeLogo /> BeeConnect
                </Link>
              </Heading>
              <Input
                placeholder={t('email')}
                onChange={changeEmail}
                variant="filled"
                mb={3}
                type="email"
                background={placeholderBackground}
                data-testid="email"
              />
              <Input
                placeholder="*******"
                onChange={changePassword}
                variant="filled"
                mb={6}
                type="password"
                background={placeholderBackground}
                data-testid="password"
              />
              <Button colorScheme="blue" mb={3} onClick={submitForm}>
                {t('signIn')}
              </Button>
              {/* Google Login*/}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <Center>
                  <GoogleLogin lang={currentLang}></GoogleLogin>
                </Center>
              )}

              <Text textAlign="center">{t('or')}</Text>

              <Button colorScheme="green" mb={6}>
                <Link href="/register">{t('register')}</Link>
              </Button>
              <Button variant="link" mb={3}>
                <Link href="/admin/login">{t('adminSignIn')}</Link>
              </Button>
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
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
})

export default login
