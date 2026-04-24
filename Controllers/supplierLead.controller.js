import SupplierLead from "../models/SupplierLead.js";
import { errorHandler } from "../utils/error.js";
import axios from "axios";

const SRI_LANKA_DISTRICTS = [
  "ampara",
  "anuradhapura",
  "badulla",
  "batticaloa",
  "colombo",
  "galle",
  "gampaha",
  "hambantota",
  "jaffna",
  "kalutara",
  "kandy",
  "kegalle",
  "kilinochchi",
  "kurunegala",
  "mannar",
  "matale",
  "matara",
  "monaragala",
  "mullaitivu",
  "nuwara eliya",
  "polonnaruwa",
  "puttalam",
  "ratnapura",
  "trincomalee",
  "vavuniya",
];

const normalizePhone = (value = "") => {
  const clean = String(value).replace(/\s|-/g, "");
  if (!clean) return "";

  if (clean.startsWith("+94")) {
    return `+94${clean.slice(3).replace(/^0+/, "")}`;
  }

  if (clean.startsWith("94")) {
    return `+94${clean.slice(2).replace(/^0+/, "")}`;
  }

  if (clean.startsWith("0")) {
    return `+94${clean.slice(1)}`;
  }

  if (/^\d{9}$/.test(clean)) {
    return `+94${clean}`;
  }

  return clean;
};

const isLikelySriLankanNumber = (value = "") => {
  if (!value) return true;
  return /^\+94\d{9}$/.test(value);
};

const isValidDistrict = (district = "") => {
  return SRI_LANKA_DISTRICTS.includes(String(district).trim().toLowerCase());
};

const deriveCityFromAddress = (formattedAddress = "") => {
  if (!formattedAddress) return "";
  const parts = formattedAddress
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts[0] : "";
};

const extractFacebookPage = (website = "") => {
  if (!website) return "";
  return website.toLowerCase().includes("facebook.com") ? website : "";
};

const DEFAULT_CUSTOMER_SEGMENTS = [
  "construction company",
  "manufacturing company",
  "factory",
  "warehouse",
  "workshop",
  "industrial service",
];

