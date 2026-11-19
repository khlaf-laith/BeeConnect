import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Application } from '../models/application.entity'
import { Job } from '../models/job.entity'
import { type User } from '../models/user.entity'
import { Repository } from 'typeorm'
import { type Applications } from './applications.types'

@Injectable()
export class ApplicationService {
  constructor (
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>
  ) {}

  // post an application and link it with the job and the user
  async postApplication (
    jobId: number,
    user: User,
    application: Applications.AddApplicationRequest,
    files: { cv?: Express.Multer.File, coverLetter?: Express.Multer.File }
  ): Promise<void> {
    if (
      application == null ||
      typeof application.name !== 'string' ||
      application.name.trim() === '' ||
      typeof application.email !== 'string' ||
      application.email.trim() === '' ||
      typeof application.phone !== 'string' ||
      application.phone.trim() === ''
    ) {
      throw new BadRequestException('Name, email, and phone are required')
    }

    const job = await this.jobsRepository.findOneOrFail({
      where: {
        id: jobId
      },
      relations: ['applications', 'user']
    })

    if (job == null) {
      throw new NotFoundException('Job not found')
    }

    if (job.user.id === user.id) {
      throw new BadRequestException('You cannot apply to your own job')
    }

    const existingApplication = await this.applicationRepository.findOne({
      where: {
        user: { id: user.id },
        job: { id: jobId }
      }
    })
    if (existingApplication != null) {
      throw new BadRequestException('You have already applied to this job')
    }

    const app = new Application()
    app.name = application.name
    app.email = application.email
    app.phone = application.phone
    app.user = user

    // convert pdf to base64
    if (files?.cv != null) {
      const buff = files.cv[0].buffer
      const base64data = buff.toString('base64')
      app.cv = base64data
    }

    // convert pdf to base64
    if (files?.coverLetter != null) {
      const buff = files.coverLetter[0].buffer
      const base64data = buff.toString('base64')
      app.coverLetter = base64data
    }

    job.applications = [...job.applications, app]
    await this.jobsRepository.save(job)
  }

  // delete an application
  async deleteApplication (applicationId: number, user: User): Promise<void> {
    const found = user.applications.find((application) => application.id === applicationId)

    if (found == null) {
      throw new NotFoundException()
    }

    await this.applicationRepository.delete(found.id)
  }

  // get all my applications
  async getMyApplications (user: User): Promise<Application[]> {
    const applications = await this.applicationRepository.find({
      where: {
        user: { id: user.id }
      },
      relations: ['job']
    })

    return applications
  }
}
