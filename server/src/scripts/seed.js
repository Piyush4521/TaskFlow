import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';

// Resolve directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Safety checks
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Refusing to run seed script in production environment (NODE_ENV=production).');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not configured in environment variables.');
  process.exit(1);
}

// Development team-member fixtures based on reference
const TEAM_MEMBER_FIXTURES = [
  {
    name: 'Ravi Mishra',
    role: 'Founder',
    email: 'ravi.mishra@example.com',
    department: 'Executive',
    isFixture: true,
    source: 'development_seed',
  },
  {
    name: 'Minati Tigga',
    role: 'Human Resources Professional',
    email: 'minati.tigga@example.com',
    department: 'Human Resources',
    isFixture: true,
    source: 'development_seed',
  },
  {
    name: 'M Chinmay',
    role: 'Cybersecurity Analyst',
    email: 'm.chinmay@example.com',
    department: 'Security',
    isFixture: true,
    source: 'development_seed',
  },
  {
    name: 'Yash Kumar',
    role: 'IT Support Intern',
    email: 'yash.kumar@example.com',
    department: 'IT Support',
    isFixture: true,
    source: 'development_seed',
  },
  {
    name: 'Deepika P',
    role: 'Human Resources / Talent Acquisition',
    email: 'deepika.p@example.com',
    department: 'Human Resources',
    isFixture: true,
    source: 'development_seed',
  },
  {
    name: 'Sahil Chauhan',
    role: 'Team Lead / Full Stack Developer',
    email: 'sahil.chauhan@example.com',
    department: 'Engineering',
    isFixture: true,
    source: 'development_seed',
  },
];

// Helper to compute date relative to now
function getRelativeDate(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(17, 0, 0, 0); // 5:00 PM standard
  return date;
}

// Realistic sample tasks across Kanban stages
function getSampleTasks() {
  return [
    // --- To-Do (5 tasks) ---
    {
      title: 'Review project requirements',
      description: 'Audit core MERN assessment deliverables against Aarvion Services specifications.',
      status: 'To-Do',
      priority: 'High',
      dueDate: getRelativeDate(3),
    },
    {
      title: 'Prepare API documentation',
      description: 'Document authentication, task CRUD, and team endpoints with request/response schemas.',
      status: 'To-Do',
      priority: 'Medium',
      dueDate: getRelativeDate(5),
    },
    {
      title: 'Improve form validation',
      description: 'Add client-side input hints and ensure server field error messages are mapped to inputs.',
      status: 'To-Do',
      priority: 'Medium',
      dueDate: getRelativeDate(7),
    },
    {
      title: 'Review responsive layouts',
      description: 'Verify tablet and mobile viewport behavior across Kanban, Calendar, and Reports pages.',
      status: 'To-Do',
      priority: 'Low',
      dueDate: getRelativeDate(10),
    },
    {
      title: 'Update README',
      description: 'Document setup commands, environment variables, test procedures, and deployment steps.',
      status: 'To-Do',
      priority: 'High',
      dueDate: getRelativeDate(4),
    },

    // --- In-Progress (5 tasks) ---
    {
      title: 'Implement task filtering',
      description: 'Enable status, priority, and date range filters with immediate UI state updates.',
      status: 'In-Progress',
      priority: 'Urgent',
      dueDate: getRelativeDate(1),
    },
    {
      title: 'Test authentication flows',
      description: 'Verify JWT expiration handling, invalid credential rejection, and secure token storage.',
      status: 'In-Progress',
      priority: 'High',
      dueDate: getRelativeDate(2),
    },
    {
      title: 'Refine dashboard layout',
      description: 'Enhance summary KPI cards and progress calculation to handle empty task sets gracefully.',
      status: 'In-Progress',
      priority: 'Medium',
      dueDate: getRelativeDate(3),
    },
    {
      title: 'Verify MongoDB connectivity',
      description: 'Test Mongoose connection resilience, Atlas SRV lookup fallback, and graceful shutdown.',
      status: 'In-Progress',
      priority: 'High',
      dueDate: getRelativeDate(0),
    },
    {
      title: 'Conduct dependency security audit',
      description: 'Run npm audit checks across server and client dependencies to ensure zero high vulnerabilities.',
      status: 'In-Progress',
      priority: 'Medium',
      dueDate: getRelativeDate(6),
    },

    // --- Done (4 tasks) ---
    {
      title: 'Configure protected routes',
      description: 'Redirect unauthenticated users to /login and clear stale task data on logout.',
      status: 'Done',
      priority: 'Urgent',
      dueDate: getRelativeDate(-3),
    },
    {
      title: 'Implement task CRUD',
      description: 'Create, Read, Update, and Delete endpoints with Mongoose and schema validations.',
      status: 'Done',
      priority: 'High',
      dueDate: getRelativeDate(-5),
    },
    {
      title: 'Add centralized error handling',
      description: 'Intercept unhandled exceptions with Express middleware and conceal internal error traces.',
      status: 'Done',
      priority: 'High',
      dueDate: getRelativeDate(-4),
    },
    {
      title: 'Verify task ownership',
      description: 'Enforce strict per-user task query filtering so users cannot view or modify others tasks.',
      status: 'Done',
      priority: 'Urgent',
      dueDate: getRelativeDate(-2),
    },
  ];
}

