import { Campaign } from "../models/Campaign.model.js";
import { readFileSync } from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const productItems = [
  "Surgical Gloves",
  "Disposable Gloves",
  "Cotton Gloves",
  "Rubber Coated Glove",
  "Rubber Gloves",
  "Gloves (All Types)",
  "Safety Aprons",
  "Disposable Caps",
  "Shoe Covers",
  "Safety Masks",
  "Surgical Masks",
  "Safety Shoe",
  "Boots & Gumboots",
  "Overall",
  "Raincoats",
  "Apron",
  "Rubber Bands (All Sizes)",
  "Cello Tapes",
  "Safety Earmuffs & Plugs",
  "Steel-Toe Safety Shoes",
  "Safety Goggles & Shields",
];

const companyInfo = {
  name: "Akila Suppliers",
  tagline: "Sri Lanka's Trusted Safety & Industrial Partner",
  website: "https://akilasuppliers.netlify.app/",
  businessLocationUrl: "https://share.google/oG5eonqrJUHeHU9aA",
  whatsapp: "https://wa.me/94767399304",
  phone: "+94767399304",
  phoneDisplay: "076 739 9304",
  location: "Hanwella, Sri Lanka",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadCompanyLogo = () => {
  try {
    const logoPath = path.resolve(
      __dirname,
      "../../client/src/images/logo.png",
    );
    const logoBuffer = readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    return null;
  }
};

const companyLogo = loadCompanyLogo();

const addWrappedText = (doc, text, x, y, width, lineHeight = 14) => {
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const buildWhatsAppMessage = (leadName) =>
  `Hello ${leadName},\n\n` +
  `${companyInfo.name} - ${companyInfo.tagline}\n\n` +
  `We warmly welcome you to a long-term partnership with Akila Suppliers.\n` +
  `We value strong customer interaction, clear communication, and reliable wholesale support.\n` +
  `Our modern product catalogue is prepared for businesses that want a trusted supply partner.\n\n` +
  `Featured items:\n` +
  productItems.map((item) => `• ${item}`).join("\n") +
  `\n\n` +
  `Island-wide delivery available across Sri Lanka.\n` +
  `Website: ${companyInfo.website}\n` +
  `WhatsApp: ${companyInfo.phoneDisplay}\n\n` +
  `We look forward to building a trusted, long-term business partnership with you.`;

const normalizeWhatsAppNumber = (phone = "") => {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;

  return digits;
};

const buildWhatsAppLink = (phone, message) => {
  const normalizedPhone = normalizeWhatsAppNumber(phone);

  if (!normalizedPhone) return companyInfo.whatsapp;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

const getCampaignPayload = async (req) => {
  const { email, name, id } = req.body;

  if (id) {
    const campaign = await Campaign.findById(id);

    if (campaign) {
      return campaign;
    }
  }

  return {
    _id: id,
    name,
    email,
    contactNo: req.body.contactNo || "",
    province: req.body.province || "",
    district: req.body.district || "",
    city: req.body.city || "",
    businessType: req.body.businessType || "",
  };
};

const createCampaignPdfBuffer = (lead) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 145, "F");
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 145, pageWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  if (companyLogo) {
    doc.addImage(companyLogo, "PNG", margin, 24, 58, 58);
    doc.text(companyInfo.name, margin + 72, 52);
  } else {
    doc.text(companyInfo.name, margin, 52);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(companyInfo.tagline, margin + (companyLogo ? 72 : 0), 74);

  doc.setFontSize(10);
  doc.text(
    `Prepared for: ${lead.name || "Valued Customer"}`,
    margin + (companyLogo ? 72 : 0),
    100,
  );
  doc.text(
    `Contact: ${lead.contactNo || "N/A"}`,
    margin + (companyLogo ? 72 : 0),
    116,
  );

  const badgeX = pageWidth - 176;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, 34, 136, 30, 12, 12, "F");
  doc.setTextColor(26, 35, 126);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("New Partnership Invite", badgeX + 14, 53);

  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Welcome to a New Partnership", margin, 185);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const introEndY = addWrappedText(
    doc,
    "We warmly welcome you and are pleased to introduce our modern safety and industrial essentials for wholesale customers. We believe in strong customer interaction, reliable service, and long-term business growth.",
    margin,
    205,
    pageWidth - margin * 2,
    15,
  );

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(
    margin,
    introEndY + 8,
    pageWidth - margin * 2,
    86,
    14,
    14,
    "F",
  );
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Why partner with us?", margin + 14, introEndY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "• Friendly customer interaction and quick response",
    margin + 18,
    introEndY + 46,
  );
  doc.text(
    "• Trusted wholesale supply with quality-assured products",
    margin + 18,
    introEndY + 62,
  );
  doc.text(
    "• Island-wide delivery and long-term business support",
    margin + 18,
    introEndY + 78,
  );

  autoTable(doc, {
    startY: introEndY + 114,
    head: [["#", "Item"]],
    body: productItems.map((item, index) => [String(index + 1), item]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 8,
      textColor: [33, 37, 41],
      lineColor: [225, 229, 234],
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 40, halign: "center" },
      1: { cellWidth: "auto" },
    },
  });

  const footerY = doc.lastAutoTable.finalY + 28;
  let footerStartY = footerY;

  if (footerStartY > 560) {
    doc.addPage();
    footerStartY = 72;
  }

  if (companyLogo) {
    doc.addImage(companyLogo, "PNG", margin, footerStartY - 6, 34, 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(26, 35, 126);
    doc.text(companyInfo.name, margin + 44, footerStartY + 16);
  }

  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Contact & Ordering", margin, footerStartY + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Website: ${companyInfo.website}`, margin, footerStartY + 52);
  doc.text(`WhatsApp: ${companyInfo.phoneDisplay}`, margin, footerStartY + 68);
  doc.text(
    `Business Location: ${companyInfo.businessLocationUrl}`,
    margin,
    footerStartY + 84,
  );
  doc.text(
    "Island-wide delivery available across Sri Lanka.",
    margin,
    footerStartY + 100,
  );
  doc.text(`Location: ${companyInfo.location}`, margin, footerStartY + 116);

  doc.setFillColor(241, 243, 249);
  doc.roundedRect(
    margin,
    footerStartY + 132,
    pageWidth - margin * 2,
    42,
    14,
    14,
    "F",
  );
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "Modern wholesale support with a customer-first approach.",
    margin + 14,
    footerStartY + 157,
  );

  return Buffer.from(doc.output("arraybuffer"));
};

