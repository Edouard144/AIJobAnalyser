// billing routes
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { billingController } from "./billing.controller";

const router = Router();

router.get("/", requireAuth, billingController.getBilling);
router.get("/invoices", requireAuth, billingController.getInvoices);
router.post("/upgrade", requireAuth, billingController.upgrade);

export default router;