async function runSeed() {
  console.log('--- TaskFlow Development Seed Script ---');
  console.log('Connecting to development MongoDB...');
  await connectDB();

  try {
    // 1. Seed Team Members (idempotent upsert by email)
    console.log('\n[1/2] Seeding Development Team Members...');
    let membersCreated = 0;
    let membersExisting = 0;

    for (const fixture of TEAM_MEMBER_FIXTURES) {
      const existing = await TeamMember.findOne({ email: fixture.email });
      if (!existing) {
        await TeamMember.create(fixture);
        membersCreated++;
        console.log(`  + Created team member: ${fixture.name} (${fixture.role})`);
      } else {
        // Keep updated with latest role/department without duplicating
        existing.name = fixture.name;
        existing.role = fixture.role;
        existing.department = fixture.department;
        existing.isFixture = true;
        await existing.save();
        membersExisting++;
        console.log(`  = Verified team member: ${fixture.name} (${fixture.role})`);
      }
    }
    console.log(`Team members processed: ${membersCreated} created, ${membersExisting} verified (total: ${TEAM_MEMBER_FIXTURES.length}).`);

    // 2. Identify or create development user for task assignment
    console.log('\n[2/2] Resolving Task Owner Account...');
    const targetEmail = (process.env.SEED_USER_EMAIL || 'test@example.com').toLowerCase();
    let targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) {
      targetUser = await User.findOne();
    }

    if (!targetUser) {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      targetUser = await User.create({
        name: 'Development User',
        email: targetEmail,
        password: hashedPassword,
      });
      console.log(`  + Created development user: ${targetEmail} (Password: Password123!)`);
    } else {
      console.log(`  = Using authorized user account: ${targetUser.email} (ID: ${targetUser._id})`);
    }

    // 3. Seed Sample Tasks (idempotent by userId + title)
    const sampleTasks = getSampleTasks();
    let tasksCreated = 0;
    let tasksExisting = 0;

    console.log(`Seeding ${sampleTasks.length} sample tasks for user ${targetUser.email}...`);
    for (const taskData of sampleTasks) {
      const existingTask = await Task.findOne({
        userId: targetUser._id,
        title: taskData.title,
      });

      if (!existingTask) {
        await Task.create({
          ...taskData,
          userId: targetUser._id,
        });
        tasksCreated++;
        console.log(`  + Created task: [${taskData.status}] "${taskData.title}" (${taskData.priority})`);
      } else {
        // Update task fields to match sample if needed, without duplicating
        existingTask.description = taskData.description;
        existingTask.status = taskData.status;
        existingTask.priority = taskData.priority;
        existingTask.dueDate = taskData.dueDate;
        await existingTask.save();
        tasksExisting++;
        console.log(`  = Verified task: [${taskData.status}] "${taskData.title}"`);
      }
    }

    console.log(`Tasks processed: ${tasksCreated} created, ${tasksExisting} verified (total: ${sampleTasks.length}).`);
    console.log('\n Seed completed successfully without altering existing unrelated records.');
  } catch (err) {
    console.error('ERROR during seed execution:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runSeed();
