---
trigger: always_on
---

# TaskFlow — Engineering Standards

## Project objective
Build TaskFlow, a production-quality mini Kanban task management application for the Aarvion Services India Pvt. Ltd. MERN Stack Developer Assessment. Treat the assignment PDF as the source of truth.

## Required stack
- MongoDB and Mongoose
- Node.js and Express.js
- React with Vite
- JavaScript by default
- React Router
- JWT authentication and bcrypt password hashing
- Git and a single public GitHub monorepo

## Mandatory requirements
- User registration and login
- User and Task Mongoose models
- Modular REST APIs, controllers, routes, and middleware
- Request payload validation
- JWT verification on protected routes
- Strict per-user task authorization
- Global error-handling middleware
- Protected React dashboard
- To-Do, In-Progress, and Done columns
- Task creation, reading, editing, deletion, and status updates
- Responsive interface with loading, empty, and error states
- README.md, .env.example files, and setup instructions

## Engineering rules
1. Inspect existing files and terminal output before making changes.
2. Do not overwrite working code or assume a command succeeded.
3. Explain the purpose of important changes in beginner-friendly technical language.
4. Use environment variables for secrets and never commit .env files.
5. Validate inputs on the server and enforce authorization on every task operation.
6. Use consistent HTTP status codes and structured API errors.
7. Keep frontend components reusable and state management understandable.
8. Handle invalid IDs, missing resources, invalid credentials, expired tokens, and network failures.
9. Avoid unnecessary dependencies, speculative features, and large unverified rewrites.
10. After each meaningful stage, provide exact verification commands and report what passed or failed.
11. Never claim tests, builds, deployments, or Git operations succeeded without evidence.
12. Prioritize mandatory assessment requirements before optional bonuses.

## Working method
Work incrementally: inspect, implement one stage, verify, explain results, and then proceed. Preserve existing functionality. Ask one focused question only when a necessary detail is missing.

## Submission requirements
Maintain a clean /client and /server monorepo. Include correct Git ignore rules, environment examples, complete local setup documentation, tested API workflows, a production build, and a final submission checklist.