import { Customers, Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import { AuthenticatedUser, CheckPassword, generateAccessToken, HashPassword, isAuthenticated } from './helpers/JwtHelper';
import { CustomerToString } from './helpers/Serializers';
import { AuthMiddleware } from './middleware/AuthMiddleware';

export const prisma = new PrismaClient()
const app = express()

app.use(express.json())

export interface sendOtp {phoneNumber:string,apiKey:string}

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
app.post('/api/sendOtp', AuthMiddleware, async(req, res) => {

  const code = Math.random() * (999999 - 100000) + 100000;
  const {phoneNumber,apiKey}:sendOtp = req.body

  

  // get the api key 
  const apiKeyId = await prisma.api_keys.findFirst({where:{Key: apiKey}})
  // get operator  by checking the phone number format
  let tempPhone  = phoneNumber.includes("213") ? phoneNumber.split('213')[1].charAt(0) : phoneNumber.charAt(1)
  let operatorString:string  = "Ooredoo"; 
  switch (tempPhone) {
      case "6": operatorString = "Mobilis"; break;
      case "7": operatorString = "Djezzy"; break;
      default: operatorString ="Ooredoo"; break;

  }
  
  let operator = await prisma.operators.findFirst({ where: { name: operatorString } })
  if(operator != null) {

    // getting the minimum price for the operator 
    let minPrice = await prisma.operators_otp_providers.aggregate({
      _min:{
        base_price:true
      },where:{
        operator_id:operator.id
      }
    })
    // getting the provider that has the min price
    let perfectProvider =await  prisma.operators_otp_providers.findFirst({
      where:{base_price: minPrice._min.base_price!}
    })

    let otpExpiration = new Date()
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 15)

  // get the operation id 

    const operation  = await prisma.operations.findFirst({where:{name:"SEND_SMS",AND:{
      otp_provider_id:perfectProvider?.otp_provider_id
    }},})
    const result = await prisma.api_calls.create({
      data: {
        id:1  ,                    
        api_key_id:apiKeyId?.id   ?? 0    ,       
        operator_otp_provider_id:perfectProvider?.id ?? 0 , 
        call_date :new Date(),              
        operation_id   :operation?.id ?? 0 ,          
        phone_number :phoneNumber    ,        
        otp            :code.toString(),          
        otp_validity  : otpExpiration  ,         
        cost            :perfectProvider?.base_price ?? 0,       
        Api_keys           :undefined,
             
        Operations       :undefined,        
        Operators_otp_providers:undefined,
      }
     
    })

    // simulate the call to be added 

    res.json({ "success": true, "message": "OTP Sent successfully" })
  }



})



const server = app.listen(3000, () => {

  
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);


}
)