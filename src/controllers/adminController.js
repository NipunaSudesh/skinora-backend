import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Order from "../models/orderModel.js";
import cloudinary from "../config/cloudinary.cjs";
import slugify from "slugify";

// ==================== DASHBOARD ====================
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "completed" }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt").lean(),
    ]);

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const newProducts = await Product.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .select("_id name qty price brand category createdAt")
      .lean();

    const newUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .select("name email createdAt")
      .lean();

    const newOrders = await Order.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .select("totalAmount status createdAt")
      .lean();

    const lowStockProducts = await Product.find({ qty: { $lte: 3 } })
      .sort({ qty: 1 })
      .select("_id name qty brand category createdAt")
      .lean();

    const activities = [
      ...newUsers.map((u) => ({
        icon: "👤",
        label: "New user registered",
        sub: `${u.name} · ${u.email}`,
        time: u.createdAt,
        type: "user",
      })),
      ...newOrders.map((o) => ({
        icon: "🛒",
        label: "New order placed",
        sub: `$${o.totalAmount} · ${o.status}`,
        time: o.createdAt,
        type: "order",
      })),
      ...newProducts.map((p) => ({
        icon: "➕",
        label: "New product added",
        sub: `${p.name} · Qty: ${p.qty}`,
        detail: `$${p.price} | ${p.brand || "N/A"} | ${p.category || "N/A"}`,
        time: p.createdAt,
        type: "product",
        productId: p._id,
      })),
      ...lowStockProducts
        .filter((p) => !newProducts.some((np) => np._id?.toString() === p._id?.toString()))
        .map((p) => ({
          icon: "📉",
          label: "Low stock alert",
          sub: `${p.name} · Qty: ${p.qty}`,
          time: p.createdAt,
          type: "lowstock",
        })),
    ];

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentUsers,
        activities: activities.slice(0, 12),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// ==================== USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").lean();
    const totalAllUsers = await User.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalSuperAdmins = await User.countDocuments({ role: "superadmin" });

    res.json({
      success: true,
      data: users,
      stats: {
        total: totalAllUsers,
        users: totalUsers,
        admins: totalAdmins,
        superAdmins: totalSuperAdmins,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User Not Found!" });
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully!",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// ==================== PRODUCTS ====================

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    // ── 1. Image upload (required by schema) ──────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required.",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "products" }
    );
    const imageUrl = uploadResult.secure_url;

    // ── 2. Parse JSON fields sent as strings via FormData ─────────────────
    let longDescription = req.body.longDescription;
    if (typeof longDescription === "string") {
      longDescription = JSON.parse(longDescription);
    }

    let tags = req.body.tags;
    if (typeof tags === "string") {
      tags = JSON.parse(tags);
    }

    // ── 3. Validate required nested fields ────────────────────────────────
    if (!longDescription?.overview) {
      return res.status(400).json({
        success: false,
        message: "longDescription.overview is required.",
      });
    }
    if (!longDescription?.howToUse) {
      return res.status(400).json({
        success: false,
        message: "longDescription.howToUse is required.",
      });
    }

    // ── 4. Generate unique slug from name ─────────────────────────────────
    const baseSlug = slugify(req.body.name, { lower: true, strict: true });
    let slug = baseSlug;
    let suffix = 1;
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // ── 5. Create product (all schema fields mapped) ──────────────────────
    const product = await Product.create({
      name:             req.body.name,
      slug,
      brand:            req.body.brand,
      category:         req.body.category,
      imageUrl,
      shortDescription: req.body.shortDescription,
      longDescription: {
        overview:        longDescription.overview,
        howToUse:        longDescription.howToUse,
        keyUses:         longDescription.keyUses        || [],
        keyIngredients:  longDescription.keyIngredients || [],
      },
      price:            Number(req.body.price),
      oldPrice:         req.body.oldPrice        ? Number(req.body.oldPrice)        : null,
      discountPercent:  req.body.discountPercent ? Number(req.body.discountPercent) : null,
      rating:           req.body.rating          ? Number(req.body.rating)          : 5,
      qty:              Number(req.body.qty)      || 0,
      stockStatus:      Number(req.body.qty) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      tags:             Array.isArray(tags) ? tags : [],
      country:          req.body.country || "",
      isActive:         true,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error.message);
  console.error("FULL ERROR:", error);   
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Re-upload image if a new file is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "products" }
      );
      updateData.imageUrl = result.secure_url;
    }

    // Parse longDescription if sent as a JSON string
    if (typeof updateData.longDescription === "string") {
      updateData.longDescription = JSON.parse(updateData.longDescription);
    }

    // Keep stockStatus in sync with qty
    if (updateData.qty !== undefined) {
      updateData.qty = Number(updateData.qty);
      updateData.stockStatus = updateData.qty > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==================== GET ALL ORDERS ====================
export const getAllOrders = async (req, res) => {
  try {
    const [
      allOrders,
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
    ] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).populate("items.product", "name imageUrl").lean(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
    ]);

    res.json({
      success: true,
      data: allOrders,
      stats: {
        total: totalOrders,
        pending: pendingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// ==================== UPDATE ORDER STATUS ====================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated successfully", data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// ==================== GET SINGLE ORDER ====================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name imageUrl").lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
};

// ==================== DELETE ORDER ====================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting order", error: error.message });
  }
};