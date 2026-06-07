import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Order from "../models/orderModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    // console.log("🕒 Server Time (UTC):", now.toISOString());

    // === Reliable Date Calculation (UTC based) ===
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // console.log("📅 sevenDaysAgo:", sevenDaysAgo.toISOString());

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // ==================== QUERIES ====================
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

    // Monthly Revenue
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

    // New Products - Critical Fix
    const newProducts = await Product.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .select("_id name qty price brand category createdAt")
      .lean();

    // console.log(`🛠️ New Products Found: ${newProducts.length}`);
    newProducts.forEach((p, i) => {
      // console.log(`Product ${i+1}: ${p.name} | Created: ${p.createdAt}`);
    });

    // Other queries
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

    // ==================== ACTIVITIES ====================
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
    // console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req,res)=>{
  try {
    const users = await User.find().select("name email role createdAt").lean();
    const totalAllUsers = await User.countDocuments();
    const totalUsers = await User.countDocuments({role:"user"});
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalSuperAdmins = await User.countDocuments({ role: "superadmin" });
    res.json({
      success: true,
      data: users,
      stats: {
        total: totalAllUsers,
        users: totalUsers,
        admins: totalAdmins,
        superAdmins: totalSuperAdmins
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
}

export const deleteUser =async (req,res)=>{
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if(!deleteUser){
      return res.stats(404).json({
        success: false,
        massage :"User Not Found!."
      })
    }
    res.stats(200).json({
      success :true,
      massage : "User Deleted Successfully!.",
      data : deletedUser
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
}
