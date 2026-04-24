import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import {
  autoFetchCustomerLeadsFromGooglePlaces,
  autoFetchSupplierLeadsFromGooglePlaces,
  bulkImportSupplierLeads,
  createSupplierLead,
  deleteSupplierLead,
  getLeadDistrictSummary,
  getSupplierLeadById,
  getSupplierLeads,
  markLeadCalled,
  markLeadMessageSent,
  removeDuplicateSupplierLeads,
  updateSupplierLead,
} from "../Controllers/supplierLead.controller.js";

const router = express.Router();

router.post("/", verifyToken, createSupplierLead);
router.post("/bulk-import", verifyToken, bulkImportSupplierLeads);
router.post("/remove-duplicates", verifyToken, removeDuplicateSupplierLeads);
router.post(
  "/auto-fetch/google-places",
  verifyToken,
  autoFetchSupplierLeadsFromGooglePlaces,
);
router.post(
  "/auto-fetch/google-places/customers",
  verifyToken,
  autoFetchCustomerLeadsFromGooglePlaces,
);
router.patch("/:id/mark-message-sent", verifyToken, markLeadMessageSent);
router.patch("/:id/mark-called", verifyToken, markLeadCalled);
router.get("/district-summary/all", verifyToken, getLeadDistrictSummary);
router.get("/", verifyToken, getSupplierLeads);
router.get("/:id", verifyToken, getSupplierLeadById);
router.put("/:id", verifyToken, updateSupplierLead);
router.delete("/:id", verifyToken, deleteSupplierLead);

export default router;
