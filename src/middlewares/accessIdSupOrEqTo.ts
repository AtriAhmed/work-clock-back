import { Response, NextFunction } from 'express';

export const accessIdSupOrEqualTo = (requiredAccessId: number) => {
  return (req: any, res: Response, next: NextFunction) => {

    const userAccessId = req.user && req.user.accessId;

    if (!req.isAuthenticated() || (userAccessId && userAccessId < requiredAccessId)) {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    next();
  };
};
