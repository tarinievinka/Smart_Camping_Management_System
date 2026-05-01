import React from "react";

// All bar colors now use shades of #166534
const COLORS = [
    "#166534",
    "#15803d",
    "#14532d",
    "#1a7a3f",
    "#1d9450",
    "#186040",
    "#12502a",
    "#1e8a48",
];

const PerformanceChart = ({ guides }) => {
    if (!guides || guides.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-gray-400 text-sm">No data to display.</p>
            </div>
        );
    }

    const maxExp = Math.max(...guides.map((g) => g.experience), 1);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Experience Overview</h3>
                <p className="text-sm text-gray-400">Years of experience per guide</p>
            </div>

            <div className="p-5 space-y-4">
                {guides.slice(0, 5).map((guide, i) => {
                    const pct = Math.round((guide.experience / maxExp) * 100);
                    const color = COLORS[i % COLORS.length];

                    return (
                        <div key={guide._id || i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 truncate pr-2">
                                    {guide.name}
                                </span>
                                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                                    {guide.experience} yrs
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between text-xs text-gray-400">
                <span>0 years</span>
                <span>Max: {maxExp} years</span>
            </div>
        </div>
    );
};

export default PerformanceChart;