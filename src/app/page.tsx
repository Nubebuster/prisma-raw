import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import styles from "./index.module.css";

async function seedData() {
  const exists = await db.user.findFirst();
  if (!exists)
    await db.user.createMany({
      data: [
        { name: "Alice", recentZIPCode: "12345", bookingCount: 5 },
        { name: "Bob", recentZIPCode: "67890", bookingCount: 3 },
        { name: "Charlie", recentZIPCode: "54321", bookingCount: 7 },
      ],
    });
}

async function testDynamicQuery() {
  const bookingCount = "4";
  const zipCodeLike = ["12%", "67%"];
  const nameLike = ["A%", "B%"];

  const conditions = [];
  const params = [];

  if (bookingCount !== undefined) {
    conditions.push(`bookingCount > ?`);
    params.push(bookingCount);
  }

  if (Array.isArray(zipCodeLike) && zipCodeLike.length > 0) {
    const zipConditions = zipCodeLike
      .map(() => `recentZIPCode LIKE ?`)
      .join(" OR ");
    conditions.push(`(${zipConditions})`);
    params.push(...zipCodeLike);
  }

  if (Array.isArray(nameLike) && nameLike.length > 0) {
    const nameConditions = nameLike.map(() => `name LIKE ?`).join(" OR ");
    conditions.push(`(${nameConditions})`);
    params.push(...nameLike);
  }

  let whereClause = "";
  if (conditions.length > 0) {
    whereClause = ` WHERE ${conditions.join(" AND ")}`;
  }

  const query = Prisma.sql([`SELECT * FROM "User"${whereClause}`, ...params]);

  try {
    const results = await db.$queryRaw(query);
    console.log(results);
  } catch (error) {
    console.error("Error executing query:", error);
  }
}

async function main() {
  await seedData();
  await testDynamicQuery();
}

export default async function Home() {
  try {
    await main();
  } catch (e) {
    console.error(e);

    return (
      <main className={styles.main}>
        <div className={styles.container}></div>
        <h1 className={styles.title}>ERROR</h1>

        <div>
          <p
            style={{
              color: "white",
              textAlign: "center",
              width: "100%",
            }}
          >
            {(e as Error).message}
            <br />
            {(e as Error).stack}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Success!!!</h1>
      </div>
    </main>
  );
}
