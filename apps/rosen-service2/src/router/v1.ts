import { Router } from 'express';

import { PathRouter } from '../types';

const router = Router();

const routes: PathRouter[] = [
  // Add any path router pairs here
];

routes.forEach((route) => router.use(route.path, route.router));

export default router;
