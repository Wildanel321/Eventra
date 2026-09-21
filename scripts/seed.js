const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();
const QR_SECRET_KEY = process.env.QR_SECRET_KEY || "eventra-secure-ticket-secret-2026";

function signTicket(ticketNumber, eventId, attendeeId) {
  const signature = crypto
    .createHmac("sha256", QR_SECRET_KEY)
    .update(`${ticketNumber}:${eventId}:${attendeeId}`)
    .digest("hex")
    .substring(0, 16);

  const qrData = JSON.stringify({
    t: ticketNumber,
    e: eventId,
    a: attendeeId,
    s: signature,
  });

  return { qrData, signature };
}

async function main() {
  console.log("🌱 Seeding Eventra database...");

  // Clean existing data in order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.sessionRegistration.deleteMany();
  await prisma.sessionSpeaker.deleteMany();
  await prisma.sessionItem.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.registrationValue.deleteMany();
  await prisma.registrationField.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.eventCampaign.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.eventTag.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Core Users
  console.log("Creating users...");
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@eventra.io",
      passwordHash,
      name: "Super Administrator",
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      jobTitle: "System Overseer",
      company: "Eventra Global",
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: "organizer@eventra.io",
      passwordHash,
      name: "Wildan Organizer",
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      jobTitle: "Lead Event Director",
      company: "Nusantara Tech Media",
      twoFactorEnabled: true,
    },
  });

  const eventAdmin = await prisma.user.create({
    data: {
      email: "admin@eventra.io",
      passwordHash,
      name: "Maya Paramitha",
      role: "EVENT_ADMIN",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      jobTitle: "Event Operations Lead",
      company: "Nusantara Tech Media",
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@eventra.io",
      passwordHash,
      name: "Budi Santoso",
      role: "STAFF",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      jobTitle: "On-site Scanner Lead",
      company: "Eventra Crew Services",
    },
  });

  const speakerUser = await prisma.user.create({
    data: {
      email: "speaker@eventra.io",
      passwordHash,
      name: "Dr. Rayhan Kusuma",
      role: "SPEAKER",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      jobTitle: "VP of Distributed Systems",
      company: "GoTo Global",
    },
  });

  const attendeeUser = await prisma.user.create({
    data: {
      email: "attendee@eventra.io",
      passwordHash,
      name: "Siti Rahma",
      role: "ATTENDEE",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      jobTitle: "Senior Frontend Engineer",
      company: "Bukalapak",
    },
  });

  // 2. Create Organizations
  console.log("Creating organizations...");
  const org1 = await prisma.organization.create({
    data: {
      name: "Nusantara Tech Foundation",
      slug: "nusantara-tech",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      description: "Empowering Indonesian digital builders through high-impact tech gatherings and summits.",
      website: "https://nusantaratech.org",
      brandingColor: "#4F46E5",
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Design Guild Asia",
      slug: "design-guild-asia",
      logo: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&auto=format&fit=crop&q=80",
      description: "Premier design community advancing UI/UX, product craft, and design systems in APAC.",
      website: "https://designguild.asia",
      brandingColor: "#EC4899",
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: "CyberSec Indonesia",
      slug: "cybersec-indonesia",
      logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
      description: "National consortium for cyber threat intelligence, defensive ops, and security research.",
      website: "https://cybersec.id",
      brandingColor: "#059669",
    },
  });

  const org4 = await prisma.organization.create({
    data: {
      name: "Venture Conclave Asia",
      slug: "venture-conclave",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80",
      description: "Connecting tier-1 institutional investors with early-stage hypergrowth founders.",
      website: "https://ventureconclave.com",
      brandingColor: "#D97706",
    },
  });

  const org5 = await prisma.organization.create({
    data: {
      name: "Indie Beats Jakarta",
      slug: "indie-beats",
      logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
      description: "Curating indie electronic, jazz, and creative arts live performance festivals.",
      website: "https://indiebeats.id",
      brandingColor: "#8B5CF6",
    },
  });

  // Assign Organization Memberships
  await prisma.organizationMember.createMany({
    data: [
      { orgId: org1.id, userId: organizer.id, role: "OWNER" },
      { orgId: org1.id, userId: eventAdmin.id, role: "ADMIN" },
      { orgId: org1.id, userId: staff.id, role: "STAFF" },
      { orgId: org2.id, userId: organizer.id, role: "ADMIN" },
      { orgId: org3.id, userId: organizer.id, role: "MEMBER" },
    ],
  });

  // 3. Create Event Categories
  console.log("Creating categories...");
  const categories = await Promise.all([
    prisma.eventCategory.create({ data: { name: "Technology & AI", slug: "technology-ai", icon: "Cpu" } }),
    prisma.eventCategory.create({ data: { name: "UI/UX & Product Design", slug: "design-product", icon: "Layout" } }),
    prisma.eventCategory.create({ data: { name: "Cybersecurity & Cloud", slug: "cybersecurity-cloud", icon: "Shield" } }),
    prisma.eventCategory.create({ data: { name: "Startup & Venture Capital", slug: "startup-vc", icon: "TrendingUp" } }),
    prisma.eventCategory.create({ data: { name: "Developer Workshop", slug: "workshop", icon: "Terminal" } }),
    prisma.eventCategory.create({ data: { name: "Music & Arts Festival", slug: "music-arts", icon: "Music" } }),
  ]);

  // 4. Create Flagship Demo Event: Nusantara Developer Conference 2026
  console.log("Creating Flagship Demo Event: Nusantara Developer Conference 2026...");
  const ndcEvent = await prisma.event.create({
    data: {
      orgId: org1.id,
      title: "Nusantara Developer Conference 2026",
      slug: "nusantara-developer-conference-2026",
      summary: "Indonesia's largest annual software engineering and architecture conference gathering 1,500+ builders.",
      description: `### Welcome to Nusantara Developer Conference 2026

**Nusantara Developer Conference (NDC 2026)** brings together leading software engineers, cloud architects, AI practitioners, and engineering leaders from Southeast Asia's top technology companies.

#### What to Expect:
- **3 Dynamic Tracks**: Systems & Cloud Architecture, AI in Production, and Modern Web & Mobile Craft.
- **20+ Expert Keynotes & Tech Sessions**: Real-world architectural breakdowns with zero marketing fluff.
- **Live Hands-on Code Labs**: Build production LLM pipelines and distributed microservices with guidance from veteran leads.
- **Exclusive Career & Networking Lounge**: Connect with hiring teams and engineering leaders from unicorn startups.

#### Venue & Logistics
The conference will take place at **Jakarta International Expo (JIExpo) Kemayoran, Grand Ballroom Hall A & B**. Full day catering, welcome kit, swag bag, and networking dinner are included in all tickets.`,
      categoryId: categories[0].id,
      format: "HYBRID",
      status: "PUBLISHED",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&auto=format&fit=crop&q=80",
      startDate: new Date("2026-10-15T09:00:00.000Z"),
      endDate: new Date("2026-10-16T18:00:00.000Z"),
      timezone: "Asia/Jakarta",
      regStart: new Date("2026-08-01T00:00:00.000Z"),
      regEnd: new Date("2026-10-14T23:59:59.000Z"),
      capacity: 1500,
      featured: true,
      isPublic: true,
      brandingColor: "#4F46E5",
      accentColor: "#6366F1",
    },
  });

  // Venue for NDC 2026
  await prisma.venue.create({
    data: {
      eventId: ndcEvent.id,
      name: "JIExpo Kemayoran - Grand Ballroom",
      address: "Gedung Pusat Niaga Lt. 1, Arena PRJ Kemayoran",
      city: "Jakarta Pusat",
      country: "Indonesia",
      postalCode: "10620",
      mapUrl: "https://maps.google.com/?q=JIExpo+Kemayoran",
      latitude: -6.1472,
      longitude: 106.8456,
      meetingUrl: "https://eventra.io/live/ndc2026",
      platform: "YouTube Live / Zoom Webinar",
    },
  });

  // Tags for NDC 2026
  await prisma.eventTag.createMany({
    data: [
      { eventId: ndcEvent.id, name: "Engineering" },
      { eventId: ndcEvent.id, name: "Cloud Architecture" },
      { eventId: ndcEvent.id, name: "AI & LLM" },
      { eventId: ndcEvent.id, name: "TypeScript" },
      { eventId: ndcEvent.id, name: "Distributed Systems" },
    ],
  });

  // Ticket Types for NDC 2026
  const tEarlyBird = await prisma.ticketType.create({
    data: {
      eventId: ndcEvent.id,
      name: "Early Bird Pass",
      description: "Limited availability pass with full 2-day access to all main tracks and exhibition floor.",
      price: 150000,
      quota: 300,
      soldCount: 285,
      minQuantity: 1,
      maxQuantity: 5,
      perksJson: JSON.stringify(["2-Day Access", "Conference Kit & Swag", "Coffee Break & Lunch", "Digital Verified Certificate"]),
    },
  });

  const tRegular = await prisma.ticketType.create({
    data: {
      eventId: ndcEvent.id,
      name: "Regular Pass",
      description: "Standard 2-day conference pass including all keynotes, breakout sessions, and networking.",
      price: 250000,
      quota: 800,
      soldCount: 420,
      minQuantity: 1,
      maxQuantity: 10,
      perksJson: JSON.stringify(["2-Day Access", "All 3 Track Sessions", "Lunch & Networking Buffet", "Digital Certificate", "Session Recordings"]),
    },
  });

  const tVip = await prisma.ticketType.create({
    data: {
      eventId: ndcEvent.id,
      name: "VIP Executive Pass",
      description: "Front-row priority seating, access to VIP Speaker Lounge, and exclusive after-party networking dinner.",
      price: 500000,
      quota: 150,
      soldCount: 95,
      minQuantity: 1,
      maxQuantity: 4,
      perksJson: JSON.stringify(["Front Row Priority Seating", "VIP Lounge Access", "Speaker Dinner Invitation", "Exclusive Merch Bundle", "Lifetime Session Video Access"]),
    },
  });

  // Custom Registration Fields for NDC 2026
  await prisma.registrationField.createMany({
    data: [
      {
        eventId: ndcEvent.id,
        label: "Company / Organization",
        name: "company",
        fieldType: "TEXT",
        isRequired: true,
        placeholder: "e.g. GoTo, Shopee, Traveloka, ITB",
        sortOrder: 1,
      },
      {
        eventId: ndcEvent.id,
        label: "Job Title / Role",
        name: "job_title",
        fieldType: "TEXT",
        isRequired: true,
        placeholder: "e.g. Senior Backend Engineer, Tech Lead",
        sortOrder: 2,
      },
      {
        eventId: ndcEvent.id,
        label: "Primary Engineering Track Interest",
        name: "track_preference",
        fieldType: "SELECT",
        isRequired: true,
        optionsJson: JSON.stringify(["Distributed Systems & Cloud", "AI in Production", "Frontend Architecture & DX"]),
        sortOrder: 3,
      },
      {
        eventId: ndcEvent.id,
        label: "Dietary Preferences",
        name: "dietary",
        fieldType: "RADIO",
        isRequired: false,
        optionsJson: JSON.stringify(["Standard / Halal", "Vegetarian", "Vegan", "No Specific Preference"]),
        sortOrder: 4,
      },
      {
        eventId: ndcEvent.id,
        label: "T-Shirt Size",
        name: "tshirt_size",
        fieldType: "SELECT",
        isRequired: true,
        optionsJson: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        sortOrder: 5,
      },
    ],
  });

  // Speakers for NDC 2026
  console.log("Creating speakers for NDC 2026...");
  const spk1 = await prisma.speaker.create({
    data: {
      eventId: ndcEvent.id,
      name: "Dr. Rayhan Kusuma",
      role: "VP of Distributed Systems",
      company: "GoTo Global",
      bio: "15+ years scaling distributed transactional engines processing 50M+ daily events across ASEAN.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
      email: "rayhan.kusuma@goto.com",
      twitter: "@rayhankusuma",
      github: "rayhankusuma",
      linkedin: "rayhan-kusuma",
      sortOrder: 1,
    },
  });

  const spk2 = await prisma.speaker.create({
    data: {
      eventId: ndcEvent.id,
      name: "Nadia Saraswati",
      role: "Head of AI Research",
      company: "Bukalapak AI Labs",
      bio: "Specializing in domain-adapted transformer models, latency reduction, and multimodal search systems.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      email: "nadia.saraswati@bukalapak.com",
      twitter: "@nadiasaraswati",
      github: "nadiasaraswati",
      linkedin: "nadia-saraswati",
      sortOrder: 2,
    },
  });

  const spk3 = await prisma.speaker.create({
    data: {
      eventId: ndcEvent.id,
      name: "Kevin Jonathan",
      role: "Principal Frontend Architect",
      company: "Traveloka",
      bio: "Creator of widely adopted open-source micro-frontend frameworks and design system compiler tooling.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      email: "kevin.jonathan@traveloka.com",
      twitter: "@kevinjtech",
      github: "kevinjonathan",
      linkedin: "kevin-jonathan-dev",
      sortOrder: 3,
    },
  });

  const spk4 = await prisma.speaker.create({
    data: {
      eventId: ndcEvent.id,
      name: "Farhan Mahendra",
      role: "Staff Site Reliability Engineer",
      company: "DANA Indonesia",
      bio: "Kubernetes core contributor and expert on multi-region active-active disaster recovery patterns.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      email: "farhan.m@dana.id",
      twitter: "@farhan_sre",
      github: "farhanm",
      linkedin: "farhan-mahendra",
      sortOrder: 4,
    },
  });

  // Sessions & Schedule for NDC 2026
  console.log("Creating sessions & agenda...");
  const sess1 = await prisma.sessionItem.create({
    data: {
      eventId: ndcEvent.id,
      title: "Keynote: The Next Decade of Cloud Architecture in Southeast Asia",
      description: "Opening keynote examining resilient microservice design, zero-trust cloud mesh, and multi-cloud strategies.",
      track: "Main Hall",
      room: "Grand Ballroom Hall A",
      startTime: new Date("2026-10-15T09:00:00.000Z"),
      endTime: new Date("2026-10-15T10:30:00.000Z"),
      capacity: 1000,
      requiresBooking: false,
      sortOrder: 1,
    },
  });

  const sess2 = await prisma.sessionItem.create({
    data: {
      eventId: ndcEvent.id,
      title: "Architecting Ultra Low-Latency Event Streams with Rust and Kafka",
      description: "Deep dive into building sub-millisecond event streaming pipelines that handle millions of transactions per second.",
      track: "Track 1 - Engineering",
      room: "Room Nusantara 1",
      startTime: new Date("2026-10-15T11:00:00.000Z"),
      endTime: new Date("2026-10-15T12:30:00.000Z"),
      capacity: 350,
      requiresBooking: true,
      sortOrder: 2,
    },
  });

  const sess3 = await prisma.sessionItem.create({
    data: {
      eventId: ndcEvent.id,
      title: "Deploying Local Agentic Models and RAG Pipelines in Production",
      description: "Practical engineering playbook for orchestrating local LLM clusters, vector embeddings, and tool-calling agents.",
      track: "Track 2 - AI & Data",
      room: "Room Nusantara 2",
      startTime: new Date("2026-10-15T11:00:00.000Z"),
      endTime: new Date("2026-10-15T12:30:00.000Z"),
      capacity: 300,
      requiresBooking: true,
      sortOrder: 3,
    },
  });

  const sess4 = await prisma.sessionItem.create({
    data: {
      eventId: ndcEvent.id,
      title: "Hands-on Workshop: Zero-Downtime Database Migrations at Scale",
      description: "Interactive lab simulating large-scale Postgres schema refactoring and multi-region sharding without downtime.",
      track: "Workshop Track",
      room: "Lab Room 3B",
      startTime: new Date("2026-10-15T14:00:00.000Z"),
      endTime: new Date("2026-10-15T17:00:00.000Z"),
      capacity: 60,
      requiresBooking: true,
      sortOrder: 4,
    },
  });

  // Link Speakers to Sessions
  await prisma.sessionSpeaker.createMany({
    data: [
      { sessionId: sess1.id, speakerId: spk1.id },
      { sessionId: sess2.id, speakerId: spk1.id },
      { sessionId: sess3.id, speakerId: spk2.id },
      { sessionId: sess4.id, speakerId: spk4.id },
    ],
  });

  // Coupons for NDC 2026
  await prisma.coupon.createMany({
    data: [
      {
        eventId: ndcEvent.id,
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minPurchase: 100000,
        quota: 200,
        usedCount: 42,
        isActive: true,
      },
      {
        eventId: ndcEvent.id,
        code: "DEVFEST50K",
        discountType: "FIXED",
        discountValue: 50000,
        minPurchase: 150000,
        quota: 100,
        usedCount: 18,
        isActive: true,
      },
      {
        eventId: ndcEvent.id,
        code: "STUDENTVIP",
        discountType: "PERCENTAGE",
        discountValue: 30,
        minPurchase: 200000,
        quota: 50,
        usedCount: 12,
        isActive: true,
      },
    ],
  });

  // Staff Assignment for NDC 2026
  await prisma.staff.createMany({
    data: [
      {
        eventId: ndcEvent.id,
        userId: staff.id,
        name: "Budi Santoso",
        email: "staff@eventra.io",
        roleName: "Scanner Lead",
        permissionsJson: JSON.stringify(["attendee.checkin", "ticket.validate", "scanner.use"]),
        inviteStatus: "ACCEPTED",
      },
      {
        eventId: ndcEvent.id,
        name: "Rina Wijaya",
        email: "rina.crew@eventra.io",
        roleName: "Registration Coordinator",
        permissionsJson: JSON.stringify(["attendee.view", "attendee.checkin", "ticket.resend"]),
        inviteStatus: "ACCEPTED",
      },
      {
        eventId: ndcEvent.id,
        name: "Dimas Anggara",
        email: "dimas.ops@eventra.io",
        roleName: "Hall Supervisor",
        permissionsJson: JSON.stringify(["session.manage", "attendee.checkin"]),
        inviteStatus: "ACCEPTED",
      },
    ],
  });

  // Marketing Referral Campaigns
  await prisma.eventCampaign.createMany({
    data: [
      { eventId: ndcEvent.id, code: "instagram", name: "Instagram Bio & Stories", source: "social", clicks: 1420, registrations: 184, revenue: 36800000 },
      { eventId: ndcEvent.id, code: "linkedin_ad", name: "LinkedIn Tech Sponsored Ads", source: "social", clicks: 980, registrations: 112, revenue: 28000000 },
      { eventId: ndcEvent.id, code: "newsletter_aug", name: "August Tech Digest Newsletter", source: "email", clicks: 750, registrations: 95, revenue: 19000000 },
      { eventId: ndcEvent.id, code: "community_discord", name: "IndoDev Discord Announcement", source: "affiliate", clicks: 610, registrations: 78, revenue: 15600000 },
    ],
  });

  // Generate 45 realistic attendees for NDC 2026 with orders, tickets, and check-ins
  console.log("Generating 45 attendees, tickets, and check-in logs for NDC 2026...");
  const attendeeSample = [
    { name: "Siti Rahma", email: "attendee@eventra.io", phone: "081298765432", company: "Bukalapak", job: "Senior Frontend Engineer", tier: tVip, checkedIn: true },
    { name: "Ahmad Rizky Pratama", email: "ahmad.rizky@gmail.com", phone: "081387654321", company: "Gojek", job: "Backend Engineer", tier: tRegular, checkedIn: true },
    { name: "Jessica Tanuwijaya", email: "jessica.tan@techasia.co", phone: "081234567890", company: "Tech Asia", job: "DevOps Engineer", tier: tVip, checkedIn: true },
    { name: "Bagus Wicaksono", email: "bagus.wicaksono@tokopedia.com", phone: "081898765432", company: "Tokopedia", job: "Staff Engineer", tier: tEarlyBird, checkedIn: true },
    { name: "Dewi Lestari", email: "dewi.lestari@traveloka.com", phone: "081765432109", company: "Traveloka", job: "Product Manager", tier: tRegular, checkedIn: false },
    { name: "Hendro Gunawan", email: "hendro.gunawan@fintech.id", phone: "081543210987", company: "Fintech ID", job: "Security Architect", tier: tVip, checkedIn: true },
    { name: "Putri Anggraini", email: "putri.anggraini@shopee.com", phone: "081987654321", company: "Shopee", job: "Mobile Dev Lead", tier: tEarlyBird, checkedIn: true },
    { name: "Rian Saputra", email: "rian.saputra@indonet.id", phone: "081234987650", company: "Indonet", job: "Network Engineer", tier: tRegular, checkedIn: false },
    { name: "Fajar Nugroho", email: "fajar.nugroho@dana.id", phone: "081345678901", company: "DANA", job: "Cloud Architect", tier: tVip, checkedIn: true },
    { name: "Clarissa Chandra", email: "clarissa.c@blibli.com", phone: "081456789012", company: "Blibli", job: "QA Automation Lead", tier: tEarlyBird, checkedIn: true },
    { name: "Aditya Pratama", email: "aditya.pratama@telkom.co.id", phone: "081567890123", company: "Telkom Indonesia", job: "System Analyst", tier: tRegular, checkedIn: false },
    { name: "Nabila Hapsari", email: "nabila.hapsari@kredivo.com", phone: "081678901234", company: "Kredivo", job: "Data Scientist", tier: tVip, checkedIn: true },
    { name: "Yusuf Maulana", email: "yusuf.m@warungpintar.co", phone: "081789012345", company: "Warung Pintar", job: "Fullstack Dev", tier: tEarlyBird, checkedIn: true },
    { name: "Meilani Kusuma", email: "meilani.k@ruangguru.com", phone: "081890123456", company: "Ruangguru", job: "Engineering Manager", tier: tRegular, checkedIn: true },
    { name: "Tommy Kurniawan", email: "tommy.k@astra.co.id", phone: "081901234567", company: "Astra Digital", job: "Infrastructure Lead", tier: tVip, checkedIn: false },
    { name: "Mega Utami", email: "mega.utami@alodokter.com", phone: "081212345678", company: "Alodokter", job: "Frontend Engineer", tier: tEarlyBird, checkedIn: true },
    { name: "Reza Firmansyah", email: "reza.f@tiket.com", phone: "081323456789", company: "Tiket.com", job: "Platform Engineer", tier: tRegular, checkedIn: true },
    { name: "Anisa Wardhani", email: "anisa.w@halodoc.com", phone: "081434567890", company: "Halodoc", job: "Backend Engineer", tier: tVip, checkedIn: true },
    { name: "Doni Setiawan", email: "doni.s@linkaja.id", phone: "081545678901", company: "LinkAja", job: "Security Specialist", tier: tEarlyBird, checkedIn: false },
    { name: "Valerie Monica", email: "valerie.m@flip.id", phone: "081656789012", company: "Flip.id", job: "UI Designer", tier: tRegular, checkedIn: true },
  ];

  for (let i = 0; i < attendeeSample.length; i++) {
    const item = attendeeSample[i];
    const orderNum = `ORD-202609-${1000 + i}`;
    const ticketCode = `EVT-2026-${item.tier.name.includes("VIP") ? "VIP" : item.tier.name.includes("Early") ? "ERL" : "REG"}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        eventId: ndcEvent.id,
        customerName: item.name,
        customerEmail: item.email,
        customerPhone: item.phone,
        subtotal: item.tier.price,
        discount: i % 3 === 0 ? item.tier.price * 0.2 : 0,
        total: i % 3 === 0 ? item.tier.price * 0.8 : item.tier.price,
        status: "PAID",
        paymentMethod: i % 2 === 0 ? "QRIS" : "VIRTUAL_ACCOUNT",
        couponCode: i % 3 === 0 ? "SAVE20" : null,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        ticketTypeId: item.tier.id,
        quantity: 1,
        unitPrice: item.tier.price,
        totalPrice: item.tier.price,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        provider: "MOCK_GATEWAY",
        providerTxId: `TX-MOCK-${Date.now()}-${i}`,
        paymentMethod: order.paymentMethod,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    const attendee = await prisma.attendee.create({
      data: {
        eventId: ndcEvent.id,
        orderId: order.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        jobTitle: item.job,
        checkInStatus: item.checkedIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
        checkedInAt: item.checkedIn ? new Date(Date.now() - (i * 15 * 60 * 1000)) : null,
      },
    });

    const { qrData, signature } = signTicket(ticketCode, ndcEvent.id, attendee.id);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: ticketCode,
        ticketTypeId: item.tier.id,
        eventId: ndcEvent.id,
        orderId: order.id,
        attendeeId: attendee.id,
        qrCode: qrData,
        qrSecret: signature,
        status: item.checkedIn ? "USED" : "VALID",
        checkedInAt: item.checkedIn ? attendee.checkedInAt : null,
        checkedInBy: item.checkedIn ? "Budi Santoso (Staff)" : null,
      },
    });

    if (item.checkedIn) {
      await prisma.checkIn.create({
        data: {
          eventId: ndcEvent.id,
          ticketId: ticket.id,
          attendeeId: attendee.id,
          staffId: staff.id,
          staffName: "Budi Santoso",
          method: "CAMERA_SCAN",
          notes: "Gate A - Kemayoran Main Turnstile",
          timestamp: attendee.checkedInAt || new Date(),
        },
      });

      // Also create Certificate
      await prisma.certificate.create({
        data: {
          eventId: ndcEvent.id,
          attendeeId: attendee.id,
          certCode: `CERT-NDC-${1000 + i}`,
          recipientName: item.name,
          issueDate: new Date(),
          isVerified: true,
        },
      });
    }

    // Add Reviews from verified attendees
    if (item.checkedIn && i % 2 === 0) {
      const reviewTexts = [
        "Extraordinary conference! The distributed systems track was packed with pure real-world engineering insights.",
        "Hands down the best tech summit in Jakarta. The QR scan check-in was lightning fast and sessions started on time.",
        "Brilliant speakers and high quality discussions without marketing pitches. Will definitely attend again next year!",
        "Great organization and seamless mobile ticketing experience. Loved the VIP lounge and networking dinner.",
      ];
      await prisma.review.create({
        data: {
          eventId: ndcEvent.id,
          attendeeId: attendee.id,
          rating: 5,
          feedback: reviewTexts[i % reviewTexts.length],
          sentiment: "Positive",
          isPublic: true,
        },
      });
    }
  }

  // 5. Create 14 Additional Realistic Events
  console.log("Creating 14 other realistic events across categories...");
  const otherEventsData = [
    {
      org: org2,
      cat: categories[1],
      title: "Asia Product & UX Summit 2026",
      slug: "asia-product-ux-summit-2026",
      summary: "Gathering 800+ product designers and UX researchers shaping the next wave of Asian digital experiences.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
      city: "Bandung",
      venueName: "Savoy Homann Grand Ballroom",
      price: 200000,
      days: 35,
    },
    {
      org: org3,
      cat: categories[2],
      title: "Cyber Defense & Threat Intel Conclave 2026",
      slug: "cyber-defense-summit-2026",
      summary: "National defensive cybersecurity and ransomware threat containment forum for financial & enterprise infrastructure.",
      format: "HYBRID",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80",
      city: "Jakarta Selatan",
      venueName: "The Ritz-Carlton Pacific Place",
      price: 450000,
      days: 42,
    },
    {
      org: org4,
      cat: categories[3],
      title: "Southeast Asia Venture Conclave 2026",
      slug: "sea-venture-conclave-2026",
      summary: "Private summit for 200+ General Partners, Angel Investors, and Series A/B tech startup founders.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80",
      city: "Bali",
      venueName: "The Westin Resort Nusa Dua",
      price: 1250000,
      days: 60,
    },
    {
      org: org1,
      cat: categories[4],
      title: "Fullstack Next.js & AI Agent Masterclass",
      slug: "nextjs-ai-masterclass-2026",
      summary: "Intensive 2-day live hands-on workshop building production agentic fullstack SaaS applications.",
      format: "ONLINE",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
      city: "Online",
      venueName: "Zoom Interactive Lab",
      price: 99000,
      days: 14,
    },
    {
      org: org5,
      cat: categories[5],
      title: "Jakarta Indie Beats & Electronic Live 2026",
      slug: "jakarta-indie-beats-2026",
      summary: "Open-air electronic synth-wave, ambient jazz, and digital art showcase across 3 outdoor stages.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
      city: "Jakarta Utara",
      venueName: "Taman Impian Jaya Ancol",
      price: 175000,
      days: 50,
    },
    {
      org: org1,
      cat: categories[0],
      title: "Jakarta AI & LLM Engineering Summit",
      slug: "jakarta-ai-summit-2026",
      summary: "Southeast Asia's focused symposium on inference optimization, fine-tuning, and compound AI systems.",
      format: "HYBRID",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1000&auto=format&fit=crop&q=80",
      city: "Jakarta Pusat",
      venueName: "Pullman Hotel Thamrin",
      price: 350000,
      days: 28,
    },
    {
      org: org2,
      cat: categories[1],
      title: "Design Systems & Micro-Interactions Expo",
      slug: "design-systems-expo-2026",
      summary: "Deep technical craft on tokens, accessible UI components, motion physics, and cross-platform synchronization.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
      city: "Yogyakarta",
      venueName: "Royal Ambarrukmo Yogyakarta",
      price: 180000,
      days: 45,
    },
    {
      org: org1,
      cat: categories[0],
      title: "Cloud Native & Kubernetes Days Indonesia",
      slug: "kubernetes-days-indonesia-2026",
      summary: "Community gathering for platform engineers, service mesh operators, and bare-metal cluster admins.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1000&auto=format&fit=crop&q=80",
      city: "Surabaya",
      venueName: "Grand City Convention Hall",
      price: 150000,
      days: 70,
    },
    {
      org: org4,
      cat: categories[3],
      title: "Fintech Growth & Regulatory Sandbox Forum",
      slug: "fintech-growth-forum-2026",
      summary: "Cross-industry dialogue on open banking APIs, cross-border payments, and digital asset security.",
      format: "HYBRID",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&auto=format&fit=crop&q=80",
      city: "Jakarta Pusat",
      venueName: "Sheraton Grand Gandaria",
      price: 500000,
      days: 80,
    },
    {
      org: org1,
      cat: categories[4],
      title: "Rust for High-Frequency Distributed Services",
      slug: "rust-high-frequency-workshop-2026",
      summary: "Hands-on code lab exploring async Tokio, lock-free queues, memory safety, and IPC serialization.",
      format: "ONLINE",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1000&auto=format&fit=crop&q=80",
      city: "Online",
      venueName: "Google Meet Interactive",
      price: 120000,
      days: 20,
    },
    {
      org: org2,
      cat: categories[1],
      title: "Spatial Computing & VisionOS Design Workshop",
      slug: "spatial-computing-workshop-2026",
      summary: "Designing ergonomic 3D spatial user interfaces, immersion depths, and gestures for next-gen headsets.",
      format: "PHYSICAL",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1000&auto=format&fit=crop&q=80",
      city: "Jakarta Selatan",
      venueName: "Block71 Innovation Hub",
      price: 250000,
      days: 90,
    },
    {
      org: org1,
      cat: categories[0],
      title: "Postgres Deep Internals & Sharding Summit",
      slug: "postgres-internals-summit-2026",
      summary: "Query planner optimization, WAL replication tuning, and multi-terabyte table maintenance strategies.",
      format: "ONLINE",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1000&auto=format&fit=crop&q=80",
      city: "Online",
      venueName: "YouTube Live Interactive",
      price: 0,
      days: 10,
    },
    {
      org: org3,
      cat: categories[2],
      title: "Automated Incident Response & SOC Operations",
      slug: "automated-soc-operations-2026",
      summary: "Hands-on purple teaming, SIEM correlation rule engineering, and real-time playbook automation.",
      format: "HYBRID",
      status: "PUBLISHED",
      cover: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
      city: "Tangerang",
      venueName: "ICE BSD City Hall 5",
      price: 300000,
      days: 100,
    },
    {
      org: org1,
      cat: categories[0],
      title: "Golang High Throughput Microservices Bootcamp",
      slug: "golang-microservices-bootcamp-2026",
      summary: "Mastering goroutines, sync pools, gRPC unary/streaming, and graceful shutdown patterns in Go.",
      format: "ONLINE",
      status: "DRAFT",
      cover: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&auto=format&fit=crop&q=80",
      city: "Online",
      venueName: "Zoom Webinar",
      price: 150000,
      days: 120,
    },
  ];

  for (const ev of otherEventsData) {
    const startDate = new Date(Date.now() + ev.days * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000);

    const createdEvent = await prisma.event.create({
      data: {
        orgId: ev.org.id,
        title: ev.title,
        slug: ev.slug,
        summary: ev.summary,
        description: `### About ${ev.title}\n\nJoin industry leaders and practitioners for an intensive session focused on ${ev.summary}.\n\n#### Key Takeaways:\n- Real-world production case studies\n- Interactive Q&A with domain experts\n- Full access to presentation materials and recordings.`,
        categoryId: ev.cat.id,
        format: ev.format,
        status: ev.status,
        coverImage: ev.cover,
        thumbnail: ev.cover,
        startDate,
        endDate,
        timezone: "Asia/Jakarta",
        regStart: new Date(),
        regEnd: startDate,
        capacity: 500,
        featured: ev.days < 40,
        isPublic: true,
      },
    });

    await prisma.venue.create({
      data: {
        eventId: createdEvent.id,
        name: ev.venueName,
        address: `${ev.venueName}, ${ev.city}`,
        city: ev.city,
        country: "Indonesia",
        meetingUrl: ev.format !== "PHYSICAL" ? "https://eventra.io/live/stream" : null,
      },
    });

    // Create 2 ticket tiers for each event
    const tReg = await prisma.ticketType.create({
      data: {
        eventId: createdEvent.id,
        name: ev.price === 0 ? "Free General Pass" : "General Admission",
        description: "Full access to the live event, presentations, and digital recordings.",
        price: ev.price,
        quota: 200,
        soldCount: Math.floor(Math.random() * 80) + 20,
        perksJson: JSON.stringify(["Full Event Access", "Certificate of Attendance", "Presentation Slides"]),
      },
    });

    if (ev.price > 0) {
      await prisma.ticketType.create({
        data: {
          eventId: createdEvent.id,
          name: "VIP + 1-on-1 Mentorship",
          description: "Priority front seats plus 30-minute 1-on-1 private mentoring with keynote speakers.",
          price: ev.price * 2,
          quota: 50,
          soldCount: Math.floor(Math.random() * 20) + 5,
          perksJson: JSON.stringify(["Priority Seating", "1-on-1 Speaker Mentoring", "VIP Networking Lounge"]),
        },
      });
    }

    // Add 1 speaker
    await prisma.speaker.create({
      data: {
        eventId: createdEvent.id,
        name: "Ir. Dian Pratama, M.Sc.",
        role: "Principal Tech Lead",
        company: ev.org.name,
        bio: `Leading practitioner and researcher at ${ev.org.name} with deep domain expertise.`,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        sortOrder: 1,
      },
    });

    // Add 1 coupon
    await prisma.coupon.create({
      data: {
        eventId: createdEvent.id,
        code: "EVENTRA10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minPurchase: 50000,
        quota: 100,
        usedCount: 5,
        isActive: true,
      },
    });
  }

  // 6. Audit Logs
  console.log("Creating audit logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        orgId: org1.id,
        eventId: ndcEvent.id,
        userId: organizer.id,
        userName: "Wildan Organizer",
        userRole: "ORGANIZER",
        action: "PUBLISHED_EVENT",
        entity: "Event",
        entityId: ndcEvent.id,
        details: "Published Nusantara Developer Conference 2026 to public directory",
        ipAddress: "127.0.0.1",
      },
      {
        orgId: org1.id,
        eventId: ndcEvent.id,
        userId: staff.id,
        userName: "Budi Santoso",
        userRole: "STAFF",
        action: "CHECKIN_ATTENDEE",
        entity: "Ticket",
        entityId: "EVT-2026-VIP-8F72A1",
        details: "Scanned and verified VIP ticket for Siti Rahma at Kemayoran Turnstile A",
        ipAddress: "127.0.0.1",
      },
    ],
  });

  // 7. System Notifications
  console.log("Creating notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: organizer.id,
        title: "Ticket Quota Milestone Reached",
        message: "Early Bird passes for Nusantara Developer Conference 2026 are 95% sold out!",
        type: "TICKET",
        isRead: false,
        link: `/organizer/events/${ndcEvent.id}/tickets`,
      },
      {
        userId: organizer.id,
        title: "New 5-Star Review Received",
        message: "Siti Rahma submitted a 5-star review for Nusantara Developer Conference.",
        type: "SYSTEM",
        isRead: true,
        link: `/organizer/events/${ndcEvent.id}/reviews`,
      },
      {
        userId: attendeeUser.id,
        title: "Ticket Confirmation & QR Code",
        message: "Your ticket for Nusantara Developer Conference 2026 is confirmed. QR Code is ready.",
        type: "TICKET",
        isRead: false,
        link: `/attendee/tickets`,
      },
    ],
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
