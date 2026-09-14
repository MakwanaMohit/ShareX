# ShareX — Backend API Specifications
**Student Resource Exchange System**
**Stack:** Node.js · Express.js v5 · MongoDB + Mongoose · JWT Auth
**Base URL:** `http://localhost:5000/api`

---

## Table of Contents

1. [Auth & Token System](#1-auth--token-system)
2. [Global Conventions](#2-global-conventions)
3. [Auth API](#3-auth-api---apiauth)
4. [User API](#4-user-api---apiusers)
5. [Resource API](#5-resource-api---apiresources)
6. [Borrow API](#6-borrow-api---apiborrow)
7. [Transaction API](#7-transaction-api---apitransactions)
8. [Review API](#8-review-api---apireviews)
9. [Notification API](#9-notification-api---apinotifications)
10. [Admin API](#10-admin-api---apiadmin)
11. [Data Models Reference](#11-data-models-reference)
12. [Error Reference](#12-error-reference)

---

## 1. Auth & Token System

### Token Types

| Token | Expiry | Where Sent | How to Use |
|-------|--------|-----------|------------|
| **Access Token** | `10 minutes` | Response body | `Authorization: Bearer <token>` header |
| **Refresh Token** | `7 days` | HTTP-only cookie (`refreshToken`) | Sent automatically by browser |

### Access Token Payload
```json
{
  "id": "64f1a...",
  "role": "student",
  "email": "user@ddu.ac.in",
  "tokenType": "access",
  "iat": 1700000000,
  "exp": 1700000600
}
```

### Refresh Token Payload
```json
{
  "id": "64f1a...",
  "tokenType": "refresh",
  "iat": 1700000000,
  "exp": 1700604800
}
```

### Refresh Cookie Options
```
Cookie: refreshToken=<token>
HttpOnly: true
SameSite: Strict
Secure: true (production) / false (development)
MaxAge: 604800000ms (7 days)
```

### Token Refresh Flow
```
Access Token expires (10 min)
  → Client sends POST /api/auth/refresh  (no body needed, cookie sent automatically)
  → Server reads refreshToken cookie, verifies it
  → Returns new Access Token in response body
  → Client stores new access token and retries original request
```

### Environment Variables Required
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sharex
JWT_SECRET=<your_access_secret>
JWT_EXPIRES_IN=10m
JWT_REFRESH_SECRET=<your_refresh_secret>
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 2. Global Conventions

### Request Headers (protected routes)
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Success Response Shape
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```

### Error Response Shape
```json
{
  "success": false,
  "message": "Human readable error message"
}
```

### Validation Error Shape
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": ["Name is required", "Email is required"]
}
```

### Route Auth Levels

| Symbol | Meaning |
|--------|---------|
| 🌐 | Public — no token needed |
| 🔒 | JWT — valid access token in `Authorization` header |
| 🍪 | Refresh cookie — reads `refreshToken` HTTP-only cookie |
| 🛡️ | Admin — JWT + `role === "admin"` |

---

## 3. Auth API — `/api/auth`

---

### `POST /api/auth/register` 🌐
Register a new student account.

**Request Body**
```json
{
  "name": "Mohit Makwana",
  "email": "24ceubt910@ddu.ac.in",
  "password": "mypassword123"
}
```

**Validation Rules**
- `name` — required
- `email` — required, unique, valid email format
- `password` — required, min 6 characters

**Success Response** `201`
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Mohit Makwana",
      "email": "24ceubt910@ddu.ac.in",
      "role": "student"
    }
  }
}
```
> **Cookie set:** `refreshToken=<token>; HttpOnly; SameSite=Strict`

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Name, email, and password are required. |
| `409` | Email is already registered. |

---

### `POST /api/auth/login` 🌐
Login with existing credentials.

**Request Body**
```json
{
  "email": "24ceubt910@ddu.ac.in",
  "password": "mypassword123"
}
```

**Success Response** `200`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Mohit Makwana",
      "email": "24ceubt910@ddu.ac.in",
      "role": "student"
    }
  }
}
```
> **Cookie set:** `refreshToken=<token>; HttpOnly; SameSite=Strict`

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Email and password are required. |
| `401` | Invalid email or password. |
| `403` | Your account has been deactivated. |

---

### `GET /api/auth/me` 🔒
Get the currently logged-in user's data.

**Request Body** — none

**Success Response** `200`
```json
{
  "success": true,
  "message": "Current user fetched.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Mohit Makwana",
      "email": "24ceubt910@ddu.ac.in",
      "role": "student",
      "profilePicture": "",
      "contactInfo": "",
      "rating": { "average": 4.5, "count": 6 },
      "isActive": true,
      "createdAt": "2026-07-15T10:00:00.000Z"
    }
  }
}
```

---

### `POST /api/auth/refresh` 🍪
Get a new access token using the refresh token cookie.

**Request Body** — none
**Cookie Required:** `refreshToken` (sent automatically)

**Success Response** `200`
```json
{
  "success": true,
  "message": "Access token refreshed.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `401` | No refresh token found. Please log in. |
| `401` | Refresh token expired or invalid. Please log in again. |

---

### `POST /api/auth/logout` 🔒
Clear the refresh token cookie (log out).

**Request Body** — none

**Success Response** `200`
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": {}
}
```
> **Cookie cleared:** `refreshToken`

---

## 4. User API — `/api/users`

All routes require a valid access token.

---

### `GET /api/users/profile` 🔒
Get the logged-in user's full profile.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Profile fetched.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Mohit Makwana",
      "email": "24ceubt910@ddu.ac.in",
      "role": "student",
      "profilePicture": "https://example.com/pic.jpg",
      "contactInfo": "+91 98765 43210",
      "rating": { "average": 4.5, "count": 6 },
      "isActive": true,
      "createdAt": "2026-07-15T10:00:00.000Z"
    }
  }
}
```

---

### `PUT /api/users/profile` 🔒
Update own profile. Only `name`, `contactInfo`, `profilePicture` can be updated.

**Request Body** (all fields optional)
```json
{
  "name": "Mohit M.",
  "contactInfo": "+91 98765 43210",
  "profilePicture": "https://example.com/newpic.jpg"
}
```

**Success Response** `200`
```json
{
  "success": true,
  "message": "Profile updated.",
  "data": {
    "user": { ...updatedUserObject }
  }
}
```

---

### `DELETE /api/users/profile` 🔒
Deactivate own account (soft delete — sets `isActive: false`).

**Success Response** `200`
```json
{
  "success": true,
  "message": "Account deactivated successfully.",
  "data": {}
}
```
> **Cookie cleared:** `refreshToken`

---

### `GET /api/users/:userId` 🔒
Get another user's public profile.

**URL Params:** `userId` — MongoDB ObjectId

**Success Response** `200`
```json
{
  "success": true,
  "message": "User profile fetched.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Naman Shah",
      "profilePicture": "https://example.com/pic.jpg",
      "rating": { "average": 4.8, "count": 12 },
      "createdAt": "2026-07-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `404` | User not found. |

---

## 5. Resource API — `/api/resources`

---

### `GET /api/resources` 🌐
Browse all available resources. Supports search and filtering via query params.

**Query Params** (all optional)
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `search` | string | Full-text search on title & description | `?search=physics+book` |
| `category` | string | Filter by category | `?category=book` |
| `listingType` | string | `lend` or `donate` | `?listingType=lend` |
| `available` | boolean | `true` or `false` | `?available=true` |

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resources fetched.",
  "data": {
    "resources": [
      {
        "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
        "title": "Engineering Physics Vol.1",
        "category": "book",
        "description": "Semester 1 physics book, good condition.",
        "condition": "good",
        "images": ["https://example.com/img1.jpg"],
        "listingType": "lend",
        "securityDeposit": 100,
        "isAvailable": true,
        "owner": {
          "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
          "name": "Naman Shah",
          "profilePicture": "",
          "rating": { "average": 4.8, "count": 12 }
        },
        "createdAt": "2026-07-20T08:00:00.000Z"
      }
    ]
  }
}
```

---

### `POST /api/resources` 🔒
Create a new resource listing.

**Request Body**
```json
{
  "title": "Engineering Physics Vol.1",
  "category": "book",
  "description": "Semester 1 physics book, good condition.",
  "condition": "good",
  "images": ["https://example.com/img1.jpg"],
  "listingType": "lend",
  "securityDeposit": 100
}
```

**Field Rules**
| Field | Required | Values |
|-------|----------|--------|
| `title` | ✅ | any string |
| `category` | ✅ | `book`, `calculator`, `lab-equipment`, `electronics`, `other` |
| `condition` | ✅ | `new`, `good`, `fair`, `poor` |
| `listingType` | ✅ | `lend`, `donate` |
| `description` | ❌ | any string |
| `images` | ❌ | array of URL strings |
| `securityDeposit` | ❌ | number ≥ 0, default `0` |

**Success Response** `201`
```json
{
  "success": true,
  "message": "Resource listed successfully.",
  "data": {
    "resource": { ...createdResourceObject }
  }
}
```

---

### `GET /api/resources/my/listings` 🔒
Get all resources listed by the logged-in user.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Your listings fetched.",
  "data": {
    "resources": [ ...arrayOfResources ]
  }
}
```

---

### `GET /api/resources/:id` 🔒
Get full details of a specific resource.

**URL Params:** `id` — resource ObjectId

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource fetched.",
  "data": {
    "resource": {
      "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
      "title": "Engineering Physics Vol.1",
      "category": "book",
      "description": "Semester 1 physics book, good condition.",
      "condition": "good",
      "images": ["https://example.com/img1.jpg"],
      "listingType": "lend",
      "securityDeposit": 100,
      "isAvailable": true,
      "owner": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Naman Shah",
        "profilePicture": "",
        "rating": { "average": 4.8, "count": 12 },
        "contactInfo": "+91 98765 43210"
      },
      "createdAt": "2026-07-20T08:00:00.000Z"
    }
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `404` | Resource not found. |

---

### `PUT /api/resources/:id` 🔒
Update a resource. Only the owner can edit.

**Request Body** (same fields as POST, all optional)
```json
{
  "title": "Updated Title",
  "condition": "fair",
  "securityDeposit": 150
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `403` | Not authorized to edit this resource. |
| `404` | Resource not found. |

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource updated.",
  "data": { "resource": { ...updatedResource } }
}
```

---

### `DELETE /api/resources/:id` 🔒
Delete a resource. Only the owner can delete.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource deleted successfully.",
  "data": {}
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `403` | Not authorized to delete this resource. |
| `404` | Resource not found. |

---

### `PATCH /api/resources/:id/availability` 🔒
Toggle the resource's availability status. Only the owner can toggle.

**Request Body** — none (toggles current value)

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource marked as unavailable.",
  "data": { "isAvailable": false }
}
```

---

## 6. Borrow API — `/api/borrow`

All routes require a valid access token.

---

### `POST /api/borrow` 🔒
Send a borrow request for a resource.

**Request Body**
```json
{
  "resourceId": "64f2b3c4d5e6f7a8b9c0d2e3",
  "startDate": "2026-09-20",
  "endDate": "2026-09-30",
  "message": "Hi, I need this book for my semester exams."
}
```

**Field Rules**
| Field | Required | Description |
|-------|----------|-------------|
| `resourceId` | ✅ | ObjectId of the resource |
| `startDate` | ✅ | ISO date string |
| `endDate` | ✅ | ISO date string |
| `message` | ❌ | Optional note to the owner |

**Success Response** `201`
```json
{
  "success": true,
  "message": "Borrow request sent.",
  "data": {
    "borrowRequest": {
      "_id": "64f3c4d5e6f7a8b9c0d3e4f5",
      "resource": "64f2b3c4d5e6f7a8b9c0d2e3",
      "requester": "64f1a2b3c4d5e6f7a8b9c0d1",
      "owner": "64f0a1b2c3d4e5f6a7b8c9d0",
      "borrowDuration": {
        "startDate": "2026-09-20T00:00:00.000Z",
        "endDate": "2026-09-30T00:00:00.000Z"
      },
      "status": "pending",
      "depositPaid": false,
      "depositStatus": "pending",
      "message": "Hi, I need this book for my semester exams.",
      "createdAt": "2026-09-14T06:30:00.000Z"
    }
  }
}
```
> **Notification triggered:** `borrow_request` → sent to resource owner

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Resource is not available. |
| `400` | You cannot borrow your own resource. |
| `404` | Resource not found. |
| `409` | You already have a pending request for this resource. |

---

### `GET /api/borrow/incoming` 🔒
Get all borrow requests received by the logged-in user (as owner).

**Success Response** `200`
```json
{
  "success": true,
  "message": "Incoming requests fetched.",
  "data": {
    "requests": [
      {
        "_id": "64f3c4d5e6f7a8b9c0d3e4f5",
        "resource": {
          "_id": "64f2b3...",
          "title": "Engineering Physics Vol.1",
          "category": "book",
          "images": ["https://example.com/img1.jpg"]
        },
        "requester": {
          "_id": "64f1a2...",
          "name": "Mohit Makwana",
          "profilePicture": "",
          "rating": { "average": 4.5, "count": 6 }
        },
        "borrowDuration": { "startDate": "...", "endDate": "..." },
        "status": "pending",
        "message": "Hi, I need this book for my semester exams.",
        "createdAt": "2026-09-14T06:30:00.000Z"
      }
    ]
  }
}
```

---

### `GET /api/borrow/outgoing` 🔒
Get all borrow requests sent by the logged-in user (as requester).

**Success Response** `200` — same shape as incoming, but `owner` is populated instead of `requester`.

---

### `PATCH /api/borrow/:id/accept` 🔒
Accept a pending borrow request. Only the resource owner can accept.

**Request Body** — none

**What happens internally:**
1. `BorrowRequest.status` → `"accepted"`
2. `Resource.isAvailable` → `false`
3. A `Transaction` document is created
4. Notification `request_accepted` sent to requester

**Success Response** `200`
```json
{
  "success": true,
  "message": "Request accepted.",
  "data": {
    "request": { ...borrowRequestObject, "status": "accepted" }
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Only pending requests can be accepted. |
| `403` | Not authorized. |
| `404` | Borrow request not found. |

---

### `PATCH /api/borrow/:id/reject` 🔒
Reject a pending borrow request. Only the resource owner can reject.

**Request Body** — none

> **Notification triggered:** `request_rejected` → sent to requester

**Success Response** `200`
```json
{
  "success": true,
  "message": "Request rejected.",
  "data": { "request": { ...borrowRequestObject, "status": "rejected" } }
}
```

---

### `PATCH /api/borrow/:id/return` 🔒
Mark a resource as returned. Only the resource owner can mark it returned.

**Request Body** — none

**What happens internally:**
1. `BorrowRequest.status` → `"returned"`
2. `Resource.isAvailable` → `true`
3. `Transaction.completedAt` → current timestamp
4. Notification `transaction_complete` sent to requester

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource marked as returned.",
  "data": { "request": { ...borrowRequestObject, "status": "returned" } }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Only accepted requests can be marked as returned. |
| `403` | Not authorized. |

---

### `PATCH /api/borrow/:id/cancel` 🔒
Cancel a pending borrow request. Only the requester can cancel.

**Request Body** — none

**Success Response** `200`
```json
{
  "success": true,
  "message": "Request cancelled.",
  "data": { "request": { ...borrowRequestObject, "status": "cancelled" } }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | Only pending requests can be cancelled. |
| `403` | Not authorized. |

---

## 7. Transaction API — `/api/transactions`

All routes require a valid access token.

---

### `GET /api/transactions` 🔒
Get own transaction history (as lender or borrower).

**Success Response** `200`
```json
{
  "success": true,
  "message": "Transaction history fetched.",
  "data": {
    "transactions": [
      {
        "_id": "64f4d5e6f7a8b9c0d4e5f6a7",
        "resource": {
          "_id": "64f2b3...",
          "title": "Engineering Physics Vol.1",
          "category": "book",
          "images": ["https://example.com/img1.jpg"]
        },
        "lender": { "_id": "...", "name": "Naman Shah", "profilePicture": "" },
        "borrower": { "_id": "...", "name": "Mohit Makwana", "profilePicture": "" },
        "borrowRequest": {
          "borrowDuration": { "startDate": "...", "endDate": "..." },
          "status": "returned"
        },
        "depositAmount": 100,
        "depositStatus": "refunded",
        "completedAt": "2026-09-30T12:00:00.000Z",
        "createdAt": "2026-09-20T08:00:00.000Z"
      }
    ]
  }
}
```

---

### `GET /api/transactions/:id` 🔒
Get details of a specific transaction. Only lender or borrower can view.

**Success Response** `200` — single transaction object (fully populated).

**Error Responses**
| Status | Message |
|--------|---------|
| `403` | Access denied. |
| `404` | Transaction not found. |

---

### `PATCH /api/transactions/:id/deposit-status` 🔒
Update the deposit status. Only the lender can update.

**Request Body**
```json
{
  "depositStatus": "refunded"
}
```

| Value | Meaning |
|-------|---------|
| `"refunded"` | Deposit returned to borrower |
| `"retained"` | Deposit kept by lender (damage, etc.) |

**Success Response** `200`
```json
{
  "success": true,
  "message": "Deposit status updated.",
  "data": {
    "transaction": { ...transactionObject, "depositStatus": "refunded" }
  }
}
```
> **Notification triggered:** `deposit_update` → sent to borrower

**Error Responses**
| Status | Message |
|--------|---------|
| `400` | depositStatus must be 'refunded' or 'retained'. |
| `403` | Only the lender can update deposit status. |

---

## 8. Review API — `/api/reviews`

All routes require a valid access token.

---

### `POST /api/reviews` 🔒
Submit a review for a user or resource. Only users involved in the transaction can review.

**Request Body — Reviewing a User**
```json
{
  "transactionId": "64f4d5e6f7a8b9c0d4e5f6a7",
  "targetType": "user",
  "targetUserId": "64f0a1b2c3d4e5f6a7b8c9d0",
  "rating": 5,
  "comment": "Great lender! Very cooperative."
}
```

**Request Body — Reviewing a Resource**
```json
{
  "transactionId": "64f4d5e6f7a8b9c0d4e5f6a7",
  "targetType": "resource",
  "targetResourceId": "64f2b3c4d5e6f7a8b9c0d2e3",
  "rating": 4,
  "comment": "Book was in good condition as described."
}
```

**Field Rules**
| Field | Required | Values |
|-------|----------|--------|
| `transactionId` | ✅ | ObjectId |
| `targetType` | ✅ | `"user"` or `"resource"` |
| `targetUserId` | ✅ if `targetType=user` | ObjectId |
| `targetResourceId` | ✅ if `targetType=resource` | ObjectId |
| `rating` | ✅ | integer 1–5 |
| `comment` | ❌ | any string |

**Success Response** `201`
```json
{
  "success": true,
  "message": "Review submitted.",
  "data": {
    "review": {
      "_id": "64f5e6f7a8b9c0d5e6f7a8b9",
      "reviewer": "64f1a2b3...",
      "targetType": "user",
      "targetUser": "64f0a1b2...",
      "rating": 5,
      "comment": "Great lender! Very cooperative.",
      "transaction": "64f4d5e6...",
      "createdAt": "2026-10-01T10:00:00.000Z"
    }
  }
}
```
> If `targetType === "user"`, the target user's `rating.average` and `rating.count` are recalculated automatically.

**Error Responses**
| Status | Message |
|--------|---------|
| `403` | You can only review transactions you were part of. |
| `404` | Transaction not found. |
| `409` | Duplicate key — already reviewed this target for this transaction. |

---

### `GET /api/reviews/user/:userId` 🔒
Get all reviews submitted for a user.

**Success Response** `200`
```json
{
  "success": true,
  "message": "User reviews fetched.",
  "data": {
    "reviews": [
      {
        "_id": "64f5e6...",
        "reviewer": { "_id": "...", "name": "Mohit Makwana", "profilePicture": "" },
        "rating": 5,
        "comment": "Great lender!",
        "createdAt": "2026-10-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### `GET /api/reviews/resource/:resourceId` 🔒
Get all reviews submitted for a resource.

**Success Response** `200` — same shape as user reviews above.

---

## 9. Notification API — `/api/notifications`

All routes require a valid access token.

---

### `GET /api/notifications` 🔒
Get all notifications for the logged-in user, sorted newest first.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Notifications fetched.",
  "data": {
    "notifications": [
      {
        "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
        "type": "borrow_request",
        "message": "Mohit Makwana has requested to borrow your resource: Engineering Physics Vol.1",
        "relatedResource": { "_id": "64f2b3...", "title": "Engineering Physics Vol.1" },
        "relatedRequest": "64f3c4d5...",
        "isRead": false,
        "createdAt": "2026-09-14T06:30:00.000Z"
      }
    ]
  }
}
```

**Notification Types Reference**
| `type` | When triggered |
|--------|----------------|
| `borrow_request` | A borrow request is sent to owner |
| `request_accepted` | Owner accepts the request |
| `request_rejected` | Owner rejects the request |
| `return_reminder` | Resource nearing return date *(future: cron job)* |
| `transaction_complete` | Resource marked as returned |
| `deposit_update` | Lender updates deposit status |

---

### `PATCH /api/notifications/read-all` 🔒
Mark all notifications as read.

**Success Response** `200`
```json
{
  "success": true,
  "message": "All notifications marked as read.",
  "data": {}
}
```

---

### `PATCH /api/notifications/:id/read` 🔒
Mark a single notification as read.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Notification marked as read.",
  "data": {
    "notification": { ...notificationObject, "isRead": true }
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| `403` | Access denied. |
| `404` | Notification not found. |

---

## 10. Admin API — `/api/admin`

All routes require **JWT + Admin role** (`role === "admin"`).

---

### `GET /api/admin/users` 🛡️
Get list of all registered users.

**Success Response** `200`
```json
{
  "success": true,
  "message": "All users fetched.",
  "data": {
    "users": [ ...arrayOfUserObjects ]
  }
}
```

---

### `GET /api/admin/users/:id` 🛡️
Get a specific user's full details.

**Success Response** `200`
```json
{
  "success": true,
  "message": "User fetched.",
  "data": { "user": { ...userObject } }
}
```

---

### `PUT /api/admin/users/:id` 🛡️
Update a user's role or active status.

**Request Body** (fields optional)
```json
{
  "role": "admin",
  "isActive": false
}
```

**Success Response** `200`
```json
{
  "success": true,
  "message": "User updated.",
  "data": { "user": { ...updatedUserObject } }
}
```

---

### `DELETE /api/admin/users/:id` 🛡️
Permanently delete a user account.

**Success Response** `200`
```json
{
  "success": true,
  "message": "User deleted.",
  "data": {}
}
```

---

### `GET /api/admin/resources` 🛡️
Get all resource listings (including unavailable ones).

**Success Response** `200`
```json
{
  "success": true,
  "message": "All resources fetched.",
  "data": {
    "resources": [ ...arrayOfResourcesWithOwnerEmailAndName ]
  }
}
```

---

### `DELETE /api/admin/resources/:id` 🛡️
Remove an inappropriate resource listing.

**Success Response** `200`
```json
{
  "success": true,
  "message": "Resource removed.",
  "data": {}
}
```

---

### `GET /api/admin/transactions` 🛡️
Get all transactions in the system.

**Success Response** `200`
```json
{
  "success": true,
  "message": "All transactions fetched.",
  "data": {
    "transactions": [ ...fullyPopulatedTransactionObjects ]
  }
}
```

---

## 11. Data Models Reference

### User
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `password` | String | Required, bcrypt hashed, hidden from queries |
| `role` | String | `student` \| `admin`, default `student` |
| `profilePicture` | String | URL, default `""` |
| `contactInfo` | String | default `""` |
| `rating.average` | Number | Recalculated on each review, default `0` |
| `rating.count` | Number | Total reviews received, default `0` |
| `isActive` | Boolean | default `true`, set `false` on deactivate |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Resource
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto |
| `owner` | ObjectId → User | Required |
| `title` | String | Required, text-indexed |
| `category` | String | `book` \| `calculator` \| `lab-equipment` \| `electronics` \| `other` |
| `description` | String | text-indexed |
| `condition` | String | `new` \| `good` \| `fair` \| `poor` |
| `images` | [String] | Array of URLs |
| `listingType` | String | `lend` \| `donate` |
| `securityDeposit` | Number | ≥ 0, default `0` |
| `isAvailable` | Boolean | default `true` |

### BorrowRequest
| Field | Type | Notes |
|-------|------|-------|
| `resource` | ObjectId → Resource | Required |
| `requester` | ObjectId → User | Required |
| `owner` | ObjectId → User | Required |
| `borrowDuration.startDate` | Date | Required |
| `borrowDuration.endDate` | Date | Required |
| `status` | String | `pending` \| `accepted` \| `rejected` \| `returned` \| `cancelled` |
| `depositPaid` | Boolean | default `false` |
| `depositStatus` | String | `pending` \| `refunded` \| `retained` |
| `message` | String | Optional note from requester |

### Transaction
| Field | Type | Notes |
|-------|------|-------|
| `borrowRequest` | ObjectId → BorrowRequest | Required |
| `resource` | ObjectId → Resource | Required |
| `lender` | ObjectId → User | Required |
| `borrower` | ObjectId → User | Required |
| `depositAmount` | Number | Copied from resource at time of acceptance |
| `depositStatus` | String | `pending` \| `refunded` \| `retained` |
| `completedAt` | Date | Set when resource is returned, default `null` |

### Review
| Field | Type | Notes |
|-------|------|-------|
| `reviewer` | ObjectId → User | Required |
| `targetType` | String | `user` \| `resource` |
| `targetUser` | ObjectId → User | Populated if `targetType === "user"` |
| `targetResource` | ObjectId → Resource | Populated if `targetType === "resource"` |
| `rating` | Number | 1–5 |
| `comment` | String | Optional |
| `transaction` | ObjectId → Transaction | Required |
| *compound index* | — | Prevents duplicate reviews |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| `recipient` | ObjectId → User | Required |
| `type` | String | See notification types table above |
| `message` | String | Human-readable message |
| `relatedResource` | ObjectId → Resource | Optional |
| `relatedRequest` | ObjectId → BorrowRequest | Optional |
| `isRead` | Boolean | default `false` |

---

## 12. Error Reference

### HTTP Status Codes Used

| Code | Meaning | Common Cause |
|------|---------|--------------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST (register, create resource, etc.) |
| `400` | Bad Request | Missing fields, invalid values, business logic violation |
| `401` | Unauthorized | Missing/expired/invalid token |
| `403` | Forbidden | Valid token, insufficient permissions |
| `404` | Not Found | Resource/user/notification does not exist |
| `409` | Conflict | Duplicate email, duplicate review |
| `500` | Server Error | Unexpected error (check server logs) |

### Common 401 Messages
| Message | Fix |
|---------|-----|
| `Access denied. No token provided.` | Add `Authorization: Bearer <token>` header |
| `Access token expired. Please refresh.` | Call `POST /api/auth/refresh` |
| `Invalid token.` | Token is malformed or signed with wrong secret |
| `Invalid token type.` | A refresh token was used where access token is needed |
| `No refresh token found. Please log in.` | refreshToken cookie is missing |

### Mongoose Errors (auto-handled by error middleware)
| Mongoose Error | HTTP | Response |
|----------------|------|----------|
| `ValidationError` | `400` | `{ errors: [...messages] }` |
| Duplicate key (`11000`) | `409` | `{ message: "<field> already exists." }` |
| `CastError` (bad ObjectId) | `400` | `{ message: "Invalid value for field: <path>" }` |
