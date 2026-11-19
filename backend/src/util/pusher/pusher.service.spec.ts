import { Test, TestingModule } from '@nestjs/testing'
import { PusherService } from './pusher.service'

describe('PusherService', () => {
  let service: PusherService
  const keys = [
    'PUSHER_APP_ID',
    'PUSHER_APP_KEY',
    'PUSHER_APP_SECRET',
    'PUSHER_APP_CLUSTER',
  ] as const
  const originalValues = keys.map((key) => process.env[key])

  beforeEach(async () => {
    keys.forEach((key) => {
      delete process.env[key]
    })
    const module: TestingModule = await Test.createTestingModule({
      providers: [PusherService],
    }).compile()

    service = module.get<PusherService>(PusherService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('disables realtime triggers when credentials are not configured', async () => {
    await expect(service.trigger('user-1', 'message', {})).resolves.toBeUndefined()
    await expect(
      service.triggerNotification('user-1', 'message-notification', {})
    ).resolves.toBeUndefined()
  })

  afterAll(() => {
    keys.forEach((key, index) => {
      const originalValue = originalValues[index]
      if (originalValue === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = originalValue
      }
    })
  })
})
