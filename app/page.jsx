import Hero from '@/components/Hero'
import StockPreview from '@/components/StockPreview'
import Servicios from '@/components/Servicios'
import InstagramStories from '@/components/InstagramStories'
import GoogleReviews from '@/components/GoogleReviews'
import About from '@/components/About'
import Location from '@/components/Location'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function HomePage() {
  return (
    <>
      <Hero />

      <ScrollReveal>
        <StockPreview />
      </ScrollReveal>

      <ScrollReveal>
        <Servicios />
      </ScrollReveal>

      <ScrollReveal>
        <InstagramStories />
      </ScrollReveal>

      <ScrollReveal>
        <GoogleReviews />
      </ScrollReveal>

      <ScrollReveal>
        <About />
      </ScrollReveal>

      <ScrollReveal>
        <Location />
      </ScrollReveal>
    </>
  )
}