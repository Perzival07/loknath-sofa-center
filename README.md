# 🛋️ Loknath Sofa Center - E-commerce Platform

A full-stack e-commerce web application built using the MERN stack (MongoDB, Express.js, React, Node.js) designed specifically for **Loknath Sofa Center**. It features product listing, a dynamic shopping cart, secure payments, order management, and a dedicated administrative dashboard to manage the entire store.

## ✨ Project Novelty & Highlights

While many e-commerce templates are built for generic retail, this platform is deeply customized for the unique logistics of a **specialized furniture business**. Its core novelties include:
- **Decoupled Admin Architecture:** Instead of handling admin privileges within the storefront application, the business administration is completely separated into its own standalone React application (`/admin`). This guarantees higher security, isolated performance, and a completely distraction-free workspace for business management.
- **Hybrid Payment Ecosystem:** Seamlessly bridges global physical and digital payment methods tailored to the regional customer base, supporting international credit gateways (Stripe), local UPI/digital wallets (Razorpay), and traditional Cash on Delivery (COD). 
- **Tailored Furniture Infrastructure:** Custom MongoDB schemas created specifically to support the complexities of furniture e-commerce, such as custom configurations, varied image assets (hosted on Cloudinary), and multi-stage order tracking.

## 🚀 Core Features

- **User Authentication:** Secure registration and login using JWT & Google Auth.
- **Product Management:** Browse, search, and view detailed product information.
- **Shopping Cart & Checkout:** Add products to the cart and smoothly process orders.
- **Payment Integration:** Secure payment flows supporting Stripe, Razorpay, and Cash on Delivery (COD).
- **Admin Dashboard:** A dedicated portal to manage inventory, users, and oversee orders.
- **Responsive Design:** Fully responsive UI built with React and Tailwind CSS, providing a seamless mobile and desktop experience.

## 🖥️ Technologies & Tools Used

### Frontend Architecture
- **React.js & Vite:** High-performance, component-based user interface using Vite for rapid HMR and optimized builds.
- **Tailwind CSS:** Utility-first CSS framework for rapid, responsive UI design.
- **React Router Dom:** For seamless Single Page Application (SPA) navigation.
- **Axios:** Promise-based HTTP client for data fetching.
- **React Toastify:** For elegant, interactive UI notifications.

### Backend Architecture
- **Node.js & Express.js:** Scalable runtime and minimalist framework for building robust REST APIs.
- **MongoDB & Mongoose:** NoSQL database tailored for diverse furniture listings alongside Object Data Modeling (ODM).
- **JWT & bcrypt:** Secures user endpoints and effectively hashes passwords to prevent data leaks.
- **Multer:** Handles multipart/form-data for seamless image file uploading.

### Integrations & Services
- **Cloudinary:** Cloud-based image hosting/delivery for optimized loading of heavy furniture visual assets.
- **Stripe & Razorpay Node SDKs:** Server-side processing for global and local secure payment channels.
- **Nodemailer:** Handles automated application emails (e.g., order confirmations).

## 🔄 Project Workflow

1. **User Discovery & Interaction:** Customers browse the product catalog on the React frontend. State operations handle filtering and searching seamlessly.
2. **Cart & Authentication:** Users add desired furniture to their shopping cart. They are prompted to log in (via JWT/Google Auth) before checkout to secure their session.
3. **Checkout & Transaction:** 
   - Customers select Cash on Delivery (COD), Razorpay, or Stripe. 
   - The frontend communicates securely with the Express API. Secure transaction sessions are uniquely verified via third-party webhooks.
4. **Order Fulfillment Initiation:** Post-transaction, the Express backend updates MongoDB—flagging items, reducing available stock, and creating a formal `Order` document.
5. **Admin Operation:** The store owner logs into the decoupled `/admin` React portal. They review live orders, update processing statuses (e.g., to "Shipped/Delivered"), and manage new store inventory entries.

## 📐 Wireframing & Design Strategy

The UX/UI of the Loknath Sofa Center was designed following a mobile-first philosophy to comfortably accommodate mobile user traffic:
- **Storefront Navigation flow:**
  `Home Landing (Hero & Promos)` ➡️ `Category Grids (Sofas, Chairs, Sets)` ➡️ `Detailed Product Page` ➡️ `Cart Drawer` ➡️ `Payment & Checkout Hub`.
- **Component Styling:** Highly visual design relying on clean whitespace, Tailwind utility spacing, and consistent modular card layouts for showcasing furniture photography.
- **Admin Navigation flow:**
  `Secure Login Portal` ➡️ `Central Analytics Dashboard` ➡️ `Inventory List (CRUD interfaces)` ➡️ `Order Tracking Desk`.

## 🧱 Project Structure

