"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function ExpensePieChart({ data }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a5450] text-sm">
        No hay datos de gastos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#161918",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#e8ebe9",
          }}
          formatter={(value) =>
            `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
          }
        />
        <Legend
          wrapperStyle={{ color: "#7a8480", fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
