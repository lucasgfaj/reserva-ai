<script setup lang="ts">
import LandingHeader from "../components/LandingHeader.vue";
import HeroSection from "../components/HeroSection.vue";
import TrustedLogos from "../components/TrustedLogos.vue";
import FeaturesBento from "../components/FeaturesBento.vue";
import TestimonialSection from "../components/TestimonialSection.vue";
import CtaSection from "../components/CtaSection.vue";
import LandingFooter from "../components/LandingFooter.vue";
import MobileBottomNav from "../components/MobileBottomNav.vue";
</script>

<template>
  <div class="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 w-full min-h-screen">
    <LandingHeader />

    <main class="pt-20">
      <HeroSection />
      <TrustedLogos />
      <FeaturesBento />
      <TestimonialSection />
      <CtaSection />
    </main>

    <LandingFooter />
    <MobileBottomNav />
  </div>
</template>

<style>
/* Global landing styles if any, but handled in components */
html {
  scroll-behavior: smooth;
}
</style>
