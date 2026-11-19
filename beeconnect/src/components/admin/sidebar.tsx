import BeeLogo from '@/components/BeeLogo'
import { checkLogin } from '@/pages/api/api'
import {
  Avatar,
  Box,
  BoxProps,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  FlexProps,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { ReactNode, ReactText, useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import { AiOutlineMessage } from 'react-icons/ai'
import { BsFillFileEarmarkPostFill, BsPerson } from 'react-icons/bs'
import { FiBell, FiChevronDown, FiHome, FiMenu } from 'react-icons/fi'

interface LinkItemProps {
  translationKey: string
  icon: IconType
  url: string
}
const LinkItems: Array<LinkItemProps> = [
  { translationKey: 'home', icon: FiHome, url: '/admin' },
  { translationKey: 'users', icon: BsPerson, url: '/admin/users' },
  {
    translationKey: 'reportedMessages',
    icon: AiOutlineMessage,
    url: '/admin/messages',
  },
  {
    translationKey: 'reportedPosts',
    icon: BsFillFileEarmarkPostFill,
    url: '/admin/posts',
  },
]

const getTokenExpiry = (token: string): number | null => {
  try {
    const encodedPayload = token.split('.')[1]
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      '='
    )
    const payload = JSON.parse(window.atob(paddedPayload))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export default function SidebarWithHeader({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const pageBackground = useColorModeValue('gray.100', 'gray.900')

  useEffect(() => {
    let active = true
    let expiryTimer: ReturnType<typeof setTimeout> | undefined
    const token = localStorage.getItem('jwt')
    if (!token) {
      router.replace('/admin/login')
      return () => {
        active = false
      }
    }

    checkLogin(token)
      .then((response) => {
        if (!active) return
        if (response.data?.type === 'admin') {
          const expiresAt = getTokenExpiry(token)
          if (expiresAt == null || expiresAt <= Date.now()) {
            localStorage.removeItem('jwt')
            router.replace('/admin/login')
            return
          }
          expiryTimer = setTimeout(() => {
            localStorage.removeItem('jwt')
            router.replace('/admin/login')
          }, expiresAt - Date.now())
          setAuthorized(true)
        } else {
          router.replace(response.status === 401 ? '/admin/login' : '/home')
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem('jwt')
          router.replace('/admin/login')
        }
      })

    return () => {
      active = false
      if (expiryTimer != null) clearTimeout(expiryTimer)
    }
  }, [router])

  if (!authorized) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Box minH="100vh" bg={pageBackground}>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { t } = useTranslation('common')
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          <BeeLogo /> BeeConnect
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.translationKey} icon={link.icon} url={link.url}>
          {t(link.translationKey)}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  url: string
  children: ReactText
}
const NavItem = ({ icon, url, children, ...rest }: NavItemProps) => {
  return (
    <Link
      href={url}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
        }}
        {...rest}
      >
        {icon && <Icon mr="4" fontSize="16" as={icon} />}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const handleLogout = () => {
    localStorage.removeItem('jwt')
    router.replace('/admin/login')
  }
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label={t('openMenu')}
        icon={<FiMenu />}
      />

      <Text display={{ base: 'flex', md: 'none' }} fontSize="2xl" fontWeight="bold">
        <BeeLogo /> BeeConnect
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label={t('openMenu')}
          icon={<FiBell />}
        />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar size={'sm'} name="Admin" />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{t('adminSupport')}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {t('admin')}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem onClick={handleLogout}>{t('signOut')}</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}
