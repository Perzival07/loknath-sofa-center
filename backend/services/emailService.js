import nodemailer from "nodemailer";

let transporter = null;

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendSafe = async (mailOptions) => {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] Skipped: set EMAIL_USER and EMAIL_PASS to enable mail");
    return;
  }
  try {
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("[email] Send failed:", err.message);
  }
};

const orderIdLabel = (orderId) => String(orderId).slice(-8).toUpperCase();

export const sendOrderConfirmation = async ({
  userEmail,
  userName,
  orderId,
  amount,
  items,
}) => {
  if (!userEmail) return;
  const itemsHtml = (items || [])
    .map(
      (item) => `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${Number(item.quantity) || 0}</td>
            <td>₹${Number(item.price) || 0}</td>
            <td>₹${(Number(item.price) || 0) * (Number(item.quantity) || 0)}</td>
        </tr>`
    )
    .join("");

  const html = `
        <h2>Thank you for your order, ${escapeHtml(userName)}!</h2>
        <p>Your order <strong>#${escapeHtml(orderIdLabel(orderId))}</strong> has been placed successfully.</p>
        <p>Total amount: <strong>₹${Number(amount) || 0}</strong></p>
        <h3>Order details</h3>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Line total</th></tr>
            ${itemsHtml}
        </table>
        <p>We will notify you when your order status changes.</p>
        <p>Thanks for shopping with us.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order confirmation #${orderIdLabel(orderId)}`,
    html,
  });
};

export const sendOrderStatusUpdate = async ({
  userEmail,
  userName,
  orderId,
  status,
}) => {
  if (!userEmail) return;

  const statusMessages = {
    "Order Placed": "Your order has been received and is being processed.",
    Packing: "Your order is being packed.",
    Shipped: "Your order has been shipped.",
    "Out for delivery": "Your order is out for delivery.",
    Delivered: "Your order has been delivered. Enjoy!",
  };

  const message =
    statusMessages[status] || `Your order status has been updated to: ${status}`;

  const html = `
        <h2>Order status update</h2>
        <p>Hi ${escapeHtml(userName)},</p>
        <p>Order <strong>#${escapeHtml(orderIdLabel(orderId))}</strong> is now: <strong>${escapeHtml(status)}</strong></p>
        <p>${escapeHtml(message)}</p>
        <p>You can review your orders anytime in your account.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order #${orderIdLabel(orderId)} — ${status}`,
    html,
  });
};

export const sendAdminNewOrderAlert = async ({
  orderId,
  customerName,
  amount,
}) => {
  const adminTo =
    process.env.ORDERS_ALERT_EMAIL || process.env.ADMIN_EMAIL;
  if (!adminTo) {
    console.warn("[email] No ORDERS_ALERT_EMAIL or ADMIN_EMAIL for admin alerts");
    return;
  }

  const html = `
        <h2>New order received</h2>
        <p><strong>Order:</strong> #${escapeHtml(orderIdLabel(orderId))} (${escapeHtml(String(orderId))})</p>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Amount:</strong> ₹${Number(amount) || 0}</p>
        <p>Sign in to the admin panel to process this order.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: adminTo,
    subject: `New order #${orderIdLabel(orderId)}`,
    html,
  });
};

export const sendOrderCancellationEmail = async ({
  userEmail,
  userName,
  orderId,
}) => {
  if (!userEmail) return;
  const html = `
        <h2>Order cancelled</h2>
        <p>Hi ${escapeHtml(userName)},</p>
        <p>Your order <strong>#${escapeHtml(orderIdLabel(orderId))}</strong> has been cancelled as you requested.</p>
        <p>For cash on delivery, no payment was taken. For prepaid orders, contact support if you need a refund.</p>
        <p>We hope to serve you again.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order #${orderIdLabel(orderId)} cancelled`,
    html,
  });
};

export const sendAdminCancellationAlert = async ({
  orderId,
  customerName,
}) => {
  const adminTo =
    process.env.ORDERS_ALERT_EMAIL || process.env.ADMIN_EMAIL;
  if (!adminTo) {
    console.warn("[email] No ORDERS_ALERT_EMAIL or ADMIN_EMAIL for admin alerts");
    return;
  }

  const html = `
        <h2>Order cancelled by customer</h2>
        <p><strong>Order:</strong> #${escapeHtml(orderIdLabel(orderId))} (${escapeHtml(String(orderId))})</p>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p>Check the admin panel for details.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: adminTo,
    subject: `Order #${orderIdLabel(orderId)} cancelled by customer`,
    html,
  });
};

export const sendPasswordResetEmail = async (email, name, resetLink) => {
  if (!email || !resetLink) return;
  const html = `
        <h2>Reset your password</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Click the link below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <p><a href="${resetLink}">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
    `;

  await sendSafe({
    from: `"Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password reset",
    html,
  });
};
