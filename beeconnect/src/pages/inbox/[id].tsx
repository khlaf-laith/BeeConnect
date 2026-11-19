import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import { Divider, Flex, Spinner, useColorMode } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import Pusher from 'pusher-js'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Footer from '../../components/Chat/Footer'
import Header from '../../components/Chat/Header'
import Messages from '../../components/Chat/Messages'
import { getUserById, getUserStatus } from '../api/api'
import { getConversationById, message } from '../api/chat'

const Chat = () => {
  const { t } = useTranslation('common')
  const User = useSelector((state) => state as any)
  // const [inputMessage, setInputMessage] = useState('')
  const [Load, setLoad] = useState(false)
  const { colorMode } = useColorMode()
  const router = useRouter()
  const [messages, setMessages] = useState([{}])
  const [chatUser, setchatUser] = useState({})
  const [numberOfMessages, setnumberOfMessages] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null)

  const [Status, setStatus] = useState('offline')

  const handleSendMessage = (inputMessage: any) => {
    if (!inputMessage.trim().length) {
      return
    }
    const data = inputMessage
    const token = localStorage.getItem('jwt')
    setMessages((old) => [...old, { senderId: User.auth.id, message: data }])

    message(token, {
      message: data,
      receiverId: router.query.id,
    }).catch((error) => {
      toast(error.message)
    })
  }

  const append = (file: any) => {
    const data = JSON.stringify(file)
    setMessages((old) => [...old, { senderId: User.auth.id, message: data }])
  }

  const sendMessagefile = (file: any) => {
    const token = localStorage.getItem('jwt')

    message(token, {
      message: JSON.stringify(file),
      receiverId: router.query.id,
    })
      .then((Response) => {
        window.location.reload()
      })
      .catch((error) => {
        toast(error.message)
      })
  }

  const loadMessage = (id: any, connected: boolean) => {
    if (localStorage.getItem('jwt')) {
      const token = localStorage.getItem('jwt')
      getConversationById(token, id)
        .then((response) => {
          setMessages(response.data)
          if (
            connected == true ||
            (connected == false && response.data.length > 0)
          ) {
            setMessages(response.data)
          } else {
            toast(t('notConnected'))
            router.push('/home')
          }
          setnumberOfMessages(response.data.length)
        })
        .catch((error) => {
          toast(error.message)
        })
    }
  }
  useEffect(() => {
    if (router.query.id) {
      const token = localStorage.getItem('jwt')
      if (router.query.id == User.auth.id) {
        router.push('/home')
      } else {
        getUserById(token, router.query.id)
          .then((response) => {
            setchatUser(response.data.user)
            setConnectionStatus(response.data.connectionStatus)
            if (response.data.connectionStatus == 'Connected') {
              loadMessage(router.query.id, true)
              getUserStatus(router.query.id, token)
                .then((reponse) => {
                  console.log(reponse.data)
                  setStatus(reponse.data)
                })
                .catch((error) => {
                  toast(error.message)
                })
              setchatUser(response.data.user)
            } else {
              setchatUser(response.data.user)
              loadMessage(router.query.id, false)
              getUserStatus(router.query.id, token)
                .then((reponse) => {
                  setStatus(reponse.data)
                })
                .catch((error) => {
                  toast(error.message)
                })
            }
          })
          .catch((error) => {
            router.push('/home')
            toast(t('userNotFound'))
          })
      }
      // setLoad(true)
    }
  }, [router.query.id])

  useEffect(() => {
    if (User.auth.id) {
      setLoad(true)
    }
  }, [User.auth])
  useEffect(() => {
    // Get coversation by ID will doo when apis are fully ready
    // Message is fully function
    if (Load == true) {
      const id = router.query.id
      // TODO Add the keys in env file
      const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
      if (!appKey) return
      const PUSHER_APP_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ?? 'us2'
      const messageChannelName = `message-${User.auth.id}`
      const statusChannelName = `userStatus-${id}`
      const pusher = new Pusher(appKey, {
        cluster: PUSHER_APP_CLUSTER,
      })
      const channel = pusher.subscribe(messageChannelName)
      const channel2 = pusher.subscribe(statusChannelName)
      channel.bind('message', function (data: any) {
        console.log('Message recived')
        if (data.sender == id) {
          setMessages((old) => [...old, { senderId: id, message: data.message }])
        }
      })
      channel2.bind('statusUpdate', (data: any) => {
        setStatus(data.status)
      })
      return () => {
        channel.unbind_all()
        channel2.unbind_all()
        pusher.unsubscribe(messageChannelName)
        pusher.unsubscribe(statusChannelName)
        pusher.disconnect()
      }
    }
  }, [Load])
  return (
    <>
      <Layout>
        <NavBar />
        {Load == false ? (
          <Spinner />
        ) : (
          <Flex
            mt={0}
            w="100%"
            h={{ base: 'calc(100dvh - 5rem)', md: 'calc(100vh - 6rem)' }}
            minH="300px"
            justify="center"
            px={{ base: 2, sm: 4 }}
          >
            <Flex
              w={{ base: '100%', md: '75%', xl: '65%' }}
              maxW="900px"
              h="100%"
              minW={0}
              minH={0}
              flexDir="column"
              borderRadius={{ base: '20px', md: '35px' }}
              borderWidth={{ base: '2px', md: '7px' }}
              p={{ base: 3, sm: 4, md: 6 }}
              boxShadow="0px 0px 10px 0px #0000001f"
              style={{
                backgroundColor: colorMode === 'light' ? '#FFFFFF9F' : '#FFFFFF1F',
                borderColor: colorMode === 'light' ? '#CECECEA0' : '#FFFFFF1F',
              }}
            >
              <Header user={chatUser} status={Status} />
              <Divider />
              <br />
              <Messages messages={messages} user={chatUser} />
              <Divider />

              <Footer
                handleSendMessage={handleSendMessage}
                sendMessagefile={sendMessagefile}
                append={append}
                connectionStatus={connectionStatus}
              />
            </Flex>
          </Flex>
        )}
      </Layout>
    </>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default Chat
