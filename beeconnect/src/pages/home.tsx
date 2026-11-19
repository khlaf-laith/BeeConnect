/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import CompanyMark from '@/components/CompanyMark'
import Layout from '@/components/Layout'
import NavBar from '@/components/NavBar'
import styles from '@/styles/modal.module.css'
import { DeleteIcon } from '@chakra-ui/icons'
import {
  Avatar,
  Box,
  Button,
  Center,
  chakra,
  Divider,
  Grid,
  Heading,
  HStack,
  Link,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'react-toastify'
import {
  applyToJob,
  checkLogin,
  createPosts,
  deletePost,
  getMyApplications,
  getOpenJobs,
  getPosts,
  reportPost,
} from './api/api'

interface JobAttributes {
  id: number
  jobTitle: string
  companyName: string
  location: string
  jobDescription: string
  salary: string
  startDate: string
  jobType: string
  coverLetter: boolean
  transcript: boolean
  user: { id: number }
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

const Home = () => {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [postToDeleteId, setPostToDeleteId] = useState(null)

  const handleDeleteClick = (postId) => {
    setPostToDeleteId(postId)
    setIsConfirmOpen(true)
  }
  const handlePostDelete = () => {
    if (postToDeleteId) {
      const token = localStorage.getItem('jwt')
      deletePost(token, postToDeleteId)
        .then((res) => {
          if (res.status === 201 || res.status === 200) {
            toast.success(t('postDeleted'))
            // add reload method here to ensure reloading happens after successful deletion
            setTimeout(() => {
              window.location.reload()
            }, 0)
          } else {
            toast.error(t('notYourPost'))
          }
        })
        .catch((error) => {
          toast.error(t('errorDeleting'))
        })
    }
    setIsConfirmOpen(false)
  }

  const handleReportPost = (post) => {
    const token = localStorage.getItem('jwt')
    reportPost(token, post, post).then((res) => {
      if (res.status == 201 || res.status == 200) {
        toast.success(t('successfullyReportedPost'))
      } else {
        toast.error(t('alreadyReported'))
      }
    })
  }
  // const FileDropzone = () => {
  //   const onDrop = useCallback((acceptedFiles) => {
  //     // Handle files here
  //     console.log(acceptedFiles)
  //   }, [])

  //   const options: DropzoneOptions = {
  //     onDrop,
  //     accept: 'image/*' as any,
  //   }

  //   const { getRootProps, getInputProps, isDragActive } = useDropzone(options)

  //   return (
  //     <div
  //       {...getRootProps()}
  //       style={{
  //         backgroundColor: 'transparent',
  //         border: useColorModeValue('1px dashed #26262673', '1px dashed #FFFFFF78'),
  //         borderWidth: '1px',
  //         borderRadius: '20px',
  //         width: '100%',
  //         height: '100%',
  //         display: 'flex',
  //       }}
  //     >
  //       <input {...getInputProps()} accept="image/*" />
  //       <VStack
  //         direction={'column'}
  //         flex={1}
  //         alignContent={'center'}
  //         padding={'10px'}
  //       >
  //         <p
  //           style={{
  //             color: useColorModeValue('gray.500', 'gray.400'),
  //             textAlign: 'center',
  //           }}
  //         >
  //           Drag and drop image here or click to browse
  //         </p>
  //         <img
  //           src="https://img.icons8.com/cute-clipart/512/image-file.png"
  //           alt="upload"
  //           width="50px"
  //           height="50px"
  //         />
  //       </VStack>
  //     </div>
  //   )
  // }
  const [jobListing, setJobListing] = useState<JobAttributes[]>([])
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
      const message = `${t('missingFields')}: ${missingFields
        .map((field) => t(field))
        .join(', ')}`
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
  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }

    const date = new Date(dateString)
    return new Intl.DateTimeFormat(router.locale ?? 'en', options).format(date)
  }
  const { t } = useTranslation('common')
  // const [jobListing, setJobListing] = useState<JobAttributes[]>([])
  // const [initialJobListing, setInitalJobListing] = useState<JobAttributes[]>([])
  const [preview, setPreview] = useState<any>(null)
  const input = useRef<any>(null)

  useEffect(() => {
    fetchUserData()
    const viewOpenJobs = async () => {
      // Get token from local storage
      const token = localStorage.getItem('jwt')

      try {
        // Call API function to get open jobs

        const response = await getOpenJobs(token)

        if (!Array.isArray(response.data)) {
          console.error(
            'Failed to load open jobs: expected an array response.',
            response.data
          )
          setJobListing([])
          toast.error(t('errorJobs'))
          return
        }

        // Update state with fetched data
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

  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)
  const formBorder = useColorModeValue('gray.300', 'gray.600')
  const postBackground = useColorModeValue('gray.100', '#DBE9FF0A ')
  const jobCardBackground = useColorModeValue('gray.100', 'gray.700')
  const jobCardBorder = useColorModeValue('#5D616736', '#E2E8F01E')
  const jobCardTextColor = useColorModeValue('gray.600', 'gray.300')
  const User = useSelector((state) => state as any)
  const [posts, setPosts] = useState([
    {
      id: 13,
      content: 'hey',
      image: null,
      created_at: '2023-03-31T17:47:41.043Z',
      updated_at: '2023-03-31T17:47:41.043Z',
      deleted_at: null,
      user: {
        id: 4,
        firstName: 'Demo',
        lastName: 'Candidate',
        email: 'demo.candidate@beeconnect.local',
        mobileNo: null,
        gender: 'MALE',
        profilePic: null,
        coverPic: null,
        cv: null,
        coverLetter: null,
        biography: null,
        userStatus: 'online',
        type: 'User',
        created_at: '2023-03-02T22:50:47.902Z',
        updated_at: '2023-03-28T05:07:19.000Z',
        deleted_at: null,
      },
    },
  ])
  useEffect(() => {
    if (User.auth) {
      const token = localStorage.getItem('jwt')
      getPosts(token)
        .then((response) => {
          const allPosts = response.data
          setPosts(allPosts)
        })
        .catch((error) => {
          toast(error.message)
        })
    }
  }, [User.auth])

  const [createpost, setCreatePost] = useState({ content: '', image: '' })
  const createPostHandler = () => {
    const fd = new FormData()
    if (createpost.image) {
      fd.append('image', createpost.image, 'post image')
    }

    fd.append('content', createpost.content)
    const token = localStorage.getItem('jwt')
    createPosts(token, fd).then((res) => {
      if (res.status == 201 || res.status == 200) {
        toast.success(t('postCreated'))
      } else {
        toast.error(t('errorCreatingPost'))
      }
    })
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
  const handlepost = (e) => {
    setCreatePost({ ...createpost, content: e.target.value })
  }
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      console.log(reader)
      reader.onload = () => {
        setCreatePost({ ...createpost, image: e.target.files[0] })
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
    }
  }

  const leastDestructiveRef = useRef(null)

  const HoverableGrid = ({ children, ...props }) => {
    return (
      <Box borderRadius="18px" {...props}>
        <Grid
          p={{ base: 2, sm: 4 }}
          gap={3}
          _hover={{
            boxShadow: '0 0 0 2px #3182ce',
            borderRadius: '18px',
            // maxWidth: '50%',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {children}
        </Grid>
      </Box>
    )
  }
  return (
    <>
      <Layout>
        <NavBar></NavBar>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          data-testid="Home-page"
        >
          <Box w="100%" maxW="1200px" minW={0} mx="auto" px={{ base: 3, md: 6 }}>
            <HStack paddingBottom={5} flexWrap="wrap" spacing={{ base: 2, sm: 4 }}>
              <Heading
                marginRight={3}
                fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}
              >
                {t('welcome')}, {User.auth.firstName} 🧑🏼‍💻
              </Heading>
              <Button
                borderRadius="50px"
                onClick={() => setIsOpen(true)}
                data-testid="create-button"
              >
                {t('createPost')}
              </Button>
            </HStack>
            <Heading
              paddingTop={1}
              style={{
                fontSize: '1.5rem',
                fontWeight: '500',
              }}
            >
              🏠 {t('recent posts')}
            </Heading>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1rem',
              }}
            >
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay className={styles.blurred} />
                <ModalContent
                  margin={'auto'}
                  borderRadius="30px"
                  padding={'1em'}
                  borderColor={formBorder}
                  backgroundColor={postBackground}
                  borderWidth="2px"
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                  width={{ base: 'calc(100vw - 2rem)', md: '50%' }}
                  maxW="100vw"
                >
                  <ModalHeader
                    style={{
                      fontWeight: '300',
                    }}
                  >
                    {t('Have something on your')} 🧠
                  </ModalHeader>

                  <ModalBody>
                    <Box
                      padding={'5px'}
                      borderRadius={'30px'}
                      border="1px solid currentColor"
                    >
                      <Center>
                        {preview ? (
                          <img
                            style={{
                              borderRadius: '10px',
                              maxHeight: '200px',
                              maxWidth: 'auto',
                            }}
                            src={preview}
                          />
                        ) : (
                          <h1
                            onClick={() => {
                              input.current.click()
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {t('Click to upload Picture')}
                          </h1>
                        )}

                        {/* </h1> */}
                      </Center>
                    </Box>
                    <TextareaAutosize
                      placeholder={t('Type anything...')}
                      onChange={handlepost}
                      id="creat-box"
                      minRows={2}
                      data-testid="create-post"
                      style={{
                        border: '0px solid #E2E8F00D',
                        borderRadius: '10px',
                        padding: '1rem',
                        width: '100%',
                        display: 'block',
                        marginTop: '20px',

                        backgroundColor: 'transparent',
                        resize: 'none',
                      }}
                    />
                    <Box style={{ marginTop: '1rem' }} height="100px">
                      {/* <FileDropzone /> */}
                      <input
                        ref={input}
                        style={{ display: 'none' }}
                        type={'file'}
                        onChange={handleImageChange}
                      ></input>
                    </Box>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={createPostHandler}
                      borderRadius="50px"
                    >
                      {t('Post')}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                      {t('Cancel')}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                size="md"
              >
                <ModalOverlay className={styles.blurred} />
                <ModalContent
                  margin={'auto'}
                  borderRadius="17px"
                  padding={'0.3em'}
                  borderColor={formBorder}
                  backgroundColor={postBackground}
                  borderWidth="2px"
                  display={'flex'}
                >
                  <ModalHeader fontSize="lg" fontWeight="bold">
                    {t('Delete Post')}
                  </ModalHeader>

                  <ModalBody>
                    {t(
                      'Are you sure you want to delete this post? This action cannot be undone.'
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={() => setIsConfirmOpen(false)}>
                      {t('Cancel')}
                    </Button>
                    <Button colorScheme="red" onClick={handlePostDelete} ml={3}>
                      {t('delete')}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>

            <HStack
              spacing={{ base: 0, md: 8 }}
              align="start"
              width="100%"
              minW={0}
              flexDirection={{ base: 'column', md: 'row' }}
            >
              <Box width={{ base: '100%', md: 'calc(70% - 1rem)' }}>
                <List>
                  {posts.map((post) => (
                    <ListItem key={post.id}>
                      <Box
                        borderWidth="1px"
                        borderColor={formBorder}
                        backgroundColor={postBackground}
                        padding="1rem"
                        marginBottom="1rem"
                        rounded="20"
                        overflow="hidden"
                        minWidth={'100%'}
                      >
                        <HStack
                          spacing={{ base: 2, md: 6 }}
                          flexDirection={'row'}
                          flexWrap="wrap"
                          alignItems={'center'}
                          width={'100%'}
                        >
                          <Avatar
                            size="md"
                            mr={4}
                            src={
                              post.user.profilePic
                                ? `data:image/jpeg;base64,${post.user.profilePic}`
                                : '/default-profile.svg'
                            }
                          />
                          <Text
                            flex={1}
                            style={{
                              fontWeight: 'bold',
                              marginLeft: '0.5rem',
                            }}
                          >
                            {post.user.firstName} {post.user.lastName}
                          </Text>

                          <Text
                            style={{
                              opacity: '0.5',
                            }}
                          >
                            {formatDate(post.created_at)}
                          </Text>
                        </HStack>
                        <HStack justifyContent={'space-between'} flexWrap="wrap">
                          <Text paddingTop={3} marginLeft={'1'} minW={0} flex={1}>
                            {post.content}
                          </Text>
                          {User.auth.id === post.user.id ? (
                            <Button
                              colorScheme="red"
                              size="sm"
                              borderRadius="50px"
                              onClick={() => handleDeleteClick(post.id)}
                              style={{
                                marginTop: '0.5rem',
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                          ) : (
                            <Button
                              colorScheme="red"
                              size="sm"
                              borderRadius="50px"
                              onClick={() => handleReportPost(post.id)}
                              style={{
                                marginTop: '0.5rem',
                              }}
                            >
                              {t('Report')}
                            </Button>
                          )}
                        </HStack>

                        {post.image !== null ? (
                          <HStack>
                            <a
                              href={`data:image/jpeg;base64,${post.image}`}
                              target="_blank"
                            >
                              <img
                                alt="post pic"
                                style={{
                                  maxHeight: '180px',
                                  maxWidth: '100%',
                                  width: 'auto',
                                  objectFit: 'cover',
                                  borderRadius: '15px',
                                  marginTop: '1rem',
                                  boxShadow: '0px 0px 10px 0px #00000040',
                                }}
                                src={
                                  post.image
                                    ? `data:image/jpeg;base64,${post.image}`
                                    : post.image
                                }
                              />
                            </a>
                          </HStack>
                        ) : null}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Divider
                orientation="vertical"
                height="100%"
                width="1px"
                color={formBorder}
                display={{ base: 'none', md: 'block', sm: 'block' }}
              />
              <Box
                width={{ md: 'calc(30% - 1rem)' }}
                display={{ base: 'none', md: 'block', sm: 'none' }}
              >
                <Text
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    textAlign: 'center',
                    backgroundColor: jobCardBackground,
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '200px',
                    borderColor: jobCardBorder,
                    borderWidth: '2px',
                  }}
                >
                  <b> {t('openJobsForYou')} </b>
                </Text>
                <div min-width={{ base: 'unset', sm: '100vh' }}>
                  {jobListing.map((job, index) => (
                    <Fragment key={index}>
                      {User.auth.id !== job.user.id ? (
                        <HoverableGrid>
                          <Box>
                            <HStack spacing={3}>
                              <CompanyMark name={job.companyName} />

                              <chakra.h2 fontWeight="bold" fontSize="md">
                                {job.companyName}
                              </chakra.h2>
                              {/* quick apply job button */}
                              {!job.coverLetter && !job.transcript && (
                                <Button
                                  colorScheme="gray"
                                  // border={useColorModeValue('gray.200', 'gray.600')}
                                  borderWidth="3px"
                                  size="sm"
                                  p={4}
                                  borderRadius="50px"
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
                            </HStack>

                            <chakra.h3
                              as={Link}
                              isExternal
                              fontWeight="extrabold"
                              fontSize="15px"
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

                            <chakra.p
                              fontWeight="bold"
                              fontSize="sm"
                              color={jobCardTextColor}
                            >
                              📍 ‎ ‎ {job.location}
                            </chakra.p>
                            <chakra.p
                              fontWeight="normal"
                              fontSize="sm"
                              color={jobCardTextColor}
                            >
                              💼 ‎ ‎ {t('jobType')}:{' '}
                              {job.jobType.charAt(0).toUpperCase() +
                                job.jobType.slice(1)}
                            </chakra.p>
                            <Grid
                              alignItems="start"
                              fontWeight="light"
                              fontSize={{ base: 'xs', sm: 'sm' }}
                              color={jobCardTextColor}
                            >
                              {/* By the way, the ‎ is an invisible space character */}

                              <chakra.p>
                                {/* format the starting date to be only year month and date */}
                                📅 ‎ ‎ {t('startDate')}:{' '}
                                {job.startDate.split('T')[0]}
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
                            </Grid>
                          </Box>
                        </HoverableGrid>
                      ) : null}

                      {jobListing.length - 1 !== index && <Divider m={0} />}
                    </Fragment>
                  ))}
                </div>
              </Box>
            </HStack>
          </Box>
        </Box>
        <div style={{ marginBottom: '3rem' }}></div>
      </Layout>
    </>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default Home
