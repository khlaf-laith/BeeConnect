import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type * as Pusher from 'pusher'
import { randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { Message } from '../models/message.entity'
import { type User } from '../models/user.entity'
import { Repository } from 'typeorm'
import { UploadedFileDB } from '../models/file.entity'
import { extname, join, resolve } from 'path'
import { PusherService } from '../util/pusher/pusher.service'

@Injectable()
export class ChatService {
  constructor (
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(UploadedFileDB)
    private readonly fileRepository: Repository<UploadedFileDB>,
    private readonly pusherService: PusherService
  ) { }

  public async message (
    sender: User,
    receiver: User,
    message: string
  ): Promise<Pusher.Response | undefined> {
    const res = await this.pusherService.trigger(
      `message-${receiver.id}`,
      'message',
      {
        message,
        sender: sender.id
      }
    )
    // Push to db (we don't need to await --> save time)
    const msg = new Message()
    msg.message = message
    msg.senderId = sender.id
    msg.receiverId = receiver.id
    await this.messageRepository.save(msg)

    await this.pusherService.trigger(
      `user-${receiver.id}`,
      'message-notification',
      {
        user: {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName
        },
        message: msg
      }
    )

    return res
  }

  // get all conversations for a user
  public async allConversations (
    userId: number
  ): Promise<Array<{ userId: number, lastMessage: string }>> {
    const messages = await this.messageRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      select: ['id', 'senderId', 'receiverId', 'message', 'created_at'],
      order: { created_at: 'DESC' } // Order by createdAt in descending order
    })

    const conversationsMap = new Map<number, Message>()

    messages.forEach((message) => {
      const conversationPartnerId =
        message.senderId === userId ? message.receiverId : message.senderId

      if (
        !conversationsMap.has(conversationPartnerId) ||
        (conversationsMap.get(conversationPartnerId) as Message).created_at <
          message.created_at
      ) {
        conversationsMap.set(conversationPartnerId, message)
      }
    })

    const conversations: Array<{ userId: number, lastMessage: string }> = []

    conversationsMap.forEach((message, conversationId) => {
      conversations.push({
        userId: conversationId,
        lastMessage: message.message
      })
    })

    return conversations
  }

  public async conversation (
    id: number,
    withUserId: number
  ): Promise<Message[]> {
    return await this.messageRepository.find({
      where: [
        { senderId: id, receiverId: withUserId },
        { senderId: withUserId, receiverId: id }
      ]
    })
  }

  /**
   * TODO: move this to a separate service
   * @param file
   * @param userId
   */
  public async upload (
    file: Express.Multer.File,
    userId: number
  ): Promise<string> {
    if (file == null) {
      throw new BadRequestException('File is required')
    }

    const storedName = randomBytes(15).toString('hex')
    const nameExt = storedName + extname(file.originalname)
    const uploadDirectory = resolve(
      process.env.UPLOAD_DIRECTORY ?? join(__dirname, '..', '..', 'uploads')
    )
    await mkdir(uploadDirectory, { recursive: true })
    await writeFile(join(uploadDirectory, nameExt), file.buffer, { flag: 'wx' })

    const dbFileData = new UploadedFileDB()
    dbFileData.originalName = file.originalname
    dbFileData.storedName = storedName
    dbFileData.mime = file.mimetype
    dbFileData.userId = userId
    dbFileData.size = file.size

    const baseUrl = (
      process.env.APP_BASE_URL ?? `http://localhost:${process.env.APP_PORT ?? 8080}`
    ).replace(/\/+$/, '')
    const url = `${baseUrl}/uploads/${encodeURIComponent(nameExt)}`
    dbFileData.url = url

    await this.fileRepository.save(dbFileData)

    return url
  }
}
