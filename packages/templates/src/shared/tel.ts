/**
 * A `tel:` href built from the number as it is displayed.
 *
 * The number in the site config is written for people — "0418 63 47 17" — and
 * that string went straight into the href, spaces included, so every phone link
 * carried a URL that only some clients accept. Digits and a leading `+` are the
 * only things a `tel:` URI may contain.
 *
 * Country-agnostic on purpose: the kit has no idea which country the business is
 * in, so it does not invent a country code. It keeps a `+` if the site wrote one.
 */
export const telHref = (phone: string): string =>
  `tel:${phone.replace(/[^\d+]/g, '')}`
