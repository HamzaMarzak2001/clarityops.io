import { Approach } from "@/components/Approach";
import { ClientWords } from "@/components/ClientWords";
import { Contact } from "@/components/Contact";
import { Fit } from "@/components/Fit";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Loader } from "@/components/Loader";
import { Machine } from "@/components/Machine";
import { Nav } from "@/components/Nav";
import { Principles } from "@/components/Principles";
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
        <Approach />
        <Principles />
        <Studio />
        <ClientWords />
        <Fit />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
