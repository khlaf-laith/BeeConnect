import SearchUserModal from '@/components/Chat/SeachUserModel'
import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Spacer,
  Spinner,
  Text,
  chakra,
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getAllConversation } from '../api/chat'

interface Conversation {
  user: {
    id: number
    firstName: string
    lastName: string
    profilePic: string | null
  }
  lastMessage: string
}

const isFileMessage = (message: string): boolean => {
  try {
    const file = JSON.parse(message)
    if (!file.ext || !file.size) return false
  } catch {
    return false
  }

  return !(Number.isFinite(parseFloat(message)) && Number.isFinite(Number(message)))
}

const Inbox = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [messages, setMessages] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const User = useSelector((state) => state as any)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleNewMessage = (user) => {
    console.log(user)
    // Add your logic to use the selected user for creating a new message
  }

  useEffect(() => {
    if (User.auth) {
      const token = localStorage.getItem('jwt')
      getAllConversation(token)
        .then((response) => {
          console.log(response)
          const allConvo: Conversation[] = response.data.filter(
            (element: Conversation) => element.user.id !== User.auth.id
          )
          allConvo.forEach((element) => {
            if (isFileMessage(element.lastMessage)) {
              element.lastMessage = `${JSON.parse(element.lastMessage).ext} File`
            }
          })
          setMessages(allConvo)
          setLoading(false)
        })
        .catch((error) => {
          setLoading(false)
          toast(error.message)
        })
    }
  }, [User.auth])

  return (
    <>
      <Layout>
        <NavBar></NavBar>
        <Box p={{ base: 4, md: 8 }} data-testid="inbox" minW={0}>
          <HStack
            flexWrap="wrap"
            spacing={3}
            style={{
              display: 'flex',
              alignContent: 'start',
              justifyContent: 'start',
              alignItems: 'start',
            }}
          >
            <Heading as="h1" size="lg" mb={4}>
              {t('inbox')}
            </Heading>
            <Button
              onClick={onOpen}
              colorScheme="blue"
              ml={{ base: 0, sm: 3 }}
              borderRadius="100px"
            >
              {t('newMessage')}
            </Button>
            <SearchUserModal
              isOpen={isOpen}
              onClose={onClose}
              newMessage={handleNewMessage}
            />
          </HStack>
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : messages.length > 0 ? (
            messages.map((element) => (
              <Flex
                key={element.user.id}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                mb={4}
                display="flex"
                alignItems="center"
                minW={0}
                cursor={'pointer'}
                onClick={() => router.push(`/inbox/${element.user.id}`)}
              >
                <Flex>
                  <Avatar
                    size="lg"
                    mr={4}
                    src={
                      element.user.profilePic
                        ? `data:image/jpeg;base64,${element.user.profilePic}`
                        : '/default-profile.svg'
                    }
                  />
                  <Box minW={0} overflow="hidden">
                    <Heading as="h2" size="md" mb={2}>
                      {`${element.user.firstName} ${element.user.lastName}`}
                    </Heading>
                    <Text mb={2} noOfLines={2} wordBreak="break-word">
                      {element.lastMessage}
                    </Text>
                  </Box>
                </Flex>
                <Spacer />
              </Flex>
            ))
          ) : (
            <Box
              textAlign="center"
              paddingTop={'2em'}
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                alt={t('noMessages')}
                src="https://img.icons8.com/3d-fluency/256/speech-bubble-with-dots.png"
                style={{
                  height: '90px',
                  width: '90px',
                  objectFit: 'cover',
                  marginBottom: '2em',
                }}
              ></img>
              <chakra.p fontSize="xl">
                {/* click hyperlink to create application */}
                {t('noMessages')}
                <br />
              </chakra.p>
            </Box>
          )}
        </Box>
      </Layout>
    </>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
export default Inbox
