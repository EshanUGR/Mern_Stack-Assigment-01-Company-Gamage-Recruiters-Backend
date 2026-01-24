import { Campaign } from "../models/Campaign.model.js";
import nodemailer from "nodemailer";

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
  const { email, name, id } = req.body;

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
    subject: `: Akila Suppliers Premium Safety Items & Industrial Supplies for ${name}`,
    html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 25px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #1a237e; padding: 45px 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px; text-transform: uppercase;">Akila Suppliers</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 16px;">Sri Lanka's Trusted Safety & Industrial Partner</p>
            </div>
            
            <div style="padding: 35px; color: #333; line-height: 1.8;">
                <h2 style="color: #1a237e; margin-top: 0;">Welcome ${name},</h2>
                <p>We are delighted to connect with you. As a leading supplier in the safety and industrial sector, we are looking for reliable partners like you to join our growing network.</p>
                
                <p style="font-weight: bold; color: #1a237e; border-bottom: 2px solid #f1f3f9; padding-bottom: 10px;">Our Complete Product Catalogue:</p>
                <div style="background: #f8fafc; border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <ul style="padding-left: 20px; margin: 0; columns: 2; -webkit-columns: 2;">
                        <li style="margin-bottom: 8px;"><b>Surgical Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Disposable Gloves</b></li>
                        <li style="margin-bottom: 8px;"><b>Gloves (All Types)</b></li>
                        <li style="margin-bottom: 8px;"><b>Safety Aprons</b></li>
                        <li style="margin-bottom: 8px;"><b>Disposable Caps</b></li>
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
                    <p style="font-size: 16px; color: #fb8c00; font-weight: bold;">⭐⭐⭐⭐⭐ High Quality & 5-Star Reviews</p>
                    <p>Contact us to know our wholesale prices. Let's build a profitable partnership!</p>
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
                            <a href="tel:+94717009059" style="color: #dc2626; font-size: 18px; font-weight: bold; text-decoration: none;">📞 076 739 9304</a>
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
    await Campaign.findByIdAndUpdate(id, { detailsSent: true });
    res.status(200).json({ message: "Welcome invite sent successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Email delivery failed", error: error.message });
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
