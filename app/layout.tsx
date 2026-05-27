import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Flow — Address Autocomplete",
	description: "Take-home exercise",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
