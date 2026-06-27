import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("m.q.kettaneh2003", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "m.q.kettaneh@gmail.com",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Created admin user:", user);

  // Seed default settings
  const defaultSettings = [
    { key: "email", value: "m.q.kettaneh@gmail.com" },
    { key: "phone", value: "+962777777777" },
    { key: "whatsapp", value: "+962777777777" },
    { key: "locationAr", value: "عمان، الأردن" },
    { key: "locationEn", value: "Amman, Jordan" },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seeded default settings");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
