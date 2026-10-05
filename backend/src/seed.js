require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

try {
  require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const User = require("./models/User.model");
const Resource = require("./models/Resource.model");
const BorrowRequest = require("./models/BorrowRequest.model");
const Transaction = require("./models/Transaction.model");
const Review = require("./models/Review.model");
const Notification = require("./models/Notification.model");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, options);
    console.log(
      `Connected to: ${mongoose.connection.host} / ${mongoose.connection.name}`
    );

    console.log("\n--- Clearing existing seedable collections ---");

    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      BorrowRequest.deleteMany({}),
      Transaction.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log(
      "Cleared User, Resource, BorrowRequest, Transaction, Review, and Notification collections."
    );

    // ─────────────────────────────────────────────────────────────
    // 1. SEED USERS
    // ─────────────────────────────────────────────────────────────

    console.log("\n1. Seeding Users...");

    // Using User.create() so userSchema.pre('save') runs and hashes passwords
    const usersData = [
      {
        name: "Admin User",
        email: "admin@mail.com",
        password: "admin123",
        role: "admin",
        contactInfo: "+91 9876543210",
        profilePicture:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        rating: { average: 5.0, count: 12 },
        isActive: true,
      },
      {
        name: "Abc",
        email: "abc@mail.com",
        password: "abc123",
        role: "student",
        contactInfo: "+91 1234567890",
        profilePicture:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        rating: { average: 4.8, count: 6 },
        isActive: true,
      },
      {
        name: "Def",
        email: "def@mail.com",
        password: "def123",
        role: "student",
        contactInfo: "+91 1357924680",
        profilePicture:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        rating: { average: 4.8, count: 6 },
        isActive: true,
      },
      {
        name: "Xyz",
        email: "xyz@mail.com",
        password: "xyz123",
        role: "student",
        contactInfo: "+91 0987654321",
        profilePicture:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        rating: { average: 4.9, count: 9 },
        isActive: true,
      },
    ];

    const users = await User.create(usersData);
    const [admin, abc, def, xyz] = users;

    console.log(`✓ Seeded ${users.length} Users.`);

    // ─────────────────────────────────────────────────────────────
    // 2. SEED RESOURCES
    // ─────────────────────────────────────────────────────────────

    console.log("\n2. Seeding Resources...");

    const resourcesData = [
      {
        owner: abc._id,
        title: "Data Structures & Algorithms",
        category: "book",
        description: "4th Edition.",
        condition: "good",
        images: [
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
        ],
        listingType: "lend",
        securityDeposit: 250,
        isAvailable: true,
      },
      {
        owner: xyz._id,
        title: "Change Your Habit Change Your Life",
        category: "book",
        description:
          "A guide to building positive habits and breaking negative ones. Perfect for personal development and self-improvement.",
        condition: "good",
        images: [
          "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
        ],
        listingType: "lend",
        securityDeposit: 500,
        isAvailable: false,
      },
      {
        owner: abc._id,
        title: "Arduino Uno R3 Ultimate Starter Kit & Sensors",
        category: "electronics",
        description:
          "Complete electronics kit with Arduino Uno, breadboard, 50+ jumper wires, LEDs, ultrasonic sensor, and LCD screen.",
        condition: "new",
        images: [
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
        ],
        videos: [
          "https://www.youtube.com/watch?v=k_xRj7fE3hI",
        ],
        listingType: "lend",
        securityDeposit: 700,
        isAvailable: true,
      },
      {
        owner: def._id,
        title: "Mechanical Keyboard",
        category: "lab-equipment",
        description:
          "Custom-built mechanical keyboard with Cherry MX Blue switches, RGB backlighting, and detachable USB-C cable. Ideal for programming and gaming.",
        condition: "good",
        images: [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        ],
        videos: [
          "https://www.youtube.com/watch?v=H62d7c54h8Y",
        ],
        listingType: "lend",
        securityDeposit: 1200,
        isAvailable: true,
      },
    ];

    const resources = await Resource.create(resourcesData);

    const [
      dsaBook,
      CHCLBook,
      arduinoKit,
      mechanicalKeyboard,
    ] = resources;

    console.log(`✓ Seeded ${resources.length} Resources.`);

    // ─────────────────────────────────────────────────────────────
    // 3. SEED BORROW REQUESTS
    // ─────────────────────────────────────────────────────────────

    console.log("\n3. Seeding Borrow Requests...");

    const now = new Date();

    const inDays = (days) =>
      new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const daysAgo = (days) =>
      new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const borrowRequestsData = [
      {
        resource: dsaBook._id,
        requester: def._id,
        owner: abc._id,
        borrowDuration: {
          startDate: inDays(1),
          endDate: inDays(14),
        },
        status: "pending",
        depositPaid: false,
        depositStatus: "pending",
        message:
          "Hi! I need this book to prepare for my upcoming Data Structures and Algorithms exam. I will take good care of it!",
      },
      {
        resource: arduinoKit._id,
        requester: xyz._id,
        owner: abc._id,
        borrowDuration: {
          startDate: daysAgo(2),
          endDate: inDays(5),
        },
        status: "accepted",
        depositPaid: true,
        depositStatus: "pending",
        message:
          "Hi! I need the Arduino kit for my electronics project. I will return all the components safely.",
      },
      {
        resource: arduinoKit._id,
        requester: def._id,
        owner: abc._id,
        borrowDuration: {
          startDate: daysAgo(16),
          endDate: daysAgo(2),
        },
        status: "returned",
        depositPaid: true,
        depositStatus: "refunded",
        message:
          "I needed the Arduino kit for a two-week project. Thanks for lending it!",
      },
      {
        resource: mechanicalKeyboard._id,
        requester: xyz._id,
        owner: def._id,
        borrowDuration: {
          startDate: daysAgo(10),
          endDate: daysAgo(5),
        },
        status: "rejected",
        depositPaid: false,
        depositStatus: "pending",
        message:
          "Can I borrow your mechanical keyboard for my programming and gaming setup?",
      },
      {
        resource: dsaBook._id,
        requester: xyz._id,
        owner: abc._id,
        borrowDuration: {
          startDate: daysAgo(7),
          endDate: inDays(3),
        },
        status: "cancelled",
        depositPaid: false,
        depositStatus: "pending",
        message:
          "I no longer need the book because my exam preparation schedule changed.",
      },
    ];

    const borrowRequests = await BorrowRequest.create(borrowRequestsData);

    const [
      reqPending,
      reqAccepted,
      reqReturned,
      reqRejected,
      reqCancelled,
    ] = borrowRequests;

    console.log(`✓ Seeded ${borrowRequests.length} Borrow Requests.`);

    // ─────────────────────────────────────────────────────────────
    // 4. SEED TRANSACTIONS
    // ─────────────────────────────────────────────────────────────

    console.log("\n4. Seeding Transactions...");

    const transactionsData = [
      {
        borrowRequest: reqReturned._id,
        resource: arduinoKit._id,
        lender: abc._id,
        borrower: def._id,
        depositAmount: 700,
        depositStatus: "refunded",
        completedAt: daysAgo(2),
      },
      {
        borrowRequest: reqAccepted._id,
        resource: arduinoKit._id,
        lender: abc._id,
        borrower: xyz._id,
        depositAmount: 700,
        depositStatus: "pending",
        completedAt: null,
      },
    ];

    const transactions = await Transaction.create(transactionsData);

    const [txCompleted, txOngoing] = transactions;

    console.log(`✓ Seeded ${transactions.length} Transactions.`);

    // ─────────────────────────────────────────────────────────────
    // 5. SEED REVIEWS
    // ─────────────────────────────────────────────────────────────

    console.log("\n5. Seeding Reviews...");

    const reviewsData = [
      {
        reviewer: def._id,
        targetType: "user",
        targetUser: abc._id,
        rating: 5,
        comment:
          "ABC was very responsive and handed over the Arduino kit with all components included.",
        transaction: txCompleted._id,
      },
      {
        reviewer: def._id,
        targetType: "resource",
        targetResource: arduinoKit._id,
        rating: 5,
        comment:
          "Excellent Arduino starter kit. All the components were included and everything worked properly.",
        transaction: txCompleted._id,
      },
      {
        reviewer: abc._id,
        targetType: "user",
        targetUser: def._id,
        rating: 5,
        comment:
          "DEF returned the Arduino kit on time and in good condition. Very trustworthy borrower!",
        transaction: txCompleted._id,
      },
    ];

    const reviews = await Review.create(reviewsData);

    console.log(`✓ Seeded ${reviews.length} Reviews.`);

    // ─────────────────────────────────────────────────────────────
    // 6. SEED NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    console.log("\n6. Seeding Notifications...");

    const notificationsData = [
      {
        recipient: abc._id,
        type: "borrow_request",
        message:
          "DEF requested to borrow 'Data Structures & Algorithms'.",
        relatedResource: dsaBook._id,
        relatedRequest: reqPending._id,
        isRead: false,
      },
      {
        recipient: xyz._id,
        type: "request_accepted",
        message:
          "Your request for 'Arduino Uno R3 Ultimate Starter Kit & Sensors' was accepted.",
        relatedResource: arduinoKit._id,
        relatedRequest: reqAccepted._id,
        isRead: false,
      },
      {
        recipient: xyz._id,
        type: "deposit_update",
        message:
          "Deposit of ₹700 is pending for 'Arduino Uno R3 Ultimate Starter Kit & Sensors'.",
        relatedResource: arduinoKit._id,
        relatedRequest: reqAccepted._id,
        isRead: false,
      },
      {
        recipient: def._id,
        type: "transaction_complete",
        message:
          "Transaction completed for 'Arduino Uno R3 Ultimate Starter Kit & Sensors'. Your deposit of ₹700 has been refunded.",
        relatedResource: arduinoKit._id,
        relatedRequest: reqReturned._id,
        isRead: true,
      },
      {
        recipient: xyz._id,
        type: "request_rejected",
        message:
          "Your request for 'Mechanical Keyboard' was declined by DEF.",
        relatedResource: mechanicalKeyboard._id,
        relatedRequest: reqRejected._id,
        isRead: true,
      },
      {
        recipient: xyz._id,
        type: "return_reminder",
        message:
          "Reminder: 'Arduino Uno R3 Ultimate Starter Kit & Sensors' is due for return in 5 days.",
        relatedResource: arduinoKit._id,
        relatedRequest: reqAccepted._id,
        isRead: false,
      },
      {
        recipient: admin._id,
        type: "borrow_request",
        message:
          "Platform Activity: 5 borrow requests and 2 transactions have been processed.",
        relatedResource: null,
        relatedRequest: null,
        isRead: false,
      },
    ];

    const notifications = await Notification.create(notificationsData);

    console.log(`✓ Seeded ${notifications.length} Notifications.`);

    console.log("\n=======================================================");
    console.log("             DATABASE SEEDING COMPLETE!               ");
    console.log("=======================================================");

    console.log("\nSummary of Test Accounts:");
    console.log("  • Admin:   admin@mail.com / admin123");
    console.log("  • Student: abc@mail.com / abc123");
    console.log("  • Student: def@mail.com / def123");
    console.log("  • Student: xyz@mail.com / xyz123");

    console.log("=======================================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seedDatabase();