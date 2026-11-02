/* Mark and wordmark files used as-is, placed with the geometry of logo-full.svg. */
const mark = "/logos/logo-icon-gradient.svg#svgView(viewBox(75,95,350,350))";

export function Logo({ draw = false }: { draw?: boolean }) {
  return (
    <span aria-hidden className="logo">
      <span className="logo-dark">
        <span className="logo-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} alt="" width={40} height={40} />
          {draw && <span className="rig"><span className="rig-r"><i /></span><span className="rig-l"><i /></span></span>}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/logo-wordmark-white.svg" alt="" width={106} height={38} className={`logo-word ${draw ? "logo-word-draw" : ""}`} />
      </span>
      {/* The on-light variant, for the paper surface. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/logo-full.svg#svgView(viewBox(73.57,174.5,528.3,170.4))" alt="" width={124} height={40} className="logo-light" />
    </span>
  );
}
