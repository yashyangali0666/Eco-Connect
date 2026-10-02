import { PrismaClient, Role, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EcoCollect database seed...');

  // Clean existing records if any
  await prisma.comment.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.pickupImage.deleteMany({});
  await prisma.pickupRequest.deleteMany({});
  await prisma.wasteCategory.deleteMany({});
  await prisma.collectionStaffProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'EcoCollect Admin',
      email: 'admin@ecocollect.demo',
      phone: '+1 800-326-2655',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'staff@ecocollect.demo',
      phone: '+1 555-014-9921',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      staffProfile: {
        create: {
          vehicleType: 'Eco Electric Van (EV-04)',
          vehicleNumber: 'GRN-8492',
          serviceArea: 'Central Metro & North District',
        },
      },
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'staff2@ecocollect.demo',
      phone: '+1 555-017-4820',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      staffProfile: {
        create: {
          vehicleType: 'Zero-Emission Cargo Bike (CB-12)',
          vehicleNumber: 'ECO-2910',
          serviceArea: 'Downtown & Waterfront Zone',
        },
      },
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'user@ecocollect.demo',
      phone: '+1 555-019-2834',
      passwordHash: userPasswordHash,
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'user2@ecocollect.demo',
      phone: '+1 555-018-7741',
      passwordHash: userPasswordHash,
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    },
  });

  console.log('✅ Users seeded:');
  console.log(` - Admin: ${admin.email}`);
  console.log(` - Staff: ${staff1.email}, ${staff2.email}`);
  console.log(` - Users: ${user1.email}, ${user2.email}`);

  // 2. Create Waste Categories
  const categoriesData = [
    {
      name: 'Recyclable Waste',
      slug: 'recyclable-waste',
      description: 'Standard recyclable materials including glass bottles, aluminum and tin cans, clean cardboard, and rigid packaging.',
      icon: 'Recycle',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      color: '#10B981',
      acceptedItems: ['Clean glass bottles and jars', 'Aluminum beverage cans', 'Food tins and metal lids', 'Corrugated cardboard', 'Clean mixed paper'],
      rejectedItems: ['Food-soiled materials', 'Ceramics & porcelain', 'Broken window glass', 'Greasy pizza boxes', 'Waxed cartons'],
      disposalInstructions: 'Rinse all bottles and cans to remove food residue. Flatten cardboard boxes and keep items completely dry before pickup.',
    },
    {
      name: 'Organic / Wet Waste',
      slug: 'organic-waste',
      description: 'Biodegradable kitchen food scraps, garden trimmings, fruit peels, and compostable organic residue for green composting.',
      icon: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      color: '#84CC16',
      acceptedItems: ['Fruit and vegetable peels', 'Coffee grounds & tea leaves', 'Cooked and uncooked food leftovers', 'Eggshells & bread scraps', 'Garden clippings & dry leaves'],
      rejectedItems: ['Plastic wrap or bags', 'Animal bones & large carcasses', 'Diapers or sanitary products', 'Pet feces or litter', 'Treated timber or chemicals'],
      disposalInstructions: 'Collect in a breathable compost caddy or compostable green bin liner. Drain excess liquid before placing in the collection bin.',
    },
    {
      name: 'Plastic Waste',
      slug: 'plastic-waste',
      description: 'Household rigid and flexible plastics, PET drink bottles, HDPE milk jugs, and recyclable poly containers.',
      icon: 'Package',
      imageUrl: 'https://images.unsplash.com/photo-1562077772-3ab12188402b?auto=format&fit=crop&w=800&q=80',
      color: '#06B6D4',
      acceptedItems: ['PET plastic bottles (Type 1)', 'HDPE shampoo & milk jugs (Type 2)', 'Polypropylene food containers (Type 5)', 'Clean plastic bottle caps'],
      rejectedItems: ['Expanded polystyrene (Styrofoam)', 'Multi-layer chip bags', 'Plastic straws and disposable cutlery', 'PVC pipes or vinyl siding'],
      disposalInstructions: 'Empty all liquids, rinse out residues, crush bottles to conserve space, and secure bottle caps tightly.',
    },
    {
      name: 'Paper Waste',
      slug: 'paper-waste',
      description: 'Office paper, discarded newspapers, magazines, catalogs, paperboard packaging, and envelopes.',
      icon: 'FileText',
      imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
      color: '#F59E0B',
      acceptedItems: ['Newspapers and magazines', 'Office documents and copy paper', 'Paper envelopes (without plastic windows)', 'Paperback books', 'Cereal and shipping boxes'],
      rejectedItems: ['Wax or plastic-coated paper', 'Greaseproof paper & paper towels', 'Used napkins & tissues', 'Carbon paper', 'Thermal receipt paper'],
      disposalInstructions: 'Bundle newspapers and clean office sheets. Flatten all paperboard cartons. Keep protected from moisture and rain.',
    },
    {
      name: 'E-Waste',
      slug: 'e-waste',
      description: 'Obsolete, broken, or discarded electrical and electronic equipment containing valuable metals and hazardous components.',
      icon: 'Cpu',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      color: '#6366F1',
      acceptedItems: ['Old smartphones and cellular phones', 'Laptops, tablets & desktop computers', 'Chargers, cables and power banks', 'Computer peripherals (keyboards, mice)', 'Small home electronics (radios, blenders)'],
      rejectedItems: ['Cracked CRT televisions/monitors with exposed leaded glass', 'Leaking lithium battery packs', 'Industrial high-voltage transformers', 'Large commercial refrigeration units with Freon'],
      disposalInstructions: 'Wipe all sensitive personal data and perform factory resets before collection. Keep cables bundled together with equipment.',
    },
    {
      name: 'Hazardous Waste',
      slug: 'hazardous-waste',
      description: 'Domestic hazardous products containing toxic, corrosive, ignitable, or reactive substances requiring specialized handling.',
      icon: 'AlertTriangle',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      color: '#EF4444',
      acceptedItems: ['Household alkaline & lithium batteries', 'Fluorescent light bulbs and CFL tubes', 'Leftover paints, varnishes and thinners', 'Used motor oils and brake fluids', 'Domestic pesticides and weed killers'],
      rejectedItems: ['Explosives or fireworks', 'Radioactive substances', 'Ammunition or flares', 'Biohazard medical needles or syringes (require clinical disposal)'],
      disposalInstructions: 'Keep in original, clearly labeled containers with tight lids. Never mix different chemical substances together.',
    },
    {
      name: 'Bulk Waste',
      slug: 'bulk-waste',
      description: 'Oversized household furniture, mattresses, broken fixtures, and bulky items exceeding regular curbside container limits.',
      icon: 'Sofa',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      color: '#8B5CF6',
      acceptedItems: ['Sofas, armchairs, and futons', 'Wooden tables, desks, and bookshelves', 'Bed frames and clean mattresses', 'Large plastic garden furniture', 'Disassembled cabinets'],
      rejectedItems: ['Construction concrete or demolition rubble', 'Automobile engines or vehicle frames', 'Hazardous asbestos sheeting', 'Intact piano harps without notice'],
      disposalInstructions: 'Disassemble large items where possible to facilitate safe loading. Place in an accessible ground-floor area on the scheduled date.',
    },
    {
      name: 'Textile Waste',
      slug: 'textile-waste',
      description: 'Old garments, worn-out clothing, fabric scraps, curtains, bed linens, and shoes suitable for fiber recycling and reuse.',
      icon: 'Shirt',
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      color: '#EC4899',
      acceptedItems: ['Clean discarded clothing and shirts', 'Pants, jackets, and winter coats', 'Bed linens, sheets, and pillowcases', 'Pairs of wearable shoes tied together', 'Fabric remnants and curtains'],
      rejectedItems: ['Wet or mold-infested fabrics', 'Textiles contaminated with chemicals or paint', 'Soiled carpets or oily rags'],
      disposalInstructions: 'Wash and dry all textiles. Place neatly inside sealed moisture-resistant clear bags to prevent dampness.',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.wasteCategory.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Seeded ${Object.keys(categories).length} waste categories.`);

  // 3. Create Demo Pickup Requests (16 realistic requests)
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const demoRequests = [
    {
      requestNumber: 'EC-2026-000001',
      userId: user1.id,
      wasteCategoryId: categories['recyclable-waste'].id,
      quantity: 15.5,
      unit: 'kg',
      description: 'Clean cardboard boxes from moving, glass jars, and crushed aluminum beverage cans.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Near Springfield Public Park',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysAgo(10),
      timeSlot: '08:00 AM – 10:00 AM',
      status: RequestStatus.COMPLETED,
      assignedStaffId: staff1.id,
      completedAt: daysAgo(10),
      adminNotes: 'Completed on schedule. Materials well segregated.',
      createdAt: daysAgo(12),
    },
    {
      requestNumber: 'EC-2026-000002',
      userId: user1.id,
      wasteCategoryId: categories['e-waste'].id,
      quantity: 3,
      unit: 'items',
      description: '2 obsolete Dell laptops, 1 iPad mini, and multiple power bricks with charging cables.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Front lobby reception',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysAgo(6),
      timeSlot: '10:00 AM – 12:00 PM',
      status: RequestStatus.COMPLETED,
      assignedStaffId: staff1.id,
      completedAt: daysAgo(6),
      adminNotes: 'Electronics safely routed to authorized e-stewards recycling facility.',
      createdAt: daysAgo(8),
    },
    {
      requestNumber: 'EC-2026-000003',
      userId: user2.id,
      wasteCategoryId: categories['paper-waste'].id,
      quantity: 22,
      unit: 'kg',
      description: 'Discarded accounting paper archives, magazines, and broken-down cardboard packaging.',
      pickupAddress: '1204 Pine Valley Boulevard',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62702',
      landmark: 'Opposite Community Library',
      latitude: 39.8005,
      longitude: -89.6455,
      pickupDate: daysAgo(4),
      timeSlot: '12:00 PM – 02:00 PM',
      status: RequestStatus.COMPLETED,
      assignedStaffId: staff2.id,
      completedAt: daysAgo(4),
      adminNotes: 'Recycled through pulping stream.',
      createdAt: daysAgo(5),
    },
    {
      requestNumber: 'EC-2026-000004',
      userId: user1.id,
      wasteCategoryId: categories['hazardous-waste'].id,
      quantity: 6,
      unit: 'items',
      description: 'Used paint cans, 2 fluorescent light tubes, and a sealed container of household battery cells.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Garage unit #12',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysAgo(2),
      timeSlot: '02:00 PM – 04:00 PM',
      status: RequestStatus.COMPLETED,
      assignedStaffId: staff1.id,
      completedAt: daysAgo(2),
      adminNotes: 'Hazardous containment boxes utilized.',
      createdAt: daysAgo(4),
    },
    {
      requestNumber: 'EC-2026-000005',
      userId: user2.id,
      wasteCategoryId: categories['plastic-waste'].id,
      quantity: 4,
      unit: 'bags',
      description: 'PET drink bottles, cleaned food containers, and laundry detergent jugs.',
      pickupAddress: '1204 Pine Valley Boulevard',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62702',
      landmark: 'Opposite Community Library',
      latitude: 39.8005,
      longitude: -89.6455,
      pickupDate: daysAgo(1),
      timeSlot: '10:00 AM – 12:00 PM',
      status: RequestStatus.COLLECTED,
      assignedStaffId: staff2.id,
      adminNotes: 'Collected and en route to sorting station.',
      createdAt: daysAgo(3),
    },
    {
      requestNumber: 'EC-2026-000006',
      userId: user1.id,
      wasteCategoryId: categories['bulk-waste'].id,
      quantity: 2,
      unit: 'items',
      description: 'Two-seater fabric sofa and a disassembled wooden bookshelf.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Curbside loading dock',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: now,
      timeSlot: '08:00 AM – 10:00 AM',
      status: RequestStatus.OUT_FOR_PICKUP,
      assignedStaffId: staff1.id,
      adminNotes: 'Large van assigned.',
      createdAt: daysAgo(2),
    },
    {
      requestNumber: 'EC-2026-000007',
      userId: user2.id,
      wasteCategoryId: categories['organic-waste'].id,
      quantity: 12,
      unit: 'kg',
      description: 'Kitchen vegetable peels, coffee grounds, and garden hedge trimmings in compost liners.',
      pickupAddress: '556 Maple Heights Avenue',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62703',
      landmark: 'Next to Green Valley Bakery',
      latitude: 39.7723,
      longitude: -89.6389,
      pickupDate: now,
      timeSlot: '10:00 AM – 12:00 PM',
      status: RequestStatus.ASSIGNED,
      assignedStaffId: staff1.id,
      adminNotes: 'Assigned for morning collection round.',
      createdAt: daysAgo(1),
    },
    {
      requestNumber: 'EC-2026-000008',
      userId: user1.id,
      wasteCategoryId: categories['textile-waste'].id,
      quantity: 3,
      unit: 'bags',
      description: 'Clean used clothing, bedsheets, winter jackets, and pair of tied sneakers for donation/recycling.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Front porch',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: now,
      timeSlot: '02:00 PM – 04:00 PM',
      status: RequestStatus.ASSIGNED,
      assignedStaffId: staff2.id,
      adminNotes: 'Assigned to Priya for afternoon route.',
      createdAt: daysAgo(1),
    },
    {
      requestNumber: 'EC-2026-000009',
      userId: user2.id,
      wasteCategoryId: categories['e-waste'].id,
      quantity: 4,
      unit: 'items',
      description: 'Broken HP laser printer, old CRT monitor, and box of ethernet/HDMI cables.',
      pickupAddress: '1204 Pine Valley Boulevard',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62702',
      landmark: 'Side entrance near driveway',
      latitude: 39.8005,
      longitude: -89.6455,
      pickupDate: daysFromNow(1),
      timeSlot: '10:00 AM – 12:00 PM',
      status: RequestStatus.CONFIRMED,
      assignedStaffId: null,
      adminNotes: 'Pending staff assignment based on route capacity.',
      createdAt: daysAgo(1),
    },
    {
      requestNumber: 'EC-2026-000010',
      userId: user1.id,
      wasteCategoryId: categories['recyclable-waste'].id,
      quantity: 18,
      unit: 'kg',
      description: 'Clean shipping corrugated boxes, clean metal beverage cans, rinsed wine bottles.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Lobby mail area',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysFromNow(2),
      timeSlot: '08:00 AM – 10:00 AM',
      status: RequestStatus.CONFIRMED,
      assignedStaffId: null,
      adminNotes: 'Regular monthly recyclables collection.',
      createdAt: now,
    },
    {
      requestNumber: 'EC-2026-000011',
      userId: user1.id,
      wasteCategoryId: categories['plastic-waste'].id,
      quantity: 2,
      unit: 'bags',
      description: 'Large clear bags of cleaned milk containers and carbonated soda bottles.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Near elevator door',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysFromNow(3),
      timeSlot: '12:00 PM – 02:00 PM',
      status: RequestStatus.PENDING,
      assignedStaffId: null,
      adminNotes: null,
      createdAt: now,
    },
    {
      requestNumber: 'EC-2026-000012',
      userId: user2.id,
      wasteCategoryId: categories['hazardous-waste'].id,
      quantity: 3,
      unit: 'items',
      description: '2 leftover automotive engine oil containers and 1 car lead battery.',
      pickupAddress: '556 Maple Heights Avenue',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62703',
      landmark: 'Driveway garage',
      latitude: 39.7723,
      longitude: -89.6389,
      pickupDate: daysFromNow(3),
      timeSlot: '04:00 PM – 06:00 PM',
      status: RequestStatus.PENDING,
      assignedStaffId: null,
      adminNotes: null,
      createdAt: now,
    },
    {
      requestNumber: 'EC-2026-000013',
      userId: user1.id,
      wasteCategoryId: categories['bulk-waste'].id,
      quantity: 1,
      unit: 'items',
      description: 'Single king mattress wrapped in plastic protector.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Ground level freight elevator',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysFromNow(4),
      timeSlot: '08:00 AM – 10:00 AM',
      status: RequestStatus.PENDING,
      assignedStaffId: null,
      adminNotes: null,
      createdAt: now,
    },
    {
      requestNumber: 'EC-2026-000014',
      userId: user2.id,
      wasteCategoryId: categories['textile-waste'].id,
      quantity: 2,
      unit: 'bags',
      description: 'Used household curtains and worn denim clothing.',
      pickupAddress: '1204 Pine Valley Boulevard',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62702',
      landmark: 'Front steps',
      latitude: 39.8005,
      longitude: -89.6455,
      pickupDate: daysAgo(5),
      timeSlot: '10:00 AM – 12:00 PM',
      status: RequestStatus.CANCELLED,
      assignedStaffId: null,
      adminNotes: 'Cancelled by citizen prior to confirmation: items donated to family.',
      createdAt: daysAgo(6),
    },
    {
      requestNumber: 'EC-2026-000015',
      userId: user1.id,
      wasteCategoryId: categories['organic-waste'].id,
      quantity: 8,
      unit: 'kg',
      description: 'Garden leaves and yard prunings.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Backyard alley gate',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysAgo(8),
      timeSlot: '02:00 PM – 04:00 PM',
      status: RequestStatus.CANCELLED,
      assignedStaffId: null,
      adminNotes: 'Citizen rescheduled for later month.',
      createdAt: daysAgo(9),
    },
    {
      requestNumber: 'EC-2026-000016',
      userId: user1.id,
      wasteCategoryId: categories['e-waste'].id,
      quantity: 1,
      unit: 'items',
      description: 'Ancient microwave oven with frayed power cord.',
      pickupAddress: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      landmark: 'Porch door',
      latitude: 39.7817,
      longitude: -89.6501,
      pickupDate: daysFromNow(5),
      timeSlot: '02:00 PM – 04:00 PM',
      status: RequestStatus.PENDING,
      assignedStaffId: null,
      adminNotes: null,
      createdAt: now,
    },
  ];

  for (const req of demoRequests) {
    const createdReq = await prisma.pickupRequest.create({
      data: req,
    });

    // Seed Activity Logs for realistic timeline
    await prisma.activityLog.create({
      data: {
        pickupRequestId: createdReq.id,
        userId: req.userId,
        action: 'CREATED',
        description: `Pickup request ${req.requestNumber} submitted by citizen.`,
        createdAt: req.createdAt,
      },
    });

    if (req.status !== RequestStatus.PENDING && req.status !== RequestStatus.CANCELLED) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: admin.id,
          action: 'CONFIRMED',
          description: `Request reviewed and confirmed by EcoCollect operations team.`,
          createdAt: new Date(req.createdAt.getTime() + 1000 * 60 * 30),
        },
      });
    }

    if (req.assignedStaffId) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: admin.id,
          action: 'ASSIGNED',
          description: `Assigned to collection officer ${req.assignedStaffId === staff1.id ? 'Amit Kumar' : 'Priya Patel'}.`,
          createdAt: new Date(req.createdAt.getTime() + 1000 * 60 * 60),
        },
      });
    }

    if (req.status === RequestStatus.OUT_FOR_PICKUP || req.status === RequestStatus.COLLECTED || req.status === RequestStatus.COMPLETED) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: req.assignedStaffId,
          action: 'OUT_FOR_PICKUP',
          description: 'Collector has started the collection route towards pickup location.',
          createdAt: new Date(req.pickupDate.getTime() - 1000 * 60 * 45),
        },
      });
    }

    if (req.status === RequestStatus.COLLECTED || req.status === RequestStatus.COMPLETED) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: req.assignedStaffId,
          action: 'COLLECTED',
          description: 'Waste inspected, weighed, and securely loaded onto collection vehicle.',
          createdAt: req.pickupDate,
        },
      });
    }

    if (req.status === RequestStatus.COMPLETED) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: req.assignedStaffId,
          action: 'COMPLETED',
          description: 'Waste delivered to certified recycling / sorting transfer station. Collection completed.',
          createdAt: req.completedAt || req.pickupDate,
        },
      });
    }

    if (req.status === RequestStatus.CANCELLED) {
      await prisma.activityLog.create({
        data: {
          pickupRequestId: createdReq.id,
          userId: req.userId,
          action: 'CANCELLED',
          description: 'Request cancelled by citizen.',
          createdAt: new Date(req.createdAt.getTime() + 1000 * 60 * 120),
        },
      });
    }

    // Add image for first few requests
    if (req.requestNumber === 'EC-2026-000001' || req.requestNumber === 'EC-2026-000002') {
      await prisma.pickupImage.create({
        data: {
          pickupRequestId: createdReq.id,
          url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=500&q=80',
          filename: 'waste-sample-1.jpg',
        },
      });
    }
  }

  console.log(`✅ Seeded ${demoRequests.length} pickup requests with activity logs.`);

  // 4. Seed Notifications for Users and Staff
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Collection Completed',
        message: 'Your pickup request EC-2026-000002 has been successfully completed and sent for e-waste recycling.',
        type: 'SUCCESS',
        isRead: false,
      },
      {
        userId: user1.id,
        title: 'Pickup Scheduled for Today',
        message: 'Your bulk waste pickup EC-2026-000006 is scheduled for collection today between 08:00 AM – 10:00 AM.',
        type: 'INFO',
        isRead: false,
      },
      {
        userId: staff1.id,
        title: 'New Pickup Assigned',
        message: 'You have been assigned to pickup request EC-2026-000007 (Organic Waste) in North District.',
        type: 'STATUS_CHANGE',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'New Pickup Request',
        message: 'New e-waste collection request EC-2026-000016 submitted by Rahul Sharma.',
        type: 'ALERT',
        isRead: false,
      },
    ],
  });

  console.log('✅ Seeded demo notifications.');
  console.log('🎉 EcoCollect database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
