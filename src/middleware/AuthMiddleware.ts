import { NextFunction,Response,Request } from "express";
import { isAuthenticated } from "../helpers/JwtHelper";


export function AuthMiddleware(req: Request, res:  Response, next: NextFunction): void {
    const bearerToken = req.headers["authorization"] 
    if(typeof bearerToken  !== "undefined"){
        try {
            const bearer = bearerToken?.split(" ") ?? ["",""]
            if(!isAuthenticated(bearer[1])){
                res.sendStatus(403);

            }else{

                next();
            }
            
        } catch (error) {
        res.sendStatus(403);
            
        }
    }else{
        res.sendStatus(403);
    }
  }