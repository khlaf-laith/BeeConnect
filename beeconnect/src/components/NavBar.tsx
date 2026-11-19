import { changeStatus, getPendingRequest, jobNotificationApi } from '@/pages/api/api'
import { getAllConversation, getConversationById } from '@/pages/api/chat'
import { getSuggestedUsers } from '@/pages/api/profile_api'
import { CloseIcon, HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  IconButton,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { RiArrowDropDownFill } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BeeLogo from './BeeLogo'
import LanguageSwitcher from './LanguageSwitcher'
import Search from './Search/Search'
import NotificationCounter from './Util/NotificationCounter'

export default function NavBar(props: any) {
  const { colorMode, toggleColorMode } = useColorMode()
  // const isDark = colorMode === "dark";
  const [display, changeDisplay] = useState('none')
  const toggleTheme = useColorModeValue('🌙', '💡')
  const formBackground = useColorModeValue('gray.100', 'gray.700')
  const [searchTerm, setSearchTerm] = useState('')
  const { onToggle, isOpen } = useDisclosure()
  const [pendingConnections, setPendingConnections] = useState([
    { user: { id: '', firstName: '', lastName: '', profilePic: '', timestamp: '' } },
  ])
  const router = useRouter()
  const isArabic = router.locale === 'ar'
  const [messageNotification, setmessageNotification]: any[] = useState([])
  const [loading1, setloading1] = useState(0)
  const [loading2, setloading2] = useState(0)
  const [loading3, setloading3] = useState(0)
  const [loading4, setloading4] = useState(0)
  const MobilehandleChange = (e: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setSearchTerm(e.target.value)
  }

  const MobilehandleSubmit = (e: any) => {
    e.preventDefault()
    router.push(`/searchResultpage?q=${searchTerm}`)
  }

  const navColor = useColorModeValue(
    'rgba(255, 255, 255, 0.25)',
    'rgba(0, 0, 0, 0.25)'
  )

  const logout = () => {
    const token = localStorage.getItem('jwt')
    if (token) {
      localStorage.removeItem('jwt')
      changeStatus('offline', token).catch((error) => {
        toast(error.message)
      })
      toast('Successfully Logged Out')
    }
  }
  useEffect(() => {
    console.log(display)
  }, [display])

  const [showDropdown1, setShowDropdown1] = useState(false)
  const [showDropdown2, setShowDropdown2] = useState(false)

  const { t } = useTranslation('common')

  const [profile, setProfile] = useState({
    name: 'John Smith',
    title: 'Software Engineer',
    location: 'Montreal, QC, CA',
    school: 'Example University',
    experience: 'Five years of experience in full stack development',
    experience2: 'Three years of experience in mobile development',
    experience3: 'Two years of experience in data analysis',
    image: '/default-profile.svg',
    cover: '/default-cover.svg',
  })
  const [Pic, setPic] = useState({
    profilePic: '',
    coverPic: '',
  })
  const currentUser = useSelector((state) => state as any)
  useEffect(() => {
    setPic({
      coverPic: currentUser.auth.coverPic,
      profilePic: currentUser.auth.profilePic,
    })
  }, [currentUser])

  const getPendingConnections = () => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('jwt')
      getPendingRequest(token)
        .then((res) => {
          setPendingConnections(res.data)
          setloading2(res.data.length)
        })
        .catch((err) => {
          toast.error(err)
        })
    }
  }
  useEffect(() => {
    if (currentUser.auth) {
      getMessage()
      getPendingConnections()
      getNotification()
    }
  }, [currentUser])

  const getNotification = () => {
    const token = localStorage.getItem('jwt')
    if (token) {
      jobNotificationApi(token)
        .then((response) => {
          setloading3(response.data.length)
        })
        .catch((error) => {
          toast(error.message)
        })
    }
  }
  const getSuggestedFriends = () => {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('jwt')
      getSuggestedUsers(token)
        .then((res) => {
          setloading4(res.data.length)
        })
        .catch((err) => {
          toast.error(err)
        })
    }
  }

  const getMessage = async () => {
    const token = localStorage.getItem('jwt')
    const notification: any = []
    if (token) {
      try {
        const allConvo = await getAllConversation(token)
        allConvo.data.map(async (element) => {
          const convo = await getConversationById(token, element.user.id)

          await Promise.all(
            convo.data.map(async (el) => {
              // console.log(el)
              const created_at: Date = new Date(el.created_at)
              const currentDate: Date = new Date()
              const diffInMs: any = currentDate.getTime() - created_at.getTime()
              const diffInHrs: number = diffInMs / (1000 * 60 * 60)
              if (el.receiverId == currentUser.auth.id && diffInHrs < 24) {
                const notif: any = {
                  id: element.user.id,
                  firstName: element.user.firstName,
                  lastName: element.user.lastName,
                  created_at: el.created_at,
                  profilePic: element.user.profilePic,
                }
                notification.push(notif)
              }
            })
          )
          notification.sort((a, b) => {
            const cr1: any = new Date(a.created_at)
            const cr2: any = new Date(b.created_at)
            return cr2.getTime() - cr1.getTime()
          })
          setmessageNotification(notification)
          setloading1(notification.length)
        })
      } catch (error) {
        toast(error.message)
      }
    }
  }

  const handleFilter = (value) => {
    // open the openJobs page
    if (value === 'option1') {
      router.push('/openJobs')
    }
    // open the jobListing page
    if (value === 'option2') {
      router.push('/myListings')
    }
    // open the myJobApplications page
    if (value === 'option3') {
      router.push('/postJob')
    }
    if (value === 'option4') {
      router.push('/myApplications')
    }
    if (value === 'option5') {
      router.push('/notifications')
    }
  }

  return (
    <Box as="nav" p={0} w="100%" data-testid="Nav-Bar">
      <Flex paddingBottom={{ base: '5rem', md: '6rem', '2xl': '7rem' }}>
        {/* Desktop */}
        <Flex
          backdropFilter="auto"
          backdropBlur="xl"
          position="fixed"
          top="0"
          left="0px"
          align="center"
          w="100%"
          minH={{ base: '64px', md: '72px' }}
          gap={{ base: 1, md: 2 }}
          backgroundColor={navColor}
          boxShadow="0px 0px 20px rgba(0, 0, 0, 0.25)"
          px={{ base: 3, md: 4, '2xl': 8 }}
          zIndex="99999"
        >
          <Text
            fontWeight="bold"
            fontSize={{
              base: '0.95rem',
              sm: '1.05rem',
              md: '1.25rem',
              '2xl': '1.5rem',
            }}
            ml={{ base: 0, sm: 2 }}
            whiteSpace="nowrap"
            flexShrink={0}
            onClick={() => {
              router.push('/')
            }}
          >
            <BeeLogo />
            <Box as="span" display={{ base: 'none', sm: 'inline' }}>
              {' BeeConnect'}
            </Box>
          </Text>
          <NextLink href="#">
            <Button
              display={{ base: 'none', md: 'inline-flex' }}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle Theme"
              my={2}
              minW={10}
              px={2}
              flexShrink={0}
              _hover={{
                transform: 'scale(1.25)',
              }}
            >
              {toggleTheme}
            </Button>
          </NextLink>
          <LanguageSwitcher className="appLanguageSwitcher" />

          <Search />
          <Flex
            display={['none', 'none', 'none', 'none', 'none', 'flex']}
            ml="auto"
            gap={1}
            align="center"
            flexShrink={0}
          >
            <NextLink href="/home" passHref>
              <Button
                aria-label="Home"
                my={2}
                px={3}
                flexShrink={0}
                whiteSpace="nowrap"
                variant="ghost"
                rounded={'full'}
              >
                🏠 ‎ {t('home')}
              </Button>
            </NextLink>

            <NextLink href="/inbox" passHref>
              <Button
                variant="ghost"
                aria-label="Messages"
                my={2}
                px={3}
                flexShrink={0}
                whiteSpace="nowrap"
                rounded={'full'}
              >
                💬 ‎ {t('messages')}
              </Button>
            </NextLink>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<Icon as={RiArrowDropDownFill} w={8} h={8} />}
                variant="outline"
                padding={'0.75em'}
                rounded={'full'}
                my={2}
                mx={1}
                flexShrink={0}
                whiteSpace="nowrap"
              >
                🚀 ‎ {t('careers')}
              </MenuButton>
              <MenuList
                style={{
                  borderRadius: '20px',
                }}
              >
                <MenuItem
                  onClick={() => handleFilter('option1')}
                  backgroundColor="transparent"
                  style={{
                    borderRadius: '10px',
                  }}
                  _hover={{
                    transform: 'scale(1.03)',
                  }}
                >
                  💼 ‎ {t('openJobs')}
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilter('option2')}
                  backgroundColor="transparent"
                  style={{
                    borderRadius: '10px',
                  }}
                  _hover={{
                    backgroundColor: 'transparent',
                    transform: 'scale(1.03)',
                  }}
                >
                  📂 ‎ {t('myListings')}
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilter('option3')}
                  backgroundColor="transparent"
                  style={{
                    borderRadius: '10px',
                  }}
                  _hover={{
                    backgroundColor: 'transparent',
                    transform: 'scale(1.03)',
                  }}
                >
                  📝 ‎ {t('createJobListing')}
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilter('option4')}
                  backgroundColor="transparent"
                  style={{
                    borderRadius: '10px',
                  }}
                  _hover={{
                    backgroundColor: 'transparent',
                    transform: 'scale(1.03)',
                  }}
                >
                  📈 ‎ {t('myApplications')}
                </MenuItem>
              </MenuList>
            </Menu>

            {props.nbNotifications != null ? (
              <NotificationCounter nbNotifications={props.nbNotifications} />
            ) : (
              <NotificationCounter
                Notifications={loading1 + loading2 + loading3 + loading4}
              />
            )}

            <NextLink href="/profile" passHref>
              <Menu isLazy>
                <MenuButton
                  as={Button}
                  size="sm"
                  px={0}
                  py={0}
                  my={2}
                  mx={2}
                  flexShrink={0}
                  variant="ghost"
                  rounded="full"
                >
                  <Avatar
                    outline="2px solid #FFFFFF35"
                    size="sm"
                    src={
                      Pic.profilePic
                        ? `data:image/jpeg;base64,${Pic.profilePic}`
                        : profile.image
                    }
                  />
                </MenuButton>
              </Menu>
            </NextLink>

            <NextLink href="/" passHref>
              <Button
                variant="ghost"
                aria-label="Logout"
                my={2}
                px={3}
                flexShrink={0}
                whiteSpace="nowrap"
                onClick={logout}
                border="2px solid #BD293F"
                borderRadius="100px"
                _hover={{
                  boxShadow: 'md',
                  transform: 'scale(1.05)',
                }}
              >
                {t('logout')}
              </Button>
            </NextLink>
          </Flex>

          {/* Mobile */}
          <IconButton
            aria-label={t('openMenu')}
            size="md"
            mr={0}
            icon={<HamburgerIcon />}
            onClick={() =>
              display == 'none' ? changeDisplay('flex') : changeDisplay('none')
            }
            display={['flex', 'flex', 'flex', 'flex', 'flex', 'none']}
            ml="auto"
            flexShrink={0}
            variant={'ghost'}
          />
        </Flex>

        {/* Mobile Content */}
        <Flex
          w="100%"
          maxW="100vw"
          display={display}
          bgColor={formBackground}
          zIndex={999999}
          h="100dvh"
          pos="fixed"
          top="0"
          left="0"
          overflowY="auto"
          flexDir="column"
        >
          <Flex justify="flex-end">
            <IconButton
              mt={2}
              mr={2}
              aria-label="Close menu"
              size="xl"
              icon={<CloseIcon />}
              onClick={() =>
                display == 'none' ? changeDisplay('flex') : changeDisplay('none')
              }
              backgroundColor="transparent"
            />
          </Flex>

          <Flex flexDir="column" align="center" paddingTop={'5em'}>
            <Button
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle Theme"
              my={3}
              w="auto"
            >
              {toggleTheme}
            </Button>

            <NextLink href="/home" passHref>
              <Button variant="ghost" aria-label="Home" my={5} w="100%">
                {t('home')}
              </Button>
            </NextLink>

            <NextLink href="/inbox" passHref>
              <Button variant="ghost" aria-label="Messages" my={5} w="100%">
                {t('messages')}
              </Button>
            </NextLink>

            <NextLink href="/profile" passHref>
              <Button variant="ghost" aria-label="My Account" my={5} w="100%">
                {t('myAccount')}
              </Button>
            </NextLink>

            <NextLink href="/notifications" passHref>
              <Button variant="ghost" aria-label="notifications" my={5} w="100%">
                {t('notifications')}
              </Button>
            </NextLink>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<Icon as={RiArrowDropDownFill} w={8} h={8} />}
                variant="outline"
                padding={'1.0em'}
                rounded={'full'}
                marginTop={'1.3em'}
                marginLeft={'1em'}
                marginRight={'1em'}
                marginBottom={'1.5em'}
              >
                {t('careers')}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleFilter('option1')}>
                  {t('openJobs')}
                </MenuItem>
                <MenuItem onClick={() => handleFilter('option2')}>
                  {t('myListings')}
                </MenuItem>
                <MenuItem onClick={() => handleFilter('option3')}>
                  {t('createJobListing')}
                </MenuItem>
                <MenuItem onClick={() => handleFilter('option4')}>
                  {t('myApplications')}
                </MenuItem>
                <MenuItem onClick={() => handleFilter('option5')}>
                  {t('notifications')}
                </MenuItem>
              </MenuList>
            </Menu>

            {/* <MobileSearchBar/> */}
            <Button
              onClick={onToggle}
              variant="ghost"
              aria-label="Search"
              backgroundColor="transparent"
            >
              🔎
            </Button>
            <Collapse in={isOpen} animateOpacity>
              <InputGroup>
                <form onSubmit={MobilehandleSubmit}>
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={MobilehandleChange}
                    style={{
                      width: 'min(80vw, 350px)',
                      maxWidth: '100%',
                      height: '40px',
                      paddingInlineStart: isArabic ? '40px' : '12px',
                      paddingInlineEnd: isArabic ? '12px' : '40px',
                      borderRadius: '100px',
                      border: 'none',
                      outline: '1px black',
                      backgroundColor: formBackground,
                    }}
                  />

                  <InputRightElement width={9}>
                    <SearchIcon
                      className="mobile-search-icon"
                      position="absolute"
                      top="50%"
                      transform="translateY(-50%)"
                      left="10px"
                      color="gray.500"
                      zIndex={1}
                      cursor="pointer"
                      // change color when hover over
                      _hover={{
                        color: 'blue.300',
                      }}
                      onClick={MobilehandleSubmit}
                    />
                  </InputRightElement>
                </form>
              </InputGroup>
            </Collapse>

            <NextLink href="/" passHref>
              <Button
                variant="ghost"
                aria-label="Sign In"
                my={5}
                w="100%"
                border="2px solid #D2173DAF"
                borderRadius="100px"
                _hover={{
                  boxShadow: 'md',
                  transform: 'scale(1.05)',
                }}
                onClick={logout}
              >
                {t('SignIn/Logout')}
              </Button>
            </NextLink>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
