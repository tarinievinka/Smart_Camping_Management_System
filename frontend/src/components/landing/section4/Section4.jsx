import React from "react";
import { Tent, CookingPot, Backpack, Flashlight } from "lucide-react";

/**
 * Data for equipment rental items.
 */
const equipmentItems = [
    {
        id: 1,
        name: "Pro Tents",
        icon: Tent
    },
    {
        id: 2,
        name: "Cooking Gear",
        icon: CookingPot
    },
    {
        id: 3,
        name: "Hiking Packs",
        icon: Backpack
    },
    {
        id: 4,
        name: "Lighting & Power",
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
                        Explore Our Gear Categories
                    </h2>
                    <p className="text-gray-500 font-medium">
                        Discover the professional-grade equipment we offer for your next adventure. From shelter to survival, we've got everything you need.
                    </p>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {equipmentItems.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-white flex flex-col items-center"
                        >
                            {/* Icon Container */}
                            <div className="w-full aspect-square bg-slate-50/80 rounded-[2rem] flex items-center justify-center mb-8 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <item.icon
                                    size={80}
                                    strokeWidth={1}
                                    className="text-green-600 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                                />
                            </div>

                            {/* Details */}
                            <div className="text-center">
                                <h3 className="text-xl font-black text-gray-900 group-hover:text-green-700 transition-colors uppercase tracking-tight">
                                    {item.name}
                                </h3>
                                <div className="h-1 w-8 bg-green-500 mx-auto mt-4 rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Section4;
