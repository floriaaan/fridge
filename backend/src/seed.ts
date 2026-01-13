import { db } from "./infrastructure/database";
import { product, user } from "./infrastructure/database/schema";

async function seed() {
  console.log("Seeding database...");

  const testUser = await db
    .insert(user)
    .values({
      id: "test-user-id",
      name: "Test User",
      email: "testuser@example.com",
    })
    .returning();

  await db.insert(product).values({
    userId: testUser[0].id,
    name: "Test Product",
    quantity: 1,
    unit: "piece",
    location: "fridge",
    category: "dairy",
  });

  console.log("Database seeded successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
