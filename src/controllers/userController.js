import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import bcrypt, { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export const register =async (req ,res)=>{
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password){
             return res.status(400).json({ message: "All fields are required" });
        }
        const exsistingUser =await User.findOne({email});
        if(exsistingUser){
            return res.status(400).json({ message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

        const user =await User.create({
            name,
            email,
            password:hashedPassword,
        })
        res.status(201).json({
            massage:"User registered successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            },
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error", error: error.message 
        })
    }
};

export const login =async (req, res)=>{
    try {
        const {email ,password} =req.body;

        if(!email || !password ){
             return res.status(400).json({ message: "Email and password required" });
        }
        const user =await User.findOne({email});
        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch =await compare(password,user.password);
        if(!isMatch){
             return res.status(400).json({ message: "Invalid credentials" });
        }
                const token = jwt.sign(
        { id: user._id ,
          name: user.name,
          email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "28d" }
        );

        res.status(200).json({
            massage:"Login Successfull",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            },
        });

    } catch (error) {
                res.status(500).json({
            message: "Server error", error: error.message 
        })
    }
};
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const editProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { items, totalAmount, shippingInfo } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "No items to order" });
//     }

//     const user = await User.findById(userId);

//     const newOrder = {
//       items,
//       totalAmount,
//       shippingInfo,
//       status: "pending",
//       placedAt: new Date(),
//     };

//     //  Save order
//     user.orders.push(newOrder);

//     //  Clear cart after placing order
//     user.cart = [];

//     await user.save();

//     res.status(201).json({
//       message: "Order placed successfully",
//       order: newOrder,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { shippingInfo } = req.body;

    // ✅ Check auth
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Get user with populated cart
    const user = await User.findById(userId).populate({
      path: "cart.product",
      select: "price name",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ Build items safely
    const items = [];

    for (const item of user.cart) {
      if (!item.product) {
        return res.status(400).json({
          message: "Some products in cart are invalid or deleted",
        });
      }

      items.push({
        product: item.product._id,
        qty: item.qty,
        price: item.product.price,
      });
    }

    // ✅ Calculate total securely
    const totalAmount = items.reduce(
      (total, item) => total + item.qty * item.price,
      0
    );

    // ✅ Order data
    const orderData = {
      items,
      totalAmount,
      shippingInfo,
      status: "pending",
      placedAt: new Date(),
    };

    // ✅ 1. Save in Order collection
    const createdOrder = await Order.create({
      user: userId,
      ...orderData,
    });

    // ✅ 2. Save inside user.orders (your requirement)
    if (!user.orders) {
      user.orders = [];
    }

    user.orders.push(orderData);

    // ✅ Clear cart
    user.cart = [];

    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
// export const getMyOrders = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate(
//       "orders.items.product",
//       "name price image"
//     );

//     res.status(200).json({
//       orders: user.orders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Get orders from Order collection
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
