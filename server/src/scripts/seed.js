import "dotenv/config";
import bcrypt from "bcryptjs";
import { Faker, en, en_IN } from "@faker-js/faker";
import prisma from "../utils/Prisma.js";

const faker = new Faker({ locale: [en_IN, en] });
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
  { name: "Aanya Kapoor", email: "admin@samadhaan.in", role: "ADMIN" },
  { name: "Raghav Sharma", email: "warden@samadhaan.in", role: "ADMIN" },
  { name: "Priya Iyer", email: "ops@samadhaan.in", role: "ADMIN" },
  { name: "Mohan Kulkarni", email: "mess@samadhaan.in", role: "MESS" },
  { name: "Ira Menon", email: "internet@samadhaan.in", role: "INTERNET" },
  { name: "Charu Bedi", email: "cleaning@samadhaan.in", role: "CLEANING" },
  { name: "Waseem Qureshi", email: "water@samadhaan.in", role: "WATER" },
  { name: "Tanvi Raman", email: "transport@samadhaan.in", role: "TRANSPORT" },
];

const BLOCKS = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "E1", "F1", "G1"];
const TIME_WINDOWS = [
  "before dinner",
  "before breakfast",
  "during the afternoon",
  "before the weekend",
  "by tomorrow evening",
  "within the next inspection round",
];

const COMPLAINT_SUBJECTS = {
  MESS: [
    "Mess food is arriving cold",
    "Breakfast portions feel inadequate",
    "Dining hall hygiene needs attention",
    "Utensils not cleaned properly",
  ],
  INTERNET: [
    "Wi-Fi disconnects repeatedly",
    "Slow internet in study hall",
    "LAN port not working",
    "Router downtime in west wing",
  ],
  CLEANING: [
    "Hallway cleaning skipped",
    "Garbage pickup delayed",
    "Washroom sanitation is poor",
    "Common room smells damp",
  ],
  WATER: [
    "Hot water not available",
    "Low water pressure on fourth floor",
    "Drinking water tastes metallic",
    "Frequent leakage near stairwell",
  ],
  TRANSPORT: [
    "Morning shuttle arrived late",
    "Evening bus skipped Block D",
    "Insufficient weekend buses",
    "Driver refused to stop at library gate",
  ],
};

const COMPLAINT_DETAILS = {
  MESS: [
    "the rice is being served completely cold for the second week in a row",
    "breakfast counters run out within fifteen minutes",
    "floors stay greasy even after cleaning",
    "disposable plates are not stocked despite request",
  ],
  INTERNET: [
    "students cannot stay connected to video lectures",
    "upload speeds drop below 1 Mbps every evening",
    "access points reboot randomly",
    "the ethernet room has blinking red indicators",
  ],
  CLEANING: [
    "the staircase smells due to stagnant water",
    "dustbins on each floor overflow by noon",
    "washrooms miss the deep-clean slot",
    "the pantry sink clogs every alternate day",
  ],
  WATER: [
    "geyser switches trip during peak hours",
    "storage tank refills only once a day",
    "tap water carries visible sediments",
    "leaks are damaging corridor paint",
  ],
  TRANSPORT: [
    "students miss classes because the shuttle is 20 minutes late",
    "seat capacity is insufficient during exam weeks",
    "drivers skip mandatory attendance list",
    "the drop-off point changes without notice",
  ],
};

const RESPONSE_ACTIONS = {
  MESS: [
    "The catering vendor has been asked to reheat and test every batch before service",
    "Quality control will stay back for surprise inspections this week",
  ],
  INTERNET: [
    "The network team is replacing faulty switches tonight",
    "A backup router is being configured for the affected block",
  ],
  CLEANING: [
    "Housekeeping leads have doubled the cleaning roster",
    "A deep-clean crew is scheduled for the shared areas",
  ],
  WATER: [
    "Maintenance engineers are flushing the pipelines",
    "Pressure valves are being recalibrated block by block",
  ],
  TRANSPORT: [
    "Additional shuttles are being deployed for the morning run",
    "Drivers received strict instructions about published stops",
  ],
};

const RESPONSE_CLOSERS = [
  "We will post an update in the notice board once resolved.",
  "Thank you for your patience while we close this.",
  "Please keep sharing evidence if the issue persists.",
  "Residents can reach the duty phone for urgent escalation.",
];

const NOTIFICATION_TITLES = [
  "Maintenance schedule update",
  "Water supply advisory",
  "Shuttle timing notice",
  "Cleaning drive announcement",
  "Mess special menu update",
];

const NOTIFICATION_BODIES = [
  "Please note the preventive maintenance planned for this weekend.",
  "Carry your own bottles as refill stations will be serviced.",
  "Shuttle timing adjusted due to city marathon.",
  "All residents are invited to join the cleanliness drive.",
  "Menu will include regional dishes based on student feedback.",
];

const generateComplaintSubject = (domain) => {
  const base = faker.helpers.arrayElement(COMPLAINT_SUBJECTS[domain]);
  const block = faker.helpers.arrayElement(BLOCKS);
  return `${base} near Block ${block}`;
};

const generateComplaintDescription = (domain) => {
  const detail = faker.helpers.arrayElement(COMPLAINT_DETAILS[domain]);
  const block = faker.helpers.arrayElement(BLOCKS);
  const timeWindow = faker.helpers.arrayElement(TIME_WINDOWS);
  return `Residents from Block ${block} report that ${detail}. Kindly inspect ${timeWindow} to avoid escalation.`;
};

const generateResponseContent = (domain) => {
  const opener = faker.helpers.arrayElement([
    "Thanks for flagging this concern.",
    "We appreciate the detailed report.",
    "Your complaint has been logged with high priority.",
  ]);
  const action = faker.helpers.arrayElement(RESPONSE_ACTIONS[domain]);
  const closer = faker.helpers.arrayElement(RESPONSE_CLOSERS);
  return `${opener} ${action} ${closer}`;
};

const generateNotificationTitle = () => faker.helpers.arrayElement(NOTIFICATION_TITLES);
const generateNotificationDescription = () => faker.helpers.arrayElement(NOTIFICATION_BODIES);

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
        subject: generateComplaintSubject(domain),
        description: generateComplaintDescription(domain),
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
        content: generateResponseContent(complaint.domain),
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
        title: generateNotificationTitle(),
        description: generateNotificationDescription(),
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
