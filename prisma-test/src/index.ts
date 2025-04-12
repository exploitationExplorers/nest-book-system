import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

// async function main() {
//     await prisma.user.create({
//         data: {
//             name: 'Alice',
//             email: '111@alice.com'
//         }
//     })
//     await prisma.user.create({
//         data: {
//             name: 'dong',
//             email: '222@dong.com'
//         }
//     });
//     const users = await prisma.user.findMany();
//     console.log(users);
// }

//main()

// async function main2() {
//     const user = await prisma.user.create({
//         data: {
//             name: '东东东',
//             email: 'dongdong@dong.com',
//             posts: {
//                 create: [
//                     {
//                         title: 'aaa',
//                         content: 'aaaa'
//                     },
//                     {
//                         title: 'bbb',
//                         content: 'bbbb'
//                     }
//                 ]
//             },
//         },
//     })
//     console.log(user)
// }

// main2()

async function main3() {
//   await prisma.post.update({
//     where: {
//       id: 1,
//     },
//     data: {
//       content: "xxx",
//     },
//   });
 await prisma.post.delete({
    where: {
        id: 1
    }
 })
}
main3();