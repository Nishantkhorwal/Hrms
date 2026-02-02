import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { changeAssetStatus, getAssetReport, getAssets, issueAsset, registerAsset } from '../controllers/assetController.js';

const router = express.Router();

router.get('/get', authenticateUser, getAssets);
router.post('/create', authenticateUser, registerAsset);
router.put('/:id/issue', authenticateUser, issueAsset);
router.patch('/:id/status', authenticateUser, changeAssetStatus);
router.get("/:id/report", authenticateUser, getAssetReport);


export default router;