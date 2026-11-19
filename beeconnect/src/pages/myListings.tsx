/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import CompanyMark from '@/components/CompanyMark'
import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import {
  Box,
  Button,
  Center,
  chakra,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import router from 'next/router'
import React, { Fragment, useEffect, useState } from 'react'
// Here we have used react-icons package for the icons
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { BsFilter } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { deleteJobListing, getJobApplicants, getOpenJobs } from './api/api'

const handleApplicationsClick = (jobId) => {
  // Here, you can implement your navigation or any other action needed
  router.push('/myApplicants') // Navigates the user to the home page
}

const myListings = () => {
  const [jobListing, setJobListing] = useState([
    {
      id: 5,
      jobTitle: 'Software Engineering Intern',
      companyName: 'Amazon',
      location: 'Montreal',
      jobDescription: 'bjdwbchjbvdhcvdhjcvbmnd m',
      salary: '20',
      jobType: 'full-time',
      startDate: '2023-03-23T04:00:00.000Z',
      coverLetter: true,
      transcript: true,
      created_at: '2023-03-16T20:19:34.940Z',
      updated_at: '2023-03-16T20:19:34.940Z',

      user: {
        id: 4,
        firstName: 'Demo',
        lastName: 'Candidate',
        email: 'demo.candidate@beeconnect.local',
        mobileNo: '',
        gender: 'MALE',
        profilePic: '',
        coverPic: null,
        cv: '',
        coverLetter: '',
        biography: null,
        userStatus: 'online',
        type: 'User',
        created_at: '2023-03-02T22:50:47.902Z',
        updated_at: '2023-04-05T03:48:54.000Z',
        deleted_at: null,
      },
      skills: [
        {
          id: 1,
          title: 'C++',
          created_at: '2023-03-02T22:52:53.844Z',
          updated_at: '2023-03-02T22:52:53.844Z',
        },
        {
          id: 2,
          title: 'Java',
          created_at: '2023-03-02T22:53:07.867Z',
          updated_at: '2023-03-02T22:53:07.867Z',
        },
      ],
    },
  ])

  const [jobApplicant, setJobApplicant] = useState([
    {
      id: 25,
      externalUrl: 'https://example.com/candidate',
      jobTitle: 'thirdparty',
      companyName: 'test',
      location: 'test',
      jobDescription: 'hey',
      salary: '34',
      jobType: 'part-time',
      startDate: '2023-04-21T04:00:00.000Z',
      coverLetter: false,
      transcript: false,
      created_at: '2023-04-18T20:50:19.339Z',
      updated_at: '2023-04-18T20:50:19.339Z',
      applications: [
        {
          id: 35,
          name: 'Example Applicant',
          email: 'demo.applicant@beeconnect.local',
          phone: '',
          cv: null,
          coverLetter: null,
          created_at: '2023-04-19T22:31:43.747Z',
        },
      ],
    },
  ])
  const { t } = useTranslation('common')

  useEffect(() => {
    const viewOpenJobs = async () => {
      // Get token from local storage
      const token = localStorage.getItem('jwt')
      try {
        // Call API function to get open jobs
        const response = await getOpenJobs(token)
        // Update state with fetched data
        setJobListing(response.data)
      } catch (error) {
        console.error(error)
        toast.error(t('errorJobs'))
      }
    }
    viewOpenJobs()
  }, [])

  useEffect(() => {
    const getApplicants = async () => {
      console.log('getting applicants')
      // Get token from local storage
      const token = localStorage.getItem('jwt')
      try {
        // Call API function to get job applicants for this job id
        const responseApplicants = await getJobApplicants(token)
        // Update state with fetched data
        setJobApplicant(responseApplicants.data)
      } catch (error) {
        console.error(error)
        toast.error(t('errorJobs'))
      }
    }
    getApplicants()
  }, [])

  const handleFilter = (value) => {
    // your logic to filter the list goes here
    console.log(value)
  }
  function handleCheckboxChange(event) {
    const isChecked = event.target.checked
    // Perform the necessary actions based on the isChecked value
    if (isChecked) {
      console.log('Filtering ...')
      // code to filter jobs
    } else {
      console.log('Not filtering.')
      // code to remove
    }
  }

  const [checkedItems, setCheckedItems] = React.useState([
    false,
    false,
    false,
    false,
  ])

  const allChecked = checkedItems.every(Boolean)
  const isIndeterminate = checkedItems.some(Boolean) && !allChecked

  const [profile] = useState({
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
  const userToken =
    typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
  return (
    <>
      <Layout>
        <NavBar />
        <Container
          maxW="5xl"
          px={{ base: 3, md: 0 }}
          py={{ base: 4, md: 0 }}
          data-testid="myListings"
        >
          <Flex justify="left" mb={3}>
            <HStack
              flexWrap="wrap"
              gap={{ base: 2, md: 4 }}
              style={{
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              {/* a profile picture image here */}
              <img
                src={
                  Pic.profilePic
                    ? `data:image/jpeg;base64,${Pic.profilePic}`
                    : profile.image
                }
                alt="Segun Adebayo"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: '1em',
                }}
              />
              <chakra.h3
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight="bold"
                textAlign="center"
                paddingBottom={'0.2em'}
                paddingRight={'0.5em'}
              >
                {t('myListings')}
              </chakra.h3>
              <Button
                alignContent={'center'}
                justifyContent={'center'}
                alignItems={'center'}
                alignSelf={'center'}
                as={Link}
                _hover={{ bg: useColorModeValue('gray.400', 'gray.600') }}
                p={{ base: 3, md: 5 }}
                colorScheme="whatsapp"
                rounded="100px"
                border={'solid 1px'}
                outlineColor={useColorModeValue('gray.400', 'gray.600')}
                // go to url /viewListings
                onClick={() => {
                  router.push(`/myApplicants`)
                }}
              >
                {t('viewApplicants')}
              </Button>
              <Spacer display={{ base: 'none', md: 'block' }} />
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<Icon as={BsFilter} w={8} h={8} />}
                  variant="outline"
                  padding={{ base: '0.8em', md: '1.5em' }}
                  rounded={'full'}
                >
                  {t('filterList')}
                </MenuButton>
                <MenuList borderRadius={'20px'} marginTop={1}>
                  <MenuItem onClick={() => handleFilter('option1')}>
                    {t('sortNewest')}
                  </MenuItem>
                  <MenuItem onClick={() => handleFilter('option2')}>
                    {t('sortHighestSalary')}
                  </MenuItem>

                  <Checkbox
                    paddingTop={1}
                    pl={3}
                    paddingBottom={1}
                    isChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={(e) =>
                      setCheckedItems([
                        e.target.checked,
                        e.target.checked,
                        e.target.checked,
                        e.target.checked,
                      ])
                    }
                  >
                    {t('viewAll')}
                  </Checkbox>
                  <Stack pl={7} mt={1} spacing={1}>
                    <Checkbox
                      isChecked={checkedItems[0]}
                      onChange={(e) =>
                        setCheckedItems([
                          e.target.checked,
                          checkedItems[1],
                          checkedItems[2],
                          checkedItems[3],
                        ])
                      }
                    >
                      {t('fullTime')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[1]}
                      onChange={(e) =>
                        setCheckedItems([
                          checkedItems[0],
                          e.target.checked,
                          checkedItems[2],
                          checkedItems[3],
                        ])
                      }
                    >
                      {t('partTime')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[2]}
                      onChange={(e) =>
                        setCheckedItems([
                          checkedItems[0],
                          checkedItems[1],
                          e.target.checked,
                          checkedItems[3],
                        ])
                      }
                    >
                      {t('internship')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[3]}
                      onChange={(e) =>
                        setCheckedItems([
                          checkedItems[0],
                          checkedItems[1],
                          checkedItems[2],
                          e.target.checked,
                        ])
                      }
                    >
                      {t('other')}
                    </Checkbox>
                  </Stack>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
          <VStack
            shadow={{ base: 'none', md: 'md' }}
            border="1px solid"
            borderColor="gray.400"
            rounded="15px"
            overflow="hidden"
            spacing={0}
            marginBottom={'5em'}
          >
            {jobListing.map((job, index) => (
              <Fragment key={index}>
                {currentUser.auth.id === job.user.id ? (
                  <Grid
                    templateRows={{ base: 'auto auto', md: 'auto' }}
                    w="100%"
                    templateColumns={{ base: 'unset', md: '4fr 3fr 2fr' }}
                    p={{ base: 2, sm: 4 }}
                    gap={3}
                    alignItems="center"
                    _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
                  >
                    <Box key={index} gridColumnEnd={{ base: 'span 2', md: 'unset' }}>
                      <HStack spacing={3}>
                        <CompanyMark name={job.companyName} />

                        <chakra.h2 fontWeight="bold" fontSize="lg">
                          {job.companyName}
                        </chakra.h2>
                      </HStack>

                      <chakra.h3
                        as={Link}
                        isExternal
                        fontWeight="extrabold"
                        fontSize="2xl"
                        onClick={() => {
                          router.push(`/jobListing/${job.id}`)
                        }}
                      >
                        {job.jobTitle}
                      </chakra.h3>

                      <chakra.p
                        fontWeight="normal"
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        style={{
                          paddingTop: '1.0em',
                        }}
                      >
                        📍 {job.location}
                      </chakra.p>
                      <chakra.p
                        fontWeight="normal"
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        style={{
                          paddingTop: '0.5em',
                        }}
                      >
                        💼 ‎ {t('jobType')}:
                        {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                      </chakra.p>
                      <chakra.p
                        fontWeight="bold"
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        style={{
                          paddingTop: '0.5em',
                        }}
                      >
                        ✅ ‎ {t('numberOfApplications')}:
                        <button onClick={() => handleApplicationsClick(job.id)}>
                          <chakra.p
                            color={useColorModeValue('blue.600', 'blue.300')}
                          >
                            {/* Display the number of applications or 0 if not present */}
                            {jobApplicant.find((app) => app.id === job.id)
                              ?.applications?.length || 0}{' '}
                            ({t('view')})
                          </chakra.p>
                        </button>
                      </chakra.p>
                    </Box>
                    <VStack
                      spacing={{ base: 0, sm: 3 }}
                      alignItems="start"
                      fontWeight="light"
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      color={useColorModeValue('gray.600', 'gray.300')}
                    >
                      {/* By the way, the ‎ is an invisible space character */}
                      <chakra.p>
                        {/* format the starting date to be only year month and date */}
                        📅 ‎ ‎ {t('startingDate')}: {job.startDate.split('T')[0]}
                      </chakra.p>
                      <chakra.p>
                        🤑 ‎ ‎ {t('salary')}: {job.salary}
                      </chakra.p>
                      <chakra.p>
                        🏫 ‎ ‎ {t('transcript')} ‎ ‎
                        {job.transcript.toString() == 'true' ? '✅' : '❌'}
                      </chakra.p>
                      <chakra.p>
                        💌 ‎ ‎ {t('coverLetter')} ‎ ‎
                        {job.coverLetter.toString() == 'true' ? '✅' : '❌'}
                      </chakra.p>
                    </VStack>
                    <Stack
                      spacing={6}
                      direction="row"
                      fontSize={{ base: 'sm', sm: 'md' }}
                      justifySelf="flex-end"
                      alignItems="center"
                    >
                      <Button
                        as={Link}
                        _hover={{ bg: useColorModeValue('gray.400', 'gray.600') }}
                        p={5}
                        rounded="100px"
                        colorScheme={'blue'}
                        outline={'solid 1px'}
                        outlineColor={useColorModeValue('gray.400', 'gray.600')}
                        onClick={() => {
                          router.push(`/jobListing/${job.id}`)
                        }}
                      >
                        {t('editListing')}
                      </Button>
                      <Button
                        as={Link}
                        _hover={{ bg: useColorModeValue('gray.400', 'gray.600') }}
                        p={5}
                        colorScheme="red"
                        rounded="100px"
                        outline={'solid 1px'}
                        outlineColor={useColorModeValue('gray.400', 'gray.600')}
                        onClick={async () => {
                          const token = localStorage.getItem('jwt')
                          try {
                            await deleteJobListing(token, job.id)
                            setJobListing(jobListing.filter((a) => a.id !== job.id))
                            toast.success(t('deletedSuccessfully'))
                          } catch (error) {
                            console.error(error)
                            toast.error(t('errorDeleting'))
                          }
                        }}
                      >
                        {t('delete')}
                      </Button>
                    </Stack>
                  </Grid>
                ) : null}

                {jobListing.length - 1 !== index && <Divider m={-1} />}
              </Fragment>
            ))}
          </VStack>
        </Container>
      </Layout>
    </>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default myListings
