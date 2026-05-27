export interface AddressComponent {
	longText: string;
	shortText: string;
	types: string[];
}

export interface ParsedAddress {
	line1: string;
	city: string;
	state: string;
	zip: string;
}

const find = (components: AddressComponent[], type: string) =>
	components.find((c) => c.types.includes(type));

export const parseAddressComponents = (
	components: AddressComponent[],
): ParsedAddress => {
	const streetNumber = find(components, "street_number")?.longText ?? "";
	const route = find(components, "route")?.longText ?? "";
	// street_number may be absent (named buildings, some PO Box leakage)
	const line1 =
		streetNumber && route ? `${streetNumber} ${route}` : route || streetNumber;

	return {
		line1,
		city: find(components, "locality")?.longText ?? "",
		state: find(components, "administrative_area_level_1")?.shortText ?? "",
		zip: find(components, "postal_code")?.longText ?? "",
	};
};
