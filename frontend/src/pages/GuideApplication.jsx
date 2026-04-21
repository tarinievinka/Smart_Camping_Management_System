import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePhone } from '../utils/validation';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LANGUAGES = ["English", "Sinhala", "Tamil", "French", "German", "Chinese", "Japanese"];

const GuideApplication = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		phone: '',
		password: '',
		confirm: '',
		guideExperience: '',
		guideFullName: '',
		guideNIC: '',
		guideAge: '',
		guideAge: '',
		guideDescription: '',
		guideLanguages: [],
	});
	const [guideCV, setGuideCV] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	// Load pre-filled data from sessionStorage
	useEffect(() => {
		const savedData = sessionStorage.getItem('guideFormData');
		if (savedData) {
			try {
				const data = JSON.parse(savedData);
				setForm(prevForm => ({
					...prevForm,
					fullName: data.fullName || '',
					email: data.email || '',
					phone: data.phone || '',
					password: data.password || '',
					confirm: data.confirm || '',
				}));
			} catch (err) {
				console.log('Could not load pre-filled data');
			}
		}
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => {
			const next = { ...prev, [name]: value };
			// Auto-fill guide profile name if standard name is being typed and guide name is empty/same
			if (name === 'fullName' && (!prev.guideFullName || prev.guideFullName === prev.fullName)) {
				next.guideFullName = value;
			}
			return next;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validation
		if (!form.fullName.trim()) {
			setError('Please enter your full name.');
			return;
		}

		if (!form.email.trim()) {
			setError('Please enter your email address.');
			return;
		}

		if (form.phone && !validatePhone(form.phone)) {
			setError('Phone number must be exactly 10 digits.');
			return;
		}

		if (!form.guideExperience.trim()) {
			setError('Please enter your guide experience in years.');
			return;
		}

		if (Number(form.guideExperience) < 0 || Number.isNaN(Number(form.guideExperience))) {
			setError('Guide experience must be a valid non-negative number.');
			return;
		}

		if (!form.guideFullName.trim()) {
			setError('Please enter your full name for the guide profile.');
			return;
		}

		if (!form.guideNIC.trim()) {
			setError('Please enter your NIC number.');
			return;
		}

		if (!form.guideAge.trim()) {
			setError('Please enter your age.');
			return;
		}

		if (Number(form.guideAge) < 18 || Number.isNaN(Number(form.guideAge))) {
			setError('You must be at least 18 years old to register as a guide.');
			return;
		}

		if (form.password !== form.confirm) {
			setError('Passwords do not match');
			return;
		}

		if (form.password.length < 6) {
			setError('Password must be at least 6 characters long');
			return;
		}

		setError('');
		setSuccessMessage('');

		try {
			let cvUrl = '';
			if (guideCV) {
				setUploading(true);
				const formData = new FormData();
				formData.append('cv', guideCV);

				const uploadRes = await fetch(`${API_URL}/api/guides/upload-cv`, {
					method: 'POST',
					body: formData,
				});

				if (!uploadRes.ok) {
					const uploadData = await uploadRes.json();
					throw new Error(uploadData.error || 'CV upload failed');
				}

				const uploadData = await uploadRes.json();
				cvUrl = uploadData.urlPath;
				setUploading(false);
			}

			const userData = {
				name: form.fullName,
				email: form.email,
				phone: form.phone,
				password: form.password,
				role: 'guide',
				guideApplication: {
					experience: Number(form.guideExperience),
					fullName: form.guideFullName.trim(),
					nic: form.guideNIC.trim(),
					age: Number(form.guideAge),
					description: form.guideDescription.trim(),
					languages: form.guideLanguages,
					cv: cvUrl,
				},
			};

			const response = await fetch(`${API_URL}/api/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccessMessage('Guide application submitted successfully! Waiting for admin approve.');
				// Clear form
				setForm({
					fullName: '',
					email: '',
					phone: '',
					password: '',
					confirm: '',
					guideExperience: '',
					guideFullName: '',
					guideNIC: '',
					guideAge: '',
					guideDescription: '',
				});

				// Close window after 3 seconds
				setTimeout(() => {
					window.close();
				}, 3000);
			} else {
				setError(data.error || 'Registration failed');
			}
		} catch (err) {
			setError('Network error. Please try again.');
		}
	};

	return (
		<div className="min-h-screen flex font-sans bg-gradient-to-br from-green-50 to-emerald-50">
			{/* Main Content */}
			<div className="w-full flex items-center justify-center p-6 sm:p-12 relative">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="mb-8 text-center">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
							<svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h2 className="text-3xl font-extrabold text-gray-900 mb-2">Guide Application</h2>
						<p className="text-gray-600 text-sm">Complete your guide profile and expertise details</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">
								{error}
							</div>
						)}

						{successMessage && (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md transition-all duration-500">
								<div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center transform transition-all duration-300 scale-100">
									<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<h2 className="text-3xl font-extrabold text-gray-900 mb-2">Application Sent!</h2>
									<p className="text-gray-600 text-lg leading-relaxed font-semibold">
										Guide application submitted! <br />
										<span className="text-[#10a110] block mt-2">Waiting for admin approve.</span>
									</p>
									<button
										onClick={() => {
                                            setSuccessMessage('');
                                            window.close();
                                        }}
										className="mt-6 w-full py-3 bg-[#10a110] hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-900/40"
									>
										Done
									</button>
								</div>
							</div>
						)}

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								name="fullName"
								value={form.fullName}
								onChange={handleChange}
								placeholder="e.g. John Doe"
								className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								disabled={form.fullName && form.fullName.length > 0 && !error}
							/>
						</div>

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Email Address</label>
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="name@example.com"
								className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								disabled={form.email && form.email.length > 0 && !error}
							/>
						</div>

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Phone Number</label>
							<input
								type="tel"
								name="phone"
								value={form.phone}
								onChange={handleChange}
								placeholder="+92 300 0000000"
								className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
							/>
						</div>

						{/* Guide Specific Fields */}
						<div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 space-y-4">
							<h3 className="font-bold text-gray-900 text-sm">Guide Experience</h3>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Experience (years)</label>
								<input
									type="number"
									name="guideExperience"
									value={form.guideExperience}
									onChange={handleChange}
									placeholder="e.g. 3"
									className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
									min="0"
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Full Name</label>
								<input
									type="text"
									name="guideFullName"
									value={form.guideFullName}
									onChange={handleChange}
									placeholder="e.g. Nimal Perera"
									className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">NIC Number</label>
								<input
									type="text"
									name="guideNIC"
									value={form.guideNIC}
									onChange={handleChange}
									placeholder="e.g. 199012345678 or 901234567V"
									className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Age</label>
								<input
									type="number"
									name="guideAge"
									value={form.guideAge}
									onChange={handleChange}
									placeholder="e.g. 25"
									className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
									min="18"
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-2">Languages Spoken</label>
								<div className="grid grid-cols-2 gap-2">
									{LANGUAGES.map(lang => (
										<label key={lang} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition">
											<input
												type="checkbox"
												checked={form.guideLanguages.includes(lang)}
												onChange={(e) => {
													const newLangs = e.target.checked
														? [...form.guideLanguages, lang]
														: form.guideLanguages.filter(l => l !== lang);
													setForm({ ...form, guideLanguages: newLangs });
												}}
												className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
											/>
											<span className="text-sm text-gray-700 font-medium">{lang}</span>
										</label>
									))}
								</div>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Upload CV (PDF/DOC)</label>
								<div className="relative">
									<input
										type="file"
										accept=".pdf,.doc,.docx"
										onChange={(e) => setGuideCV(e.target.files[0])}
										className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 transition"
									/>
									{guideCV && (
										<p className="mt-1.5 text-[11px] text-green-600 font-bold flex items-center gap-1">
											<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											Selected: {guideCV.name}
										</p>
									)}
								</div>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">About Your Experience</label>
								<textarea
									name="guideDescription"
									value={form.guideDescription}
									onChange={handleChange}
									rows="4"
									placeholder="Describe your guiding expertise, specializations, and what makes you a great guide..."
									className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
								/>
							</div>
						</div>

						{/* Password Section */}
						<div className="border-t-2 pt-4">
							<h3 className="font-bold text-gray-900 text-sm mb-3">Security</h3>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Password</label>
									<div className="relative">
										<input
											type={showPassword ? 'text' : 'password'}
											name="password"
											value={form.password}
											onChange={handleChange}
											placeholder="••••••••"
											className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition tracking-widest placeholder:tracking-normal"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase"
											aria-label="Toggle password visibility"
										>
											{showPassword ? 'Hide' : 'Show'}
										</button>
									</div>
								</div>

								<div>
									<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Confirm</label>
									<div className="relative">
										<input
											type={showConfirm ? 'text' : 'password'}
											name="confirm"
											value={form.confirm}
											onChange={handleChange}
											placeholder="••••••••"
											className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition tracking-widest placeholder:tracking-normal"
										/>
										<button
											type="button"
											onClick={() => setShowConfirm(!showConfirm)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase"
											aria-label="Toggle confirm visibility"
										>
											{showConfirm ? 'Hide' : 'Show'}
										</button>
									</div>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={uploading}
							className={`w-full mt-6 bg-[#10a110] hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors duration-200 shadow-[0_0_15px_rgba(16,161,16,0.3)] hover:shadow-[0_0_20px_rgba(16,161,16,0.5)] ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
						>
							{uploading ? (
								<>
									<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Uploading and Submitting...
								</>
							) : (
								<>
									Submit Guide Application
									<svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={() => window.close()}
							className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-xl text-sm transition-colors duration-200"
						>
							Cancel & Close
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default GuideApplication;
