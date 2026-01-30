import User from "../models/userModel.js";

export const getCart = async (req, res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .populate("cart.product"); 

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const user = await User.findById(req.user.id);

    const index = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index > -1) {
      user.cart[index].qty += qty;
    } else {
      user.cart.push({ product: productId, qty });
    }

    await user.save();
    await user.populate("cart.product");

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE QTY */
export const updateQty = async (req, res) => {
  const { productId, qty } = req.body;
  const user = await User.findById(req.user.id);

  const item = user.cart.find(
    (item) => item.product.toString() === productId
  );

  if (item) item.qty = qty;

  await user.save();
  res.json(user.cart);
};

export const removeItem = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== id
    );

    await user.save();
    await user.populate("cart.product");

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* SYNC LOCAL CART AFTER LOGIN */
export const syncCart = async (req, res) => {
  const { items } = req.body;
  const user = await User.findById(req.user.id);

  items.forEach((item) => {
    const index = user.cart.findIndex(
      (c) => c.product.toString() === item._id
    );

    if (index > -1) {
      user.cart[index].qty += item.qty;
    } else {
      user.cart.push({
        product: item._id,
        qty: item.qty,
      });
    }
  });

  await user.save();
  res.json(user.cart);
};