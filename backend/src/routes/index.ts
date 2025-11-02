import { Router } from 'express';
import { archiveRouter } from '../modules/archive/archive.routes';
import { attributesRouter } from '../modules/attributes/attributes.routes';
import { decreesRouter } from '../modules/decrees/decrees.routes';
import { personnelRouter } from '../modules/personnel/personnel.routes';
import { reportsRouter } from '../modules/reports/reports.routes';
import { rulesRouter } from '../modules/rules/rules.routes';
import { seedRouter } from '../modules/seed/seed.routes';

const apiRouter = Router();

apiRouter.use('/rules', rulesRouter);
apiRouter.use('/attributes', attributesRouter);
apiRouter.use('/personnel', personnelRouter);
apiRouter.use('/decrees', decreesRouter);
apiRouter.use('/archive', archiveRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/seed', seedRouter);

export { apiRouter };
