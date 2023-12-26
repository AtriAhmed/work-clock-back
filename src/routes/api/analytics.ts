import express, { Router } from 'express';
import analyticsController from '../../controllers/analyticsController';

const router: Router = express.Router();

router.get('/months-avg-work-hours', analyticsController.getMonthsAvgWorkHours);

router.get('/weekdays-avg-work-hours', analyticsController.getWeekdaysAvgWorkHours);

router.get('/months-leave-requests-status', analyticsController.getMonthsLeaveRequestsStatus);

router.get('/months-leave-requests', analyticsController.getMonthsLeaveRequests);

router.get('/salaries-sum', analyticsController.getSalariesSum);

router.get('/motivation-and-reduction', analyticsController.getMotivationAndReduction);
export = router;
