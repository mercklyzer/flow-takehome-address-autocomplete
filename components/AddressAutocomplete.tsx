import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import { parseAddressComponents } from "@/lib/places";
import type { ParsedAddress } from "@/lib/places";

interface Props {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSelect: (address: ParsedAddress) => void;
}

type Status = "initializing" | "ready" | "fetching" | "error";

const AddressAutocomplete = ({ value, onChange, onSelect }: Props) => {
	const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
		null,
	);
	const PlaceRef = useRef<typeof google.maps.places.Place | null>(null);
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

				const { AutocompleteService, Place } = await importLibrary("places");

				if (cancelled) return;

				serviceRef.current = new AutocompleteService();
				PlaceRef.current = Place;
				setStatus("ready");
			} catch {
				if (!cancelled) setStatus("error");
			}
		};

		init();

		return () => {
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
			{
				input,
				types: ["address"],
				componentRestrictions: { country: "us" },
			},
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

	const handlePredictionSelect = async (
		prediction: google.maps.places.AutocompletePrediction,
	) => {
		if (!PlaceRef.current) return;

		setStatus("fetching");
		setShowDropdown(false);

		try {
			const place = new PlaceRef.current({ id: prediction.place_id });
			await place.fetchFields({ fields: ["addressComponents"] });
			onSelect(
				parseAddressComponents(
					(place.addressComponents ?? []) as Parameters<
						typeof parseAddressComponents
					>[0],
				),
			);
		} catch {
			// fetchFields failed; user can fill remaining fields manually.
		} finally {
			setStatus("ready");
		}
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
					onChange={onChange}
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
									onMouseDown={() => handlePredictionSelect(p)}
									className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
								>
									{p.description}
								</li>
							))}
						</ul>
					)}
				</>
			)}
			{status === "fetching" && (
				<p className="mt-1 text-xs text-gray-500">Loading address details…</p>
			)}
		</div>
	);
};

export default AddressAutocomplete;
