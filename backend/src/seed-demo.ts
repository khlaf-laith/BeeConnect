import 'dotenv/config'
import * as argon2 from 'argon2'
import { join } from 'path'
import { DataSource } from 'typeorm'
import { Application } from './models/application.entity'
import { Award } from './models/award.entity'
import { Connection } from './models/connection.entity'
import { Course } from './models/course.entity'
import { Education } from './models/education.entity'
import { Job } from './models/job.entity'
import { Language } from './models/language.entity'
import { Message } from './models/message.entity'
import { Notifications } from './models/notifications.entity'
import { Post } from './models/post.entity'
import { Project } from './models/project.entity'
import { Skill } from './models/skill.entity'
import { User } from './models/user.entity'
import { Volunteering } from './models/volunteering.entity'
import { Work } from './models/work.entity'

const DEMO_PASSWORD = 'BeeConnectDemo2026'

const demoUsers = [
  {
    email: 'demo.candidate@beeconnect.local',
    firstName: 'Alex',
    lastName: 'Morgan',
    mobileNo: '+1 514 555 0100',
    gender: 'female' as const,
    biography: 'Product designer focused on accessible, people-centered digital experiences.',
    skills: ['Product Design', 'Figma', 'User Research', 'Prototyping'],
    language: { languageName: 'English', proficiency: 'Fluent' },
    education: { institution: 'Example University', degree: 'BFA, Design', start_year: 2019, end_year: 2023 },
    work: { company: 'Northstar Studio', title: 'Product Designer', start_year: 2023, end_year: 2025 },
    course: { courseName: 'Inclusive Design', courseNumber: 'DES-204' },
    project: { name: 'Accessible City Guide', description: 'A prototype that helps people find accessible local places.', url: 'https://example.com/accessible-city-guide', start_year: 2024, end_year: 2025 },
    award: { title: 'Community Design Award', issuer: 'BeeConnect Design Community', url: 'https://example.com/community-design-award', issue_date: new Date('2024-05-01'), description: 'Recognized for a community-focused accessibility project.' },
    volunteering: { company: 'Design for Good', title: 'Volunteer Designer', start_year: 2022, end_year: 2024 }
  },
  {
    email: 'demo.recruiter@beeconnect.local',
    firstName: 'Jordan',
    lastName: 'Lee',
    mobileNo: '+1 514 555 0101',
    gender: 'male' as const,
    biography: 'Talent partner connecting thoughtful builders with teams doing meaningful work.',
    skills: ['Recruiting', 'Talent Acquisition', 'People Operations'],
    language: { languageName: 'English', proficiency: 'Fluent' },
    education: { institution: 'McGill University', degree: 'BA, Management', start_year: 2015, end_year: 2019 },
    work: { company: 'Brightside Labs', title: 'Talent Partner', start_year: 2021, end_year: 2025 },
    course: { courseName: 'Inclusive Hiring Practices', courseNumber: 'HR-118' },
    project: { name: 'Open Doors Hiring', description: 'A practical guide to making interview processes more inclusive.', url: 'https://example.com/open-doors-hiring', start_year: 2023, end_year: 2024 },
    award: { title: 'People First Award', issuer: 'Brightside Labs', url: 'https://example.com/people-first-award', issue_date: new Date('2024-12-01'), description: 'Recognized for improving the candidate experience.' },
    volunteering: { company: 'Tech Careers Montréal', title: 'Mentor', start_year: 2022, end_year: 2025 }
  },
  {
    email: 'demo.colleague@beeconnect.local',
    firstName: 'Samira',
    lastName: 'Haddad',
    mobileNo: '+1 514 555 0102',
    gender: 'female' as const,
    biography: 'Frontend engineer who enjoys building clear, responsive products with collaborative teams.',
    skills: ['JavaScript', 'React', 'TypeScript', 'Accessibility'],
    language: { languageName: 'French', proficiency: 'Professional' },
    education: { institution: 'Example University', degree: 'BEng, Software Engineering', start_year: 2018, end_year: 2022 },
    work: { company: 'Northstar Studio', title: 'Frontend Engineer', start_year: 2022, end_year: 2025 },
    course: { courseName: 'Modern TypeScript', courseNumber: 'WEB-310' },
    project: { name: 'Neighborhood Exchange', description: 'A small community platform for sharing local resources.', url: 'https://example.com/neighborhood-exchange', start_year: 2023, end_year: 2024 },
    award: { title: 'Emerging Developer Award', issuer: 'BeeConnect Engineering Community', url: 'https://example.com/emerging-developer-award', issue_date: new Date('2022-04-15'), description: 'Recognized for collaborative engineering work.' },
    volunteering: { company: 'Code for Montréal', title: 'Volunteer Developer', start_year: 2021, end_year: 2024 }
  },
  {
    email: 'demo.pending@beeconnect.local',
    firstName: 'Noah',
    lastName: 'Williams',
    mobileNo: '+1 514 555 0103',
    gender: 'male' as const,
    biography: 'Early-career data analyst interested in turning useful questions into clear insights.',
    skills: ['Data Analysis', 'SQL', 'Python', 'Communication'],
    language: { languageName: 'English', proficiency: 'Fluent' },
    education: { institution: 'McGill University', degree: 'BSc, Statistics', start_year: 2020, end_year: 2024 },
    work: { company: 'Cedar Analytics', title: 'Junior Data Analyst', start_year: 2024, end_year: 2025 },
    course: { courseName: 'Data Visualization', courseNumber: 'DATA-105' },
    project: { name: 'City Services Dashboard', description: 'A sample dashboard exploring public service request trends.', url: 'https://example.com/city-services-dashboard', start_year: 2023, end_year: 2024 },
    award: { title: 'Student Research Prize', issuer: 'McGill Statistics Department', url: 'https://example.com/student-research-prize', issue_date: new Date('2024-05-10'), description: 'Recognized for clear and reproducible analysis.' },
    volunteering: { company: 'Data for Communities', title: 'Volunteer Analyst', start_year: 2023, end_year: 2024 }
  },
  {
    email: 'demo.admin@beeconnect.local',
    firstName: 'Taylor',
    lastName: 'Admin',
    mobileNo: '+1 514 555 0104',
    gender: 'female' as const,
    biography: 'Local demo administrator account.',
    type: 'admin' as const,
    skills: [],
    language: { languageName: 'English', proficiency: 'Fluent' },
    education: { institution: 'Example University', degree: 'BA, Communication Studies', start_year: 2018, end_year: 2022 },
    work: { company: 'BeeConnect', title: 'Community Administrator', start_year: 2023, end_year: 2025 },
    course: { courseName: 'Community Management', courseNumber: 'COMM-101' },
    project: { name: 'BeeConnect Demo', description: 'Sample account for exploring local moderation tools.', url: 'https://example.com/beeconnect-demo', start_year: 2025, end_year: 2025 },
    award: { title: 'Community Builder', issuer: 'BeeConnect', url: 'https://example.com/community-builder', issue_date: new Date('2025-01-01'), description: 'A sample profile award.' },
    volunteering: { company: 'Local Community Network', title: 'Volunteer Organizer', start_year: 2021, end_year: 2023 }
  }
]

