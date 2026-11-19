/* eslint-disable @next/next/no-img-element */
import CompanyMark from '@/components/CompanyMark'
import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import {
  Box,
  Button,
  chakra,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  HStack,
  Icon,
  Img,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { useTranslation, withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import router from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import { BsFilter } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { applyToJob, checkLogin, getMyApplications, getOpenJobs } from './api/api'

interface JobAttributes {
  id: number
  jobTitle: ''
  companyName: ''
  location: ''
  jobDescription: ''
  salary: ''
  skills: ''
  startDate: ''
  jobType: ''
  coverLetter: false | true
  transcript: false | true
  externalUrl: '' | null
}

interface UserAttributes {
  id: number
  firstName: string
  lastName: string
  email: string
  mobileNo: string
  gender: string
  profilePic: string | null
  coverPic: string | null
  cv: string | null
  coverLetter: string | null
  biography: string
  userStatus: string
  type: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const FindJob = () => {
  const mockJobData = {
    id: 5,
    externalUrl: 'https://example.com/candidate' as string,
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
      firstName: '',
      lastName: '',
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
  }
  const [jobListing, setJobListing] = useState([mockJobData])
  const [initialJobListing, setInitalJobListing] = useState([mockJobData])
  const [userId, setUserId] = useState(0)
  const [userFirstName, setUserFirstName] = useState('')
  const [userLastName, setUserLastName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userCv, setUserCv] = useState('')
  const [userCover, setUserCover] = useState('')
  const [userDataLoading, setUserDataLoading] = useState(true)
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [submittingJobId, setSubmittingJobId] = useState<number | null>(null)
  const currentUser = useSelector((state) => state as any)
  const cardHoverBg = useColorModeValue('gray.200', 'gray.700')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300')
  const buttonHoverBg = useColorModeValue('gray.400', 'gray.600')
  const handleSubmit = (event, jobId) => {
    const token = localStorage.getItem('jwt')
    event.preventDefault()

    if (appliedJobIds.includes(jobId) || submittingJobId === jobId) return

    const submitApp = {
      userId: userId,
      name: `${userFirstName} ${userLastName}`,
      email: userEmail,
      phone: userPhone,
      ...(userCv && { cv: userCv }),
      coverLetter: userCover,
      id: 0,
    }

    const missingFields = [] as string[]

    if (!submitApp.name) {
      missingFields.push('name')
    }
    if (!submitApp.email) {
      missingFields.push('email')
    }
    if (!submitApp.phone) {
      missingFields.push('phone')
    }

    if (missingFields.length > 0) {
      const message = `Missing fields: ${missingFields.join(', ')}`
      toast.error(message)
      return
    } else {
      setSubmittingJobId(jobId)
      applyToJob(token, jobId, submitApp)
        .then((res) => {
          if (res.status == 201 || res.status == 200) {
            toast.success(t('successfullyApplied'))
            setAppliedJobIds((current) =>
              current.includes(jobId) ? current : [...current, jobId]
            )
          } else {
            console.error('Error applying to job!', res.data)
            toast.error(res.data.message) // toast the error message
          }
        })
        .catch((error) => {
          console.error('Error applying to job!', error)
          toast.error(t('errorApplying'))
        })
        .finally(() => setSubmittingJobId(null))
    }
  }
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('jwt')
      // fetch checkLogin API
      const response = await checkLogin(token)
      const data: UserAttributes = response.data

      // Access the user attributes
      const userId = data.id
      const userFirstName = data.firstName
      const userLastName = data.lastName
      const userEmail = data.email
      const userPhone = data.mobileNo ?? ''
      const userCv = data.cv
      const userCover = data.coverLetter

      // Update state variables with user data
      setUserId(userId)
      setUserFirstName(userFirstName)
      setUserLastName(userLastName)
      setUserEmail(userEmail)
      setUserPhone(userPhone)
      setUserCv('')
      setUserCover('')

      console.log('User ID:', userId)
      console.log('User first name:', userFirstName)
      console.log('User last name:', userLastName)
      console.log('User email:', userEmail)
      console.log('User phone:', userPhone)
      console.log('User CV:', userCv)
      console.log('User cover letter:', userCover)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setUserDataLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
    const viewOpenJobs = async () => {
      // Get token from local storage
      const token = localStorage.getItem('jwt')
      try {
        // Call API function to get open jobs
        const response = await getOpenJobs(token)
        // Update state with fetched data
        console.log(response.data)
        setInitalJobListing(response.data)
        setJobListing(response.data)
      } catch (error) {
        console.error(error)
        toast.error(t('errorJobs'))
      }
    }
    viewOpenJobs()
    const viewMyApplications = async () => {
      const token = localStorage.getItem('jwt')
      if (!token) {
        setApplicationsLoading(false)
        return
      }

      try {
        const response = await getMyApplications(token)
        if (response.status !== 200 || !Array.isArray(response.data)) {
          throw new Error(response.data?.message ?? 'Invalid applications response')
        }
        setAppliedJobIds(response.data.map((application) => application.job.id))
      } catch (error) {
        console.error('Failed to load applications:', error)
        toast.error(t('errorJobs'))
      } finally {
        setApplicationsLoading(false)
      }
    }
    viewMyApplications()
  }, [])

  const handleFilter = (value) => {
    switch (value) {
      case 'option1':
        setJobListing(
          [...jobListing].sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
        )
        break
      case 'option2':
        setJobListing(
          [...jobListing].sort((a, b) => parseFloat(b.salary) - parseFloat(a.salary))
        )
        break
      default:
        break
    }
  }

  function handleCheckboxChange(event) {
    const isChecked = event.target.checked
    const filterValue = event.target.value

    let filteredJobs = [...jobListing]

    if (isChecked) {
      console.log('Filtering ...')
      switch (filterValue) {
        case 'full-time':
          filteredJobs = filteredJobs.filter(
            (job) => job.jobType === ('full-time' as string)
          )
          break
        case 'part-time':
          filteredJobs = filteredJobs.filter(
            (job) => job.jobType === ('part-time' as string)
          )
          break
        case 'contract':
          filteredJobs = filteredJobs.filter(
            (job) => job.jobType === ('contract' as string)
          )
          break
        case 'other':
          filteredJobs = filteredJobs.filter(
            (job) => job.jobType === ('other' as string)
          )
          break

        default:
          break
      }
    } else {
      console.log('Resetting ...')
      filteredJobs = initialJobListing
    }

    setJobListing(filteredJobs)
  }
  const [checkedItems, setCheckedItems] = useState([false, false, false, false])
  const allChecked = checkedItems.every(Boolean)
  const isIndeterminate = checkedItems.some(Boolean) && !allChecked
  const { t } = useTranslation('common')

  return (
    <>
      <Layout>
        <NavBar />
        <Container maxW="5xl" px={{ base: 3, md: 0 }} py={{ base: 4, md: 0 }}>
          <Flex justify="left" mb={3}>
            <HStack
              flexWrap="wrap"
              gap={{ base: 2, md: 4 }}
              style={{
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <chakra.h3
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight="bold"
                textAlign="center"
                paddingBottom={'0.2em'}
              >
                💼 ‎ {t('openJobs')}
              </chakra.h3>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<Icon as={BsFilter} w={8} h={8} />}
                  variant="outline"
                  padding={{ base: '0.8em', md: '1.5em' }}
                  rounded={'full'}
                >
                  {t('filterJobs')}
                </MenuButton>
                <MenuList borderRadius={'20px'} marginTop={1}>
                  <MenuItem onClick={() => handleFilter('option1')}>
                    {t('sortStartingDate')}
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
                    onChange={(e) => {
                      setCheckedItems([
                        e.target.checked,
                        e.target.checked,
                        e.target.checked,
                        e.target.checked,
                      ])
                      handleCheckboxChange(e)
                    }}
                  >
                    {t('viewAll')}
                  </Checkbox>
                  <Stack pl={7} mt={1} spacing={1}>
                    <Checkbox
                      isChecked={checkedItems[0]}
                      value="full-time"
                      onChange={(e) => {
                        setCheckedItems([
                          e.target.checked,
                          checkedItems[1],
                          checkedItems[2],
                          checkedItems[3],
                        ])
                        handleCheckboxChange(e)
                      }}
                    >
                      {t('fullTime')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[1]}
                      value="part-time"
                      onChange={(e) => {
                        setCheckedItems([
                          checkedItems[0],
                          e.target.checked,
                          checkedItems[2],
                          checkedItems[3],
                        ])
                        handleCheckboxChange(e)
                      }}
                    >
                      {t('partTime')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[2]}
                      onChange={(e) => {
                        setCheckedItems([
                          checkedItems[0],
                          checkedItems[1],
                          e.target.checked,
                          checkedItems[3],
                        ])
                        handleCheckboxChange(e)
                      }}
                      value="contract"
                    >
                      {t('contract')}
                    </Checkbox>
                    <Checkbox
                      isChecked={checkedItems[3]}
                      onChange={(e) => {
                        setCheckedItems([
                          checkedItems[0],
                          checkedItems[1],
                          checkedItems[2],
                          e.target.checked,
                        ])
                        handleCheckboxChange(e)
                      }}
                      value="other"
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
                <Grid
                  templateRows={{ base: 'auto auto', md: 'auto' }}
                  w="100%"
                  templateColumns={{ base: 'unset', md: '4fr 3fr 2fr' }}
                  p={{ base: 2, sm: 4 }}
                  gap={3}
                  alignItems="center"
                  _hover={{ bg: cardHoverBg }}
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
                    <div
                      style={{
                        paddingTop: '0.5em',
                      }}
                    ></div>

                    <chakra.p fontWeight="bold" fontSize="sm" color={mutedTextColor}>
                      📍 {job.location}
                    </chakra.p>
                    <chakra.p
                      fontWeight="normal"
                      fontSize="sm"
                      color={mutedTextColor}
                    >
                      💼 ‎ {t('jobType')}:{' '}
                      {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                    </chakra.p>
                  </Box>
                  <VStack
                    spacing={{ base: 0, sm: 3 }}
                    alignItems="start"
                    fontWeight="light"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    color={mutedTextColor}
                  >
                    <chakra.p>
                      📅 {t('startingDate')}: {job.startDate.split('T')[0]}
                    </chakra.p>
                    <chakra.p>
                      🤑 {t('salary')}: {job.salary}
                    </chakra.p>
                    <chakra.p>
                      🏫 {t('transcript')}:{' '}
                      {job.transcript.toString() == 'true' ? t('yes') : t('no')}
                    </chakra.p>
                    <chakra.p>
                      💌 {t('coverLetter')}:{' '}
                      {job.coverLetter.toString() == 'true' ? t('yes') : t('no')}
                    </chakra.p>
                  </VStack>
                  <VStack
                    spacing={4}
                    direction={{ base: 'column', md: 'row' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    justifySelf="flex-end"
                    alignItems="end"
                  >
                    <div key={job.id}>
                      {/* quick apply job button */}
                      {!job.coverLetter &&
                        !job.transcript &&
                        currentUser.auth.id !== job.user.id && (
                          <Button
                            as={Link}
                            _hover={{
                              bg: buttonHoverBg,
                            }}
                            rounded="100px"
                            outline={'solid 1px'}
                            colorScheme="green"
                            outlineColor={buttonHoverBg}
                            isDisabled={
                              userDataLoading ||
                              applicationsLoading ||
                              submittingJobId === job.id ||
                              appliedJobIds.includes(job.id)
                            }
                            onClick={(event) => handleSubmit(event, job.id)}
                          >
                            {appliedJobIds.includes(job.id)
                              ? t('Applied')
                              : t('Quick Apply')}
                          </Button>
                        )}
                    </div>
                    {currentUser.auth.id !== job.user.id ? (
                      <Button
                        as={Link}
                        _hover={{ bg: buttonHoverBg }}
                        rounded="100px"
                        outline={'solid 1px'}
                        outlineColor={buttonHoverBg}
                        onClick={() => {
                          router.push(`/jobListing/${job.id}`)
                        }}
                      >
                        {t('apply')}
                      </Button>
                    ) : (
                      <Button
                        as={Link}
                        _hover={{ bg: buttonHoverBg }}
                        rounded="100px"
                        outline={'solid 1px'}
                        outlineColor={buttonHoverBg}
                        onClick={() => {
                          router.push(`/myListings/`)
                        }}
                      >
                        {t('editListing')}
                      </Button>
                    )}
                  </VStack>
                </Grid>

                {jobListing.length - 1 !== index && <Divider m={0} />}
              </Fragment>
            ))}
          </VStack>
        </Container>
      </Layout>
    </>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default withTranslation('common')(FindJob)
