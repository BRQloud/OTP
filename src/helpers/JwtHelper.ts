import dotenv from "dotenv";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import * as bcrypt from 'bcrypt';
import { Customers } from "@prisma/client";
import { prisma } from "..";

export const generateAccessToken = (customer: String, expiresIn = "1d"):string => {
    dotenv.config();
    const Secret = process.env.TOKEN_SECRET as Secret;
    return jwt.sign({customer:customer}, Secret , {
        expiresIn: "1d",
    });
}
export const isAuthenticated = (token: string):boolean => {
    const Secret:Secret = process.env.TOKEN_SECRET ?? "";
    try{

        const result : JwtPayload = jwt.verify(token,Secret) as JwtPayload;
        return Date.now() / 1000 < (result.exp ?? 0)
    }catch(e){
        return false;
      
    }
}
export const AuthenticatedUser = (token:string):Customers| undefined   => {
    if(isAuthenticated(token)){
        const Secret:Secret = process.env.TOKEN_SECRET ?? "";
        const payload : JwtPayload = jwt.verify(token,Secret) as JwtPayload;
        return JSON.parse(payload.customer) as Customers;
        
    }
    return undefined;
}
export const HashPassword =  (password: string):string  => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
     
    

}
export const CheckPassword =  (password: string,hashedPassword: string) : Boolean => {
 
    const result =  bcrypt.compareSync(password, hashedPassword);
    return result;
}