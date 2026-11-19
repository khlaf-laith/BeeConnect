import { Injectable, Logger } from '@nestjs/common'
import * as Pusher from 'pusher'

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name)
  private readonly pusher?: Pusher

  constructor () {
    const { PUSHER_APP_ID, PUSHER_APP_KEY, PUSHER_APP_SECRET, PUSHER_APP_CLUSTER } = process.env
    if (
      PUSHER_APP_ID !== undefined &&
      PUSHER_APP_ID.length > 0 &&
      PUSHER_APP_KEY !== undefined &&
      PUSHER_APP_KEY.length > 0 &&
      PUSHER_APP_SECRET !== undefined &&
      PUSHER_APP_SECRET.length > 0 &&
      PUSHER_APP_CLUSTER !== undefined &&
      PUSHER_APP_CLUSTER.length > 0
    ) {
      this.pusher = new Pusher({
        appId: PUSHER_APP_ID,
        key: PUSHER_APP_KEY,
        secret: PUSHER_APP_SECRET,
        cluster: PUSHER_APP_CLUSTER
      })
    } else {
      this.logger.warn('Pusher is not configured; real-time events are disabled.')
    }
  }

  async triggerNotification (
    channel: string,
    event: string,
    data: any
  ): Promise<Pusher.Response | undefined> {
    if (this.pusher === undefined) return undefined
    return await this.pusher.trigger(channel, event, {
      message: data
    })
  }

  async trigger (channel: string, event: string, data: any): Promise<Pusher.Response | undefined> {
    if (this.pusher === undefined) return undefined
    return await this.pusher.trigger(channel, event, data)
  }
}
