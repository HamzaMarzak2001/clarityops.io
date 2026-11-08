import { Approach } from "@/components/Approach";
import { ClientWords } from "@/components/ClientWords";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Loader } from "@/components/Loader";
import { Machine } from "@/components/Machine";
import { Nav } from "@/components/Nav";
import { Principles } from "@/components/Principles";
import { Stack } from "@/components/Stack";
import { Studio } from "@/components/Studio";
import { Thesis } from "@/components/Thesis";
import { WhatWeDo } from "@/components/WhatWeDo";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <Loader />
      <Machine />
      <Nav />
      <main>
        <Hero />
        <Thesis />
        <Work />
        <WhatWeDo />
        {/* Approach and How we think sit on paper, in the same world as Selected work. */}
        <div className="paper-run">
          <Approach />
          <Principles />
        </div>
        <Studio />
        <ClientWords />
        {/* Near the end the page turns white: the stack, the questions, and the conversation. */}
        <div className="paper-run white-run">
          <Stack />
          <Faq />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
