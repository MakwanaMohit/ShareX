require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
try {
  require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");
const app = require("./src/app");
const http = require("http");

const PORT = 5055;
let server;
let baseUrl = `http://127.0.0.1:${PORT}/api`;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

let passed = 0;
let failed = 0;

function assert(condition, message, detail = "") {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${message}`);
    passed++;
  } else {
    console.error(`  ${colors.red}✖ FAIL:${colors.reset} ${message} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const method = options.method || "GET";
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === "object" && !(body instanceof String)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }

  const rawCookies = res.headers.get("set-cookie") || "";

  return {
    status: res.status,
    headers: res.headers,
    cookies: rawCookies,
    data: json,
  };
}

async function runTests() {
  console.log(`${colors.bold}${colors.cyan}====================================================`);
  console.log(`       STARTING SHAREX FULL BACKEND TEST SUITE`);
  console.log(`====================================================${colors.reset}\n`);

  try {
    const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`${colors.green}Connected to MongoDB database: ${mongoose.connection.name}${colors.reset}\n`);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Test server running at ${baseUrl}\n`);

    const timestamp = Date.now();
    const testEmail1 = `alice_${timestamp}@test.edu`;
    const testEmail2 = `bob_${timestamp}@test.edu`;
    const testAdminEmail = `admin_${timestamp}@test.edu`;

    let student1Token = "";
    let student1Cookie = "";
    let student1Id = "";

    let student2Token = "";
    let student2Cookie = "";
    let student2Id = "";

    let adminToken = "";
    let adminId = "";

    let createdResourceId = "";
    let createdBorrowRequestId = "";
    let createdTransactionId = "";
    let createdNotificationId = "";

    // ─── 1. Health Check ──────────────────────────────────────────────────────────
    console.log(`${colors.yellow}1. HEALTH CHECK${colors.reset}`);
    {
      const res = await request("/health");
      assert(res.status === 200, "GET /api/health returned HTTP 200");
      assert(res.data.success === true, "Health check success flag is true");
    }

    // ─── 2. Auth API ──────────────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}2. AUTHENTICATION & TOKEN SYSTEM (/api/auth)${colors.reset}`);
    {
      const reg1 = await request("/auth/register", {
        method: "POST",
        body: { name: "Alice Wonderland", email: testEmail1, password: "password123" },
      });
      assert(reg1.status === 201, "POST /api/auth/register (Student 1) created user (201)");
      assert(Boolean(reg1.data.data?.accessToken), "Access token received for Student 1");
      student1Token = reg1.data.data?.accessToken;
      student1Id = reg1.data.data?.user?.id;
      student1Cookie = reg1.cookies;

      const dup = await request("/auth/register", {
        method: "POST",
        body: { name: "Alice Duplicate", email: testEmail1, password: "password123" },
      });
      assert(dup.status === 409, "Duplicate email registration rejected with 409 Conflict");

      const reg2 = await request("/auth/register", {
        method: "POST",
        body: { name: "Bob Builder", email: testEmail2, password: "password123" },
      });
      assert(reg2.status === 201, "POST /api/auth/register (Student 2) created user (201)");
      student2Token = reg2.data.data?.accessToken;
      student2Id = reg2.data.data?.user?.id;
      student2Cookie = reg2.cookies;

      const regAdmin = await request("/auth/register", {
        method: "POST",
        body: { name: "Super Admin", email: testAdminEmail, password: "password123" },
      });
      adminId = regAdmin.data.data?.user?.id;
      const User = require("./src/models/User.model");
      await User.findByIdAndUpdate(adminId, { role: "admin" });

      const loginAdmin = await request("/auth/login", {
        method: "POST",
        body: { email: testAdminEmail, password: "password123" },
      });
      assert(loginAdmin.status === 200, "POST /api/auth/login successful for Admin (200)");
      adminToken = loginAdmin.data.data?.accessToken;

      const login1 = await request("/auth/login", {
        method: "POST",
        body: { email: testEmail1, password: "password123" },
      });
      assert(login1.status === 200, "POST /api/auth/login successful for Student 1 (200)");
      assert(login1.data.data?.user?.email === testEmail1, "Logged in user email matches");

      const invalidLogin = await request("/auth/login", {
        method: "POST",
        body: { email: testEmail1, password: "wrongpassword" },
      });
      assert(invalidLogin.status === 401, "Invalid password login rejected with 401");

      const getMe = await request("/auth/me", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(getMe.status === 200, "GET /api/auth/me returns current user profile (200)");
      assert(getMe.data.data?.user?.name === "Alice Wonderland", "Current user payload verified");

      const refreshCookieHeader = student1Cookie.split(";")[0];
      const refreshRes = await request("/auth/refresh", {
        method: "POST",
        headers: { Cookie: refreshCookieHeader },
      });
      assert(refreshRes.status === 200, "POST /api/auth/refresh returns new access token (200)");
      if (refreshRes.data.data?.accessToken) {
        student1Token = refreshRes.data.data.accessToken;
      }

      const logoutRes = await request("/auth/logout", {
        method: "POST",
      });
      assert(logoutRes.status === 200, "POST /api/auth/logout clears cookie successfully (200)");
    }

    // ─── 3. User Profile API ──────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}3. USER PROFILE API (/api/users)${colors.reset}`);
    {
      const ownProfile = await request("/users/profile", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(ownProfile.status === 200, "GET /api/users/profile fetches user profile");

      const updateProf = await request("/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: {
          name: "Alice Updated",
          contactInfo: "+91-9876543210 / Telegram: @alice",
          profilePicture: "https://example.com/alice.jpg",
        },
      });
      assert(updateProf.status === 200, "PUT /api/users/profile updates user details");
      assert(updateProf.data.data?.user?.name === "Alice Updated", "Updated profile name confirmed");

      const pubProf = await request(`/users/${student1Id}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(pubProf.status === 200, "GET /api/users/:userId fetches public profile");
      assert(pubProf.data.data?.user?.name === "Alice Updated", "Public profile shows updated name");
    }

    // ─── 4. Resource API ──────────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}4. RESOURCE API (/api/resources)${colors.reset}`);
    {
      const createRes = await request("/resources", {
        method: "POST",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: {
          title: "Introduction to Algorithms (CLRS 3rd Ed)",
          category: "book",
          description: "Standard computer science algorithms textbook in great condition.",
          condition: "good",
          images: ["https://example.com/clrs.jpg"],
          listingType: "lend",
          securityDeposit: 300,
        },
      });
      assert(createRes.status === 201, "POST /api/resources creates new resource listing (201)");
      createdResourceId = createRes.data.data?.resource?._id;
      assert(Boolean(createdResourceId), "Resource ID generated properly");

      const listAll = await request("/resources");
      assert(listAll.status === 200, "GET /api/resources lists all resources");
      assert(Array.isArray(listAll.data.data?.resources), "Resources returned as an array");

      const searchRes = await request("/resources?search=Algorithms&category=book");
      assert(searchRes.status === 200, "GET /api/resources with search and category filters works");

      // Test public / unauthenticated access to single resource details
      const getSinglePublic = await request(`/resources/${createdResourceId}`);
      assert(getSinglePublic.status === 200, "GET /api/resources/:id fetches single resource without auth (Public/Anonymous)");
      assert(getSinglePublic.data.data?.resource?.title.includes("Algorithms"), "Public resource details verified");
      assert(Boolean(getSinglePublic.data.data?.resource?.owner?.email), "Resource owner email is exposed for contact");
      assert(!getSinglePublic.data.data?.resource?.owner?.contactInfo, "Resource owner phone/contactInfo is removed");

      const getSingle = await request(`/resources/${createdResourceId}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(getSingle.status === 200, "GET /api/resources/:id fetches single resource with auth");

      const updateRes = await request(`/resources/${createdResourceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: {
          title: "Introduction to Algorithms (CLRS 4th Ed)",
          category: "book",
          condition: "new",
          listingType: "lend",
          securityDeposit: 350,
        },
      });
      assert(updateRes.status === 200, "PUT /api/resources/:id updates resource by owner");

      const unauthorizedEdit = await request(`/resources/${createdResourceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: { title: "Hacked title" },
      });
      assert(unauthorizedEdit.status === 403, "Non-owner edit attempt rejected with 403 Forbidden");

      const toggleRes = await request(`/resources/${createdResourceId}/availability`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(toggleRes.status === 200, "PATCH /api/resources/:id/availability toggles status");

      await request(`/resources/${createdResourceId}/availability`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      const myListings = await request("/resources/my/listings", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(myListings.status === 200, "GET /api/resources/my/listings fetches owner's resources");
      assert(myListings.data.data?.resources?.length > 0, "My listings contains created resource");
    }

    // ─── 5. Borrow API ────────────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}5. BORROW REQUEST API (/api/borrow)${colors.reset}`);
    {
      const selfBorrow = await request("/borrow", {
        method: "POST",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: {
          resourceId: createdResourceId,
          startDate: "2026-10-01",
          endDate: "2026-10-15",
          message: "Can I borrow my own book?",
        },
      });
      assert(selfBorrow.status === 400, "Self-borrow attempt blocked with 400 Bad Request");

      const borrowRes = await request("/borrow", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          resourceId: createdResourceId,
          startDate: "2026-10-01",
          endDate: "2026-10-15",
          message: "Need this for upcoming midterms. Will handle carefully!",
        },
      });
      assert(borrowRes.status === 201, "POST /api/borrow creates borrow request (201)");
      createdBorrowRequestId = borrowRes.data.data?.borrowRequest?._id;

      const dupBorrow = await request("/borrow", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          resourceId: createdResourceId,
          startDate: "2026-10-01",
          endDate: "2026-10-15",
        },
      });
      assert(dupBorrow.status === 409, "Duplicate pending borrow request rejected with 409");

      const incoming = await request("/borrow/incoming", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(incoming.status === 200, "GET /api/borrow/incoming fetches owner's pending requests");
      assert(incoming.data.data?.requests?.some((r) => r._id === createdBorrowRequestId), "Incoming request found");

      const outgoing = await request("/borrow/outgoing", {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(outgoing.status === 200, "GET /api/borrow/outgoing fetches requester's sent requests");

      const acceptRes = await request(`/borrow/${createdBorrowRequestId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(acceptRes.status === 200, "PATCH /api/borrow/:id/accept accepts borrow request (200)");
      assert(acceptRes.data.data?.request?.status === "accepted", "Borrow request marked accepted");

      const checkedRes = await request(`/resources/${createdResourceId}`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(checkedRes.data.data?.resource?.isAvailable === false, "Resource automatically set isAvailable: false");

      const returnRes = await request(`/borrow/${createdBorrowRequestId}/return`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(returnRes.status === 200, "PATCH /api/borrow/:id/return marks borrow request returned (200)");

      const restoredRes = await request(`/resources/${createdResourceId}`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(restoredRes.data.data?.resource?.isAvailable === true, "Resource automatically restored to available");
    }

    // ─── 6. Transaction API ───────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}6. TRANSACTION API (/api/transactions)${colors.reset}`);
    {
      const txRes = await request("/transactions", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(txRes.status === 200, "GET /api/transactions returns user's transaction history");
      assert(txRes.data.data?.transactions?.length > 0, "Transactions history list populated");
      createdTransactionId = txRes.data.data?.transactions?.[0]?._id;

      const singleTx = await request(`/transactions/${createdTransactionId}`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(singleTx.status === 200, "GET /api/transactions/:id returns single transaction");

      const updateDeposit = await request(`/transactions/${createdTransactionId}/deposit-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: { depositStatus: "refunded" },
      });
      assert(updateDeposit.status === 200, "PATCH /api/transactions/:id/deposit-status marks deposit refunded");
      assert(updateDeposit.data.data?.transaction?.depositStatus === "refunded", "Deposit status verified");
    }

    // ─── 7. Review API ────────────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}7. REVIEW API (/api/reviews)${colors.reset}`);
    {
      const userRev = await request("/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          transactionId: createdTransactionId,
          targetType: "user",
          targetUserId: student1Id,
          rating: 5,
          comment: "Great lender, textbook was in pristine condition!",
        },
      });
      assert(userRev.status === 201, "POST /api/reviews submits user review (201)");

      const resRev = await request("/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          transactionId: createdTransactionId,
          targetType: "resource",
          targetResourceId: createdResourceId,
          rating: 5,
          comment: "Clear diagrams and comprehensive explanations.",
        },
      });
      assert(resRev.status === 201, "POST /api/reviews submits resource review (201)");

      const getUserRev = await request(`/reviews/user/${student1Id}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(getUserRev.status === 200, "GET /api/reviews/user/:userId fetches user reviews");
      assert(getUserRev.data.data?.reviews?.length > 0, "User reviews array contains new review");

      const updatedUser = await request(`/users/${student1Id}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(updatedUser.data.data?.user?.rating?.average === 5, "User average rating recalculated to 5.0");

      const getResRev = await request(`/reviews/resource/${createdResourceId}`, {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(getResRev.status === 200, "GET /api/reviews/resource/:resourceId fetches resource reviews");
    }

    // ─── 8. Notification API ──────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}8. NOTIFICATION API (/api/notifications)${colors.reset}`);
    {
      const notifs = await request("/notifications", {
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(notifs.status === 200, "GET /api/notifications fetches user notifications");
      assert(notifs.data.data?.notifications?.length > 0, "User has automated lifecycle notifications");
      createdNotificationId = notifs.data.data?.notifications?.[0]?._id;

      const markSingle = await request(`/notifications/${createdNotificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(markSingle.status === 200, "PATCH /api/notifications/:id/read marks single notification read");

      const markAll = await request("/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(markAll.status === 200, "PATCH /api/notifications/read-all marks all notifications read");
    }

    // ─── 9. Admin API ─────────────────────────────────────────────────────────────
    console.log(`\n${colors.yellow}9. ADMIN API (/api/admin)${colors.reset}`);
    {
      const unauthAdmin = await request("/admin/users", {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(unauthAdmin.status === 403, "Student access to /api/admin/users blocked with 403 Forbidden");

      const adminUsers = await request("/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(adminUsers.status === 200, "GET /api/admin/users (Admin) fetches all platform users");
      assert(adminUsers.data.data?.users?.length >= 3, "Admin user list contains all registered test users");

      const adminSingleUser = await request(`/admin/users/${student2Id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(adminSingleUser.status === 200, "GET /api/admin/users/:id fetches single user details");

      const adminUpdateUser = await request(`/admin/users/${student2Id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { isActive: true },
      });
      assert(adminUpdateUser.status === 200, "PUT /api/admin/users/:id updates user by admin");

      const adminResources = await request("/admin/resources", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(adminResources.status === 200, "GET /api/admin/resources fetches all platform resources");

      const adminTx = await request("/admin/transactions", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(adminTx.status === 200, "GET /api/admin/transactions fetches all platform transactions");
    }

    // ─── 10. Razorpay Payment Lifecycle API ─────────────────────────────────────────
    console.log(`\n${colors.yellow}10. RAZORPAY PAYMENT LIFECYCLE API (/api/payment)${colors.reset}`);
    let rzpResourceId = "";
    let rzpRequestId = "";
    {
      const crypto = require("crypto");

      // 1. Create a resource with security deposit and Razorpay accepted
      const rzpResourceRes = await request("/resources", {
        method: "POST",
        headers: { Authorization: `Bearer ${student1Token}` },
        body: {
          title: "Advanced Robotics Kit",
          category: "electronics",
          condition: "good",
          listingType: "lend",
          securityDeposit: 1500,
          acceptedPaymentMethods: ["pay_on_collection", "razorpay"],
          description: "Full robotics kit with sensors and microcontrollers.",
        },
      });
      assert(rzpResourceRes.status === 201, "POST /api/resources created resource with Razorpay payment method");
      rzpResourceId = rzpResourceRes.data.data?.resource?._id;
      assert(
        rzpResourceRes.data.data?.resource?.acceptedPaymentMethods?.includes("razorpay"),
        "Resource acceptedPaymentMethods includes razorpay"
      );

      // 2. Student 2 sends borrow request selecting Razorpay
      const rzpBorrowRes = await request("/borrow", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          resourceId: rzpResourceId,
          startDate: "2026-10-10",
          endDate: "2026-10-25",
          paymentMethod: "razorpay",
          message: "Will pay the 1500 deposit via Razorpay.",
        },
      });
      assert(rzpBorrowRes.status === 201, "POST /api/borrow sent request with razorpay payment method");
      rzpRequestId = rzpBorrowRes.data.data?.borrowRequest?._id;
      assert(
        rzpBorrowRes.data.data?.borrowRequest?.paymentMethod === "razorpay",
        "Borrow request paymentMethod recorded as razorpay"
      );

      // 3. Owner accepts request -> status must transition to 'payment_processing'
      const rzpAcceptRes = await request(`/borrow/${rzpRequestId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(rzpAcceptRes.status === 200, "PATCH /api/borrow/:id/accept responds 200");
      assert(
        rzpAcceptRes.data.data?.request?.status === "payment_processing",
        "Borrow request transitions to 'payment_processing'"
      );
      const generatedOrderId = rzpAcceptRes.data.data?.request?.razorpayOrderId;
      assert(Boolean(generatedOrderId), "Razorpay order ID automatically created upon owner acceptance");

      // 4. Requester fetches/creates order endpoint
      const rzpOrderEndpointRes = await request(`/payment/create-order/${rzpRequestId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(rzpOrderEndpointRes.status === 200, "POST /api/payment/create-order/:requestId returns 200");
      assert(
        rzpOrderEndpointRes.data.data?.keyId === process.env.RAZORPAY_KEY_ID,
        "Order creation provides client Razorpay Key ID"
      );
      assert(
        rzpOrderEndpointRes.data.data?.amount === 150000,
        "Order amount in paise correctly matches ₹1500 (150000)"
      );

      // 5. Test invalid signature rejection
      const invalidVerifyRes = await request("/payment/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          requestId: rzpRequestId,
          razorpay_order_id: generatedOrderId || "order_fake_123",
          razorpay_payment_id: "pay_fake_456",
          razorpay_signature: "invalid_tampered_signature",
        },
      });
      assert(invalidVerifyRes.status === 400, "Invalid signature payment verification rejected with 400");

      // 6. Test valid signature verification
      const testPaymentId = `pay_test_${Date.now()}`;
      const validSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${generatedOrderId}|${testPaymentId}`)
        .digest("hex");

      const validVerifyRes = await request("/payment/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${student2Token}` },
        body: {
          requestId: rzpRequestId,
          razorpay_order_id: generatedOrderId,
          razorpay_payment_id: testPaymentId,
          razorpay_signature: validSignature,
        },
      });
      assert(validVerifyRes.status === 200, "POST /api/payment/verify succeeds with valid signature");
      assert(
        validVerifyRes.data.data?.request?.status === "accepted",
        "Borrow request successfully confirmed to 'accepted'"
      );
      assert(
        validVerifyRes.data.data?.request?.depositPaid === true,
        "Deposit marked as paid"
      );
      assert(
        validVerifyRes.data.data?.request?.depositStatus === "held",
        "Deposit status marked as 'held'"
      );
      assert(
        validVerifyRes.data.data?.transaction?.paymentMethod === "razorpay",
        "Transaction recorded with paymentMethod: razorpay"
      );

      // Check resource is now marked unavailable
      const rzpResourceCheck = await request(`/resources/${rzpResourceId}`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(
        rzpResourceCheck.data.data?.resource?.isAvailable === false,
        "Resource marked isAvailable: false after payment confirmed"
      );
    }

    // ─── 11. Cleanup & Account Deletion ───────────────────────────────────────────
    console.log(`\n${colors.yellow}11. CLEANUP & DELETION ENDPOINTS${colors.reset}`);
    {
      const delRes = await request(`/resources/${createdResourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(delRes.status === 200, "DELETE /api/resources/:id deletes resource listing (200)");

      const delUser = await request("/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(delUser.status === 200, "DELETE /api/users/profile deactivates student account");

      const User = require("./src/models/User.model");
      const Resource = require("./src/models/Resource.model");
      const BorrowRequest = require("./src/models/BorrowRequest.model");
      const Transaction = require("./src/models/Transaction.model");
      const Review = require("./src/models/Review.model");
      const Notification = require("./src/models/Notification.model");

      await User.deleteMany({ email: { $in: [testEmail1, testEmail2, testAdminEmail] } });
      await Resource.deleteMany({ _id: { $in: [createdResourceId, rzpResourceId] } });
      await BorrowRequest.deleteMany({ _id: { $in: [createdBorrowRequestId, rzpRequestId] } });
      await Transaction.deleteMany({ _id: { $in: [createdTransactionId] } });
      await Review.deleteMany({ reviewer: { $in: [student1Id, student2Id] } });
      await Notification.deleteMany({ recipient: { $in: [student1Id, student2Id] } });
      console.log(`  ${colors.green}Cleaned up test documents from database.${colors.reset}`);
    }

    console.log(`\n${colors.bold}${colors.cyan}====================================================`);
    console.log(`       TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================${colors.reset}\n`);

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
