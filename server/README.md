# Survey Management System

A location-aware web-based survey management platform that connects **Users, Surveyers, and Admins** through a controlled survey lifecycle.

## Overview

The Survey Management System allows users to discover and participate in surveys available in their geographical area. Users can also submit proposals to conduct their own surveys.

When an Admin approves a proposal, the user is temporarily authorized as a **Surveyer** and receives a unique Surveyer ID such as `SURVEYMDU01`.

A Surveyer can create **only one survey corresponding to the approved proposal**, manage its questions, define its location and duration, publish it, monitor responses, analyze results, and generate a final report.

After submitting the final report, the Surveyer's authorization is completed and the Surveyer ID can no longer be used for Surveyer login or operations. However, the Survey, responses, Surveyer ID, and report remain available to the Admin as historical records.

## Key Features

* User registration and login
* JWT-based authentication
* Role-based access control
* User survey proposal submission
* Admin proposal approval/rejection
* Automatic Surveyer ID generation
* Surveyer authorization lifecycle
* One approved proposal → one survey
* Dynamic survey question builder
* Single Choice questions
* Multiple Choice questions
* Yes/No questions
* Rating questions
* Paragraph/multiline questions
* Location-based survey discovery
* Browser geolocation support
* Survey start and end time
* One response per user per survey
* Response validation
* Survey analytics
* Pie and bar chart visualization
* Report generation
* Report submission to Admin
* Surveyer authorization completion
* Historical survey and report access

## User Roles

### User

A User can:

* Register and log in.
* View available surveys based on location.
* Participate in active surveys.
* Submit survey proposals.
* Track proposal status.
* View submitted responses.

### Surveyer

A Surveyer is an approved User who receives an official Surveyer ID.

A Surveyer can:

* Log in using the Surveyer ID.
* Create one survey based on the approved proposal.
* Add and edit questions.
* Configure survey location and radius.
* Configure survey start and end time.
* Preview and publish the survey.
* View survey analytics.
* Generate a report.
* Submit the final report to Admin.

A Surveyer cannot participate in surveys while the Surveyer authorization is active.

### Admin

The Admin is the supercontroller of the system.

The Admin can:

* View proposals.
* Approve or reject proposals.
* Assign Surveyer IDs.
* View all surveys.
* View survey details and response statistics.
* View submitted reports.
* Analyze historical survey information.

## Survey Lifecycle

```text
Proposal Submitted
        ↓
Admin Review
        ↓
Approved
        ↓
Surveyer ID Assigned
        ↓
Survey Created
        ↓
Survey Published
        ↓
Users Participate
        ↓
Survey Ends
        ↓
Analytics
        ↓
Report Generated
        ↓
Report Submitted
        ↓
Surveyer Authorization Completed
        ↓
User Account Restored
```

## Surveyer Lifecycle

```text
USER
  ↓
ADMIN APPROVAL
  ↓
SURVEYER
  ↓
SURVEYER ID ACTIVE
  ↓
CREATE ONE SURVEY
  ↓
SUBMIT FINAL REPORT
  ↓
SURVEYER ID COMPLETED / INVALID
  ↓
USER
```

The Surveyer ID remains stored for historical reference, but cannot be used for Surveyer login after completion.

## Location-Based Survey

Each survey contains:

```text
City
Latitude
Longitude
Radius
```

When a User searches for surveys, the application obtains the User's current location through the browser Geolocation API and checks whether the User is within the survey's configured radius.

```text
User Location
      ↓
Distance Calculation
      ↓
Within Survey Radius?
      ↓
   Yes → Show Survey
   No  → Hide Survey
```

The backend also performs the location check before accepting a response.

## One Response Per Survey

A User can submit only one response for a particular survey.

The system enforces this at the database level using a unique combination of:

```text
surveyId + userId
```

Example:

```text
User U001 → Survey S001 → ✅
User U001 → Survey S001 → ❌
```

## Technology Stack

### Frontend

* React
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Recharts

### Backend

* Node.js
* Express.js
* JavaScript
* MongoDB / Mongoose
* JWT
* bcryptjs
* Zod

### Supporting Technologies

* Browser Geolocation API
* OpenStreetMap Nominatim for reverse geocoding
* PDF generation
* MongoDB Atlas

## Project Structure

```text
survey-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Main API Modules

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### User Proposals

```text
POST /api/proposals
GET  /api/proposals/my
```

### Admin

```text
GET   /api/admin/proposals
PATCH /api/admin/proposals/:id/approve
PATCH /api/admin/proposals/:id/reject

GET   /api/admin/surveys
GET   /api/admin/surveys/:id
```

### Surveyer / Surveys

```text
POST  /api/surveys
GET   /api/surveys/my
PUT   /api/surveys/:id
GET   /api/surveys/:id/preview
PATCH /api/surveys/:id/publish
```

### User Participation

```text
GET  /api/surveys/available
GET  /api/surveys/:id/participate
POST /api/surveys/:id/responses
```

### Analytics and Reports

```text
GET   /api/surveys/:id/analytics
POST  /api/surveys/:id/report
PATCH /api/reports/:id/submit
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd survey-system
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure environment variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

### 4. Start the backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Security

The application uses:

* Password hashing with bcryptjs
* JWT authentication
* Role-based authorization
* Request validation
* Backend ownership checks
* Database-level duplicate-response prevention
* Environment variables for secrets
* Backend location validation

Frontend restrictions are not treated as security controls; authorization is enforced on the backend.

## Core Business Rules

1. Every registered person starts as a `USER`.
2. Only Admin can approve survey proposals.
3. Only Admin can assign Surveyer IDs.
4. A Surveyer can create only one survey.
5. The survey must correspond to the approved proposal.
6. Surveyers cannot participate in surveys.
7. A User can submit only one response per survey.
8. Users can participate only in surveys available within the configured location radius.
9. Users can participate only during the survey's active period.
10. A final report can be submitted only after the survey is completed.
11. After final report submission, the Surveyer authorization becomes completed.
12. The Surveyer ID becomes invalid for Surveyer login and operations.
13. Historical Surveyer, Survey, Response, and Report information remains available to Admin.

## Future Enhancements

Possible future improvements include:

* Email notifications
* Advanced analytics
* Sentiment analysis
* AI-assisted report summarization
* Additional question types
* Advanced map visualization
* Audit logging
* Cloud deployment
* Mobile application

## Contributors

**Saravanan**

Built as a full-stack web application using the MERN ecosystem.

## License

This project is intended for educational and academic purposes.
