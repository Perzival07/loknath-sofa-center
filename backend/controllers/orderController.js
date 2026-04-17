
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendAdminNewOrderAlert,
    sendOrderCancellationEmail,
    sendAdminCancellationAlert,
} from '../services/emailService.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';



// global variables
const currency ="inr"; // currency for the application


// gateway initialization - lazy initialization to prevent crashes on missing env vars
let stripe = null;
let razorpayInstance = null;

const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

const getRazorpay = () => {
    if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
    }
    return razorpayInstance;
};

const assertStockAvailableForItems = async (items) => {
    for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty < 1) {
            throw new Error(`Invalid quantity for ${item.name || item._id}`);
        }
        const p = await productModel.findById(item._id);
        if (!p) {
            throw new Error(`Product not found: ${item.name || item._id}`);
        }
        const avail = p.stock ?? 0;
        if (avail < qty) {
            throw new Error(`Insufficient stock for ${p.name}. Available: ${avail}`);
        }
    }
};

const decrementStockForItems = async (items) => {
    const applied = [];
    try {
        for (const item of items) {
            const qty = Number(item.quantity);
            if (!Number.isFinite(qty) || qty < 1) {
                throw new Error(`Invalid quantity for ${item.name || item._id}`);
            }
            const updated = await productModel.findOneAndUpdate(
                { _id: item._id, stock: { $gte: qty } },
                { $inc: { stock: -qty } },
                { new: true }
            );
            if (!updated) {
                const p = await productModel.findById(item._id);
                const name = p?.name || String(item._id);
                const avail = p?.stock ?? 0;
                throw new Error(`Insufficient stock for ${name}. Available: ${avail}`);
            }
            applied.push({ _id: item._id, qty });
        }
    } catch (e) {
        for (const a of applied.reverse()) {
            await productModel.findByIdAndUpdate(a._id, { $inc: { stock: a.qty } });
        }
        throw e;
    }
};

const customerDisplayName = (user, address) => {
    if (user?.name?.trim()) return user.name.trim();
    const fn = String(address?.firstName ?? "").trim();
    const ln = String(address?.lastName ?? "").trim();
    const fromAddr = `${fn} ${ln}`.trim();
    if (fromAddr) return fromAddr;
    return "Customer";
};




 // for formatting date like "24-Jul-2025 07:45 PM"
        const formatDateTime = (date) => {
            const d = new Date(date);

            // Date part
            const day = String(d.getDate()).padStart(2, '0');
            const month = d.toLocaleString('en-US', { month: 'short' });
            const year = d.getFullYear();

            // Time part
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert to 12-hour format
            const time = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

            return `${day}-${month}-${year} ${time}`;
        };


// placing order using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, deliveryFee = 0 } = req.body;


       



        // Default to COD if paymentMethod is not specified
        const orderPaymentMethod = req.body.paymentMethod || "COD";
        // For COD and UPI, payment is false initially (UPI payment is verified separately via QR)
        const paymentStatus = false;

        const orderData = {
            userId,
            items,
            address,
            amount,
            deliveryFee,
            paymentMethod: orderPaymentMethod,
            payment: paymentStatus,
            date: new Date().toISOString()
        };





        
        const newOrder = new orderModel(orderData)
        await newOrder.save();

        try {
            await decrementStockForItems(items);
        } catch (stockError) {
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, message: stockError.message });
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        try {
            const user = await userModel.findById(userId);
            const displayName = customerDisplayName(user, address);
            if (user?.email) {
                await sendOrderConfirmation({
                    userEmail: user.email,
                    userName: displayName,
                    orderId: newOrder._id,
                    amount,
                    items,
                });
            }
            await sendAdminNewOrderAlert({
                orderId: newOrder._id,
                customerName: displayName,
                amount,
            });
        } catch (emailErr) {
            console.error("Order notification email error:", emailErr);
        }

        res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



// placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
 try {
    const { userId, items, amount, address, deliveryFee = 0 } = req.body;
    const {origin} = req.headers;

     const orderData = {
            userId,
            items,
            address,
            amount,
            deliveryFee,
            paymentMethod: "Stripe",
            payment: false,
            date: new Date().toISOString()
        };
        const newOrder = new orderModel(orderData)
        await newOrder.save();

        try {
            await assertStockAvailableForItems(items);
        } catch (stockError) {
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, message: stockError.message });
        }

        const line_items = items.map((item)=>({
            price_data: {
                currency:currency,
                product_data: {
                    name: item.name
               
                },
                unit_amount: item.price * 100, 
            },
            quantity: item.quantity
        }))
        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency:currency,
                    product_data: {
                        name: 'Delivery Charges'
                    },
                    unit_amount: deliveryFee * 100,
                },
                quantity: 1
            })
        }

        const stripeInstance = getStripe();
        if (!stripeInstance) {
            // If Stripe is not configured, delete the order and return error
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, message: "Stripe payment gateway is not configured" });
        }

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });




 } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
 }
}





// verify Stripe
const verifyStripe = async (req, res) => {
    const {orderId, success, userId}= req.body;

    try {
        // Validate orderId exists
        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (success === "true") {
            if (order.payment) {
                return res.json({ success: true });
            }
            try {
                await decrementStockForItems(order.items);
            } catch (stockError) {
                return res.json({ success: false, message: stockError.message });
            }
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            try {
                const user = await userModel.findById(userId);
                const displayName = customerDisplayName(user, order.address);
                if (user?.email) {
                    await sendOrderConfirmation({
                        userEmail: user.email,
                        userName: displayName,
                        orderId,
                        amount: order.amount,
                        items: order.items,
                    });
                }
                await sendAdminNewOrderAlert({
                    orderId,
                    customerName: displayName,
                    amount: order.amount,
                });
            } catch (emailErr) {
                console.error("Stripe verify email error:", emailErr);
            }

            res.json({success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success : false})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}








// placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    
    try {
         const { userId, items, amount, address, deliveryFee = 0 } = req.body;
    

     const orderData = {
            userId,
            items,
            address,
            amount,
            deliveryFee,
            paymentMethod: "Razorpay",
            payment: false,
            date: new Date().toISOString()
        };
        const newOrder = new orderModel(orderData)
        await newOrder.save();

        try {
            await assertStockAvailableForItems(items);
        } catch (stockError) {
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, message: stockError.message });
        }

        const options ={
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
        }

        const razorpay = getRazorpay();
        if (!razorpay) {
            // If Razorpay is not configured, delete the order and return error
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.json({ success: false, message: "Razorpay payment gateway is not configured" });
        }

        try {
            const order = await razorpay.orders.create(options);
            res.json({success: true, order});
        } catch (razorpayError) {
            console.log(razorpayError);
            // Delete the order if Razorpay order creation fails
            await orderModel.findByIdAndDelete(newOrder._id);
            res.json({success: false, message: razorpayError.message || razorpayError});
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}




// verify Razorpay payment
const verifyRazorpay = async (req, res) => {

    try {
        const {userId, razorpay_order_id} = req.body;
        
        if (!razorpay_order_id) {
            return res.json({ success: false, message: "Razorpay order ID is required" });
        }

        const razorpay = getRazorpay();
        if (!razorpay) {
            return res.json({ success: false, message: "Razorpay payment gateway is not configured" });
        }
        const orderInfo = await razorpay.orders.fetch(razorpay_order_id);

      if(orderInfo.status === 'paid'){
            // Validate that the receipt (orderId) exists
            const orderId = orderInfo.receipt;
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.json({ success: false, message: "Order not found" });
            }

            if (order.payment) {
                return res.json({ success: true, message: "Payment Successfully" });
            }

            try {
                await decrementStockForItems(order.items);
            } catch (stockError) {
                return res.json({ success: false, message: stockError.message });
            }
            
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            try {
                const user = await userModel.findById(userId);
                const displayName = customerDisplayName(user, order.address);
                if (user?.email) {
                    await sendOrderConfirmation({
                        userEmail: user.email,
                        userName: displayName,
                        orderId,
                        amount: order.amount,
                        items: order.items,
                    });
                }
                await sendAdminNewOrderAlert({
                    orderId,
                    customerName: displayName,
                    amount: order.amount,
                });
            } catch (emailErr) {
                console.error("Razorpay verify email error:", emailErr);
            }

            res.json({success: true, message: "Payment Successfully"});
        } else {
            res.json({success: false, message: "Payment Failed"});
        }


    } catch (error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}








// all orders data for admin panel
const allOrders = async (req, res) => {
 try {
   const orders = await orderModel.find({});
   res.json({success:true,orders})

 } catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
 }
}





