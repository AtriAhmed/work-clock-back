import { Router } from 'express';
import workLogController from '../../controllers/workLogController';

const router = Router();

// Matches with "/api/workLog"
router
  .route('/')
  // GET "/api/workLog"
   .get(workLogController.getDayWorkLog)
  // POST "/api/workLog" Example Request: { "vals": ["test_workLog", "111111", 1] }
  .post(workLogController.createWorkLog); // create a new workLog

// Matches with "/api/workLog/:id"
router
  .route('/:id')
  // GET "/api/workLog/:id"
 // .get(workLogController.getworkLogById)  get workLog data by ID
  // PUT "/api/workLog/:id" Example Request: { "vals": ["test_workLog", "111111", 1] }
 // .put(workLogController.updateworkLogById)  update a workLog by ID
  // DELETE "/api/workLog/:id"
 // .delete(workLogController.deleteworkLogById);  delete a workLog by ID

 router
 .route("/status")
 .get(workLogController.getWorkClockStatus)

  module.exports = router;