```text
loknath-sofa-center/
├── .gitignore
├── README.md
├── admin
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   ├── icon.png
│   │   └── vite.svg
│   ├── src
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   ├── add_icon.png
│   │   │   ├── assets.js
│   │   │   ├── logo.png
│   │   │   ├── logo_login.png
│   │   │   ├── order_icon.png
│   │   │   ├── parcel_icon.svg
│   │   │   └── upload_area.png
│   │   ├── components
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── Add.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── List.jsx
│   │   │   └── Orders.jsx
│   │   └── utils
│   │       └── dimensionsConverter.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── assets
│   └── logos
│       └── logoFinal.png
├── backend
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   ├── config
│   │   ├── cloudinary.js
│   │   ├── mongodb.js
│   │   └── validateEnv.js
│   ├── controllers
│   │   ├── cartController.js
│   │   ├── deliveryController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   └── wishlistController.js
│   ├── middleware
│   │   ├── adminAuth.js
│   │   ├── auth.js
│   │   ├── multer.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── models
│   │   ├── orderModel.js
│   │   ├── passwordResetModel.js
│   │   ├── productModel.js
│   │   ├── refreshTokenModel.js
│   │   ├── reviewModel.js
│   │   ├── userModel.js
│   │   └── wishlistModel.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes
│   │   ├── cartRoute.js
│   │   ├── deliveryRoute.js
│   │   ├── orderRoute.js
│   │   ├── productRoute.js
│   │   ├── reviewRoute.js
│   │   ├── userRoute.js
│   │   └── wishlistRoute.js
│   ├── server.js
│   ├── services
│   │   └── emailService.js
│   ├── utils
│   │   ├── deliveryCalculator.js
│   │   └── logger.js
│   └── vercel.json
└── frontend
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   ├── icon.png
    │   └── vite.svg
    ├── src
    │   ├── App.jsx
    │   ├── assets
    │   │   ├── about_img.png
    │   │   ├── assets.js
    │   │   ├── bin_icon.png
    │   │   ├── cart_icon.png
    │   │   ├── contact_img.png
    │   │   ├── cross_icon.png
    │   │   ├── dropdown_icon.png
    │   │   ├── exchange_icon.png
    │   │   ├── hero_img.jpg
    │   │   ├── logo.png
    │   │   ├── menu_icon.png
    │   │   ├── profile_icon.png
    │   │   ├── quality_icon.png
    │   │   ├── razorpay_logo.png
    │   │   ├── search_icon.png
    │   │   ├── star_dull_icon.png
    │   │   ├── star_icon.png
    │   │   ├── stripe_logo.png
    │   │   ├── support_img.png
    │   │   ├── upi_qr.jpeg
    │   │   └── wishlist_icon.svg
    │   ├── components
    │   │   ├── BestSeller.jsx
    │   │   ├── CartTotal.jsx
    │   │   ├── Footer.jsx
    │   │   ├── GoogleBusinessProfile.jsx
    │   │   ├── Hero.jsx
    │   │   ├── LatestCollection.jsx
    │   │   ├── LoadingSkeleton.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NewsletterBox.jsx
    │   │   ├── OurPolicy.jsx
    │   │   ├── ProducItem.jsx
    │   │   ├── RelatedProducts.jsx
    │   │   ├── SearchBar.jsx
    │   │   └── Title.jsx
    │   ├── context
    │   │   └── ShopContext.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── About.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Collection.jsx
    │   │   ├── Contact.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── Orders.jsx
    │   │   ├── PlaceOrder.jsx
    │   │   ├── PrivacyPolicy.jsx
    │   │   ├── Product.jsx
    │   │   ├── Profile.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Verify.jsx
    │   │   └── Wishlist.jsx
    │   └── utils
    │       └── dimensionsConverter.js
    ├── tailwind.config.js
    ├── vercel.json
    └── vite.config.js
```

## ⚙️ Local Installation & Setup Guide

### 1. Clone the project

```bash
git clone https://github.com/Perzival07/loknath-sofa-center.git
cd loknath-sofa-center
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:

```env
MONGODB_URL=your_mongodb_atlas_connection_string
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
CLOUDINARY_NAME=your_cloudinary_name
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
PORT=5000
```

Start the backend development server:

```bash
npm run dev
```

### 3. Setup Frontend

Open a new terminal session:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Run the frontend server:

```bash
npm run dev
```

### 4. Setup Admin Panel

Open another terminal session:

```bash
cd admin
npm install
```

Create any required environment variables (e.g., `VITE_BACKEND_URL`) in a `.env` file in the `admin/` directory, then start the panel:

```bash
npm run dev
```

## ☎︎ Contact & Support

If you have any questions or need further clarification, please reach out!

- **Email:** [loknathsofacenter@gmail.com](mailto:loknathsofacenter@gmail.com)
