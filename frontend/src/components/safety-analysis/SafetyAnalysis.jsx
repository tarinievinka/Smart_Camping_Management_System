import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ShieldCheck, ShieldAlert, Thermometer, Wind, CloudRain, Sun, Info, ArrowRight, Activity, Gauge } from 'lucide-react';
import backgroundImage from '../../assets/camping-bg.png';

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

  const formatTime = (isoString) => {
    if (!isoString || typeof isoString !== 'string') return isoString;
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div 
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-2xl">
            <Activity size={14} /> AI Powered Prediction
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight sm:text-6xl lg:text-7xl drop-shadow-2xl">
            Camping Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Analysis</span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            Our intelligent system combines real-time meteorology with historical patterns to ensure your next adventure is perfectly safe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 border border-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Gauge size={20} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Trip Details</h2>
              </div>
              
              <form onSubmit={handleAnalyze} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" /> Destination City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer hover:bg-white shadow-sm appearance-none"
                  >
                    <option value="">Choose a location...</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1 flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-500" /> Planned Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer hover:bg-white shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`group w-full py-5 rounded-2xl text-white font-black text-base shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-300'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing AI...
                    </>
                  ) : (
                    <>
                      Analyze Safety <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in duration-300">
                  <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-rose-600 font-bold leading-tight">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[2rem] border-4 border-dashed border-slate-200/50 p-16 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3 border border-slate-100">
                  <ShieldCheck size={48} className="text-emerald-500/20" />
                </div>
                <h3 className="text-2xl font-black text-white/80">Awaiting Your Input</h3>
                <p className="text-white/60 font-medium max-w-sm mt-3">
                  Please provide your trip details on the left to initialize the safety analysis engine.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                {/* Main Prediction Card */}
                <div className={`relative overflow-hidden p-10 rounded-[2.5rem] shadow-2xl border ${
                  result.is_unsafe 
                  ? 'bg-gradient-to-br from-rose-50 to-white border-rose-200 shadow-rose-100/50' 
                  : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-emerald-100/50'
                }`}>
                  {/* Glass highlight */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="flex-1">
                      <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${
                        result.is_unsafe ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${result.is_unsafe ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                        Safety Status
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl shadow-lg ${result.is_unsafe ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-emerald-600 text-white shadow-emerald-200'}`}>
                          {result.is_unsafe ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
                        </div>
                        <div>
                          <span className="text-5xl font-black text-slate-900 block tracking-tight">
                            {result.is_unsafe ? 'Potentially Unsafe' : 'Perfectly Safe'}
                          </span>
                          <p className="text-slate-500 mt-1 font-bold">
                            Confidence Level: <span className={`px-2 py-0.5 rounded-lg uppercase text-[10px] ml-1 tracking-widest ${
                              result.confidence_label === 'high' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>{result.confidence_label}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-w-[160px] text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Safety Score</div>
                      <div className="text-5xl font-black text-slate-900 tabular-nums leading-none">
                        {(result.safe_probability * 100).toFixed(0)}<span className="text-2xl text-slate-300">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mt-12 relative h-5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden p-1 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${
                        result.is_unsafe ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }`}
                      style={{ width: `${result.safe_probability * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    <span className={result.safe_probability < 0.3 ? "text-rose-500" : ""}>Extreme Risk</span>
                    <span>Moderate</span>
                    <span className={result.safe_probability > 0.8 ? "text-emerald-500" : ""}>Ideal Conditions</span>
                  </div>
                </div>

                {/* Weather Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Temp', value: `${result.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { label: 'Wind', value: `${result.wind_speed.toFixed(1)} km/h`, icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Rain', value: `${result.precip_hours.toFixed(1)} hrs`, icon: CloudRain, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                    { label: 'Humidity', value: `${result.humidity.toFixed(0)}%`, icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border-2 ${stat.border} shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}>
                      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon size={80} />
                      </div>
                      <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                        <stat.icon className={stat.color} size={24} />
                      </div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums tracking-tight">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Recommendation Section */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all duration-700" />
                  
                  <div className="relative flex flex-col lg:flex-row gap-8 items-start">
                    <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl h-fit border border-white/10 shadow-xl">
                      <Info size={32} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <h4 className="text-2xl font-black mb-3 tracking-tight">AI Insights & Recommendation</h4>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                          {result.is_unsafe 
                            ? "Based on atmospheric patterns, we advise extreme caution. Significant precipitation or elevated wind speeds pose a risk to temporary shelters. Consider a secure alternative or delay your departure."
                            : "Predictive models indicate excellent stability. The combination of optimal temperature and low moisture levels creates peak camping conditions. Secure your site and enjoy the outdoors!"}
                        </p>
                      </div>
                      
                      <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Sunrise</span>
                          <span className="flex items-center gap-2 text-sm font-bold text-white"><Sun size={16} className="text-amber-400" /> {formatTime(result.sunrise)}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Sunset</span>
                          <span className="flex items-center gap-2 text-sm font-bold text-white"><CloudRain size={16} className="text-indigo-400" /> {formatTime(result.sunset)}</span>
                        </div>
                        <div className="space-y-1 hidden sm:block">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Data Engine</span>
                          <span className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-widest"><ShieldCheck size={16} /> Open-Meteo V3</span>
                        </div>
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

