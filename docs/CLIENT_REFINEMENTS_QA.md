# Client refinements — 26 October 2026

- Updated the confirmed location to **Meatery — Al Matal, Madinah, Saudi Arabia**, with corresponding Arabic wording throughout the homepage, menu mastheads, navigation and footer.
- Added the UK origins note within Our Story, using the existing paper colour, typefaces and editorial alignment. English/Arabic copy remains editable in `src/data/homeCopy.js`.
- Removed the illustrative numerical coordinates. The map remains a clearly labelled conceptual location treatment; both directions links use an area search until `site.googleMapsUrl` contains the client's verified place link.
- Centralised the name, district/city/country, hours, phone, WhatsApp, website origin and Maps link in `src/data/site.js`. Phone links only appear once a real number is supplied. No Google Business Profile was created or claimed.
- Kept `websiteUrl` empty: Meatery.com has not been checked, acquired or connected. Canonical/sharing URLs derive from the current origin until a verified HTTPS origin is configured. The built application contains no hard-coded Meatery preview hostname.
- Retained the approved destination in `public/qr/destination.txt` as the deliberate record for existing printed cards. Regenerating all three QR assets produces no changes at the current settings. Future domain changes must keep that older address working for existing prints.

## Verification

- Production build, TypeScript check and all 19 data/language/domain tests pass.
- Reviewed English and Arabic homepage layouts at desktop (1440 px) and mobile (390 px), including origins spacing, extended location labels, map notices and SVG CTA alignment.
- Verified QR menu language switching, English search while browsing Arabic, dish-dialog opening/closing, and a triple-patty selection updating the riyal estimate.
- Checked successful HTTP responses and content types for all three page routes in both languages, branding assets, key photography and printable QR assets.
- Source scan found no emoji-style arrows, stars, pictographic characters or emoji variation selectors in the interface. The dark HTML/body background and SVG icon system remain in place.
- **Native Safari/iPhone check remains outstanding:** the running Simulator could not be accessed through the available computer-use connection. Chrome phone-size review does not establish native Safari rendering. Check the deployed pages on a physical iPhone before final client sign-off.

No ordering, cart, payment, account, kitchen or backend functionality was added.
