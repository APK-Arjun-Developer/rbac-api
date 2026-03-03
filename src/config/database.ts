import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

db.$connect()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// export const db = basePrisma.$extends({
//   query: {
//     $allModels: {
//       async findMany({ args, query }) {
//         args.where = {
//           deletedAt: null,
//           ...args.where,
//         };
//         return query(args);
//       },

//       async findFirst({ args, query }) {
//         args.where = {
//           deletedAt: null,
//           ...args.where,
//         };
//         return query(args);
//       },

//       async findUnique({ model, args }) {
//         return (basePrisma as any)[model].findFirst({
//           where: {
//             ...args.where,
//             deletedAt: null,
//           },
//         });
//       },

//       async delete({ model, args }) {
//         return (basePrisma as any)[model].update({
//           where: args.where,
//           data: { deletedAt: new Date() },
//         });
//       },

//       async deleteMany({ model, args }) {
//         return (basePrisma as any)[model].updateMany({
//           where: args.where,
//           data: { deletedAt: new Date() },
//         });
//       },
//     },
//   },
// });

export { db };
