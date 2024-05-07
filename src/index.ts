import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import { CheckPassword, generateAccessToken, HashPassword } from './helpers/JwtHelper';

const prisma = new PrismaClient()
const app = express()

app.use(express.json())


app.post(`/api/signup`, async (req, res) => {



  const { name, email, password } = req.body

  const HashedPassword =  HashPassword(password);
  const user = await prisma.user.findFirst({ where: { email: email } });

  if (!user) {

    const result = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: HashedPassword,

      },
    })
    res.json({ "success": true, "message": "User created successfully" })
  } else {
    res.status(401).json({ "error": "Error creating user email already exists" })

  }
})

app.post(`/api/signin`, async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findFirst({ where: { email: email } });
  const errorResponse = { "error": "Wrong email or password" };
  if (user) {
    const passwordCorrect  =  CheckPassword(password, user.password);
    if (!passwordCorrect) {
      res.status(401).json(errorResponse);

    } else {
      const token = generateAccessToken(user.email);
      res.json({
        name: user.name,
        email: user.email,
        token: token
      })
    }
  } else {
    res.status(401).json(errorResponse);

  }

})






app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})



const server = app.listen(3000, () => {

  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);


}
)