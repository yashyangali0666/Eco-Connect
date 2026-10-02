import bcrypt from 'bcryptjs';

export interface FallbackUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

// Pre-hashed passwords for demo accounts
// User@123, Staff@123, Admin@123
const DEMO_USER_HASH = bcrypt.hashSync('User@123', 10);
const DEMO_STAFF_HASH = bcrypt.hashSync('Staff@123', 10);
const DEMO_ADMIN_HASH = bcrypt.hashSync('Admin@123', 10);

class FallbackStore {
  private users: Map<string, FallbackUser> = new Map();
  private categories: any[] = [];
  private requests: any[] = [];
  private notifications: any[] = [];

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    // 1. Seed Demo Users
    const demoUsers: FallbackUser[] = [
      {
        id: 'usr-demo-001',
        name: 'Aarav Sharma (Citizen)',
        email: 'user@ecocollect.demo',
        phone: '+91 98765 43210',
        passwordHash: DEMO_USER_HASH,
        role: 'USER',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'stf-demo-001',
        name: 'Vikram Singh (Driver)',
        email: 'staff@ecocollect.demo',
        phone: '+91 98765 12345',
        passwordHash: DEMO_STAFF_HASH,
        role: 'STAFF',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'adm-demo-001',
        name: 'Priya Patel (Operations)',
        email: 'admin@ecocollect.demo',
        phone: '+91 98111 22334',
        passwordHash: DEMO_ADMIN_HASH,
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const u of demoUsers) {
      this.users.set(u.email.toLowerCase(), u);
    }

    // 2. Seed Standard 8 Categories
    this.categories = [
      {
        id: 'cat-01',
        name: 'Plastic Waste',
        slug: 'plastic-waste',
        description: 'Rigid plastics, clean bottles, containers, and packaging wrappers.',
        disposalGuide: 'Rinse thoroughly, flatten bottles, and replace the caps.',
        acceptedItems: ['Water bottles', 'Milk jugs', 'Food containers', 'Plastic wraps'],
        rejectedItems: ['Medical syringes', 'Oil soaked containers', 'Thermocol packaging'],
        badgeColor: 'blue',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-02',
        name: 'Organic / Wet Waste',
        slug: 'organic-waste',
        description: 'Kitchen scraps, food remains, vegetable peels, and garden cuttings.',
        disposalGuide: 'Drain any excess liquids and place in breathable compost bin.',
        acceptedItems: ['Fruit & veg peels', 'Coffee grounds', 'Tea leaves', 'Fallen leaves'],
        rejectedItems: ['Plastic bags', 'Packaging', 'Hazardous chemicals'],
        badgeColor: 'green',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-03',
        name: 'Recyclable Waste',
        slug: 'recyclable-waste',
        description: 'Dry corrugated cardboard, paperboards, cartons, and packaging boxes.',
        disposalGuide: 'Flatten boxes completely and protect strictly from rain and oil stains.',
        acceptedItems: ['Cardboard boxes', 'Pulp cartons', 'Paper bags'],
        rejectedItems: ['Waxed cartons', 'Greasy pizza box bases'],
        badgeColor: 'teal',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-04',
        name: 'Paper Waste',
        slug: 'paper-waste',
        description: 'Newspapers, office paper, notebooks, envelopes, and magazines.',
        disposalGuide: 'Stack flat and tie with string. Do not crumple excessively.',
        acceptedItems: ['Office documents', 'Envelopes', 'Magazines', 'Newspapers'],
        rejectedItems: ['Carbon paper', 'Laminated sheets', 'Sanitary tissues'],
        badgeColor: 'amber',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-05',
        name: 'E-Waste',
        slug: 'e-waste',
        description: 'Dead electronics, smartphones, chargers, laptops, and circuit boards.',
        disposalGuide: 'Keep dry and handle carefully. Remove memory cards and wipe private data.',
        acceptedItems: ['Smartphones', 'Keyboards', 'Power banks', 'Laptops', 'Chargers'],
        rejectedItems: ['Exploded batteries', 'Industrial capacitors'],
        badgeColor: 'purple',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-06',
        name: 'Hazardous Waste',
        slug: 'hazardous-waste',
        description: 'Household batteries, paints, solvents, thinners, and chemical cleansers.',
        disposalGuide: 'Keep in original containers with warning labels. Tape battery terminals.',
        acceptedItems: ['AA/AAA batteries', 'Aerosol spray cans', 'Household paint leftovers'],
        rejectedItems: ['Commercial industrial effluent', 'Explosives'],
        badgeColor: 'red',
        isRecyclable: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-07',
        name: 'Bulk Waste',
        slug: 'bulk-waste',
        description: 'Oversized household furniture, mattresses, wooden crates, and fixtures.',
        disposalGuide: 'Disassemble parts and place on ground-level accessible loading point.',
        acceptedItems: ['Chairs', 'Tables', 'Wooden pallets', 'Cabinet frames'],
        rejectedItems: ['Construction bricks', 'Demolition concrete rubble'],
        badgeColor: 'indigo',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-08',
        name: 'Textile Waste',
        slug: 'textile-waste',
        description: 'Used clothing, bedsheets, curtains, discarded fabric, and cloth bags.',
        disposalGuide: 'Launder cleanly and seal in moisture-proof plastic bags.',
        acceptedItems: ['Shirts', 'Jeans', 'Cotton bedsheets', 'Curtains'],
        rejectedItems: ['Oil soaked rags', 'Contaminated biomedical fabric'],
        badgeColor: 'emerald',
        isRecyclable: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // 3. Seed Sample Requests
    this.requests = [
      {
        id: 'req-001',
        requestNumber: 'EC-2026-000001',
        userId: 'usr-demo-001',
        categoryId: 'cat-01',
        status: 'OUT_FOR_PICKUP',
        address: '42 Green Valley Apartments, MG Road, Sector 4',
        latitude: 12.9716,
        longitude: 77.5946,
        scheduledDate: new Date().toISOString(),
        timeSlot: 'MORNING',
        estimatedWeight: 5.5,
        actualWeight: null,
        description: 'Sorted PET bottles and clean milk jugs.',
        notes: 'Gate access code: 4201. Leave on porch.',
        staffId: 'stf-demo-001',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        user: { name: 'Aarav Sharma (Citizen)', email: 'user@ecocollect.demo', phone: '+91 98765 43210' },
        category: this.categories[0],
        staff: {
          user: { name: 'Vikram Singh (Driver)', email: 'staff@ecocollect.demo', phone: '+91 98765 12345' },
          vehicleType: 'Eco Electric Van',
          vehicleNumber: 'EV-COLLECT-01',
        },
      },
      {
        id: 'req-002',
        requestNumber: 'EC-2026-000002',
        userId: 'usr-demo-001',
        categoryId: 'cat-05',
        status: 'COMPLETED',
        address: '15 Palm Grove Residency, Indiranagar',
        latitude: 12.9784,
        longitude: 77.6408,
        scheduledDate: new Date(Date.now() - 86400000).toISOString(),
        timeSlot: 'AFTERNOON',
        estimatedWeight: 3.2,
        actualWeight: 3.4,
        description: 'Old laptops and charging adapters.',
        notes: 'Recycled at authorized municipal e-hub.',
        staffId: 'stf-demo-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 40000000).toISOString(),
        user: { name: 'Aarav Sharma (Citizen)', email: 'user@ecocollect.demo', phone: '+91 98765 43210' },
        category: this.categories[4],
        staff: {
          user: { name: 'Vikram Singh (Driver)', email: 'staff@ecocollect.demo', phone: '+91 98765 12345' },
          vehicleType: 'Eco Electric Van',
          vehicleNumber: 'EV-COLLECT-01',
        },
      },
    ];

    // 4. Seed Notifications
    this.notifications = [
      {
        id: 'notif-01',
        userId: 'usr-demo-001',
        title: 'Driver is on the way! 🚛',
        message: 'Your request EC-2026-000001 is now OUT FOR PICKUP.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-02',
        userId: 'usr-demo-001',
        title: 'Recycling Completed! ♻️',
        message: 'Request EC-2026-000002 was weighed (3.4 kg) and confirmed recycled.',
        isRead: true,
        createdAt: new Date(Date.now() - 40000000).toISOString(),
      },
    ];
  }

  // --- User Operations ---
  public findUserByEmail(email: string): FallbackUser | undefined {
    return this.users.get(email.toLowerCase());
  }

  public findUserById(id: string): FallbackUser | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public createUser(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    role?: 'USER' | 'STAFF' | 'ADMIN';
  }): FallbackUser {
    const newUser: FallbackUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      passwordHash: data.passwordHash,
      role: data.role || 'USER',
      avatar: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(newUser.email, newUser);

    // Add welcome notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to EcoCollect! 🌱',
      message: 'Your account is ready. Learn waste segregation guidelines and schedule your first pickup.',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newUser;
  }

  // --- Category Operations ---
  public getCategories(): any[] {
    return this.categories;
  }

  public getCategoryBySlug(slug: string): any | undefined {
    return this.categories.find((c) => c.slug === slug || c.id === slug);
  }

  // --- Request Operations ---
  public getRequests(role: string, userId: string): any[] {
    if (role === 'ADMIN') {
      return this.requests;
    }
    if (role === 'STAFF') {
      return this.requests.filter((r) => r.staffId === userId || r.status === 'ASSIGNED' || r.status === 'OUT_FOR_PICKUP');
    }
    return this.requests.filter((r) => r.userId === userId);
  }

  public getRequestById(id: string): any | undefined {
    return this.requests.find((r) => r.id === id || r.requestNumber === id);
  }

  public createRequest(data: any, userId: string, user: FallbackUser): any {
    const category = this.categories.find((c) => c.id === data.categoryId) || this.categories[0];
    const newReq = {
      id: `req-${Date.now()}`,
      requestNumber: `EC-2026-${String(this.requests.length + 1).padStart(6, '0')}`,
      userId,
      categoryId: data.categoryId,
      status: 'PENDING',
      address: data.address,
      latitude: data.latitude || 12.9716,
      longitude: data.longitude || 77.5946,
      scheduledDate: data.scheduledDate,
      timeSlot: data.timeSlot || 'MORNING',
      estimatedWeight: Number(data.estimatedWeight) || 5,
      actualWeight: null,
      description: data.description || '',
      notes: data.notes || '',
      staffId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { name: user.name, email: user.email, phone: user.phone },
      category,
      staff: null,
    };

    this.requests.unshift(newReq);
    return newReq;
  }

  // --- Dashboard Stats Operations ---
  public getDashboardStats(role: string, userId: string): any {
    if (role === 'ADMIN') {
      const totalRequests = this.requests.length;
      const completed = this.requests.filter((r) => r.status === 'COMPLETED').length;
      const inProgress = this.requests.filter((r) => ['ASSIGNED', 'OUT_FOR_PICKUP', 'COLLECTED'].includes(r.status)).length;
      const totalRecycled = this.requests.reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || 0), 0);

      return {
        totalRequests,
        pendingRequests: this.requests.filter((r) => r.status === 'PENDING').length,
        inProgressRequests: inProgress,
        completedRequests: completed,
        totalRecycledKg: Math.round(totalRecycled * 10) / 10,
        registeredUsers: this.users.size,
        activeStaff: 3,
        recentRequests: this.requests.slice(0, 5),
      };
    }

    if (role === 'STAFF') {
      return {
        assignedToday: this.requests.filter((r) => r.staffId === userId).length,
        completedToday: this.requests.filter((r) => r.staffId === userId && r.status === 'COMPLETED').length,
        pendingRoute: this.requests.filter((r) => r.staffId === userId && r.status !== 'COMPLETED').length,
        totalWeightCollected: 85.5,
        recentPickups: this.requests.slice(0, 5),
      };
    }

    // Citizen User Stats
    const userReqs = this.requests.filter((r) => r.userId === userId);
    const completed = userReqs.filter((r) => r.status === 'COMPLETED');
    const totalKg = userReqs.reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || 0), 0);

    return {
      activePickups: userReqs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length,
      completedPickups: completed.length,
      totalRecycledKg: Math.round(totalKg * 10) / 10,
      ecoCredits: Math.round(totalKg * 10),
      recentRequests: userReqs.slice(0, 5),
    };
  }

  // --- Notifications Operations ---
  public getNotifications(userId: string): any[] {
    return this.notifications.filter((n) => n.userId === userId);
  }
}

export const fallbackStore = new FallbackStore();
