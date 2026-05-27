"use client";

import { useState } from "react";

type AddressForm = {
	line1: string;
	line2: string;
	city: string;
	state: string;
	zip: string;
};

const initialForm: AddressForm = {
	line1: "",
	line2: "",
	city: "",
	state: "",
	zip: "",
};

export default function Page() {
	const [form, setForm] = useState<AddressForm>(initialForm);

	const handleChange =
		(field: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setForm((prev) => ({ ...prev, [field]: e.target.value }));
		};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Logging is fine for the take-home; no real submission needed.
		console.log("Submitted address:", form);
	};

	return (
		<main className="mx-auto max-w-md p-6">
			<h1 className="mb-6 text-2xl font-semibold">Shipping address</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/*
          TODO: Replace the manual `line1` input below with an autocomplete-enabled
          input that calls Google Places API and populates city/state/zip on selection.
          See README.md for full requirements.
        */}
				<Field
					label="Street address"
					id="line1"
					value={form.line1}
					onChange={handleChange("line1")}
				/>
				<Field
					label="Apt, suite, etc. (optional)"
					id="line2"
					value={form.line2}
					onChange={handleChange("line2")}
				/>
				<Field
					label="City"
					id="city"
					value={form.city}
					onChange={handleChange("city")}
				/>
				<div className="grid grid-cols-2 gap-4">
					<Field
						label="State"
						id="state"
						value={form.state}
						onChange={handleChange("state")}
					/>
					<Field
						label="ZIP code"
						id="zip"
						value={form.zip}
						onChange={handleChange("zip")}
					/>
				</div>
				<button
					type="submit"
					className="w-full rounded-md bg-green-800 px-4 py-2 font-medium text-white hover:bg-green-800/90"
				>
					Continue
				</button>
			</form>
		</main>
	);
}

function Field({
	label,
	id,
	value,
	onChange,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-sm font-medium">
				{label}
			</label>
			<input
				id={id}
				name={id}
				type="text"
				value={value}
				onChange={onChange}
				className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800"
			/>
		</div>
	);
}