const buildCampaignAssets = (lead) => {
  const message = buildWhatsAppMessage(lead.name || "Customer");
  const pdfBuffer = createCampaignPdfBuffer(lead);
  const whatsappLink = buildWhatsAppLink(lead.contactNo, message);

  return {
    message,
    pdfBuffer,
    whatsappLink,
  };
};

// FETCH ALL LEADS WITH FILTERING & SEARCH
export const getCampaignLeads = async (req, res) => {
  try {
    const { province, district, businessType, search } = req.query;
    let query = {};

    if (province) query.province = province;
    if (district) query.district = district;
    if (businessType) query.businessType = businessType;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { contactNo: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Campaign.find(query).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch leads", error: error.message });
  }
};

// REGISTER NEW CAMPAIGN CUSTOMER
export const createCampaignLead = async (req, res) => {
  try {
    const newLead = new Campaign(req.body);
    await newLead.save();
    res
      .status(201)
      .json({ message: "Customer registered successfully!", lead: newLead });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

// SEND FULLY UPDATED CAMPAIGN EMAIL
export const sendInviteEmail = async (req, res) => {
  const lead = await getCampaignPayload(req);
  const { pdfBuffer, whatsappLink } = buildCampaignAssets(lead);
  const email = lead.email || req.body.email;
  const name = lead.name || req.body.name || "Customer";

  if (!email) {
    return res.status(400).json({ message: "Customer email is required" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Akila Suppliers" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Akila Suppliers New Partnership Invite for ${name}`,
    attachments: [
      {
        filename: `Akila_Suppliers_${name.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Customer"}.pdf`,
        content: pdfBuffer,
      },
    ],
    html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 25px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #1a237e; padding: 45px 20px; text-align: center; color: white;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 76px; height: 76px; border-radius: 18px; background: rgba(255,255,255,0.12); margin-bottom: 14px; overflow: hidden;">
            <img src="${companyLogo || "https://placehold.co/80x80/ffffff/1a237e?text=A"}" alt="Akila Suppliers Logo" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
                <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px; text-transform: uppercase;">Akila Suppliers</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 16px;">Sri Lanka's Trusted Safety & Industrial Partner</p>
            </div>
            
            <div style="padding: 35px; color: #333; line-height: 1.8;">
                <h2 style="color: #1a237e; margin-top: 0;">Warm welcome ${name},</h2>
          <p>We warmly welcome you to a long-term partnership with Akila Suppliers. We value strong customer relationships and are delighted to introduce our modern safety and industrial product range for your business.</p>
                <p style="background: #eef6ff; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 12px; font-weight: 700; color: #1e3a8a;">Island-wide delivery available across Sri Lanka.</p>
                <p style="margin: 0 0 18px 0; font-weight: 700; color: #111827;">WhatsApp us on 076 739 9304 for quick support and orders.</p>
          <p style="margin: 0 0 18px 0; color: #374151;">Our team is ready to support your business with fast communication, trusted supply, and friendly customer service.</p>
                    <p style="margin: 0 0 18px 0; color: #374151;">Business location: <a href="${companyInfo.businessLocationUrl}" style="color: #1a237e; font-weight: 700; text-decoration: none;">${companyInfo.businessLocationUrl}</a></p>
                
                <p style="font-weight: bold; color: #1a237e; border-bottom: 2px solid #f1f3f9; padding-bottom: 10px;">Featured Product Catalogue:</p>
                <div style="background: #f8fafc; border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <ul style="padding-left: 20px; margin: 0; columns: 2; -webkit-columns: 2;">
                        <li style="margin-bottom: 8px;"><b>Surgical Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Disposable Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Cotton Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Rubber Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Gloves (All Types)</b></li>
                        <li style="margin-bottom: 8px;"><b>Safety Aprons</b></li>
                        <li style="margin-bottom: 8px;"><b>Disposable Caps</b></li>
                        <li style="margin-bottom: 8px;"><b>Shoe Covers</b></li>
                        <li style="margin-bottom: 8px;"><b>Safety Masks</b></li>
                        <li style="margin-bottom: 8px;"><b>Surgical Masks</b></li>
                        <li style="margin-bottom: 8px;"><b>Hair Nets</b></li>
                        <li style="margin-bottom: 8px;"><b>Boots & Gumboots</b></li>
                        <li style="margin-bottom: 8px;"><b>Overall</b></li>
                        <li style="margin-bottom: 8px;"><b>Raincoats</b></li>
                        <li style="margin-bottom: 8px;"><b>Rubber Bands (All Sizes)</b></li>
                        <li style="margin-bottom: 8px;"><b>Cello Tapes</b></li>
                        <li style="margin-bottom: 8px;"><b>Safety Earmuffs & Plugs</b></li>
                        <li style="margin-bottom: 8px;"><b>Steel-Toe Safety Shoes</b></li>
                        <li style="margin-bottom: 8px;"><b> Safety Goggles & Shields</b></li>
                       
                       
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 16px; color: #fb8c00; font-weight: bold;">Premium wholesale support and reliable supply</p>
                    <p>Contact us to explore wholesale pricing. Let’s build a long-term and profitable partnership together.</p>
                  <p style="margin-top: 18px;">
                    <a href="https://wa.me/94767399304" style="display: inline-block; background: #25d366; color: white; padding: 14px 26px; text-decoration: none; border-radius: 12px; font-weight: bold;">Send on WhatsApp</a>
                  </p>
                </div>

                <div style="text-align: center; border-top: 1px solid #f1f1f1; padding-top: 30px;">
                    <p style="margin-bottom: 20px;">
                        <a href="https://akilasuppliers.netlify.app/" style="display: inline-block; background: #1a237e; color: white; padding: 14px 40px; text-decoration: none; border-radius: 12px; font-weight: bold;">Explore Our Website</a>
                    </p>
                    
                    <div style="display: inline-block; width: 100%; margin-top: 10px;">
                        <div style="margin-bottom: 15px;">
                            <span style="display: block; font-size: 12px; color: #777; text-transform: uppercase; font-weight: bold;">Quick Support via WhatsApp</span>
                          <a href="https://wa.me/94767399304" style="color: #25d366; font-size: 18px; font-weight: bold; text-decoration: none;">💬 076 739 9304</a>
                        </div>
                        <div>
                            <span style="display: block; font-size: 12px; color: #777; text-transform: uppercase; font-weight: bold;">Direct Sales Office</span>
                          <a href="tel:+94767399304" style="color: #dc2626; font-size: 18px; font-weight: bold; text-decoration: none;">📞 076 739 9304</a>
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: #f1f3f9; padding: 25px; text-align: center; font-size: 12px; color: #666;">
                <p style="margin: 0; font-weight: bold;">Akila Suppliers</p>
                <p style="margin: 5px 0;"> Hanwella, Sri Lanka</p>
                <p style="margin: 10px 0 0 0;">© 2026 Akila Suppliers. All rights reserved.</p>
            </div>
        </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    if (lead._id) {
      await Campaign.findByIdAndUpdate(lead._id, { detailsSent: true });
    }

    res.status(200).json({
      message: "Welcome invite sent successfully!",
      whatsappLink,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Email delivery failed", error: error.message });
  }
};

// DOWNLOAD CAMPAIGN PDF
export const downloadCampaignPdf = async (req, res) => {
  try {
    const lead = await Campaign.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Campaign customer not found" });
    }

    const pdfBuffer = createCampaignPdfBuffer(lead);
    const safeName = (lead.name || "Customer")
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "");
    const fileName = `Akila_Suppliers_${safeName || "Customer"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "PDF generation failed", error: error.message });
  }
};

// GET PRE-FILLED WHATSAPP MESSAGE
export const getCampaignWhatsAppMessage = async (req, res) => {
  try {
    const lead = await Campaign.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Campaign customer not found" });
    }

    const { message, whatsappLink } = buildCampaignAssets(lead);

    res.status(200).json({
      message,
      whatsappLink,
      customer: {
        name: lead.name,
        contactNo: lead.contactNo,
        email: lead.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "WhatsApp message generation failed",
      error: error.message,
    });
  }
};

// DELETE LEAD
export const deleteCampaignLead = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Lead removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
