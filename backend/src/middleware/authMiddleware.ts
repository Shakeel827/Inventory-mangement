import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebaseAdmin";

export interface AuthUser {
  uid: string;
  orgId: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const decoded = await auth.verifyIdToken(token);

    const orgId = (decoded as any).orgId as string | undefined;
    const role = (decoded as any).role as string | undefined;

    if (!orgId || !role) {
      return res.status(403).json({ error: "Missing org or role claims" });
    }

    req.user = { uid: decoded.uid, orgId, role };
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("authMiddleware error", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (!roles.includes(req.user.role) && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

