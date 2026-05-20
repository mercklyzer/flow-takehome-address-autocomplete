/**
 * Address parsing + Google Places API client.
 *
 * Implement the functions in this file to support the address autocomplete feature.
 * See README.md for full requirements.
 */

/** Normalized US address shape used by the checkout form. */
export type ParsedAddress = {
  line1: string;
  city: string;
  state: string;
  zip: string;
};

/**
 * A single component returned by Google Places.
 * See: https://developers.google.com/maps/documentation/places/web-service/details
 */
export type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

/**
 * Convert Google Places `address_components` into the form's structured shape.
 *
 * Notes:
 * - `line1` should be `street_number + " " + route` when both exist.
 * - `state` should be the short_name of `administrative_area_level_1` (e.g. "CA").
 * - `zip` should be `postal_code` (long_name).
 * - Missing components should result in empty strings (do not throw).
 */
export function parseAddressComponents(
  components: AddressComponent[],
): ParsedAddress {
  // TODO: implement
  throw new Error("Not implemented");
}
