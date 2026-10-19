"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function QualityPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="bg-surface border rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Quality Status Share</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "#1c1c1e", borderColor: "#38383a", borderRadius: "8px", color: "#f4f4f5" }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}