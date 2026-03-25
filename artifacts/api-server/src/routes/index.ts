import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import patientsRouter from "./patients.js";
import eemmRouter from "./eemm.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(eemmRouter);

export default router;
