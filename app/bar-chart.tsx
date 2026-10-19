"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function DefectsBarChart({ data }: { data: { name: string; defects: number }[] }) {
  return (
    <div className="bg-surface border rounded-xl p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Defects per Inspection</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1c1c1e", borderColor: "#38383a", borderRadius: "8px", color: "#f4f4f5" }}
            />
            <Bar dataKey="defects" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
