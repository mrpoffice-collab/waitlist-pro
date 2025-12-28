"use client";

import { BarChart3 } from "lucide-react";

interface DailyData {
  date: string;
  total: number;
  organic: number;
  referred: number;
}

interface SignupChartProps {
  data: DailyData[];
}

export default function SignupChart({ data }: SignupChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Signup Trend</h3>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No signup data yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Chart will appear after first signup
          </p>
        </div>
      </div>
    );
  }

  // Get max value for scaling
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  // Take last 14 days
  const chartData = data.slice(-14);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Signup Trend</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-500">Organic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-500">Referred</span>
          </div>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-1 h-48">
        {chartData.map((day, index) => {
          const height = (day.total / maxTotal) * 100;
          const organicHeight = day.total > 0 ? (day.organic / day.total) * height : 0;
          const referredHeight = day.total > 0 ? (day.referred / day.total) * height : 0;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                <p>Total: {day.total}</p>
                <p>Organic: {day.organic}</p>
                <p>Referred: {day.referred}</p>
              </div>

              {/* Stacked bar */}
              <div className="w-full flex flex-col rounded-t overflow-hidden">
                {day.referred > 0 && (
                  <div
                    className="w-full bg-purple-500 transition-all"
                    style={{ height: `${referredHeight}%` }}
                  />
                )}
                {day.organic > 0 && (
                  <div
                    className="w-full bg-blue-500 transition-all"
                    style={{ height: `${organicHeight}%` }}
                  />
                )}
              </div>

              {/* Date label (show every few days) */}
              {index % 3 === 0 && (
                <p className="text-[10px] text-gray-400 mt-2 text-center truncate">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