const jobSamples = [
  {
    email: 'demo.recruiter@beeconnect.local',
    jobTitle: 'Product Designer',
    companyName: 'Brightside Labs',
    location: 'Montréal, QC (Hybrid)',
    jobDescription: 'Help shape accessible product experiences with a collaborative design and engineering team.',
    salary: '$75,000–$95,000',
    jobType: 'full-time' as const,
    skills: ['Product Design', 'Figma', 'User Research'],
    coverLetter: true,
    transcript: false
  },
  {
    email: 'demo.recruiter@beeconnect.local',
    jobTitle: 'Frontend Developer',
    companyName: 'Brightside Labs',
    location: 'Remote, Canada',
    jobDescription: 'Build responsive web features with React and TypeScript and help improve product accessibility.',
    salary: '$80,000–$105,000',
    jobType: 'full-time' as const,
    skills: ['React', 'TypeScript', 'Accessibility'],
    coverLetter: false,
    transcript: false
  },
  {
    email: 'demo.colleague@beeconnect.local',
    jobTitle: 'UX Research Assistant',
    companyName: 'Northstar Studio',
    location: 'Montréal, QC',
    jobDescription: 'Support interviews, usability sessions, and synthesis for a range of digital products.',
    salary: '$28–$34 / hour',
    jobType: 'part-time' as const,
    skills: ['User Research', 'Communication', 'Product Design'],
    coverLetter: true,
    transcript: false
  },
  {
    email: 'demo.colleague@beeconnect.local',
    jobTitle: 'Data Analyst Intern',
    companyName: 'Cedar Analytics',
    location: 'Montréal, QC (Hybrid)',
    jobDescription: 'Turn real-world datasets into clear reports and visualizations alongside an experienced team.',
    salary: '$25–$30 / hour',
    jobType: 'contract' as const,
    skills: ['Data Analysis', 'SQL', 'Python'],
    coverLetter: false,
    transcript: false
  }
]

