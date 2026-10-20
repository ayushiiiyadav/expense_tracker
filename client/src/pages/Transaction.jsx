import { useEffect, useState } from "react";
import api, { errorMessage } from "../api.js";

const CATEGORIES = ["Salary", "Food", "Travel", "Rent", "Shopping", "Bills", "Health", "Other"];
const PAGE_SIZE = 8;
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = { type: "expense", amount: "", category: "", note: "", date: today() };

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [period, setPeriod] = useState("");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    try {
      const [year, month] = period ? period.split("-") : [];
      const res = await api.get("/transactions", {
        params: {
          page,
          limit: PAGE_SIZE,
          type: typeFilter || undefined,
          year,
          month,
          sortBy: "date",
          order,
        },
      });
      setItems(res.data.transactions);
      setTotalPages(res.data.totalPages || 1);
      if (res.data.transactions.length === 0 && page > 1) setPage(page - 1);
    } catch (err) {
      setError("Could not load transactions");
    }
  };

  useEffect(() => {
    load();
  }, [page, typeFilter, period, order]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      date: form.date,
    };
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err, "Could not save the transaction"));
    }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      note: t.note || "",
      date: t.date.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const remove = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err, "Could not delete"));
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>{editingId ? "Edit transaction" : "Add transaction"}</h2>
      </div>

      <form className="tx-form" onSubmit={submit}>
        <select value={form.type} onChange={set("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={form.amount}
          onChange={set("amount")}
          required
        />
        <input
          list="categories"
          placeholder="Category"
          maxLength={30}
          value={form.category}
          onChange={set("category")}
          required
        />
        <datalist id="categories">
          {CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input type="date" value={form.date} onChange={set("date")} required />
        <input
          type="text"
          placeholder="Note (optional)"
          maxLength={100}
          value={form.note}
          onChange={set("note")}
        />
        <div className="form-actions">
          <button className="primary-btn" type="submit">
            {editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="small-btn danger" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="filter-row">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="month"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(1);
          }}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="muted">No transactions yet ☁️</p>
      ) : (
        <ul className="tx-list">
          {items.map((t) => (
            <li key={t._id} className="tx-item">
              <div className="tx-main">
                <span className="tx-cat">{t.category}</span>
                <span className="tx-meta">
                  {new Date(t.date).toLocaleDateString("en-IN")}
                  {t.note ? ` · ${t.note}` : ""}
                </span>
              </div>
              <div className="tx-right">
                <span className={`tx-amount ${t.type}`}>
                  {t.type === "income" ? "+" : "-"}
                  {money(t.amount)}
                </span>
                <button className="small-btn" onClick={() => startEdit(t)}>
                  Edit
                </button>
                <button className="small-btn danger" onClick={() => remove(t._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button className="small-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="small-btn"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}