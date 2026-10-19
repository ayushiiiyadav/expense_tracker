const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const toId = (id) => new mongoose.Types.ObjectId(id);

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.userId });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = { user: req.userId };
    if (["income", "expense"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    if (req.query.year && req.query.month) {
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month);
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }

    const allowedSort = ["date", "amount"];
    const sortBy = allowedSort.includes(req.query.sortBy) ? req.query.sortBy : "date";
    const order = req.query.order === "asc" ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid transaction id" });
  }
};

exports.monthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    const match = {
      user: toId(req.userId),
      date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
    };

    const [totals, byCategory] = await Promise.all([
      Transaction.aggregate([
        { $match: match },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { ...match, type: "expense" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;

    res.json({
      year,
      month,
      income,
      expense,
      balance: income - expense,
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.yearlySummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: toId(req.userId),
          date: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    rows.forEach((r) => {
      months[r._id.month - 1][r._id.type] = r.total;
    });

    const income = months.reduce((sum, m) => sum + m.income, 0);
    const expense = months.reduce((sum, m) => sum + m.expense, 0);

    res.json({ year, income, expense, balance: income - expense, months });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};