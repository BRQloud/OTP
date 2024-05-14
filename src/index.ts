import { Customers, Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import { AuthenticatedUser, CheckPassword, generateAccessToken, HashPassword, isAuthenticated } from './helpers/JwtHelper';
import { CustomerToString } from './helpers/Serializers';
import { AuthMiddleware } from './middleware/AuthMiddleware';

export const prisma = new PrismaClient()
const app = express()

app.use(express.json())


app.post(`/api/signup`, async (req, res) => {



  const { name, email, password , company_name,nif,rc,} = req.body

  const HashedPassword =  HashPassword(password);
  const user = await prisma.customers.findFirst({ where: { email: email } });

  if (!user) {

    const result = await prisma.customers.create({
      data: {
        name: name,
        email: email,
        password: HashedPassword,
        company_name:company_name,
        nif  :nif,
        rc:rc,
        balance:0,
      },
    })
    res.json({ "success": true, "message": "User created successfully" })
  } else {
    res.status(401).json({ "error": "Error creating user email already exists" })

  }
})

app.post(`/api/signin`, async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.customers.findFirst({ where: { email: email } }) as Customers;
  const errorResponse = { "error": "Wrong email or password" };
  if (user) {
    const passwordCorrect  =  CheckPassword(password, user.password);
    if (!passwordCorrect) {
      res.status(401).json(errorResponse);

    } else {
      const token = generateAccessToken(CustomerToString(user));

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






app.get('/api/customers', AuthMiddleware ,async (req, res) => {
  res.json("test")
  // const users = await prisma.customers.findMany()
  // res.json(users)
})



const server = app.listen(3000, () => {

  
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);


}
)