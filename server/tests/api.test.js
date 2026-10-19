import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { notFoundHandler, errorHandler } from '../src/middleware/errorHandler.js';
import { authenticate } from '../src/middleware/authMiddleware.js';
import { createAuthLimiter, authLimiter } from '../src/middleware/rateLimiter.js';
import { registerValidator, loginValidator } from '../src/validators/authValidators.js';
import { createTaskValidator, updateTaskValidator, taskIdValidator } from '../src/validators/taskValidators.js';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../src/controllers/taskController.js';
import Task from '../src/models/Task.js';

function mockRes() {
  return {
    statusCode: null,
    data: null,
    headersSent: false,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.data = d; return this; }
  };
}

test('errorHandler: handles malformed JSON with 400', () => {
  const err = new SyntaxError('Unexpected token');
  err.status = 400;
  err.body = '{bad json';
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.success, false);
  assert.equal(res.data.message, 'Invalid JSON payload');
});

test('errorHandler: handles payload too large with 413', () => {
  const err = new Error('Too large');
  err.type = 'entity.too.large';
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 413);
  assert.equal(res.data.success, false);
  assert.equal(res.data.message, 'Request payload too large');
});

test('errorHandler: sanitizes 500 errors and conceals secrets', () => {
  const err = new Error('Database password is SECRET_KEY_123');
  err.stack = 'Sensitive trace with SECRET_KEY_123';
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.equal(res.data.success, false);
  assert.equal(res.data.message, 'Internal server error');
  assert.equal(JSON.stringify(res.data).includes('SECRET_KEY_123'), false);
});

test('notFoundHandler: returns 404 Route not found', () => {
  const res = mockRes();
  notFoundHandler({}, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.data.success, false);
  assert.equal(res.data.message, 'Route not found');
});

test('authValidators: rejects invalid registration fields', async () => {
  const req = { body: { name: 'A', email: 'not-an-email', password: '123' } };
  const res = mockRes();
  for (const mw of registerValidator) {
    if (res.statusCode) break;
    await mw(req, res, () => {});
  }
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.success, false);
  const fields = res.data.errors.map(e => e.field);
  assert.ok(fields.includes('name'));
  assert.ok(fields.includes('email'));
  assert.ok(fields.includes('password'));
});

test('authValidators: rejects invalid login fields', async () => {
  const req = { body: { email: 'bad-email', password: '' } };
  const res = mockRes();
  for (const mw of loginValidator) {
    if (res.statusCode) break;
    await mw(req, res, () => {});
  }
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.success, false);
  const fields = res.data.errors.map(e => e.field);
  assert.ok(fields.includes('email'));
  assert.ok(fields.includes('password'));
});

