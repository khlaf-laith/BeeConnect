import { AdminHome } from '@/components/admin/home'
import SidebarWithHeader from '@/components/admin/sidebar'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

const Admin = () => {
  return (
    <SidebarWithHeader>
      <AdminHome />
    </SidebarWithHeader>
  )
}
export default Admin

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
})
