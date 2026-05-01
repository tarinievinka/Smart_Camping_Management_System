import React from "react";

const StatCard = ({ title, value, trend, icon, color }) => {
  // Map Tailwind green classes to our brand color
  const isBrandGreen = color === "bg-green-500" || color === "bg-[#166534]";

  const iconBg = isBrandGreen
    ? "rgba(22,101,52,0.1)"
    : undefined;

  const iconColor = isBrandGreen
    ? "#166534"
    : undefined;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <div
          className={`p-3 rounded-xl ${!isBrandGreen ? `${color} bg-opacity-10` : ""}`}
          style={isBrandGreen ? { backgroundColor: iconBg } : {}}
        >
          <div
            className={`w-6 h-6 ${!isBrandGreen ? color.replace("bg-", "text-") : ""}`}
            style={isBrandGreen ? { color: iconColor } : {}}
          >
            {icon}
          </div>
        </div>

        {trend && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(22,101,52,0.08)' }}
          >
            <span className="text-xs font-bold" style={{ color: '#166534' }}>↗ {trend}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h2 className="text-3xl font-black text-gray-900 mt-1">{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;