import { SearchIcon } from '@chakra-ui/icons'
import { Box, Flex, Stack, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { SetStateAction, useState } from 'react'

const Search = () => {
  const [search, setSearch] = useState(false)
  const toggleSearch = () => setSearch(!search)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const formBackground = useColorModeValue('gray.100', 'gray.700')
  const { getButtonProps, onToggle, getDisclosureProps, isOpen } = useDisclosure()

  const router = useRouter()
  const isArabic = router.locale === 'ar'

  const handleSubmit = (e: any) => {
    e.preventDefault()
    router.push(`/searchResultpage?q=${searchTerm}`)
  }

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSearchTerm(event.target.value)
  }

  const { t } = useTranslation('common')

  return (
    <>
      <Flex
        display={['none', 'none', 'none', 'none', 'none', 'flex']}
        flex="0 1 350px"
        minW={0}
      >
        <Stack w="100%" minW={0}>
          <Box
            display={['none', 'none', 'none', 'none', 'none', 'flex']}
            w="100%"
            minW={0}
            position="relative"
          >
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={handleChange}
                list="browser"
                style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: '42px',
                  paddingLeft: isArabic ? '12px' : '50px',
                  paddingRight: isArabic ? '50px' : '12px',
                  borderRadius: '100px',
                  border: 'none',
                  // black with 30 opacity
                  backgroundColor: useColorModeValue('#0000001A', '#FFFFFF1A'),
                }}
              />
              <SearchIcon
                position="absolute"
                top="50%"
                transform="translateY(-50%)"
                left={isArabic ? 'auto' : '25px'}
                right={isArabic ? '25px' : 'auto'}
                zIndex={1}
                cursor="pointer"
                // change color when hover over
                _hover={{
                  color: 'blue.300',
                }}
                onClick={handleSubmit}
              />
            </form>
          </Box>
        </Stack>
      </Flex>
    </>
  )
}

export default Search

function setSearchTerm(value: SetStateAction<string>) {
  throw new Error('Function not implemented.')
}
