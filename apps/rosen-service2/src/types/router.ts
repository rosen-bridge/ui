import { Router } from 'express';

export interface PathRouter {
  path: string;
  router: Router;
}
