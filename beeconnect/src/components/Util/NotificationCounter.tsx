import { BellIcon } from '@chakra-ui/icons'
import { Badge, IconButton } from '@chakra-ui/react'
import NextLink from 'next/link'
import Pusher from 'pusher-js'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const NotificationCounter = (props: any) => {
  const [counter, setCounter] = useState(0)
  const currentUser = useSelector((state) => state as any)
  useEffect(() => {
    console.log(props.Notifications)
    if (props.Notifications) {
      setCounter(props.Notifications)
    }
  }, [props.Notifications])
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
    if (!currentUser.auth || !appKey) return

    const pusher = new Pusher(appKey, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ?? 'us2',
    })
    const channelName = `user-${currentUser.auth.id}`
    const channel = pusher.subscribe(channelName)
    const incrementCounter = () => setCounter((prevCount) => prevCount + 1)
    channel.bind('friend-request', incrementCounter)
    channel.bind('message-notification', incrementCounter)
    channel.bind('newJob', incrementCounter)
    channel.bind('warn', incrementCounter)

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      pusher.disconnect()
    }
  }, [currentUser])
  return (
    <NextLink href="/notifications" passHref>
      <div style={{ position: 'relative' }}>
        <IconButton
          aria-label="Notifications"
          icon={<BellIcon />}
          variant="ghost"
          size="lg"
          w="100%"
          my={4}
          rounded={'full'}
          marginRight={'10px'}
        ></IconButton>
        <Badge
          colorScheme="red"
          borderRadius="full"
          px="2"
          position="absolute"
          top="20px"
          right="0"
          marginRight={'5px'}
        >
          {props.nbNotifications != null ? props.nbNotifications : counter}
        </Badge>
      </div>
    </NextLink>
  )
}
export default NotificationCounter
