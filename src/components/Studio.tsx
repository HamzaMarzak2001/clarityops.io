import Image from "next/image";
import { Reveal } from "./Reveal";

export function Studio() {
  return (
    <section id="studio" aria-labelledby="studio-h" className="sec">
      <div className="wrap grid12 gap-y-10">
        <Reveal className="st-portrait frame col-span-12 aspect-square md:col-span-5">
          <Image src="/studio/hamza-marzak.jpg" alt="Hamza Marzak in profile, in front of a lime halo." fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </Reveal>
        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <p className="label mb-6">The studio</p>
          <h2 id="studio-h" className="d">Founder-led, by design.</h2>
          <p className="body mt-8">I started ClarityOps because I kept seeing the same thing. Good companies, growing fast, held together by a founder who had become the system. Four years later, we&apos;ve built operations for companies in construction, real estate, media, consumer brands and professional services, across three continents. Every engagement is still led by me, from the first review to the handover. That&apos;s deliberate. The people who design your operation should be the ones who build it.</p>
          <p className="fine mt-6">Hamza Marzak, Founder</p>
        </div>
        <Reveal className="st-pull col-span-12 mt-8 lg:mt-24"><p className="human"><span>The founder shouldn&apos;t be the system.</span></p></Reveal>
      </div>
    </section>
  );
}
