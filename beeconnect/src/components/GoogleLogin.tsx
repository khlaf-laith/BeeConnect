import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import Router from 'next/router'
import React from 'react'
import { toast } from 'react-toastify'
import { googleAuth } from '../pages/api/api'

type GoogleLoginButtonProps = {
  lang?: string
}

const GoogleLoginButton = ({ lang }: GoogleLoginButtonProps) => {
  const responseGoogle = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast('Failed to login with Google. Please try again later.')
      return
    }

    try {
      const result = await googleAuth(response.credential)
      localStorage.setItem('jwt', result.data.access_token)
      await Router.replace(result.data.user?.type === 'admin' ? '/admin' : '/home')
    } catch {
      toast('Failed to login with Google. Please try again later.')
    }
  }

  const onFailure = () => {
    toast('Failed to login with Google. Please try again later.')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <GoogleLogin
        text="signin_with"
        locale={lang}
        onSuccess={responseGoogle}
        onError={onFailure}
      />
    </div>
  )
}

export default GoogleLoginButton
