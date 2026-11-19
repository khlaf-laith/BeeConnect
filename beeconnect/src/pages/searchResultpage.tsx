import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Box, Flex, Heading, Img, List, Stack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { default as NextLink } from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { search } from './api/api'

const Search = () => {
  const { t } = useTranslation('common')
  const formBorder = useColorModeValue('gray.100', 'gray.600')
  const postBackground = useColorModeValue('gray.100', 'gray.700')
  // const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const profile = {
    image: '/default-profile.svg',
    cover: '/default-cover.svg',
  }

  const router = useRouter()

  const searchQuery = router.query.q?.valueOf() as string
  const searchQuery2 = router.query.c?.valueOf() as boolean

  const filterFun = (user) => {
    return user.connectionStatus == 'Connected'
  }
  useEffect(() => {
    console.log(router.query)
    if (searchQuery) {
      console.log(searchQuery2)
      const token = localStorage.getItem('jwt')
      search(token, searchQuery)
        .then((response) => {
          if (!response.data || !response.data.users) {
            toast(t('noResults'))
          } else {
            if (response.data !== null && response.data.users !== null) {
              if (searchQuery2) {
                console.log('searchQuery2')
                const user = response.data.users.filter(filterFun)
                // user.filter((element) => (
                //   element.connectionStatus == "Connected"
                // ))
                setSearchResults(user)
              } else {
                setSearchResults(response.data.users)
              }
              console.log(searchResults)
            } else {
              setSearchResults([])
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [searchQuery, searchQuery2])

  // display search results in a card component with profile pic, name,

  return (
    <Layout>
      <NavBar></NavBar>
      <Heading
        textAlign={'center'}
        style={{
          paddingBottom: '1.5rem',
        }}
      >
        {t('total results')}: {searchResults.length}
      </Heading>
      <Flex flexDir="column" align="center" px={{ base: 3, md: 6 }} minW={0}>
        <Stack w="100%" maxW="350px" minW={0}>
          <div style={{ width: '100%', minWidth: 0 }}>
            <List>
              {searchResults.map((user: any) => (
                <Stack key={user.user.id}>
                  <Box
                    borderWidth="1px"
                    borderColor={formBorder}
                    backgroundColor={postBackground}
                    padding={{ base: 3, md: 4 }}
                    marginBottom="1rem"
                    rounded="25px"
                    overflow="hidden"
                    width="100%"
                    maxW={300}
                    minW={0}
                    key={user.id}
                  >
                    <li key={user.user.id}>
                      <NextLink
                        href={`${
                          searchQuery2
                            ? `inbox/${user.user.id}`
                            : `profile/${user.user.id}`
                        }`}
                      >
                        <Heading
                          fontSize={20}
                          style={{
                            paddingBottom: '1rem',
                            paddingLeft: '5px',
                          }}
                        >
                          {user.user.firstName} {user.user.lastName}
                        </Heading>
                        <div
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '150px',
                            width: '150px',
                            position: 'absolute',
                            margin: '2%',
                            marginBottom: '1%',
                          }}
                        ></div>

                        <Img
                          src={
                            user.user.profilePic
                              ? `data:image/jpeg;base64,${user.user.profilePic}`
                              : profile.image
                          }
                          style={{
                            borderRadius: '15px',
                          }}
                          alt={`${user.user.firstName} ${user.user.lastName}`}
                        />
                      </NextLink>
                    </li>
                  </Box>
                </Stack>
              ))}
            </List>
          </div>
        </Stack>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default Search

// const handleSearch = async (e:any) => {
// const token = localStorage.getItem("jwt");

// search(token, searchQuery)
//     .then((response) => {
//         console.log(response.data.users);
//         if (response.data == null) {
//             toast("No results found");
//         }else{

//           const fetch = response.data.users.json();
//           // using key value pairs

//           response.data.users.map((user:any) => {
//             setSearchResults({...searchResults, firstName: user.firstName, lastName: user.lastName, profilePic: user.profilePic});
//           })

//         }
//     })
//     .catch((error) => {

//         console.log(error);
//     })
// };
