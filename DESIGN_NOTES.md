# Design research and direction

Official restaurant sites reviewed before implementation:

| Reference                                                                | Useful observation                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Hawksmoor](https://thehawksmoor.com/)                                   | Image-led opening, a short point of view, and visible menu and booking paths. Its [menu](https://thehawksmoor.com/locations/seven-dials/food/menu/) presents dish names, supporting details, and prices in a straightforward hierarchy. |
| [CUT by Wolfgang Puck](https://wolfgangpuck.com/restaurants/cut-london/) | Restaurant identity is paired quickly with practical location, hours, and directions.                                                                                                                                                   |
| [ROKA Riyadh](https://www.rokarestaurant.com/en/roka-midtown-riyadh)     | A Saudi location gets its own venue story, menu highlights, directions, and hours; its [menu](https://www.rokarestaurant.com/en/roka-midtown-riyadh/menu?menu=main-menu) is grouped for scanning.                                       |
| [Firedoor](https://firedoor.com.au/)                                     | A memorable cooking idea anchors sparse copy, large photography, menu access, and visit details.                                                                                                                                        |
| [Nusr-Et](https://www.nusr-et.com.tr/en)                                 | Restaurant atmosphere and signature dishes do much of the storytelling through imagery.                                                                                                                                                 |

## Synthesis for Meatery

- **Hero:** one dominant food photograph, a short line about the restaurant, and immediate menu/directions actions. The typography is oversized but the navigation stays quiet.
- **Typography and spacing:** a strong condensed display face carries the brand voice; a calm sans serif handles details. The page alternates dense visual moments with generous breathing room.
- **Image treatment:** dark, tactile, believable editorial photography, with restrained overlays for legibility. The gallery uses varied crops rather than repeating uniform cards.
- **Navigation and CTAs:** the home page keeps menu and visit paths clear. The menu gives category navigation priority on a phone, with a compact language switch and simple dish rows.
- **Mobile:** a short hero hands off quickly to the actual menu; category links remain accessible while scrolling. Arabic uses localized copy and right-to-left layout.
- **Originality:** the composition, words, map treatment, and section pacing were made for this Meatery preview. None of the referenced sites' layouts, logos, copy, or assets were reused.

## Client-requested QR menu refinement

Reviewed the client’s [Ramo menu reference](https://ramo-menu.vercel.app/menu). Useful interaction patterns were category filtering, search in either language, a clear result count, and access to dish information. Meatery retains its own monochrome palette, condensed headings, flame mark, and editorial dish rows. No Ramo branding, imagery, copy, or page composition was reused.

`/menu-qr-code` puts the menu first: a compact masthead, sticky search and category controls, a complete category picker, readable dish names, and optional patty/side selections. No food photos load on this route. `/menu` uses the same content and controls with a larger photographic introduction. The two pages have no ordering, cart, payment, account, or backend dependency.

## Arabic homepage and supplied kinetic navigation

The Arabic homepage keeps the large MEATERY wordmark while translating the complete restaurant story, calls to action, visit information, image descriptions, and footer. Layout, typography, and hero image treatment adapt to right-to-left reading. The language control follows the reference's straightforward Arabic/English toggle pattern and preserves the guest's choice across routes.

The user-supplied Sterling Gate component was adapted to Meatery's actual links and warm monochrome styling. Layered panels, staggered link movement, a rolling Menu/Close trigger, and subtle brand-mark movement provide its animation. A native dialog adds keyboard focus containment; reduced motion avoids animated transitions. The GSAP module is separate from the initial QR menu bundle.
