import "dotenv/config";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import prisma from "../utils/Prisma.js";

faker.seed(2025);

const ROLE_PASSWORDS = {
  ADMIN: "Admin@123",
  STUDENT: "Student@123",
  MESS: "Mess@123",
  INTERNET: "Internet@123",
  CLEANING: "Cleaning@123",
  WATER: "Water@123",
  TRANSPORT: "Transport@123",
};

const COMPLAINT_DOMAINS = ["MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];
const COMPLAINT_STATUSES = [
  "CREATED",
  "REVIEWED",
  "ASSIGNED",
  "WORK_IN_PROGRESS",
  "RESOLVED",
];
const NOTIFICATION_TYPES = ["ALERT", "UPDATE", "ANNOUNCEMENT"];

const STUDENT_EMAIL_DOMAINS = [
  "aurora-hostel.in",
  "zephyr-campus.in",
  "lumen-hall.edu",
  "solstice-residence.in",
  "evergreen-hostel.org",
  "cascade-housing.in",
  "summit-dorms.edu",
  "harbor-hall.in",
  "meadow-residence.org",
  "crescent-housing.in",
  "willow-haven.edu",
  "ember-hostel.in",
  "banyan-campus.org",
  "oasis-housing.in",
  "nebula-dorms.edu",
  "driftwood-hall.in",
  "lotus-residence.org",
  "quartz-hostel.in",
  "radial-campus.edu",
  "vista-residence.in",
];

const STAFF_USERS = [
  {
    name: "Aanya Kapoor",
    email: "admin@samadhaan.in",
    role: "ADMIN",
  },
  {
    name: "Mohan Kulkarni",
    email: "mess.lead@mess.samadhaan.in",
    role: "MESS",
  },
  {
    name: "Ira Menon",
    email: "net.manager@internet.samadhaan.in",
    role: "INTERNET",
  },
  {
    name: "Charu Bedi",
    email: "clean.ops@cleaning.samadhaan.in",
    role: "CLEANING",
  },
  {
    name: "Waseem Qureshi",
    email: "water.lead@utility.samadhaan.in",
    role: "WATER",
  },
  {
    name: "Tanvi Raman",
    email: "transport.lead@transport.samadhaan.in",
    role: "TRANSPORT",
  },
  {
    name: "Raghav Sharma",
    email: "warden@residence.samadhaan.in",
    role: "ADMIN",
  },
  {
    name: "Priya Iyer",
    email: "operations@samadhaan.in",
    role: "ADMIN",
  },
];

const STUDENT_COUNT = STUDENT_EMAIL_DOMAINS.length; // 20 unique domains

const hashCache = new Map();

const hashPasswordForRole = async (role) => {
  if (hashCache.has(role)) {
    return hashCache.get(role);
  }
  const password = ROLE_PASSWORDS[role] ?? ROLE_PASSWORDS.STUDENT;
  const hashed = await bcrypt.hash(password, 10);
  hashCache.set(role, hashed);
  return hashed;
};

const generateStudentUsers = () => {
  return STUDENT_EMAIL_DOMAINS.map((domain, index) => ({
    name: faker.person.fullName(),
    email: `student${String(index + 1).padStart(2, "0")}@${domain}`,
    role: "STUDENT",
  }));
};

const cleanDatabase = async () => {
  await prisma.$transaction([
    prisma.response.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

const createUsers = async () => {
  const studentTemplates = generateStudentUsers();
  const allTemplates = [...STAFF_USERS, ...studentTemplates];
  const createdUsers = [];

  for (const template of allTemplates) {
    const hashedPassword = await hashPasswordForRole(template.role);
    const user = await prisma.user.create({
      data: {
        name: template.name,
        email: template.email.toLowerCase(),
        password: hashedPassword,
        role: template.role,
        status: "ACTIVE",
      },
    });
    createdUsers.push(user);
  }

  return createdUsers;
};

const createComplaints = async (students, targetCount = 120) => {
  const complaints = [];
  for (let i = 0; i < targetCount; i += 1) {
    const complainer = faker.helpers.arrayElement(students);
    const domain = faker.helpers.arrayElement(COMPLAINT_DOMAINS);
    const complaint = await prisma.complaint.create({
      data: {
        subject: faker.lorem.sentence(faker.number.int({ min: 6, max: 12 })),
        description: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 3 }), "\n\n"),
        domain,
        status: faker.helpers.arrayElement(COMPLAINT_STATUSES),
        anonymous: faker.datatype.boolean({ probability: 0.2 }),
        mediaLink: faker.helpers.maybe(
          () => faker.image.urlLoremFlickr({ category: "interior" }),
          { probability: 0.18 }
        ),
        complainerId: complainer.id,
      },
    });
    complaints.push(complaint);
  }
  return complaints;
};

const createResponses = async ({ complaints, staff }, targetCount = 520) => {
  const responses = [];
  for (let i = 0; i < targetCount; i += 1) {
    const complaint = faker.helpers.arrayElement(complaints);
    const responder = faker.helpers.arrayElement(staff);
    const response = await prisma.response.create({
      data: {
        complaintId: complaint.id,
        responderId: responder.id,
  content: faker.lorem.paragraph(faker.number.int({ min: 1, max: 3 })),
        mediaLink: faker.helpers.maybe(
          () => faker.image.urlLoremFlickr({ category: "business" }),
          { probability: 0.1 }
        ),
        isVisible: faker.datatype.boolean({ probability: 0.9 }),
      },
    });
    responses.push(response);
  }
  return responses;
};

const createNotifications = async (users, targetCount = 60) => {
  const notifications = [];
  for (let i = 0; i < targetCount; i += 1) {
    const audience = faker.helpers.arrayElement(users);
    const notification = await prisma.notification.create({
      data: {
        userId: audience.id,
  title: faker.lorem.sentence(faker.number.int({ min: 4, max: 8 })),
  description: faker.lorem.paragraph(faker.number.int({ min: 1, max: 2 })),
        type: faker.helpers.arrayElement(NOTIFICATION_TYPES),
        domain: faker.helpers.maybe(() => faker.helpers.arrayElement(COMPLAINT_DOMAINS), {
          probability: 0.5,
        }),
        mediaLink: faker.helpers.maybe(
          () => faker.image.urlLoremFlickr({ category: "city" }),
          { probability: 0.1 }
        ),
      },
    });
    notifications.push(notification);
  }
  return notifications;
};

const main = async () => {
  console.info("\n🌱  Starting Samadhaan database seeding...");
  await cleanDatabase();
  console.info("✅ Cleared existing data");

  const users = await createUsers();
  const students = users.filter((user) => user.role === "STUDENT");
  const staff = users.filter((user) => user.role !== "STUDENT");
  console.info(`👥 Created ${users.length} users (${students.length} students, ${staff.length} staff)`);

  const complaints = await createComplaints(students);
  console.info(`🧾 Created ${complaints.length} complaints`);

  const responses = await createResponses({ complaints, staff });
  console.info(`💬 Created ${responses.length} responses`);

  const notifications = await createNotifications(users);
  console.info(`🔔 Created ${notifications.length} notifications`);

  console.info("\nSeeding complete. Happy debugging! ✨\n");
};

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
