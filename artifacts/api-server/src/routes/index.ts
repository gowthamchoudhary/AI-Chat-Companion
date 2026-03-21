import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import searchRouter from "./search.js";
import agentTokenRouter from "./agent-token.js";
import verdictRouter from "./verdict.js";
import scrapeRouter from "./scrape.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(agentTokenRouter);
router.use(verdictRouter);
router.use(scrapeRouter);

export default router;
