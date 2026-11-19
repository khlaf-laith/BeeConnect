import Layout from '@/components/Layout'
import Courses from '@/components/Profile/Courses'
import { ChakraProvider } from '@chakra-ui/react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import store from '../src/Redux/store'

jest.mock('next/router', () => require('next-router-mock'))

describe('courses', () => {
  const renderCourses = () =>
    render(
      <Provider store={store}>
        <ChakraProvider>
          <Layout>
            <Courses />
          </Layout>
        </ChakraProvider>
      </Provider>
    )
  // beforeAll(()=>{
  //     <Layout></Layout>
  // })
  it('should render courses page without crashing', () => {
    renderCourses()
    expect(screen.getByText(/accomplishedCourses/)).toBeInTheDocument()
  })
})
