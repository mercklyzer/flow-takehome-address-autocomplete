import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type Status = "initializing" | "ready" | "error";

const AddressAutocomplete = ({ value, onChange }: Props) => {
	const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
		null,
	);
	const [status, setStatus] = useState<Status>("initializing");
	const [predictions, setPredictions] = useState<
		google.maps.places.AutocompletePrediction[]
	>([]);
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const init = async () => {
			try {
				setOptions({
					key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "",
				});

				const { AutocompleteService } = await importLibrary("places");

				if (cancelled) return;

				serviceRef.current = new AutocompleteService();
				setStatus("ready");
			} catch {
				console.error("error");
				if (!cancelled) setStatus("error");
			}
		};

		init();

		return () => {
			// cancelled ensures that we never resolve a promise on an unmounted component (memory leak)
			cancelled = true;
		};
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e);

    const input = e.target.value;

		if (!input || !serviceRef.current) {
			setPredictions([]);
			setShowDropdown(false);
			return;
		}
		serviceRef.current.getPlacePredictions(
			{ input, types: ["address"], componentRestrictions: { country: "us" } },
			(results, serviceStatus) => {
				if (
					serviceStatus === google.maps.places.PlacesServiceStatus.OK &&
					results
				) {
					setPredictions(results);
					setShowDropdown(true);
				} else {
					setPredictions([]);
					setShowDropdown(false);
				}
			},
		);
	};

	if (status === "error") {
		return (
			<div>
				<label htmlFor="line1" className="mb-1 block text-sm font-medium">
					Street address
				</label>
				<input
					id="line1"
					name="line1"
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Enter your address"
					className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800"
				/>
				<p className="mt-1 text-xs text-gray-500">
					Address suggestions unavailable — type your address directly.
				</p>
			</div>
		);
	}

	return (
		<div className="relative">
			<label htmlFor="line1" className="mb-1 block text-sm font-medium">
				Street address
			</label>
			{status === "initializing" ? (
				<div className="h-10 w-full animate-pulse rounded-md bg-gray-100" />
			) : (
				<>
					<input
						id="line1"
						name="line1"
						type="text"
						value={value}
						onChange={handleChange}
						onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
						placeholder="Enter your address"
						className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800"
					/>
					{showDropdown && predictions.length > 0 && (
						<ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
							{predictions.map((p) => (
								<li
									key={p.place_id}
									className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
								>
									{p.description}
								</li>
							))}
						</ul>
					)}
				</>
			)}
		</div>
	);
};

export default AddressAutocomplete;
