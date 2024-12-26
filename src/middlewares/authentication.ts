import jwt from 'jsonwebtoken';
import { Request, Response,NextFunction } from "express";

//todo later
interface User {
  role: string;
  // Add other properties from JWT payload if needed
}

export const authenticate = (req: Request, res: Response, next: NextFunction):any => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized',success:false });
  const secret=process.env.SECRET_KEY;
  if(!secret) return res.status(500).json({ message: 'internal server error',success:false });
  jwt.verify(token, secret, (err, decoded: any) => {
    console.log('klkklkl',err)
    if (err) return res.status(403).json({ error: 'Forbidden' });
    // (req as any).user = decoded as User;
    (req as any).user = decoded;
    next();
  });
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction):any => {
  if ((req as any).user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin role required',success:false });
  }
  next();
};