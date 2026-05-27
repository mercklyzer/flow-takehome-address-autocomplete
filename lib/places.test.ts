import { describe, expect, it } from "vitest";
import type { AddressComponent } from "./places";
import { parseAddressComponents } from "./places";

const mockAddressComponent = (
	type: string,
	longText: string,
	shortText = longText,
): AddressComponent => ({
	longText,
	shortText,
	types: [type],
});

describe("parseAddressComponents", () => {
	it("parses a complete US address (street + city + state + zip)", () => {
		const components = [
			mockAddressComponent("street_number", "123"),
			mockAddressComponent("route", "Main Street"),
			mockAddressComponent("locality", "San Francisco"),
			mockAddressComponent("administrative_area_level_1", "California", "CA"),
			mockAddressComponent("postal_code", "94105"),
		];

		expect(parseAddressComponents(components)).toEqual({
			line1: "123 Main Street",
			city: "San Francisco",
			state: "CA",
			zip: "94105",
		});
	});

	it("returns empty zip when postal_code component is missing", () => {
		const components = [
			mockAddressComponent("street_number", "1"),
			mockAddressComponent("route", "Rural Route 2"),
			mockAddressComponent("locality", "Billings"),
			mockAddressComponent("administrative_area_level_1", "Montana", "MT"),
		];

		expect(parseAddressComponents(components).zip).toBe("");
	});
});
