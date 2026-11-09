const TEXT =
  "We earn commissions when you shop through some links on this page. It costs you nothing extra and doesn't change the order or the prices.";

/** Small affiliate note shown above plan listings. Wording is fixed. */
export default function AffiliateNote() {
  return (
    <p className="aff-note">
      <a href="/disclosure/">{TEXT}</a>
    </p>
  );
}
