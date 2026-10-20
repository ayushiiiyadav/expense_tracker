# Expense Tracker (MERN)

A full-stack expense tracker with user accounts. Track income and expenses by category and see monthly and yearly summaries with charts.

## Features
- Register and login with JWT authentication
- Add, edit and delete income and expense transactions
- Category-based tracking, with filters by type and month
- Sorting and pagination
- Monthly summary: income, expense, balance and spending by category
- Yearly summary: income and expense for each month
- MongoDB aggregation pipelines for all summaries
- Request validation with Zod and centralized error handling
- Dark glass-style UI with charts (Recharts)

## Tech stack
- **Frontend:** React (Vite), React Router, Axios, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose

## Project structure
```
server/
  controllers/   request handling and aggregation logic
  middleware/    auth guard, validation, error handler
  models/        Mongoose schemas (User, Transaction)
  routes/        API routes
  utils/         Zod validation schemas
client/
  src/pages/       Login, Register, Dashboard, Transactions
  src/components/  Layout and navigation
```

## Run locally
1. Start MongoDB locally, or use a MongoDB Atlas connection string.
2. Backend:
```
   cd server
   npm install
```
   Create a `.env` file based on `.env.example`, then:
```
   node server.js
```
3. Frontend:
```
   cd client
   npm install
   npm run dev
```
4. Open the address Vite prints (usually http://localhost:5173). The frontend expects the API at http://localhost:5001.

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in, returns a token |
| GET | /api/transactions | List transactions (page, limit, type, category, year, month, sortBy, order) |
| POST | /api/transactions | Add a transaction |
| PUT | /api/transactions/:id | Update a transaction |
| DELETE | /api/transactions/:id | Delete a transaction |
| GET | /api/transactions/summary/monthly | Income, expense, balance and category breakdown for a month |
| GET | /api/transactions/summary/yearly | Income and expense for each month of a year |

All transaction routes need the header `Authorization: Bearer <token>`.