import fs from "node:fs";
import path from "node:path";
import { db } from "../../src/config/database.ts";

async function runSeeds() {
  const seedsDir = path.join(__dirname);

  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.match(/^\d+_.*\.ts$/))
    .sort();

  for (const file of files) {
    const filePath = path.join(seedsDir, file);

    const [version, ...nameParts] = file.replace(".ts", "").split("_");

    const name = nameParts.join("_");

    const alreadyExecuted = await db.seedHistory.findUnique({
      where: { version },
    });

    if (alreadyExecuted) {
      console.log(`Skipping seed ${file}`);
      continue;
    }

    console.log(`Running seed ${file}`);

    const seedModule = await import(filePath);

    await db.$transaction(async (tx) => {
      await seedModule.default(tx);

      await tx.seedHistory.create({
        data: { version, name },
      });
    });

    console.log(`Completed seed ${file}`);
  }
}

runSeeds()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
