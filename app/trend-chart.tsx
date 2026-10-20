"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function QualityTrendChart({ data }: { data: { name: string; inspected: number; defective: number }[] }) {
  return (
    <div className="bg-surface border rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Inspection Trend (Inspected vs Defective)</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1c1c1e", borderColor: "#38383a", borderRadius: "8px", color: "#f4f4f5" }}
            />
            <Line type="monotone" dataKey="inspected" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="defective" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
