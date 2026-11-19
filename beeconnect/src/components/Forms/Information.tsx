import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spacer,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { useSelector } from 'react-redux'

const Information = ({ update, handleSubmit }: any) => {
  const { t } = useTranslation('common')
  const currentUser = useSelector((state) => state as any)
  const setState = (updateUserObj: any) => {
    update(updateUserObj)
  }

  return (
    <Box
      minWidth={'60vw'}
      borderWidth="1px"
      borderRadius={25}
      p={8}
      width="auto"
      mt={30}
    >
      <Stack direction={'row'}>
        <Spacer />
        <Button
          style={{
            boxShadow: '0 5px 17px 0px rgba(0, 100, 500, 0.3)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
          }}
          type="button"
          colorScheme={'blue'}
          borderRadius="100px"
          onClick={handleSubmit}
        >
          {t('update')}
        </Button>
      </Stack>

      <FormControl>
        <FormLabel htmlFor="name">{t('First Name')}</FormLabel>
        <Input
          minWidth={'100%'}
          type="text"
          id="name"
          defaultValue={currentUser.auth.firstName}
          // value={name}
          onChange={(event) => setState({ firstName: event.target.value })}
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="name">{t('Last Name')}</FormLabel>
        <Input
          minWidth={'100%'}
          type="text"
          defaultValue={currentUser.auth.lastName}
          onChange={(event) => setState({ lastName: event.target.value })}
          id="school"
          // value={school}
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="email">{t('email')}</FormLabel>
        <Input
          minWidth={'100%'}
          type="email"
          defaultValue={currentUser.auth.email}
          id="title"
          // value={title}
          onChange={(event) => setState({ email: event.target.value })}
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="number">{t('mobileNumber')}</FormLabel>
        <Input
          minWidth={'100%'}
          type="tel"
          defaultValue={
            currentUser.auth.mobileNo == null
              ? t('pleaseAddMobile')
              : currentUser.auth.mobileNo
          }
          id="location"
          onChange={(event) => setState({ mobileNo: event.target.value })}
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="gender">{t('Sex')}</FormLabel>
        <Select
          minWidth={'100%'}
          // defaultValue={profile.location}
          id="location"
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
          defaultValue={currentUser.auth.gender || ''}
          onChange={(event) => setState({ gender: event.target.value })}
        >
          <option value="MALE">{t('male')}</option>
          <option value="FEMALE">{t('female')}</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="text">{t('bio')}</FormLabel>
        <Textarea
          minWidth={'100%'}
          placeholder={
            currentUser.auth.biography == null
              ? t('pleaseAddBio')
              : currentUser.auth.biography
          }
          id="location"
          onChange={(event) => setState({ biography: event.target.value })}
          borderRadius="10"
          size="lg"
          mb={5}
          width="auto"
        />
      </FormControl>
    </Box>
  )
}
export default Information
