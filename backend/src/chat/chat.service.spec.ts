import { Test, TestingModule } from "@nestjs/testing";
import { ChatService } from "./chat.service";
import { Message } from "../models/message.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PusherService } from "../util/pusher/pusher.service";
import { UploadedFileDB } from "../models/file.entity";
import { Readable } from "typeorm/platform/PlatformTools";
import { User } from "../models/user.entity";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

describe("ChatService", () => {
    let service: ChatService;
    let messageRepository: Repository<Message>;
    let pusherService: PusherService;
    let fileRepository: Repository<UploadedFileDB>;

    const mockMessageRepository = {
        find: jest.fn(() => []),
        save: jest.fn(() => { }),
    };

    const mockFileRepository = {
        save: jest.fn((file: UploadedFileDB) => file),
    };

    const mockPusherService = {
        trigger: jest.fn(() => { }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockMessageRepository,
                },
                {
                    provide: getRepositoryToken(UploadedFileDB),
                    useValue: mockFileRepository,
                },
                { provide: PusherService, useValue: mockPusherService },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        messageRepository = module.get(getRepositoryToken(Message));
        pusherService = module.get<PusherService>(PusherService);
        fileRepository = module.get(getRepositoryToken(UploadedFileDB));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should send a message", async () => {
        const sender = { id: 1, firstName: "Test", lastName: "User" };
        const receiver = { id: 2, firstName: "Test", lastName: "Receiver" };
        const message = "Hello!";
        await service.message(sender as User, receiver as User, message);
        expect(pusherService.trigger).toHaveBeenCalledTimes(2);
        expect(messageRepository.save).toHaveBeenCalled();
    });

    it("should get all conversations for a user", async () => {
        const userId = 1;
        const result = await service.allConversations(userId);
        expect(messageRepository.find).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Array);
    });

    it("should get a conversation between two users", async () => {
        const userId = 1;
        const withUserId = 2;
        const result = await service.conversation(userId, withUserId);
        expect(messageRepository.find).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Array);
    });

    it("should upload a file", async () => {
        const previousUploadDirectory = process.env.UPLOAD_DIRECTORY;
        const previousAppBaseUrl = process.env.APP_BASE_URL;
        const uploadDirectory = await mkdtemp(join(tmpdir(), "beeconnect-uploads-"));
        process.env.UPLOAD_DIRECTORY = uploadDirectory;
        process.env.APP_BASE_URL = "http://localhost:8080";
        const file: Express.Multer.File = {
            fieldname: "file",
            originalname: "test.txt",
            encoding: "7bit",
            mimetype: "text/plain",
            buffer: Buffer.from("Hello, World!"),
            size: 13,
            stream: new Readable(),
            destination: "",
            filename: "",
            path: ""
        };
        const userId = 1;
        try {
            const result = await service.upload(file, userId);
            const savedFile = mockFileRepository.save.mock.calls[
                mockFileRepository.save.mock.calls.length - 1
            ][0] as UploadedFileDB;
            expect(result).toBe(`http://localhost:8080/uploads/${savedFile.storedName}.txt`);
            expect(savedFile.url).toBe(result);
            expect(savedFile.userId).toBe(userId);
            await expect(
                readFile(join(uploadDirectory, `${savedFile.storedName}.txt`))
            ).resolves.toEqual(file.buffer);
        } finally {
            await rm(uploadDirectory, { recursive: true, force: true });
            if (previousUploadDirectory == null) {
                delete process.env.UPLOAD_DIRECTORY;
            } else {
                process.env.UPLOAD_DIRECTORY = previousUploadDirectory;
            }
            if (previousAppBaseUrl == null) {
                delete process.env.APP_BASE_URL;
            } else {
                process.env.APP_BASE_URL = previousAppBaseUrl;
            }
        }
    });
});
