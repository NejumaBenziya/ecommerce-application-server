const UserModel = require("../models/userModel")
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
const saltRounds = Number(process.env.SALT_ROUNDS)
const jwt_secret = process.env.JWT_SECRET
const { getValidationErrorMessage } = require("../utils/validationUtils")
const ProductModel = require("../models/productModel")
const OrderModel = require("../models/orderModel")
const crypto = require("crypto");
const mongoose = require("mongoose");
const { log } = require("node:console")
const ReviewModel = require("../models/reviewModel")
const razorpay = require("../config/razorpay");
const sendEmail = require("../utils/sendEmail");
const orderEmailTemplate = require("../templates/orderEmailTemplate");          

const registerController = async (req, res) => {

  try {
    const { name, email, password, phone } = req.body

    const user_email = await UserModel.findOne({ email })
    const user_phone = await UserModel.findOne({ phone })

    if (user_email) {
      return res.status(400).json({ message: "User with this Email ID already exists" })
    } else if (user_phone) {
      return res.status(400).json({ message: "User with this Phone Number already exists" })
    } else {

      bcrypt.hash(password, saltRounds, async function (err, hash) {

        //  Handle bcrypt error
        if (err) {
          return res.status(500).json({
            message: "Error hashing password"
          });
        }

        if (hash) {
          try {
            const newUser = await UserModel.create({
              name,
              email,
              password: hash,
              phone
            })

            res.status(201).json({
              message: "User registered successfully"
            })

          } catch (err) {

            if (err.name === "ValidationError") {
              const message = getValidationErrorMessage(err)

              res.status(400).json({ message: message })

            } else {
              res.status(500).json({
                message: "Something went wrong in the server. Please try after some time."
              })
            }
          }

        } else {
          return res.status(400).json({
            message: "Password is required."
          })
        }
      })
    }

  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server. Please try after some time."
    })
  }

}
const loginController = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Email ID and password is required",
      });
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwt_secret,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist
      },
    });

  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server.",
    });
  }
};
const productListController = async (req, res) => {
  try {
    const categoryFilter = req.query.productCategory;

    // Pagination values
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    let query = { isDeleted: false };

    // Apply category filter if exists
    if (categoryFilter) {
      query.productCategory = categoryFilter;
    }

    // Get paginated products
    const products = await ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count (for frontend pagination UI)
    const totalProducts = await ProductModel.countDocuments(query);

    res.json({
      message: "Fetched products successfully",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });

  } catch (err) {
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};
const searchController = async (req, res) => {
  try {
    const search = req.query.q

    const products = await ProductModel.find({
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { productCategory: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } }
      ]
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ "message": "Something went wrong in the server.Please try again." })
  }
}
const productController = async (req, res) => {
  try {
    const id = req.query.productId;

    const product = await ProductModel.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Fetched product successfully", product })
  } catch (err) {
    res.status(500).json({ "message": "Something went wrong in the server.Please try again." })
  }
}
const addtowishlistController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const user = await UserModel.findById(userId);


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist" });
  }
}
const wishlistRemoveController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const user = await UserModel.findById(userId);


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist" });
  }
}
const wishlistController = async (req, res) => {
  try {
    const user = req.user;


    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await ProductModel.find({
      _id: { $in: user.wishlist },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};
const cartRemoveController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ProductId is required" });
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Remove item from cart
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    res.json({
      message: "Removed product successfully",
      cart: user.cart
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};

const cartController = async (req, res) => {

  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId } = req.body
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = user.cart.find(
      item => item.productId.toString() === productId
    );


    if (existingItem) {

      existingItem.quantity += 1;
    } else {

      user.cart.push({ productId, quantity: 1 });
    }

    await user.save();

    res.json({ message: "Add to cart successfully" })
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err)

      res.status(400).json({ message: message })
    } else if (err.name === "CastError") {
      res.status(500).json({ message: err.message })
    } else {
      res.json({ message: "Something went wrong in the server. Please try after some time." })
    }
  }
}
const cartQuantityController = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.body;
    const product = user.cart.find(
      item => item.productId.toString() === productId

    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    product.quantity -= 1;
    if (product.quantity === 0) {
      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId
      );
    }
    await user.save();
    res.json({
      success: true,
      message: "Quantity updated",
      cart: user.cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
}
const cartListController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const productIds = user.cart.map(item => item.productId);


    const products = await ProductModel.find({ _id: { $in: productIds } });


    const cartItems = products.map(product => {
      const item = user.cart.find(
        c => c.productId.toString() === product._id.toString()
      );
      return {
        ...product.toObject(),

        quantity: item ? item.quantity : 1, //  cart qty
        stock: product.quantity,                //  actual stock
      };
    });

    res.json({
      message: "Fetched cart products successfully",
      products: cartItems
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};

const reviewController = async (req, res) => {
  try {
    const { product_id, rating } = req.body;
    console.log(rating);
    const product = await ProductModel.findById(product_id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.rating.push(rating)
    await product.save();


    res.json({ message: "Rating added successfully", rating: product.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const addReviewController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const review_by = user._id;
    const { product_id, rating, feedback, orderId } = req.body;

    //  Create review
    const review = await ReviewModel.create({
      rating,
      feedback,
      review_by,
    });

    // Push review into product
    const product = await ProductModel.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.reviews.push(review);
    await product.save();

    // Update order → mark reviewDone = true for that product
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productItem = order.products.find(
      (item) => item.productId.toString() === product_id
    );
    if (productItem) {
      productItem.reviewDone = true;
      await order.save();
    }

    // Send response
    res.status(201).json({
      message: "Review added successfully",
      review,
      reviewDoneUpdated: !!productItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const reviewListController = async (req, res) => {
  try {
    const { productId } = req.query;  //  productId comes from query params

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    //  Populate reviews AND review_by inside reviews
    const product = await ProductModel.findById(productId)
      .populate({
        path: "reviews",
        populate: {
          path: "review_by", // field inside ReviewModel
          model: "user",     // make sure your user model is registered as "User"
          select: "name", // select only required fields
        },
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = product.reviews || [];
    console.log(reviews);

    res.json({
      message: "Fetched reviews successfully",
      reviews,
    });
  } catch (err) {
    console.error("Error in reviewListController:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};




const orderController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const {
      houseName,
      street,
      landMark,
      pincode,
      city,
      state,
      paymentMethod,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // ==================================
    //  VERIFY PAYMENT (ONLINE)
    // ==================================
    if (paymentMethod !== "Cash on Delivery") {
      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({ message: "Payment verification failed" });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    // ==================================
    //  CHECK STOCK
    // ==================================
    for (let item of user.cart) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `${product.productName} is out of stock. Available: ${product.quantity}`,
        });
      }
    }

    // ==================================
    //  DEDUCT STOCK
    // ==================================
    for (let item of user.cart) {
      const product = await ProductModel.findById(item.productId);
      product.quantity -= item.quantity;
      await product.save();
    }

    // ==================================
    // CREATE ORDER
    // ==================================
    const order = await OrderModel.create({
      products: user.cart,
      name: user.name,
      phone: user.phone,


      houseName,
      street,
      landMark,
      pincode,
      city,
      state,

      paymentMethod,
    });

    // ==================================
    // CLEAR CART
    // ==================================
    user.orders.push(order._id);
    user.cart = [];
    await user.save();
    const html = orderEmailTemplate(user, order);
    await sendEmail(user.email, "Order Confirmation", html);
    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong in the server. Please try again later.",
    });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //  Cart validation
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate amount from DB (SECURE)
    let totalAmount = 0;

    for (const item of user.cart) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      const price = product.salePrice ?? product.price;
      totalAmount += price * item.quantity;
    }

    //  Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // rupees → paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    //  Send to frontend
    return res.status(200).json(razorpayOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
};

const userOrderController = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orderIds = user.orders
    const orders = await OrderModel.find({ _id: { $in: orderIds } })
      .populate("products.productId");

    res.json({
      message: "Fetched orders  successfully",
      orders: orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
}


const cancelOrderController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { orderId, productId } = req.body;

    // Find the order
    const order = await OrderModel.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the product inside the order
    const productItem = order.products.find(
      (item) => item.productId._id.toString() === productId
    );

    if (!productItem) {
      return res.status(404).json({ message: "Product not found in this order" });
    }

    if (productItem.cancelled) {
      return res.status(400).json({ message: "Product already cancelled" });
    }

    // Mark it as cancelled
    productItem.cancelled = true;
    await order.save();

    // Restore the stock in ProductModel
    await ProductModel.findByIdAndUpdate(
      productId,
      { $inc: { quantity: productItem.quantity } }, // increase stock
      { new: true }
    );

    res.json({ message: "Product cancelled successfully", order });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong in the server. Please try again later." });
    }
  }
};

module.exports = { registerController, loginController, productListController, searchController, addtowishlistController, wishlistRemoveController, wishlistController, cartController, reviewController, orderController, createRazorpayOrder, cancelOrderController, cartListController, productController, cartRemoveController, userOrderController, cartQuantityController, addReviewController, reviewListController } 