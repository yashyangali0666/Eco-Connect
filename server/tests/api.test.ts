import request from 'supertest';
import app from '../src/server';
import prisma from '../src/prisma';

describe('🌿 EcoCollect API Integration Test Suite', () => {
  let adminToken: string;
  let staffToken: string;
  let userToken: string;
  let user2Token: string;
  let testCategoryId: string;
  let createdRequestId: string;
  let staffId: string;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@ecocollect.demo',
      password: 'Admin@123',
    });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // 2. Authenticate Staff
    const staffRes = await request(app).post('/api/auth/login').send({
      email: 'staff@ecocollect.demo',
      password: 'Staff@123',
    });
    expect(staffRes.status).toBe(200);
    staffToken = staffRes.body.data.token;
    staffId = staffRes.body.data.user.id;

    // 3. Authenticate User 1
    const userRes = await request(app).post('/api/auth/login').send({
      email: 'user@ecocollect.demo',
      password: 'User@123',
    });
    expect(userRes.status).toBe(200);
    userToken = userRes.body.data.token;

    // 4. Authenticate User 2
    const user2Res = await request(app).post('/api/auth/login').send({
      email: 'user2@ecocollect.demo',
      password: 'User@123',
    });
    expect(user2Res.status).toBe(200);
    user2Token = user2Res.body.data.token;

    // Get a category ID
    const catRes = await request(app).get('/api/waste-categories');
    expect(catRes.status).toBe(200);
    testCategoryId = catRes.body.data[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('🔐 1. Authentication & Security', () => {
    test('POST /api/auth/register - Successfully registers a new citizen', async () => {
      const email = `citizen_${Date.now()}@test.demo`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Citizen',
        email,
        phone: '+1 555-999-0000',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never return password hash!
    });

    test('POST /api/auth/login - Rejects invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'user@ecocollect.demo',
        password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('RBAC - Citizens cannot access admin routes (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('RBAC - Admin CAN access admin staff route', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('♻️ 2. Waste Categories', () => {
    test('GET /api/waste-categories - Returns waste categories list', async () => {
      const res = await request(app).get('/api/waste-categories');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    });

    test('GET /api/waste-categories/:slug - Returns specific category with accepted/rejected items', async () => {
      const res = await request(app).get('/api/waste-categories/e-waste');
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('e-waste');
      expect(Array.isArray(res.body.data.acceptedItems)).toBe(true);
      expect(Array.isArray(res.body.data.rejectedItems)).toBe(true);
      expect(res.body.data.disposalInstructions).toBeDefined();
    });
  });

  describe('📦 3. Pickup Request Workflow & IDOR Protection', () => {
    test('POST /api/requests - Citizen creates a new pickup request', async () => {
      const pickupDate = new Date(Date.now() + 86400000 * 3).toISOString();

      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          wasteCategoryId: testCategoryId,
          quantity: 5,
          unit: 'kg',
          description: 'Automated test pickup request',
          pickupAddress: '100 Green Planet Way',
          city: 'Eco City',
          state: 'CA',
          postalCode: '90210',
          landmark: 'Next to solar charging point',
          latitude: 37.7749,
          longitude: -122.4194,
          pickupDate,
          timeSlot: '10:00 AM – 12:00 PM',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.requestNumber).toMatch(/^EC-\d{4}-\d{6}$/);
      expect(res.body.data.status).toBe('PENDING');
      createdRequestId = res.body.data.id;
    });

    test('IDOR Protection - User 2 cannot access User 1 request directly (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    test('User 1 CAN access their own request', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdRequestId);
    });

    test('PATCH /api/requests/:id/assign - Admin assigns staff member to request', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          staffId,
          note: 'Assigned for morning collection route',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedStaffId).toBe(staffId);
      expect(res.body.data.status).toBe('ASSIGNED');
    });

    test('PATCH /api/requests/:id/status - Staff transitions status to OUT_FOR_PICKUP', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'OUT_FOR_PICKUP',
          note: 'En route to citizen address',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('OUT_FOR_PICKUP');
    });

    test('PATCH /api/requests/:id/status - Staff transitions status to COLLECTED', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'COLLECTED',
          note: 'Materials safely loaded and verified',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COLLECTED');
    });

    test('PATCH /api/requests/:id/status - Staff transitions status to COMPLETED', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'COMPLETED',
          note: 'Materials unloaded at recycling plant',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.completedAt).toBeDefined();
    });

    test('State Machine - Cannot transition back from COMPLETED to PENDING', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'PENDING',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('📊 4. Dashboards & Analytics', () => {
    test('GET /api/dashboard/user - Returns user statistics and active counts', async () => {
      const res = await request(app)
        .get('/api/dashboard/user')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
      expect(typeof res.body.data.metrics.completedPickups).toBe('number');
    });

    test('GET /api/admin/dashboard - Returns platform overview statistics', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalRequests).toBeGreaterThan(0);
      expect(res.body.data.metrics.completedRequests).toBeGreaterThan(0);
    });

    test('GET /api/admin/analytics - Returns aggregated chart data for Recharts', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.requestsByStatus)).toBe(true);
      expect(Array.isArray(res.body.data.requestsByCategory)).toBe(true);
      expect(Array.isArray(res.body.data.dailyVolume)).toBe(true);
      expect(res.body.data.summary.completionRate).toBeDefined();
    });
  });
});
