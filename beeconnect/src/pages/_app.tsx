import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { appWithTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import store from '../Redux/store'

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    const locale = router.locale ?? router.defaultLocale ?? 'en'
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [router.locale, router.defaultLocale])

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <Provider store={store}>
        <ChakraProvider>
          <Component {...pageProps} />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={router.locale === 'ar'}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </ChakraProvider>
      </Provider>
    </GoogleOAuthProvider>
  )
}

export default appWithTranslation(MyApp)
