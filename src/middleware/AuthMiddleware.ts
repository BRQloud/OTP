import { NextFunction, Response, Request } from "express";
import { isAuthenticated } from "../helpers/JwtHelper";
import { prisma } from "..";


export function AuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const bearerToken = req.headers["authorization"]
    if (typeof bearerToken !== "undefined") {
        try {
            const bearer = bearerToken?.split(" ") ?? ["", ""]
            if (!isAuthenticated(bearer[1])) {
                res.sendStatus(403);

            } else {

                next();
            }

        } catch (error) {
            res.sendStatus(403);

        }
    } else {
        res.sendStatus(403);
    }
}

export async function ApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = req.headers["key"] as string

    try {
        if (typeof key !== "undefined") {

            const apiKey = await prisma.api_keys.findFirst({ where: { Key: key } })

            if (apiKey == null || new Date() > apiKey.valide_untill) {
                res.sendStatus(403);

            } else {

                next();
            }

        }
        else {
            res.sendStatus(403);
        }
    }
    catch (error) {
        res.sendStatus(403);

    }
}