export const createSupplierLead = async (req, res, next) => {
  try {
    const {
      businessName,
      contactName,
      phone,
      whatsappNumber,
      facebookName,
      facebookPage,
      district,
      city,
      productType,
      category,
      source,
      sourceUrl,
      notes,
      leadType,
      verifiedStatus,
      isBlocked,
    } = req.body;

    if (!businessName || !district || !productType) {
      return next(
        errorHandler(
          400,
          "businessName, district and productType are required",
        ),
      );
    }

    if (!isValidDistrict(district)) {
      return next(
        errorHandler(400, "District is invalid. Use a Sri Lanka district."),
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedWhatsapp = normalizePhone(whatsappNumber);

    if (
      !isLikelySriLankanNumber(normalizedPhone) ||
      !isLikelySriLankanNumber(normalizedWhatsapp)
    ) {
      return next(
        errorHandler(
          400,
          "Phone or WhatsApp number is not a valid Sri Lanka format",
        ),
      );
    }

    const duplicateFilter = {
      createdBy: req.user._id,
      businessName: businessName.trim(),
    };

    if (normalizedWhatsapp) {
      duplicateFilter.whatsappNumber = normalizedWhatsapp;
    }

    const existingLead = await SupplierLead.findOne(duplicateFilter);
    if (existingLead) {
      return next(errorHandler(409, "Duplicate supplier lead already exists"));
    }

    const lead = await SupplierLead.create({
      businessName,
      contactName,
      phone: normalizedPhone,
      whatsappNumber: normalizedWhatsapp,
      facebookName,
      facebookPage,
      district,
      city,
      productType,
      category,
      source,
      sourceUrl,
      notes,
      leadType,
      verifiedStatus,
      isBlocked,
      createdBy: req.user._id,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierLeads = async (req, res) => {
  try {
    const {
      search,
      district,
      productType,
      leadType,
      outreachStatus,
      called,
      messageSent,
      verifiedStatus,
      source,
      isBlocked,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {
      createdBy: req.user._id,
    };

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { facebookName: { $regex: search, $options: "i" } },
        { facebookPage: { $regex: search, $options: "i" } },
        { whatsappNumber: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (district) filter.district = district;
    if (productType) filter.productType = productType;
    if (leadType) filter.leadType = leadType;
    if (outreachStatus) filter.outreachStatus = outreachStatus;
    if (typeof called !== "undefined") filter.called = called === "true";
    if (typeof messageSent !== "undefined") {
      filter.messageSent = messageSent === "true";
    }
    if (verifiedStatus) filter.verifiedStatus = verifiedStatus;
    if (source) filter.source = source;
    if (typeof isBlocked !== "undefined")
      filter.isBlocked = isBlocked === "true";

    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const isUnlimited =
      String(limit).toLowerCase() === "all" || Number(limit) === 0;
    const limitNumber = isUnlimited
      ? null
      : Number(limit) > 0
        ? Number(limit)
        : 20;
    const skip = isUnlimited ? 0 : (pageNumber - 1) * limitNumber;
    const sortDirection = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

    const listQuery = SupplierLead.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip);

    if (!isUnlimited) {
      listQuery.limit(limitNumber);
    }

    const [leads, total] = await Promise.all([
      listQuery,
      SupplierLead.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page: pageNumber,
      limit: isUnlimited ? "all" : limitNumber,
      totalPages: isUnlimited ? 1 : Math.ceil(total / limitNumber),
      leads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierLeadById = async (req, res, next) => {
  try {
    const lead = await SupplierLead.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!lead) {
      return next(errorHandler(404, "Supplier lead not found"));
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplierLead = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (updates.district && !isValidDistrict(updates.district)) {
      return next(
        errorHandler(400, "District is invalid. Use a Sri Lanka district."),
      );
    }

    if (updates.phone) {
      updates.phone = normalizePhone(updates.phone);
      if (!isLikelySriLankanNumber(updates.phone)) {
        return next(
          errorHandler(400, "Phone number is not a valid Sri Lanka format"),
        );
      }
    }

    if (updates.whatsappNumber) {
      updates.whatsappNumber = normalizePhone(updates.whatsappNumber);
      if (!isLikelySriLankanNumber(updates.whatsappNumber)) {
        return next(
          errorHandler(400, "WhatsApp number is not a valid Sri Lanka format"),
        );
      }
    }

    const lead = await SupplierLead.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!lead) {
      return next(
        errorHandler(404, "Supplier lead not found or not authorized"),
      );
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markLeadMessageSent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const lead = await SupplierLead.findOne({
      _id: id,
      createdBy: req.user._id,
    });
    if (!lead) {
      return next(errorHandler(404, "Lead not found or not authorized"));
    }

    lead.messageSent = true;
    lead.messageSentAt = new Date();
    lead.contactAttempts += 1;
    lead.outreachStatus = lead.called ? "called" : "messaged";
    if (note) lead.contactNote = note;

    await lead.save();

    res.status(200).json({
      message: "Lead marked as message sent",
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markLeadCalled = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, closed } = req.body;

    const lead = await SupplierLead.findOne({
      _id: id,
      createdBy: req.user._id,
    });
    if (!lead) {
      return next(errorHandler(404, "Lead not found or not authorized"));
    }

    lead.called = true;
    lead.calledAt = new Date();
    lead.contactAttempts += 1;
    lead.outreachStatus = closed ? "closed" : "called";
    if (note) lead.contactNote = note;

    await lead.save();

    res.status(200).json({
      message: "Lead marked as called",
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeadDistrictSummary = async (req, res) => {
  try {
    const summary = await SupplierLead.aggregate([
      {
        $match: {
          createdBy: req.user._id,
        },
      },
      {
        $group: {
          _id: "$district",
          total: { $sum: 1 },
          customers: {
            $sum: {
              $cond: [{ $eq: ["$leadType", "customer"] }, 1, 0],
            },
          },
          suppliers: {
            $sum: {
              $cond: [{ $eq: ["$leadType", "supplier"] }, 1, 0],
            },
          },
          messaged: {
            $sum: {
              $cond: ["$messageSent", 1, 0],
            },
          },
          called: {
            $sum: {
              $cond: ["$called", 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          district: "$_id",
          total: 1,
          customers: 1,
          suppliers: 1,
          messaged: 1,
          called: 1,
        },
      },
      {
        $sort: { district: 1 },
      },
    ]);

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSupplierLead = async (req, res, next) => {
  try {
    const deleted = await SupplierLead.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!deleted) {
      return next(
        errorHandler(404, "Supplier lead not found or not authorized"),
      );
    }

    res.status(200).json({ message: "Supplier lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportSupplierLeads = async (req, res, next) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return next(errorHandler(400, "leads must be a non-empty array"));
    }

    const inserted = [];
    const skipped = [];

    for (const leadInput of leads) {
      const businessName = leadInput.businessName?.trim();
      const district = leadInput.district?.trim();
      const productType = leadInput.productType?.trim();
      const whatsappNumber = normalizePhone(leadInput.whatsappNumber || "");
      const phone = normalizePhone(leadInput.phone || "");

      if (!businessName || !district || !productType) {
        skipped.push({ lead: leadInput, reason: "Missing required fields" });
        continue;
      }

      if (!isValidDistrict(district)) {
        skipped.push({ lead: leadInput, reason: "Invalid Sri Lanka district" });
        continue;
      }

      if (
        !isLikelySriLankanNumber(phone) ||
        !isLikelySriLankanNumber(whatsappNumber)
      ) {
        skipped.push({
          lead: leadInput,
          reason: "Invalid Sri Lanka phone format",
        });
        continue;
      }

      const duplicateFilter = {
        createdBy: req.user._id,
        businessName,
      };

      if (whatsappNumber) {
        duplicateFilter.whatsappNumber = whatsappNumber;
      }

      const exists = await SupplierLead.findOne(duplicateFilter);
      if (exists) {
        skipped.push({ lead: leadInput, reason: "Duplicate lead" });
        continue;
      }

      const createdLead = await SupplierLead.create({
        ...leadInput,
        businessName,
        district,
        productType,
        phone,
        whatsappNumber,
        leadType: leadInput.leadType || "supplier",
        source: leadInput.source || "csv_import",
        createdBy: req.user._id,
      });

      inserted.push(createdLead);
    }

    res.status(201).json({
      importedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeDuplicateSupplierLeads = async (req, res) => {
  try {
    const leads = await SupplierLead.find({ createdBy: req.user._id }).sort({
      createdAt: 1,
    });

    const seen = new Set();
    const duplicateIds = [];

    for (const lead of leads) {
      const key = `${lead.businessName?.toLowerCase() || ""}|${lead.whatsappNumber || ""}`;
      if (seen.has(key)) {
        duplicateIds.push(lead._id);
      } else {
        seen.add(key);
      }
    }

    if (duplicateIds.length > 0) {
      await SupplierLead.deleteMany({
        _id: { $in: duplicateIds },
        createdBy: req.user._id,
      });
    }

    res.status(200).json({
      removedDuplicates: duplicateIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const autoFetchSupplierLeadsFromGooglePlaces = async (
  req,
  res,
  next,
) => {
  try {
    const {
      productType,
      productTypes,
      district,
      keyword = "supplier",
      maxResults = 20,
    } = req.body;

    const resolvedProductTypes = Array.isArray(productTypes)
      ? productTypes.map((value) => String(value || "").trim()).filter(Boolean)
      : typeof productTypes === "string"
        ? productTypes
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    if (!resolvedProductTypes.length && productType) {
      resolvedProductTypes.push(String(productType).trim());
    }

    if (!resolvedProductTypes.length || !district) {
      return next(
        errorHandler(
          400,
          "district and at least one product type are required",
        ),
      );
    }

    if (!isValidDistrict(district)) {
      return next(
        errorHandler(400, "District is invalid. Use a Sri Lanka district."),
      );
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return next(
        errorHandler(
          500,
          "GOOGLE_PLACES_API_KEY is missing. Add it in your server .env file.",
        ),
      );
    }

    const limit = Math.min(Math.max(Number(maxResults) || 20, 1), 40);

    const inserted = [];
    const skipped = [];
    const searches = [];
    let fetched = 0;

    for (const currentProductType of resolvedProductTypes) {
      const query = `${currentProductType} ${keyword} in ${district}, Sri Lanka`;

      const searchResponse = await axios.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        {
          params: {
            query,
            region: "lk",
            key: googleApiKey,
          },
        },
      );

      const searchStatus = searchResponse?.data?.status;
      if (searchStatus === "REQUEST_DENIED") {
        return next(
          errorHandler(
            400,
            searchResponse?.data?.error_message ||
              "Google Places request denied. Check API key and enabled APIs.",
          ),
        );
      }

      const results = (searchResponse?.data?.results || []).slice(0, limit);
      searches.push({
        query,
        productType: currentProductType,
        fetched: results.length,
      });
      fetched += results.length;

      for (const place of results) {
        try {
          const placeId = place.place_id;
          let details = null;

          if (placeId) {
            const detailsResponse = await axios.get(
              "https://maps.googleapis.com/maps/api/place/details/json",
              {
                params: {
                  place_id: placeId,
                  fields:
                    "name,formatted_phone_number,website,url,formatted_address",
                  key: googleApiKey,
                },
              },
            );

            details = detailsResponse?.data?.result || null;
          }

          const businessName = (details?.name || place.name || "").trim();
          if (!businessName) {
            skipped.push({
              placeId: placeId || null,
              productType: currentProductType,
              reason: "Missing business name",
            });
            continue;
          }

          const normalizedPhone = normalizePhone(
            details?.formatted_phone_number || "",
          );
          const safePhone = isLikelySriLankanNumber(normalizedPhone)
            ? normalizedPhone
            : "";

          const whatsappNumber = safePhone;
          const duplicateFilter = {
            createdBy: req.user._id,
            businessName,
          };

          if (whatsappNumber) {
            duplicateFilter.whatsappNumber = whatsappNumber;
          }

          const existingLead = await SupplierLead.findOne(duplicateFilter);
          if (existingLead) {
            skipped.push({
              businessName,
              productType: currentProductType,
              reason: "Duplicate lead",
            });
            continue;
          }

          const formattedAddress =
            details?.formatted_address || place.formatted_address || "";
          const city = deriveCityFromAddress(formattedAddress);
          const sourceUrl =
            details?.url ||
            `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId || "")}`;
          const facebookPage = extractFacebookPage(details?.website || "");

          const created = await SupplierLead.create({
            businessName,
            phone: safePhone,
            whatsappNumber,
            facebookName: facebookPage ? businessName : "",
            facebookPage,
            district,
            city,
            productType: currentProductType,
            category: keyword,
            leadType: "supplier",
            source: "google_places",
            sourceUrl,
            notes: "Auto-fetched from Google Places public data",
            verifiedStatus: "unverified",
            createdBy: req.user._id,
          });

          inserted.push(created);
        } catch (placeError) {
          skipped.push({
            placeId: place.place_id || null,
            businessName: place.name || "",
            productType: currentProductType,
            reason: placeError.message,
          });
        }
      }
    }

    res.status(201).json({
      district,
      productTypes: resolvedProductTypes,
      leadType: "supplier",
      searches,
      fetched,
      importedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const autoFetchCustomerLeadsFromGooglePlaces = async (
  req,
  res,
  next,
) => {
  try {
    const {
      productType,
      productTypes,
      district,
      customerSegments,
      customerNeeds,
      includeRawResults = true,
      maxResults = 10,
    } = req.body;

    const resolvedProductTypes = Array.isArray(productTypes)
      ? productTypes.map((value) => String(value || "").trim()).filter(Boolean)
      : typeof productTypes === "string"
        ? productTypes
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    if (!resolvedProductTypes.length && productType) {
      resolvedProductTypes.push(String(productType).trim());
    }

    if (!resolvedProductTypes.length || !district) {
      return next(
        errorHandler(
          400,
          "district and at least one product type are required",
        ),
      );
    }

    if (!isValidDistrict(district)) {
      return next(
        errorHandler(400, "District is invalid. Use a Sri Lanka district."),
      );
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return next(
        errorHandler(
          500,
          "GOOGLE_PLACES_API_KEY is missing. Add it in your server .env file.",
        ),
      );
    }

    const resolvedSegments =
      Array.isArray(customerSegments) && customerSegments.length
        ? customerSegments
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        : DEFAULT_CUSTOMER_SEGMENTS;

    const resolvedNeeds = Array.isArray(customerNeeds)
      ? customerNeeds.map((value) => String(value || "").trim()).filter(Boolean)
      : typeof customerNeeds === "string"
        ? customerNeeds
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    const searchTargets = resolvedNeeds.length
      ? resolvedNeeds
      : resolvedSegments;

    const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);
    const inserted = [];
    const skipped = [];
    const searches = [];
    const fullOutput = [];
    let fetched = 0;

    for (const currentProductType of resolvedProductTypes) {
      for (const target of searchTargets) {
        const query = `${target} need ${currentProductType} in ${district}, Sri Lanka`;

        const searchResponse = await axios.get(
          "https://maps.googleapis.com/maps/api/place/textsearch/json",
          {
            params: {
              query,
              region: "lk",
              key: googleApiKey,
            },
          },
        );

        const searchStatus = searchResponse?.data?.status;
        if (searchStatus === "REQUEST_DENIED") {
          return next(
            errorHandler(
              400,
              searchResponse?.data?.error_message ||
                "Google Places request denied. Check API key and enabled APIs.",
            ),
          );
        }

        const results = (searchResponse?.data?.results || []).slice(0, limit);
        searches.push({
          query,
          productType: currentProductType,
          target,
          fetched: results.length,
        });
        fetched += results.length;

        const queryOutput = {
          query,
          productType: currentProductType,
          target,
          fetched: results.length,
          inserted: [],
          skipped: [],
          rawResults: includeRawResults ? results : undefined,
        };

        for (const place of results) {
          try {
            const placeId = place.place_id;
            let details = null;

            if (placeId) {
              const detailsResponse = await axios.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                {
                  params: {
                    place_id: placeId,
                    fields:
                      "name,formatted_phone_number,website,url,formatted_address",
                    key: googleApiKey,
                  },
                },
              );

              details = detailsResponse?.data?.result || null;
            }

            const businessName = (details?.name || place.name || "").trim();
            if (!businessName) {
              skipped.push({
                placeId: placeId || null,
                productType: currentProductType,
                target,
                reason: "Missing business name",
              });
              queryOutput.skipped.push({
                placeId: placeId || null,
                businessName: place.name || "",
                reason: "Missing business name",
              });
              continue;
            }

            const normalizedPhone = normalizePhone(
              details?.formatted_phone_number || "",
            );
            const safePhone = isLikelySriLankanNumber(normalizedPhone)
              ? normalizedPhone
              : "";
            const whatsappNumber = safePhone;

            const duplicateFilter = {
              createdBy: req.user._id,
              businessName,
              district,
              productType: currentProductType,
              leadType: "customer",
            };

            if (whatsappNumber) {
              duplicateFilter.whatsappNumber = whatsappNumber;
            }

            const existingLead = await SupplierLead.findOne(duplicateFilter);
            if (existingLead) {
              skipped.push({
                businessName,
                productType: currentProductType,
                target,
                reason: "Duplicate customer lead",
              });
              queryOutput.skipped.push({
                businessName,
                reason: "Duplicate customer lead",
              });
              continue;
            }

            const formattedAddress =
              details?.formatted_address || place.formatted_address || "";
            const city = deriveCityFromAddress(formattedAddress);
            const sourceUrl =
              details?.url ||
              `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId || "")}`;
            const facebookPage = extractFacebookPage(details?.website || "");

            const created = await SupplierLead.create({
              businessName,
              phone: safePhone,
              whatsappNumber,
              facebookName: facebookPage ? businessName : "",
              facebookPage,
              district,
              city,
              productType: currentProductType,
              category: target,
              leadType: "customer",
              source: "google_places",
              sourceUrl,
              notes: `Potential customer for ${currentProductType}`,
              verifiedStatus: "unverified",
              createdBy: req.user._id,
            });

            inserted.push(created);
            queryOutput.inserted.push(created);
          } catch (placeError) {
            skipped.push({
              placeId: place.place_id || null,
              businessName: place.name || "",
              productType: currentProductType,
              target,
              reason: placeError.message,
            });
            queryOutput.skipped.push({
              placeId: place.place_id || null,
              businessName: place.name || "",
              reason: placeError.message,
            });
          }
        }

        fullOutput.push(queryOutput);
      }
    }

    res.status(201).json({
      district,
      productTypes: resolvedProductTypes,
      leadType: "customer",
      searches,
      fetched,
      importedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
      fullOutput,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
