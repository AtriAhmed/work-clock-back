import express, { Router } from 'express';
import accessLevelController from '../../controllers/accessLevelController';

const router: Router = express.Router();

router.get('/', accessLevelController.getAllAccessLevels);
router.get('/:id', accessLevelController.getAccessLevelById);
router.post('/', accessLevelController.createAccessLevel);
router.put('/:id', accessLevelController.updateAccessLevel);
router.delete('/:id', accessLevelController.deleteAccessLevel);

export = router;