// user order data for frontend
const userOrders = async (req, res) => {
 try {
  const {userId} = req.body;

  const orders = await orderModel.find({userId})

  res.json({success:true, orders})
 } catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
 }

}

// cancel order (customer) — only before shipped
const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (String(order.userId) !== String(userId)) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        if (order.status === "Cancelled") {
            return res.json({ success: false, message: "This order is already cancelled" });
        }

        const cancellableStatuses = ["Order Placed", "Packing"];
        if (!cancellableStatuses.includes(order.status)) {
            return res.json({
                success: false,
                message: `This order cannot be cancelled because it is already ${order.status}.`,
            });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });

        const needsStockRestore =
            order.payment === true ||
            order.paymentMethod === "COD" ||
            order.paymentMethod === "UPI";

        if (needsStockRestore) {
            for (const item of order.items) {
                const qty = Number(item.quantity);
                if (!Number.isFinite(qty) || qty < 1) continue;
                await productModel.findByIdAndUpdate(item._id, { $inc: { stock: qty } });
            }
        }

        try {
            const user = await userModel.findById(userId);
            const displayName = customerDisplayName(user, order.address);
            if (user?.email) {
                await sendOrderCancellationEmail({
                    userEmail: user.email,
                    userName: displayName,
                    orderId,
                });
            }
            await sendAdminCancellationAlert({
                orderId,
                customerName: displayName || "Customer",
            });
        } catch (emailErr) {
            console.error("Cancel order email error:", emailErr);
        }

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};







// update order status from admin panel
const updateStatus = async (req, res) => {
try {
    const {orderId, status} = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
        return res.json({ success: false, message: "Order not found" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status });

    try {
        const user = await userModel.findById(order.userId);
        const displayName = customerDisplayName(user, order.address);
        if (user?.email) {
            await sendOrderStatusUpdate({
                userEmail: user.email,
                userName: displayName,
                orderId,
                status,
            });
        }
    } catch (emailErr) {
        console.error("Status update email error:", emailErr);
    }

    res.json({success:true, message:"Status Updated Successfully"});
} catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
}
}

// remove order from admin panel
const removeOrder = async (req, res) => {
try {
    const {orderId} = req.body;
    
    if (!orderId) {
        return res.json({success:false, message:"Order ID is required"});
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
        return res.json({success:false, message:"Order not found"});
    }

    await orderModel.findByIdAndDelete(orderId);
    res.json({success:true, message:"Order removed successfully"});
} catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
}
}

// update payment status from admin panel
const updatePaymentStatus = async (req, res) => {
try {
    const {orderId, payment} = req.body;
    
    if (!orderId) {
        return res.json({success:false, message:"Order ID is required"});
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
        return res.json({success:false, message:"Order not found"});
    }

    await orderModel.findByIdAndUpdate(orderId, {payment: payment === true || payment === "true"});
    res.json({success:true, message:"Payment status updated successfully"});
} catch (error){
    console.log(error);
    res.json({success:false, message:error.message});
}
}


const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const totalSalesAgg = await orderModel.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalSales = totalSalesAgg[0]?.total || 0;
        const recentOrders = await orderModel
            .find()
            .sort({ date: -1 })
            .limit(5)
            .lean();
        const ordersByStatus = await orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalSales,
                recentOrders,
                ordersByStatus,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {verifyStripe,verifyRazorpay, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, removeOrder, updatePaymentStatus, formatDateTime, cancelOrder, getDashboardStats };


