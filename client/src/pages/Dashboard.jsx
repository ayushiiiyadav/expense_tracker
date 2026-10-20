import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../api.js";

const COLORS = ["#e64980", "#f783ac", "#b197fc", "#74c0fc", "#63e6be", "#ffd43b", "#ffa94d", "#a9e34b"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Dashboard() {
  const now = new Date();
  const [period, setPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [error, setError] = useState("");

  const [year, month] = period.split("-").map(Number);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, y] = await Promise.all([
          api.get("/transactions/summary/monthly", { params: { year, month } }),
          api.get("/transactions/summary/yearly", { params: { year } }),
        ]);
        setMonthly(m.data);
        setYearly(y.data);
        setError("");
      } catch (err) {
        setError("Could not load the summary");
      }
    };
    load();
  }, [year, month]);

  const pieData = (monthly?.byCategory || []).map((c) => ({
    name: c.category,
    value: c.total,
  }));

  const barData = (yearly?.months || []).map((m) => ({
    name: MONTHS[m.month - 1],
    Income: m.income,
    Expense: m.expense,
  }));

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <input
          type="month"
          value={period}
          onChange={(e) => e.target.value && setPeriod(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="cards">
        <div className="card">
          <div className="label">Income</div>
          <div className="value income">{money(monthly?.income)}</div>
        </div>
        <div className="card">
          <div className="label">Expense</div>
          <div className="value expense">{money(monthly?.expense)}</div>
        </div>
        <div className="card">
          <div className="label">Balance</div>
          <div className="value balance">{money(monthly?.balance)}</div>
        </div>
      </div>

      <div className="charts">
        <div className="card chart-card">
          <h3>Spending by category</h3>
          {pieData.length === 0 ? (
            <p className="muted">No expenses this month ☁️</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card chart-card">
          <h3>{year} month by month</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
                <Bar dataKey="Income" fill="#2f9e8f" />
                <Bar dataKey="Expense" fill="#e64980" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="muted small">
            Year total: {money(yearly?.income)} in, {money(yearly?.expense)} out
          </p>
        </div>
      </div>
    </div>
  );
}