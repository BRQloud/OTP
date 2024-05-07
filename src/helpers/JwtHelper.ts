import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';

export const generateAccessToken = (email: string, expiresIn = "1d"):string => {
    dotenv.config();
    const Secret = process.env.TOKEN_SECRET;
    return jwt.sign({ email: email }, Secret?.toString() ?? "", {
        expiresIn: "1d",
    });
}
export const HashPassword =  (password: string):string  => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
     
    

}
export const CheckPassword =  (password: string,hashedPassword: string) : Boolean => {
 
    const result =  bcrypt.compareSync(password, hashedPassword);
    return result;
}