const entities = [join(__dirname, 'models/**/*.entity.{ts,js}')]
const dataSource = new DataSource(
  process.env.DB_TYPE === 'sqlite'
    ? {
        type: 'sqlite',
        database: process.env.DB_NAME ?? 'dev.sqlite',
        entities,
        synchronize: true
      }
    : {
        type: 'mysql',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: Number(process.env.DB_PORT ?? 3306),
        username: process.env.DB_USERNAME ?? 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME ?? 'beeconnect',
        entities,
        synchronize: true
      }
)

async function getOrCreateSkill (title: string): Promise<Skill> {
  const skillRepository = dataSource.getRepository(Skill)
  const existing = await skillRepository.findOneBy({ title })
  if (existing != null) return existing
  return await skillRepository.save(skillRepository.create({ title }))
}

async function ensureProfile (user: User, profile: typeof demoUsers[number]): Promise<void> {
  const educationRepository = dataSource.getRepository(Education)
  const workRepository = dataSource.getRepository(Work)
  const courseRepository = dataSource.getRepository(Course)
  const projectRepository = dataSource.getRepository(Project)
  const awardRepository = dataSource.getRepository(Award)
  const volunteeringRepository = dataSource.getRepository(Volunteering)
  const languageRepository = dataSource.getRepository(Language)
  const userRepository = dataSource.getRepository(User)

  if (await educationRepository.findOne({ where: { user: { id: user.id }, institution: profile.education.institution } }) == null) {
    await educationRepository.save(educationRepository.create({ ...profile.education, user }))
  }
  if (await workRepository.findOne({ where: { user: { id: user.id }, company: profile.work.company, title: profile.work.title } }) == null) {
    await workRepository.save(workRepository.create({ ...profile.work, user }))
  }
  if (await courseRepository.findOne({ where: { user: { id: user.id }, courseNumber: profile.course.courseNumber } }) == null) {
    await courseRepository.save(courseRepository.create({ ...profile.course, user }))
  }
  if (await projectRepository.findOne({ where: { user: { id: user.id }, name: profile.project.name } }) == null) {
    await projectRepository.save(projectRepository.create({ ...profile.project, user }))
  }
  if (await awardRepository.findOne({ where: { user: { id: user.id }, title: profile.award.title } }) == null) {
    await awardRepository.save(awardRepository.create({ ...profile.award, user }))
  }
  if (await volunteeringRepository.findOne({ where: { user: { id: user.id }, company: profile.volunteering.company, title: profile.volunteering.title } }) == null) {
    await volunteeringRepository.save(volunteeringRepository.create({ ...profile.volunteering, user }))
  }

  const userWithLanguages = await userRepository.findOneOrFail({ where: { id: user.id }, relations: ['languages'] })
  const languageExists = userWithLanguages.languages.some((language) =>
    language.languageName === profile.language.languageName && language.proficiency === profile.language.proficiency
  )
  if (!languageExists) {
    const language = await languageRepository.save(languageRepository.create(profile.language))
    await userRepository.createQueryBuilder().relation(User, 'languages').of(user.id).add(language.id)
  }

  const userWithSkills = await userRepository.findOneOrFail({ where: { id: user.id }, relations: ['skills'] })
  for (const title of profile.skills) {
    const skill = await getOrCreateSkill(title)
    if (!userWithSkills.skills.some((existing) => existing.id === skill.id)) {
      await userRepository.createQueryBuilder().relation(User, 'skills').of(user.id).add(skill.id)
      userWithSkills.skills.push(skill)
    }
  }
}

