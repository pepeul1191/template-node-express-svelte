// web/routes.js
import { Router } from 'express';
import * as webController from './controllers.js';
import * as apis from './apis.js';
import { requireAuth } from '../configs/middlewares.js';
import { redirectIfAuthenticated } from '../configs/middlewares.js'; 


const router = Router();

router.get('/', requireAuth, webController.home);
router.get('/sign-in', redirectIfAuthenticated, webController.signIn);
router.get('/sign-out', requireAuth, webController.logout);
router.post('/sign-in', redirectIfAuthenticated, webController.login);
router.get('/reset-password', redirectIfAuthenticated, webController.resetPassword);
router.get('/sign-up', redirectIfAuthenticated, webController.signUp);
router.get('/api/v1/session', requireAuth, apis.sessionInfo); 

router.get('/flash-test', (req, res) => {
  req.flash('success', 'Flash funciona ✅');
  res.redirect('/sign-in');
});

export default router;
