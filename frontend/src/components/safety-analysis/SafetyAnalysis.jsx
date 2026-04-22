import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ShieldCheck, ShieldAlert, Thermometer, Wind, CloudRain, Sun, Info } from 'lucide-react';

const CITIES = [
  "Athurugiriya", "Badulla", "Bentota", "Colombo", "Galle", "Gampaha", "Hambantota", "Hatton", "Jaffna", "Kalmunai", "Kalutara", "Kandy", "Kesbewa", "Kolonnawa", "Kurunegala", "Mabole", "Maharagama", "Mannar", "Matale", "Matara", "Moratuwa", "Mount Lavinia", "Negombo", "Oruwala", "Pothuhera", "Puttalam", "Ratnapura", "Sri Jayewardenepura Kotte", "Trincomalee", "Weligama"
].sort();

const SafetyAnalysis = () => {
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!city) {
      setError("Please select a city.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`http://localhost:5001/forecast`, {
        params: { city, date }
      });
      setResult(response.data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.error || "Failed to connect to safety analysis service. Make sure the AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
            Camping Safety <span className="text-emerald-600">Analysis</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our AI-powered system analyzes real-time weather patterns and historical data to predict camping safety conditions for your next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info size={20} className="text-emerald-500" />
                Trip Details
              </h2>
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Destination City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">Select a city</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Planned Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 ${
                    loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Safety'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="text-red-500 shrink-0" size={18} />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck size={40} className="text-emerald-500 opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-slate-400">Ready to Analyze</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-2">
                  Select your destination and date to see the safety prediction.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Main Prediction Card */}
                <div className={`p-8 rounded-2xl shadow-xl border-l-8 ${
                  result.is_unsafe ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'
                }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-widest mb-1 ${
                        result.is_unsafe ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        AI Safety Status
                      </h3>
                      <div className="flex items-center gap-3">
                        {result.is_unsafe ? (
                          <ShieldAlert size={32} className="text-red-600" />
                        ) : (
                          <ShieldCheck size={32} className="text-emerald-600" />
                        )}
                        <span className="text-3xl font-black text-slate-900">
                          {result.is_unsafe ? 'Potentially Unsafe' : 'Safe to Camp'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-2 font-medium">
                        Confidence Level: <span className={`capitalize font-bold ${
                          result.confidence_label === 'high' ? 'text-blue-600' : 'text-amber-600'
                        }`}>{result.confidence_label}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-500 mb-1">Safety Score</div>
                      <div className="text-4xl font-black text-slate-900">
                        {(result.safe_probability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-8 bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        result.is_unsafe ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${result.safe_probability * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <span>Extreme Risk</span>
                    <span>Moderate</span>
                    <span>Perfectly Safe</span>
                  </div>
                </div>

                {/* Weather Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Temp', value: `${result.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Wind', value: `${result.wind_speed.toFixed(1)} km/h`, icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Rain', value: `${result.precip_hours.toFixed(1)} hrs`, icon: CloudRain, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Humidity', value: `${result.humidity.toFixed(0)}%`, icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <stat.icon className={stat.color} size={20} />
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-lg font-black text-slate-900">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Info Card */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white/10 rounded-xl h-fit">
                      <Info size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Recommendation</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {result.is_unsafe 
                          ? "We recommend reconsidering your trip or taking extra precautions. High wind speeds or heavy rain may cause hazardous conditions."
                          : "Weather conditions look favorable for camping. Remember to pack essentials and check local guidelines before you head out!"}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Sun size={14} /> Sunrise: {result.sunrise}</span>
                        <span className="flex items-center gap-1"><CloudRain size={14} /> Source: {result.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyAnalysis;
