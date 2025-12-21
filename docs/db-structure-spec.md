# Database Overview
- **Database type**: MongoDB
- **ORM / ODM**: Mongoose
- **Naming conventions**: CamelCase for fields, PascalCase for models
- **Common fields across entities**: `createdAt`, `updatedAt` (timestamps), `_id` (ObjectId)

## Entity: Contract
### Description
Represents a contract between a client and a supplier for an event.

### Fields
| Field                | Type       | Required | Default       | Validation                                                                 | References       |
|----------------------|------------|----------|---------------|----------------------------------------------------------------------------|------------------|
| eventId             | ObjectId   | Yes      |               |                                                                            | Event            |
| supplierId          | ObjectId   | Yes      |               |                                                                            | Supplier         |
| clientId            | ObjectId   | Yes      |               |                                                                            | User             |
| s3Key               | String     | Yes      |               |                                                                            |                  |
| supplierSignature   | Subdocument| No       | null          |                                                                            |                  |
| clientSignatures    | Array      | No       | []            |                                                                            |                  |
| status              | String     | No       | "טיוטה"       | Enum: ["טיוטה", "ממתין לספק", "ממתין ללקוח", "פעיל", "הושלם", "מבוטל"] |                  |

### Indexes & Constraints
- `eventId`, `supplierId`, `clientId` are indexed.
- `status` is indexed.

### Relations
- References `Event`, `Supplier`, and `User`.

## Entity: Event
### Description
Represents an event planned by a user.

### Fields
| Field            | Type       | Required | Default       | Validation                                      | References |
|------------------|------------|----------|---------------|------------------------------------------------|------------|
| ownerId         | ObjectId   | Yes      |               |                                                | User       |
| name            | String     | Yes      |               |                                                |            |
| type            | String     | Yes      | "אחר"         | Enum: EVENT_TYPES                              |            |
| date            | Date       | Yes      |               |                                                |            |
| locationRegion  | String     | No       |               |                                                |            |
| budget          | Number     | No       |               |                                                |            |
| budgetHistory   | Array      | No       | []            | Subdocument                                   |            |
| budgetAllocated | Number     | No       | 0             |                                                |            |
| estimatedGuests | Number     | Yes      |               |                                                |            |

### Indexes & Constraints
- `ownerId` and `date` are indexed.

### Relations
- References `User`.

## Entity: User
### Description
Represents a user in the system.

### Fields
| Field    | Type   | Required | Default | Validation                          | References |
|----------|--------|----------|---------|--------------------------------------|------------|
| name     | String | No       | ""      |                                      |            |
| email    | String | Yes      |         | Unique, lowercase, trimmed          |            |
| phone    | String | No       | ""      |                                      |            |
| role     | String | Yes      |         | Enum: ["admin", "user", "supplier"] |            |
| password | String | Yes      |         |                                      |            |
| social   | Object | No       |         | Contains `googleId`                 |            |

### Indexes & Constraints
- `email` is unique.
- `role` is indexed.

### Relations
- None.

## Entity: Supplier
### Description
Represents a supplier providing services for events.

### Fields
| Field         | Type       | Required | Default       | Validation                                      | References |
|---------------|------------|----------|---------------|------------------------------------------------|------------|
| user          | ObjectId   | Yes      |               |                                                | User       |
| category      | ObjectId   | Yes      |               |                                                | Category   |
| regions       | Array      | Yes      |               |                                                |            |
| kashrut       | String     | No       |               |                                                |            |
| media         | Subdocument| No       | {}            |                                                |            |
| profileImage  | Subdocument| No       | null          |                                                |            |
| description   | String     | No       |               |                                                |            |
| status        | String     | No       | "בהמתנה"      | Enum: ["בהמתנה", "מאושר", "נפסל", "נחסם"] |            |

### Indexes & Constraints
- `user`, `category`, and `regions` are indexed.

### Relations
- References `User` and `Category`.

## Entity: Payment
### Description
Represents a payment for a contract.

### Fields
| Field                | Type       | Required | Default       | Validation                                                                 | References       |
|----------------------|------------|----------|---------------|----------------------------------------------------------------------------|------------------|
| contractId          | ObjectId   | Yes      |               |                                                                            | Contract         |
| amount              | Number     | Yes      |               |                                                                            |                  |
| dueDate             | Date       | Yes      |               |                                                                            |                  |
| paidAt              | Date       | No       |               |                                                                            |                  |
| status              | String     | No       | "ממתין"        | Enum: ["ממתין", "שולם", "באיחור", "נדחה", "ממתין לאישור ספק"] |                  |
| method              | String     | No       |               | Enum: ["מזומן", "העברה בנקאית", "אשראי חיצוני", "צ'ק", "other"] |                  |
| note                | String     | No       |               |                                                                            |                  |

### Indexes & Constraints
- `contractId` and `status` are indexed.

### Relations
- References `Contract`.

... (Other entities follow the same structure)
