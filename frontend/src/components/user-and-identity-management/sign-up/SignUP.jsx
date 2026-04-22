import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { validatePhone } from '../../../utils/validation';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LANGUAGES = ["English", "Sinhala", "Tamil", "French", "German", "Chinese", "Japanese"];

const SignUP = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { setUser } = useAuth();
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		phone: '',
		role: '',
		password: '',
		confirm: '',
		guideExperience: '',
		guideFullName: '',
		guideNIC: '',
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
	const [showGuideModal, setShowGuideModal] = useState(false);
	const [showOwnerModal, setShowOwnerModal] = useState(false);
	const [ownerForm, setOwnerForm] = useState({
		businessName: '',
		nic: '',
		address: '',
		experience: '',
		description: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => {
			const next = { ...prev, [name]: value };
			// Auto-fill guide profile name from main name field
			if (name === 'fullName' && (!prev.guideFullName || prev.guideFullName === prev.fullName)) {
				next.guideFullName = value;
			}
			return next;
		});
	};

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();

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

		if (!form.role) {
			setError('Please select a role to continue.');
			return;
		}

		const isGuide = form.role === 'guide';
		const isOwner = form.role === 'campsite owner';
		
		// If guide and modal not shown, show modal
		if (isGuide && !showGuideModal) {
			setShowGuideModal(true);
			return;
		}

		// If owner and modal not shown, show modal
		if (isOwner && !showOwnerModal) {
			setShowOwnerModal(true);
			return;
		}

		if (form.password !== form.confirm) {
			setError('Passwords do not match');
			return;
		}

		if (form.role !== 'guide') {
			if (form.password !== form.confirm) {
				setError('Passwords do not match');
				return;
			}

			if (form.password.length < 6) {
				setError('Password must be at least 6 characters long');
				return;
			}
		}

		setError('');
		setSuccessMessage('');

		try {
			// Owner validation
			if (isOwner) {
				if (!ownerForm.businessName.trim()) {
					setError('Please enter your business name.');
					return;
				}
				if (!ownerForm.nic.trim()) {
					setError('Please enter your NIC number.');
					return;
				}
				if (!ownerForm.address.trim()) {
					setError('Please enter your business address.');
					return;
				}
			}
			
			// If guide, validate required fields
			if (isGuide) {
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
			}

			let cvUrl = '';
			if (isGuide && guideCV) {
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
				email: form.email.toLowerCase().trim(),
				phone: form.phone,
				password: form.password,
				role: form.role === 'campsite owner' ? 'campsite_owner' : form.role,
				guideApplication: isGuide
					? {
						experience: Number(form.guideExperience),
						fullName: form.guideFullName.trim(),
						nic: form.guideNIC.trim(),
						age: Number(form.guideAge),
						description: form.guideDescription.trim(),
						languages: form.guideLanguages,
						cv: cvUrl,
					}
					: undefined,
				ownerApplication: isOwner
					? {
						businessName: ownerForm.businessName.trim(),
						nic: ownerForm.nic.trim(),
						phone: form.phone,
						address: ownerForm.address.trim(),
						description: ownerForm.description.trim(),
						experience: ownerForm.experience ? Number(ownerForm.experience) : 0,
					}
					: undefined,
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
				// Navigate based on role
				const role = data.user.role;
				if (role === 'guide' || role === 'campsite_owner') {
					setShowGuideModal(false);
					setShowOwnerModal(false);
					setSuccessMessage('Account created successfully! Waiting for admin approve.');
					// Clear form
					setForm({
						fullName: '',
						email: '',
						phone: '',
						role: '',
						password: '',
						confirm: '',
						guideExperience: '',
						guideFullName: '',
						guideNIC: '',
						guideAge: '',
						guideDescription: '',
						guideLanguages: [],
					});
					return;
				}

				// Store standardized userInfo in localStorage and update AuthContext state
				const userInfo = { ...data.user, token: data.token };
				localStorage.setItem('userInfo', JSON.stringify(userInfo));
				setUser(userInfo);

				// Handle redirection logic - prioritize 'from' state if available
				const from = location.state?.from;
				if (from) {
					navigate(from);
					return;
				}

				switch (role) {
					case 'admin':
						navigate('/admin-dashboard');
						break;
					case 'camper':
					default:
						navigate('/');
						break;
				}
			} else {
				setError(data.error || 'Registration failed');
			}
		} catch (err) {
			setError('Network error. Please try again.');
		}
	};

	return (
		<div className="min-h-screen flex font-sans overflow-hidden bg-white">
			{/* Left panel with background image */}
			<div
				className="hidden md:flex md:w-3/5 lg:w-2/3 relative flex-col justify-between p-8 sm:p-12 overflow-hidden"
				style={{
					backgroundImage: "url('https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2000')",
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<div className="absolute inset-0 bg-black/40 transition-all duration-1000" />

				{/* Marketing Copy */}
				<div className="relative z-10 mt-auto mb-10 group cursor-default">
					<h1 className="text-white text-5xl xl:text-6xl font-extrabold leading-tight mb-4 drop-shadow-xl transition-all duration-700 ease-in-out transform group-hover:translate-x-2 group-hover:scale-105 origin-left">
						Elevate your <span className="text-green-400 block transition-all duration-700 group-hover:text-green-300 group-hover:tracking-wide">outdoor experience.</span>
					</h1>
					<p className="text-white/80 text-sm xl:text-base leading-relaxed max-w-sm mt-4 transition-all duration-700 ease-in-out transform delay-75 group-hover:translate-x-3 group-hover:text-white">
						The ultimate management system for campers, explorers, and nature lovers.
					</p>
				</div>

				<div className="relative z-10">
					<p className="text-white/50 text-xs">© 2026 Smart Camping Management System. All rights reserved.</p>
				</div>
			</div>

			{/* Right panel - Compact Form */}
			<div className="w-full md:w-2/5 lg:w-1/3 flex items-center justify-center bg-white p-6 sm:p-12 relative h-screen overflow-y-auto">
				<div className="w-full max-w-md my-auto">
					<div className="mb-6 w-full">
						<h2 className="text-3xl font-extrabold text-gray-900 mb-1">Start Your Adventure</h2>
						<p className="text-gray-500 text-sm">Create your account to start managing your campsites.</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-3">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
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
									<h2 className="text-3xl font-extrabold text-gray-900 mb-2">Registration Successful!</h2>
									<p className="text-gray-600 text-lg leading-relaxed font-semibold">
										Account created successfully! <br />
										<span className="text-[#10a110] block mt-2">Waiting for admin approve.</span>
									</p>
									<button
										onClick={() => setSuccessMessage('')}
										className="mt-6 w-full py-3 bg-[#10a110] hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-900/40"
									>
										Close
									</button>
								</div>
							</div>
						)}
						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Full Name</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</span>
								<input
									type="text"
									name="fullName"
									value={form.fullName}
									onChange={handleChange}
									placeholder="e.g. John Doe"
									className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Email Address</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</span>
								<input
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									placeholder="name@example.com"
									className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Phone Number</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
									</svg>
								</span>
								<input
									type="tel"
									name="phone"
									value={form.phone}
									onChange={handleChange}
									placeholder="+92 300 0000000"
									className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Role</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</span>
								<select
									name="role"
									value={form.role}
									onChange={handleChange}
									className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition appearance-none cursor-pointer"
								>
									<option value="" disabled>Select your role</option>
									<option value="campsite owner">Campsite Owner</option>
									<option value="camper">Camper</option>
									<option value="guide">Guide</option>
								</select>
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</div>
						</div>

						{form.role !== 'guide' && form.role !== 'campsite owner' && (
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Password</label>
									<div className="relative">
										<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</span>
										<input
											type={showPassword ? 'text' : 'password'}
											name="password"
											value={form.password}
											onChange={handleChange}
											placeholder="••••••••"
											className="w-full pr-8 pl-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition tracking-widest placeholder:tracking-normal"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase"
										>
											{showPassword ? 'Hide' : 'Show'}
										</button>
									</div>
								</div>

								<div>
									<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Confirm</label>
									<div className="relative">
										<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</span>
										<input
											type={showConfirm ? 'text' : 'password'}
											name="confirm"
											value={form.confirm}
											onChange={handleChange}
											placeholder="••••••••"
											className="w-full pr-8 pl-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition tracking-widest placeholder:tracking-normal"
										/>
										<button
											type="button"
											onClick={() => setShowConfirm(!showConfirm)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase"
										>
											{showConfirm ? 'Hide' : 'Show'}
										</button>
									</div>
								</div>
							</div>
						)}

						{form.role !== 'guide' && form.role !== 'campsite owner' && (
							<button
								type="submit"
								className="w-full mt-3 bg-[#10a110] hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors duration-200 shadow-[0_0_15px_rgba(16,161,16,0.3)] hover:shadow-[0_0_20px_rgba(16,161,16,0.5)]"
							>
								Create Account
								<svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
							</button>
						)}
					</form>

					<div className="flex items-center gap-3 my-5">
						<div className="flex-1 h-px bg-gray-200" />
						<span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 bg-white">Or continue with</span>
						<div className="flex-1 h-px bg-gray-200" />
					</div>

					{form.role === 'guide' && (
						<div className="rounded-3xl border-2 border-green-400 bg-green-50 p-5 space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-green-900">🌟 Guide Application</h3>
									<p className="text-sm text-green-700 mt-1">
										Complete your guide profile and expertise details below.
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setShowGuideModal(true)}
								className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors duration-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
							>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								Complete Guide Application
							</button>
						</div>
					)}

					{form.role === 'campsite owner' && (
						<div className="rounded-3xl border-2 border-blue-400 bg-blue-50 p-5 space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold text-blue-900">🏕️ Owner Application</h3>
									<p className="text-sm text-blue-700 mt-1">
										Complete your campsite owner profile to get approved.
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setShowOwnerModal(true)}
								className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
							>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
								Complete Owner Application
							</button>
						</div>
					)}

					<div className="grid grid-cols-2 gap-3">
						<button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 shadow-sm rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
							<svg className="w-4 h-4" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
							Google
						</button>
						<button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 shadow-sm rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
							</svg>
							Apple
						</button>
					</div>

					<p className="text-center text-xs text-gray-600 mt-5 font-medium">
						Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="text-[#10a110] font-bold hover:underline">Log in</Link>
					</p>

					<p className="text-center text-[10px] text-gray-400 mt-4 mx-auto leading-relaxed">
						By signing up, you agree to our <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a><br />and <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
					</p>
				</div>
			</div>

			{/* Guide Application Modal */}
			{showGuideModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between border-b">
							<h2 className="text-xl font-bold text-white">Guide Application</h2>
							<button onClick={() => setShowGuideModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-6 space-y-4">
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Experience (years)</label>
								<input type="number" name="guideExperience" value={form.guideExperience} onChange={handleChange} placeholder="e.g. 3" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" min="0" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Full Name</label>
								<input type="text" name="guideFullName" value={form.guideFullName} onChange={handleChange} placeholder="e.g. Nimal Perera" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">NIC Number</label>
								<input type="text" name="guideNIC" value={form.guideNIC} onChange={handleChange} placeholder="e.g. 199012345678 or 901234567V" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Age</label>
								<input type="number" name="guideAge" value={form.guideAge} onChange={handleChange} placeholder="e.g. 25" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" min="18" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-2">Languages Spoken</label>
								<div className="grid grid-cols-2 gap-2">
									{LANGUAGES.map(lang => (
										<label key={lang} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
											<input type="checkbox" checked={form.guideLanguages.includes(lang)} onChange={(e) => {
												const newLangs = e.target.checked ? [...form.guideLanguages, lang] : form.guideLanguages.filter(l => l !== lang);
												setForm({ ...form, guideLanguages: newLangs });
											}} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
											<span className="text-sm text-gray-700">{lang}</span>
										</label>
									))}
								</div>
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Upload CV (PDF/DOC)</label>
								<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setGuideCV(e.target.files[0])} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 bg-zinc-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">About Your Experience</label>
								<textarea name="guideDescription" value={form.guideDescription} onChange={handleChange} rows="4" placeholder="Describe your expertise..." className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none" />
							</div>
							{error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
							<div className="flex gap-3 pt-4">
								<button type="button" onClick={() => setShowGuideModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-xl text-sm transition-colors duration-200">Back</button>
								<button type="button" onClick={handleSubmit} disabled={uploading} className={`flex-1 bg-[#10a110] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors duration-200 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
									{uploading ? 'Uploading...' : 'Complete Signup'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Owner Application Modal */}
			{showOwnerModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b">
							<h2 className="text-xl font-bold text-white">Owner Application</h2>
							<button onClick={() => setShowOwnerModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-6 space-y-4">
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Business Name</label>
								<input type="text" value={ownerForm.businessName} onChange={(e) => setOwnerForm({ ...ownerForm, businessName: e.target.value })} placeholder="e.g. Pine Ridge Campsites" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">NIC Number</label>
								<input type="text" value={ownerForm.nic} onChange={(e) => setOwnerForm({ ...ownerForm, nic: e.target.value })} placeholder="e.g. 199012345678" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Business Address</label>
								<input type="text" value={ownerForm.address} onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })} placeholder="e.g. Ella, Sri Lanka" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">Experience (years)</label>
								<input type="number" value={ownerForm.experience} onChange={(e) => setOwnerForm({ ...ownerForm, experience: e.target.value })} placeholder="e.g. 5" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" min="0" />
							</div>
							<div>
								<label className="block text-[11px] uppercase tracking-wide font-bold text-gray-700 mb-1">About Your Business</label>
								<textarea value={ownerForm.description} onChange={(e) => setOwnerForm({ ...ownerForm, description: e.target.value })} rows="4" placeholder="Describe your business..." className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
							</div>
							{error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
							<div className="flex gap-3 pt-4">
								<button type="button" onClick={() => setShowOwnerModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-xl text-sm transition-colors duration-200">Back</button>
								<button type="button" onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors duration-200">Complete Signup</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SignUP;
