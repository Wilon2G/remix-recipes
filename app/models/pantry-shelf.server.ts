import { Prisma } from "@prisma/client";
import db from "~/db.server";
import { handleDelete } from "./utils";

export function getAllShelves(query: string | null) {
  return db.pantryShelf.findMany({
    where: {
      name: {
        contains: query ?? "",
        mode: "insensitive",
      },
    },
    include: {
      items: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy:{
      createdAt:"desc"
    }
  });
}


export function createShelf(){
  return db.pantryShelf.create({
    data:{
      name:"New Shelf",
    }
  })
}

export function deleteShelf(id:string){
  return handleDelete(()=>db.pantryShelf.delete({
    where:{
      id,
    }
  }));
  
}

export async function saveShelfName(shelfId:string,shelfName:string){
  try{
    const updated = await db.pantryShelf.update({
      where:{
        id:shelfId,
      },
      data:{
        name: shelfName
      }
    });
    return updated;
  } catch(error){
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code==="P2025") {
        return error.message;
      }
    }
    throw error;
  }
  
}

