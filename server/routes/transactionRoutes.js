const express = require("express");
const protect = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require("../utils/validators");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  monthlySummary,
  yearlySummary,
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);

router.get("/summary/monthly", monthlySummary);
router.get("/summary/yearly", yearlySummary);

router.post("/", validate(createTransactionSchema), createTransaction);
router.get("/", getTransactions);
router.put("/:id", validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;