import Image from "next/image";

const Line = ({ children }: { children: string }) => <span className="line"><span>{children}</span></span>;

export function Hero() {
  return (
    <section aria-labelledby="hero-h" className="hero pt-[88px]">
      <div className="wrap pt-6 lg:pt-12">
        <p className="label hero-fade mb-6">Operations &amp; AI systems studio</p>
        <h1 id="hero-h" className="d-xl" aria-label="We design how companies run.">
          <span aria-hidden className="block sm:hidden"><Line>We design</Line><Line>how</Line><Line>companies</Line><Line>run.</Line></span>
          <span aria-hidden className="hidden sm:block"><Line>We design how</Line><Line>companies run.</Line></span>
        </h1>
      </div>
      <div className="hero-low">
        <div className="hero-copy hero-fade">
          <p className="hero-sub">ClarityOps builds the operating systems behind growing companies. The structure, the automation and the AI that let a business run without everything passing through its founder.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#contact" className="btn btn-p"><span>Start a conversation</span></a>
            <a href="#work" className="tlink">See selected work</a>
          </div>
        </div>
        {/* A still of the machine: shown until the live one fades in, and for good with reduced motion or no WebGL. */}
        <div aria-hidden className="hero-object">
          <Image src="/object/machine.webp" alt="" width={1100} height={1100} priority sizes="(min-width: 1024px) 720px, 100vw" className="hero-still" />
        </div>
      </div>
    </section>
  );
}