async function seedDemo (): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo data seeding is disabled when NODE_ENV=production.')
  }

  await dataSource.initialize()
  try {
    const userRepository = dataSource.getRepository(User)
    const users = new Map<string, User>()

    for (const sample of demoUsers) {
      let user = await userRepository.findOne({ where: { email: sample.email }, withDeleted: true })
      if (user?.deleted_at != null) {
        await userRepository.restore(user.id)
        user = await userRepository.findOneByOrFail({ email: sample.email })
      }

      if (user == null) {
        user = userRepository.create({
          email: sample.email,
          firstName: sample.firstName,
          lastName: sample.lastName,
          mobileNo: sample.mobileNo,
          gender: sample.gender,
          type: sample.type ?? 'user',
          biography: sample.biography,
          password: await argon2.hash(DEMO_PASSWORD),
          userStatus: 'offline'
        })
      }
      if (user.mobileNo == null || user.mobileNo.trim() === '') {
        user.mobileNo = sample.mobileNo
      }

      const savedUser = await userRepository.save(user)
      users.set(sample.email, savedUser)
      await ensureProfile(savedUser, sample)
    }

    const jobRepository = dataSource.getRepository(Job)
    const jobs = new Map<string, Job>()
    for (const [index, sample] of jobSamples.entries()) {
      const recruiter = users.get(sample.email)
      if (recruiter == null) throw new Error(`Missing demo recruiter account: ${sample.email}`)

      let job = await jobRepository.findOne({
        where: { user: { id: recruiter.id }, jobTitle: sample.jobTitle, companyName: sample.companyName },
        relations: ['skills']
      })
      if (job == null) {
        job = jobRepository.create({
          jobTitle: sample.jobTitle,
          companyName: sample.companyName,
          location: sample.location,
          jobDescription: sample.jobDescription,
          salary: sample.salary,
          jobType: sample.jobType,
          startDate: new Date(Date.now() + (index + 7) * 24 * 60 * 60 * 1000),
          coverLetter: sample.coverLetter,
          transcript: sample.transcript,
          user: recruiter,
          skills: []
        })
        job = await jobRepository.save(job)
      }

      for (const title of sample.skills) {
        const skill = await getOrCreateSkill(title)
        if (!job.skills.some((existing) => existing.id === skill.id)) {
          await jobRepository.createQueryBuilder().relation(Job, 'skills').of(job.id).add(skill.id)
          job.skills.push(skill)
        }
      }
      jobs.set(sample.jobTitle, job)
    }

    const applicationRepository = dataSource.getRepository(Application)
    const candidate = users.get('demo.candidate@beeconnect.local')
    if (candidate == null) throw new Error('Missing demo candidate account.')
    for (const jobTitle of ['Product Designer', 'Frontend Developer']) {
      const job = jobs.get(jobTitle)
      if (job == null) throw new Error(`Missing demo job: ${jobTitle}`)
      const existing = await applicationRepository.findOne({
        where: { user: { id: candidate.id }, job: { id: job.id } }
      })
      if (existing == null) {
        await applicationRepository.save(applicationRepository.create({
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          phone: '+1 514 555 0100',
          user: candidate,
          job
        }))
      }
    }

    const postSamples = [
      { user: candidate, content: 'I just wrapped up an accessibility-focused design project. Looking forward to sharing what our team learned about making everyday experiences more inclusive.' },
      { user: users.get('demo.recruiter@beeconnect.local'), content: 'We are growing the Brightside Labs team and have new design and frontend opportunities open. Happy to answer questions from the community!' },
      { user: users.get('demo.colleague@beeconnect.local'), content: 'A small reminder that keyboard navigation and clear focus states make a real difference. What accessibility detail do you always check in a new project?' }
    ]
    const postRepository = dataSource.getRepository(Post)
    for (const sample of postSamples) {
      if (sample.user == null) throw new Error('A demo post is missing its author.')
      const existing = await postRepository.findOne({ where: { user: { id: sample.user.id }, content: sample.content } })
      if (existing == null) {
        await postRepository.save(postRepository.create({ user: sample.user, content: sample.content }))
      }
    }

    const connectionRepository = dataSource.getRepository(Connection)
    const connectionPairs = [
      { first: candidate, second: users.get('demo.recruiter@beeconnect.local'), accepted: true },
      { first: candidate, second: users.get('demo.colleague@beeconnect.local'), accepted: true },
      { first: users.get('demo.pending@beeconnect.local'), second: candidate, accepted: false }
    ]
    for (const pair of connectionPairs) {
      if (pair.first == null || pair.second == null) throw new Error('A demo connection is missing a user.')
      const existing = await connectionRepository.findOne({
        where: [
          { user_1: { id: pair.first.id }, user_2: { id: pair.second.id } },
          { user_1: { id: pair.second.id }, user_2: { id: pair.first.id } }
        ]
      })
      if (existing == null) {
        await connectionRepository.save(connectionRepository.create({
          user_1: pair.first,
          user_2: pair.second,
          isAccepted: pair.accepted
        }))
      }
    }

    const recruiter = users.get('demo.recruiter@beeconnect.local')
    if (recruiter == null) throw new Error('Missing demo recruiter account.')
    const messageRepository = dataSource.getRepository(Message)
    const messages = [
      { senderId: recruiter.id, receiverId: candidate.id, message: 'Hi Alex! Your portfolio stood out. Would you be available to chat about the Product Designer role?' },
      { senderId: candidate.id, receiverId: recruiter.id, message: 'Thanks, Jordan! I would be happy to chat. I am available this week.' }
    ]
    for (const [index, sample] of messages.entries()) {
      const existing = await messageRepository.findOne({ where: sample })
      if (existing == null) {
        const createdAt = new Date(Date.now() - (messages.length - index) * 60 * 60 * 1000)
        await messageRepository.save(messageRepository.create({ ...sample, created_at: createdAt }))
      }
    }

    const notificationsRepository = dataSource.getRepository(Notifications)
    for (const [index, jobTitle] of ['Product Designer', 'Frontend Developer'].entries()) {
      const job = jobs.get(jobTitle)
      if (job == null) throw new Error(`Missing demo job: ${jobTitle}`)
      const title = 'A role picked for you'
      const existing = await notificationsRepository.findOne({
        where: { user: { id: candidate.id }, type: 'Job Alert', title, link: `/jobId/${job.id}` }
      })
      if (existing == null) {
        await notificationsRepository.save(notificationsRepository.create({
          type: 'Job Alert',
          title,
          text: `The ${job.jobTitle} opportunity at ${job.companyName} may match your skills.`,
          link: `/jobId/${job.id}`,
          photo: null,
          read: index > 0,
          user: candidate
        }))
      }
    }

    console.log(`Demo data is ready. ${demoUsers.length} accounts and ${jobSamples.length} jobs are available.`)
    console.log(`Demo password for all accounts: ${DEMO_PASSWORD}`)
  } finally {
    await dataSource.destroy()
  }
}

void seedDemo().catch((error: unknown) => {
  console.error('Demo data seeding failed:', error)
  process.exitCode = 1
})
