//import { json } from "body-parser";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//     log: ['query', 'info', 'warn', 'error'],
//   });

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

prisma.$use(async (params, next) => {
    // Check incoming query type
    // console.log("param.model -  "+params.model+ "    params.action -"+params.action);
    //console.log("param.agrs - " +params.args['data']);
    if (params.model == 'Post') {
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update'
        params.args['data'] = { deleted: true }
      }
      
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany'
        if (params.args.data != undefined) {
          params.args.data['deleted'] = true
        } else {
          params.args['data'] = { deleted: true }
        }
      }
    }
    // console.log("********************************");
    // console.log("param.model -    "+params.model+ "     params.action -"+params.action);
    //console.log("param.agrs -" +params.args.data);
    return next(params)
  })

  prisma.$use(async (params, next) => {
    if (params.model == 'Post') {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change to findFirst - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'findFirst'
        // Add 'deleted' filter
        // ID filter maintained
        params.args.where['deleted'] = false
      }
      if (params.action === 'findMany') {
        // Find many queries
        if (params.args.where) {
          if (params.args.where.deleted == undefined) {
            // Exclude deleted records if they have not been explicitly requested
            params.args.where['deleted'] = false
          }
        } else {
          params.args['where'] = { deleted: false }
        }
      }
    }
    return next(params)
  });


  prisma.$use(async (params, next) => {
    if (params.model == 'Post') {
      if (params.action == 'update') {
        // Change to updateMany - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'updateMany'
        // Add 'deleted' filter
        // ID filter maintained
        params.args.where['deleted'] = false
      }
      if (params.action == 'updateMany') {
        if (params.args.where != undefined) {
          params.args.where['deleted'] = false
        } else {
          params.args['where'] = { deleted: false }
        }
      }
    }
    return next(params)
  });


export const getPost = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.post.findMany({
            // include:{         //To retrieve Auther information
            //     author :true
            // }
            // where :{     // to retrieve based on condition
            //     deleted : true,
            //     id : 2
            // }
            
            where:{
                deleted : false
            }
        });
        res.json({ users });
    } catch (error) {
        console.log("Error in getting post data");
        throw error;
    }
}

export const createPost = async (req: Request, res: Response) => {
    //res.send("create request called");

    try {
        const postInformation = req.body;
        console.log(postInformation);
        const post = await prisma.post.create({
            data: {
                title: postInformation.title,
                authorId: postInformation.authorId
            },
        });
        //console.log(user);
        res.json({ post });
    } catch (error) {
        console.log("Error in Creating Post");
        throw error;
    }
};


export const updatePost = async (req: Request, res: Response) => {
    //res.send("update request .....");
    try {
        const id = +req.params["id"];
        const updateInformation = req.body;
        const post = await prisma.post.update({
            where: {
                id: id,
            },
            data: {
                title: updateInformation.title,
                authorId: updateInformation.authorId
            },
        });
        res.json({ post });
    } catch (error) {
        //   console.log("Error in updated Post");
        //   throw error;
        res.json({ "Message": "Error in Updating post" });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    //res.send("delete request .....");
    try {
        const id = +req.params["id"];
        const post = await prisma.post.delete({
            where: {
                id: id,
            },

        });
        res.json({ post });
    } catch (error) { }
};