test('authMiddleware: accepts valid token and populates req.userId', () => {
  const secret = 'test_jwt_secret';
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;

  const token = jwt.sign({}, secret, { subject: 'user_12345', expiresIn: '1h' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;

  authenticate(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.userId, 'user_12345');
  assert.equal(res.statusCode, null);

  process.env.JWT_SECRET = originalSecret;
});

test('authMiddleware: rejects missing, malformed, or invalid tokens with 401', () => {
  const secret = 'test_jwt_secret';
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;

  // Missing header
  const res1 = mockRes();
  authenticate({ headers: {} }, res1, () => {});
  assert.equal(res1.statusCode, 401);

  // Malformed header
  const res2 = mockRes();
  authenticate({ headers: { authorization: 'Basic abc' } }, res2, () => {});
  assert.equal(res2.statusCode, 401);

  // Invalid token
  const res3 = mockRes();
  authenticate({ headers: { authorization: 'Bearer invalid.token.value' } }, res3, () => {});
  assert.equal(res3.statusCode, 401);

  // Expired token
  const expiredToken = jwt.sign({}, secret, { subject: 'user_123', expiresIn: '-1s' });
  const res4 = mockRes();
  authenticate({ headers: { authorization: `Bearer ${expiredToken}` } }, res4, () => {});
  assert.equal(res4.statusCode, 401);

  process.env.JWT_SECRET = originalSecret;
});

test('authMiddleware: forwards missing JWT_SECRET to error handler', () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  const req = { headers: { authorization: 'Bearer some-token' } };
  const res = mockRes();
  let passedError = null;

  authenticate(req, res, (err) => { passedError = err; });

  assert.ok(passedError instanceof Error);
  assert.equal(passedError.message, 'JWT_SECRET is not configured');
  assert.equal(res.statusCode, null);

  process.env.JWT_SECRET = originalSecret;
});

test('taskValidators: validates task create, update, and ID params', async () => {
  // Missing title on create
  const req1 = { body: { title: '   ' } };
  const res1 = mockRes();
  for (const mw of createTaskValidator) {
    if (res1.statusCode) break;
    await mw(req1, res1, () => {});
  }
  assert.equal(res1.statusCode, 400);
  assert.equal(res1.data.errors[0].field, 'title');

  // Invalid status on create
  const req2 = { body: { title: 'Valid', status: 'InvalidStatus' } };
  const res2 = mockRes();
  for (const mw of createTaskValidator) {
    if (res2.statusCode) break;
    await mw(req2, res2, () => {});
  }
  assert.equal(res2.statusCode, 400);
  assert.equal(res2.data.errors[0].field, 'status');

  // Invalid mongo id on param
  const req3 = { params: { id: 'not-a-mongo-id' } };
  const res3 = mockRes();
  for (const mw of taskIdValidator) {
    if (res3.statusCode) break;
    await mw(req3, res3, () => {});
  }
  assert.equal(res3.statusCode, 400);
  assert.equal(res3.data.errors[0].field, 'id');

  // Empty title on update
  const req4 = { params: { id: '6ad5f6626a6723bf79337bc7' }, body: { title: '' } };
  const res4 = mockRes();
  for (const mw of updateTaskValidator) {
    if (res4.statusCode) break;
    await mw(req4, res4, () => {});
  }
  assert.equal(res4.statusCode, 400);
  assert.equal(res4.data.errors[0].field, 'title');
});

test('taskController: createTask enforces req.userId and ignores client userId', async () => {
  const origCreate = Task.create;
  let passedDoc = null;
  Task.create = (doc) => {
    passedDoc = doc;
    return Promise.resolve({ _id: 'task_1', ...doc });
  };

  const req = {
    userId: 'user_legit',
    body: { title: 'New Task', description: 'Test', status: 'To-Do', userId: 'attacker_id' }
  };
  const res = mockRes();
  await createTask(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.equal(passedDoc.userId, 'user_legit');
  assert.notEqual(passedDoc.userId, 'attacker_id');

  Task.create = origCreate;
});

test('taskController: getTasks sorts newest first and filters by req.userId', async () => {
  const origFind = Task.find;
  let queryFilter = null;
  let sortCriteria = null;
  Task.find = (filter) => {
    queryFilter = filter;
    return {
      sort: (sort) => {
        sortCriteria = sort;
        return Promise.resolve([{ _id: 't2' }, { _id: 't1' }]);
      }
    };
  };

  const req = { userId: 'user_owner' };
  const res = mockRes();
  await getTasks(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(queryFilter.userId, 'user_owner');
  assert.equal(sortCriteria.createdAt, -1);
  assert.equal(res.data.count, 2);

  Task.find = origFind;
});

test('taskController: enforces cross-user isolation on get, update, and delete', async () => {
  const origFindOne = Task.findOne;
  const origFindOneAndUpdate = Task.findOneAndUpdate;
  const origFindOneAndDelete = Task.findOneAndDelete;

  // Return null if userId doesn't match
  Task.findOne = (q) => Promise.resolve(q.userId === 'user_owner' ? { _id: q._id, userId: q.userId } : null);
  Task.findOneAndUpdate = (q) => Promise.resolve(q.userId === 'user_owner' ? { _id: q._id, userId: q.userId } : null);
  Task.findOneAndDelete = (q) => Promise.resolve(q.userId === 'user_owner' ? { _id: q._id } : null);

  // User B tries GET User A's task
  const resGet = mockRes();
  await getTaskById({ params: { id: 'task_1' }, userId: 'user_other' }, resGet, () => {});
  assert.equal(resGet.statusCode, 404);

  // User B tries PATCH User A's task
  const resPatch = mockRes();
  await updateTask({ params: { id: 'task_1' }, userId: 'user_other', body: { title: 'Hijacked' } }, resPatch, () => {});
  assert.equal(resPatch.statusCode, 404);

  // User B tries DELETE User A's task
  const resDel = mockRes();
  await deleteTask({ params: { id: 'task_1' }, userId: 'user_other' }, resDel, () => {});
  assert.equal(resDel.statusCode, 404);

  Task.findOne = origFindOne;
  Task.findOneAndUpdate = origFindOneAndUpdate;
  Task.findOneAndDelete = origFindOneAndDelete;
});

test('rateLimiter: returns HTTP 429 when auth request limit is exceeded', async () => {
  const app = express();
  const testLimiter = createAuthLimiter({ windowMs: 60 * 1000, limit: 2 });
  app.use(testLimiter);
  app.post('/api/auth/login', (_req, res) => res.json({ success: true }));

  const server = app.listen(0);
  try {
    const port = server.address().port;
    const url = `http://127.0.0.1:${port}/api/auth/login`;
    const r1 = await fetch(url, { method: 'POST' });
    assert.equal(r1.status, 200);
    const r2 = await fetch(url, { method: 'POST' });
    assert.equal(r2.status, 200);
    const r3 = await fetch(url, { method: 'POST' });
    assert.equal(r3.status, 429);
    const b3 = await r3.json();
    assert.equal(b3.success, false);
    assert.equal(b3.message, 'Too many requests, please try again later');
  } finally {
    server.close();
  }
});

test('rateLimiter: authLimiter permits normal requests under the threshold', async () => {
  const app = express();
  app.use(authLimiter);
  app.post('/api/auth/login', (_req, res) => res.json({ success: true }));

  const server = app.listen(0);
  try {
    const port = server.address().port;
    const url = `http://127.0.0.1:${port}/api/auth/login`;
    const res = await fetch(url, { method: 'POST' });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).success, true);
  } finally {
    server.close();
  }
});
