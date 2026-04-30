"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface BarChartProps {
  data: MonthlyData[];
}

export default function MonthlyBarChart({ data }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a5450] text-sm">
        No hay datos mensuales para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#4a5450", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          tick={{ fill: "#4a5450", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(value: number) =>
            `$${value.toLocaleString("es-AR", { notation: "compact" })}`
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#161918",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#e8ebe9",
          }}
          formatter={(value, name) => [
            `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
            name === "income" ? "Ingresos" : "Gastos",
          ]}
        />
        <Bar dataKey="income" fill="#4ef07c" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#f07a4e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
