import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function getShelves() {
  return [
    {
      name: "Dairy",
      items: {
        create: [{ name: "Milk" }, { name: "Eggs" }, { name: "Cheese" }],
      },
    },
    {
      name: "Fruits",
      items: {
        create: [{ name: "Apple" }, { name: "Orange" }],
      },
    },
  ];
}

async function seed() {
    await Promise.all(getShelves().map(shelf=>db.pantryShelf.create({data:shelf})));
}


seed();