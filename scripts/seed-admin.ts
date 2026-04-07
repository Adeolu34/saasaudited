import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminUser from "../src/lib/models/AdminUser";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/saasverdict";

async function seedAdmin() {
  const email = process.argv[2] || "admin@saasaudited.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`Admin user "${email}" already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  await AdminUser.create({
    email,
    password_hash,
    name,
    role: "superadmin",
    is_active: true,
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ADMIN USER CREATED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     superadmin`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nChange the default password after first login!");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
