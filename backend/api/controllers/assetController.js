import Asset from "../models/assetModel.js";

export const registerAsset = async (req, res) => {
  try {
    const {
      assetType,
      assetName,
      serialNumber,
      purchaseDate,
      condition,
      remarks,
      createdBy,
    } = req.body;

    // 1️⃣ Validation
    if (!assetType || !assetName) {
      return res.status(400).json({
        success: false,
        message: "Asset Type and Asset Name are required",
      });
    }

    // 2️⃣ Optional: prevent duplicate serial number
    if (serialNumber) {
      const existingAsset = await Asset.findOne({ serialNumber });
      if (existingAsset) {
        return res.status(409).json({
          success: false,
          message: "Asset with this serial number already exists",
        });
      }
    }

    // 3️⃣ Create asset (NO employee info here)
    const asset = await Asset.create({
      assetType,
      assetName,
      serialNumber,
      purchaseDate,
      condition,
      remarks,
      createdBy,
      assetStatus: "Available", // default state
    });

    res.status(201).json({
      success: true,
      message: "Asset registered successfully",
      data: asset,
    });
  } catch (error) {
    console.error("Register Asset Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while registering asset",
    });
  }
};



export const issueAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      employeeName,
      employeeId,
      department,
      employeeMobile,
      employeeEmail,
      issuedDate,
    } = req.body || {};

    // 1️⃣ Basic validation
    if (!employeeName || !department) {
      return res.status(400).json({
        success: false,
        message: "Employee name and department are required",
      });
    }

    // 2️⃣ Find asset
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // 3️⃣ Prevent double issue
    if (asset.assetStatus === "Issued") {
      return res.status(400).json({
        success: false,
        message: "Asset is already issued",
      });
    }

    // 4️⃣ Issue asset
    asset.employeeName = employeeName;
    asset.employeeId = employeeId || null;
    asset.department = department;
    asset.employeeMobile = employeeMobile || null;
    asset.employeeEmail = employeeEmail || null;
    asset.issuedDate = issuedDate ? new Date(issuedDate) : new Date();
    asset.assetStatus = "Issued";

    await asset.save();

    res.status(200).json({
      success: true,
      message: "Asset issued successfully",
      data: asset,
    });
  } catch (error) {
    console.error("Issue Asset Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while issuing asset",
    });
  }
};



export const getAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      department,
      issued,
      fromDate,
      toDate,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};

    /* ---------------- SEARCH ---------------- */
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: "i" } },
        { assetType: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
        { employeeName: { $regex: search, $options: "i" } },
      ];
    }

    /* ---------------- FILTERS ---------------- */
    if (status && status !== "") {
    query.assetStatus = status;
    }

    if (type && type !== "") {
    query.assetType = type;
    }

    if (department && department !== "") {
      query.department = department;
    }

    if (issued === "true") {
      query.assetStatus = "Issued";
    }

    if (issued === "false") {
      query.assetStatus = "Available";
    }

    /* ---------------- DATE RANGE ---------------- */
    if (fromDate || toDate) {
      query.issuedDate = {};
      if (fromDate) query.issuedDate.$gte = new Date(fromDate);
      if (toDate) query.issuedDate.$lte = new Date(toDate);
    }

    /* ---------------- PAGINATION ---------------- */
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    /* ---------------- SORTING ---------------- */
    const sortOrder = order === "asc" ? 1 : -1;

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(pageSize),
      Asset.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("Get Assets Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assets",
    });
  }
};


export const changeAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: "Available", "Issued", "Under Repair", "Retired"

    // 1️⃣ Validate status
    const allowedStatuses = ["Available", "Issued", "Under Repair", "Retired"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status is required and must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    // 2️⃣ Find asset
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // 3️⃣ Handle "Available" status → push to history if it was issued
    if (status === "Available" && asset.assetStatus === "Issued") {
      asset.history.push({
        employeeName: asset.employeeName || "",
        employeeId: asset.employeeId || "",
        department: asset.department || "",
        employeeMobile: asset.employeeMobile || "",
        employeeEmail: asset.employeeEmail || "",
        issuedDate: asset.issuedDate || null,
        returnedDate: new Date(),
      });

      // Clear current employee info
      asset.employeeName = null;
      asset.employeeId = null;
      asset.department = null;
      asset.employeeMobile = null;
      asset.employeeEmail = null;
      asset.issuedDate = null;
      asset.returnedDate = null;
    }

    // 4️⃣ Update assetStatus for all other cases
    asset.assetStatus = status;

    await asset.save();

    res.status(200).json({
      success: true,
      message: `Asset status updated to "${status}" successfully`,
      data: asset,
    });
  } catch (error) {
    console.error("Change Asset Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing asset status",
    });
  }
};


// Get single asset report (current + history)
export const getAssetReport = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the asset by ID
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // 2️⃣ Prepare report
    const report = {
      assetDetails: {
        assetName: asset.assetName,
        assetType: asset.assetType,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        condition: asset.condition,
        remarks: asset.remarks,
        assetStatus: asset.assetStatus,
      },
      currentAssignment: asset.assetStatus === "Issued" ? {
        employeeName: asset.employeeName,
        employeeId: asset.employeeId,
        department: asset.department,
        employeeMobile: asset.employeeMobile,
        employeeEmail: asset.employeeEmail,
        issuedDate: asset.issuedDate,
      } : null,
      history: asset.history || [],
    };

    res.status(200).json({
      success: true,
      message: "Asset report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("Get Asset Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching asset report",
    });
  }
};

