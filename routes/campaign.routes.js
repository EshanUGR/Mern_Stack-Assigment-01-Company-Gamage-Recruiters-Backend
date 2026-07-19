import express from "express";
import {
  createCampaignLead,
  getCampaignLeads,
  sendInviteEmail,
  downloadCampaignPdf,
  getCampaignWhatsAppMessage,
  deleteCampaignLead,
} from "../Controllers/campaign.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Get all leads with filtering (verifyToken ensures only logged-in users see leads)
router.get("/", verifyToken, getCampaignLeads);

// Register a new lead from the field
router.post("/register", verifyToken, createCampaignLead);

// Send the modern invite and toggle the status
router.post("/send-invite", verifyToken, sendInviteEmail);

// Download the modern PDF for a specific campaign customer
router.get("/:id/pdf", verifyToken, downloadCampaignPdf);

// Get a pre-filled WhatsApp message and link for a specific customer
router.get("/:id/whatsapp", verifyToken, getCampaignWhatsAppMessage);

// Delete lead
router.delete("/:id", verifyToken, deleteCampaignLead);

export default router;
