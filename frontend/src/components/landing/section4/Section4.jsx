import React from "react";
import { Tent, CookingPot, Backpack, Flashlight } from "lucide-react";

/**
 * Data for equipment rental items.
 */
const equipmentItems = [
    {
        id: 1,
        name: "4-Person Tent",
        price: 15,
        icon: Tent
    },
    {
        id: 2,
        name: "Cooking Set",
        price: 8,
        icon: CookingPot
    },
    {
        id: 3,
        name: "Hiking Pack",
        price: 12,
        icon: Backpack
    },
    {
        id: 4,
        name: "Survival Kit",
        price: 10,
        icon: Flashlight
    }
];

const Section4 = () => {
    return (
        <section className="py-24 bg-[#eff7f1]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                {/* Header Section */}
                <div className="max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        Gear Up for Your Journey
                    </h2>
                    <p className="text-gray-500 font-medium">
                        High-quality camping equipment available for rent. From pro tents to survival kits, we've got you covered.
                    </p>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {equipmentItems.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white flex flex-col items-center"
                        >
                            {/* Icon Container */}
                            <div className="w-full aspect-[4/3] bg-slate-50/80 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <item.icon
                                    size={64}
                                    strokeWidth={1.5}
                                    className="text-green-600 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                />
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-8 text-center">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-green-600 font-black text-lg">
                                    LKR {item.price}<span className="text-xs uppercase tracking-wider">/day</span>
                                </p>
                            </div>

                            {/* Action Button */}
                            <button className="w-full py-4 text-sm font-bold text-green-700 border-2 border-green-50 rounded-2xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all active:scale-95">
                                Rent Item
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Section4;
