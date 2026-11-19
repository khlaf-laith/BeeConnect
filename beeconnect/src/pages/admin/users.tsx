import SidebarWithHeader from '@/components/admin/sidebar'
import ListOfUsers from '@/components/admin/users'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

const Users = () => {
  return (
    <SidebarWithHeader>
      <ListOfUsers />
    </SidebarWithHeader>
  )
}

export default Users

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
})
