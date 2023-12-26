import { Router, Request, Response } from 'express';

const router = Router();

// Matches with "api/logout"
router.route('/').get((req: any, res:Response) => {
  req.session.destroy((err:any) => {
    if (err) {
      console.log(err);
    }
    res.status(200).json({
      user: {
        accessId: 0,
        type: 'visitor',
        _id: 0,
        username: '',
      },
    });
  });
  req.logout();
});

module.exports = router;
