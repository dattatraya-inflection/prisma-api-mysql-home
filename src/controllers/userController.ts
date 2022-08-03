//import { json } from "body-parser";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//////////Middleware//////////////////
prisma.$use(async (params, next) => {
  const before = Date.now()

  const result = await next(params)

  const after = Date.now()

  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)

  return result
})


export const getUser = async (_req: Request, res: Response) => {
  // try {
  //   const users = await prisma.user.findMany({
  //     include: {
  //       posts: true,
  //     },
  //   });
  //   res.json({ users });
  // } catch (error) {
  //   console.log("Error in getting user data");
  //   throw error;
  // }

  ////////////////////////////////////////////////// for blog 
  // try {
  //   const users = await prisma.blog.findMany({
  //     where: {
  //       content: {
  //         search:'cat',
  //       },
  //     },
  //   });
  //   res.json({ users });
  // } catch (error) {
  //   console.log("Error in getting user data");
  //   throw error;
  // }

  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          search: "Londhe",
        },
      },
    });
    res.json({ users });
  } catch (error) {
    console.log("Error in getting user data");
    throw error;
  }


};

export const createUser = async (req: Request, res: Response) => {
  //res.send("create request called");

  try {
    const userInformation = req.body;
    console.log(userInformation);
    const user = await prisma.user.create({
      data: {
        email: userInformation.email,
        name: userInformation.name,
      },
    });
    //console.log(user);
    res.json({ user });
  } catch (error) {
    console.log("Error in Creating user");
    throw error;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  //res.send("update request .....");
  try {
    const id = +req.params["id"];
    const updateInformation = req.body;
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        email: updateInformation.email,
        name: updateInformation.name,
      },
    });
    res.json({ user });
  } catch (error) {
    console.log("Error in updated user");
    throw error;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  //res.send("delete request .....");
  try {
    const id = +req.params["id"];
    const user = await prisma.user.delete({
      where: {
        id: id,
      },

      include: {
        posts: true,
      },
    });
    res.json({ user });
  } catch (error) { }
};
