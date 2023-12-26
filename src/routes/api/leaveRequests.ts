import express, { Router } from 'express';
import leaveRequestController from '../../controllers/leaveRequestController';

const router: Router = express.Router();

router.get('/', leaveRequestController.getAllLeaveRequests);
router.get('/user', leaveRequestController.getUserLeaveRequests);
router.get('/remaining/:id?', leaveRequestController.getRemainingLeaveDays);
router.get('/approuve/:id', leaveRequestController.approuveLeaveRequest);
router.get('/decline/:id', leaveRequestController.declineLeaveRequest);
router.get('/archive/:id', leaveRequestController.archiveLeaveRequest);
router.get('/:id', leaveRequestController.getLeaveRequestById);
router.post('/', leaveRequestController.createLeaveRequest);
router.put('/:id', leaveRequestController.updateLeaveRequest);
router.delete('/:id', leaveRequestController.archiveLeaveRequest);

export = router;
