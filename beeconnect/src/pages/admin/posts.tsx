import { ReportedPosts } from '@/components/admin/posts'
import SidebarWithHeader from '@/components/admin/sidebar'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

const Posts = () => {
  return (
    <SidebarWithHeader>
      <ReportedPosts />
    </SidebarWithHeader>
  )
}

export default Posts

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
})
