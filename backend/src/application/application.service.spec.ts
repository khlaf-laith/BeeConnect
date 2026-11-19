import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Application } from '../models/application.entity'
import { Job } from '../models/job.entity'
import { User } from '../models/user.entity'
import { Applications } from './applications.types'
import { ApplicationService } from './application.service'

describe('ApplicationService', () => {
  let service: ApplicationService
  let jobsRepository: {
    findOneOrFail: jest.Mock
    save: jest.Mock
  }
  let applicationRepository: {
    findOne: jest.Mock
  }

  beforeEach(async () => {
    jobsRepository = {
      findOneOrFail: jest.fn(),
      save: jest.fn()
    }
    applicationRepository = {
      findOne: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Job),
          useValue: jobsRepository
        },
        {
          provide: getRepositoryToken(Application),
          useValue: applicationRepository
        }
      ]
    }).compile()

    service = module.get<ApplicationService>(ApplicationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('rejects applications without a phone number', async () => {
    const application = Object.assign(new Applications.AddApplicationRequest(), {
      name: 'Candidate',
      email: 'candidate@example.com',
      phone: ''
    })

    await expect(
      service.postApplication(2, Object.assign(new User(), { id: 1 }), application, {})
    ).rejects.toThrow('Name, email, and phone are required')
    expect(jobsRepository.findOneOrFail).not.toHaveBeenCalled()
  })

  it('rejects a second application to the same job', async () => {
    jobsRepository.findOneOrFail.mockResolvedValue({
      id: 2,
      user: { id: 3 },
      applications: []
    })
    applicationRepository.findOne.mockResolvedValue({ id: 10 })
    const application = Object.assign(new Applications.AddApplicationRequest(), {
      name: 'Candidate',
      email: 'candidate@example.com',
      phone: '555-0100'
    })

    await expect(
      service.postApplication(2, Object.assign(new User(), { id: 1 }), application, {})
    ).rejects.toThrow('You have already applied to this job')
    expect(jobsRepository.save).not.toHaveBeenCalled()
  })

  it('saves a valid application', async () => {
    const job = {
      id: 2,
      user: { id: 3 },
      applications: []
    }
    jobsRepository.findOneOrFail.mockResolvedValue(job)
    applicationRepository.findOne.mockResolvedValue(null)
    const application = Object.assign(new Applications.AddApplicationRequest(), {
      name: 'Candidate',
      email: 'candidate@example.com',
      phone: '555-0100'
    })

    await service.postApplication(
      2,
      Object.assign(new User(), { id: 1 }),
      application,
      {}
    )

    expect(job.applications).toHaveLength(1)
    expect(job.applications[0]).toMatchObject({
      name: 'Candidate',
      email: 'candidate@example.com',
      phone: '555-0100'
    })
    expect(jobsRepository.save).toHaveBeenCalledWith(job)
  })
})
