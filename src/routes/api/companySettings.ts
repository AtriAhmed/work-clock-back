import express, { Router } from 'express';
import companySettingsController from '../../controllers/companySettingsController';

const router: Router = express.Router();

router.get('/', companySettingsController.getAllCompanySettings);
router.get('/holidays', companySettingsController.getAllHolidays);
router.get('/:id', companySettingsController.getCompanySettingsById);
router.post('/', companySettingsController.createCompanySettings);
router.post('/holidays', companySettingsController.createHoliday);
router.put('/:id', companySettingsController.updateCompanySettings);
router.delete('/:id', companySettingsController.deleteCompanySettings);

export = router;
