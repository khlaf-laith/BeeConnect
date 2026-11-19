import { changeStatus, checkLogin } from '@/pages/api/api'
import { Box } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { bindActionCreators } from 'redux'
import { actionCreator } from '../Redux/index'

const publicAuthPages = ['/login', '/register', '/admin/login', '/admin/setup']

const handleBeforeUnload = () => {
  const token = localStorage.getItem('jwt')
  changeStatus('offline', token).catch((error) => {
    toast(error.message)
  })
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [Loading, setLoading] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const actions = useMemo(
    () => bindActionCreators(actionCreator, dispatch),
    [dispatch]
  )

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('jwt')
    window.addEventListener('beforeunload', handleBeforeUnload)
    if (token) {
      checkLogin(token)
        .then((response) => {
          if (!active) return
          if (router.pathname === '/login' || router.pathname === '/register') {
            actions.setUser(response.data)
            router.replace(response.data?.type === 'admin' ? '/admin' : '/home')
            setLoading(false)

            changeStatus('online', token).catch((error) => toast(error.message))
          } else if (
            router.pathname === '/admin/login' &&
            response.data?.type === 'admin'
          ) {
            router.replace('/admin')
            setLoading(false)
          } else {
            actions.setUser(response.data)
            setLoading(false)

            changeStatus('online', token).catch((error) => toast(error.message))
          }
        })
        .catch(() => {
          if (!active) return
          localStorage.removeItem('jwt')
          if (!publicAuthPages.includes(router.pathname)) {
            router.replace('/login')
          }
          setLoading(false)
        })
    } else {
      if (!publicAuthPages.includes(router.pathname)) {
        router.replace('/login')
      }
      setLoading(false)
    }

    return () => {
      active = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [actions, router])
  return (
    <>
      <main>
        {Loading ? (
          <Box alignContent={'center'}>
            <Spinner />
          </Box>
        ) : (
          children
        )}
      </main>
    </>
  )
}
export default Layout
