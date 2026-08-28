import { getHistorias } from '@/lib/historias'
import InstagramStoriesCarousel from './InstagramStoriesCarousel'

export default async function InstagramStories() {
  const historias = await getHistorias()

  // Si todavía no se cargó ninguna foto desde el panel, no mostramos la
  // sección vacía en el sitio público.
  if (historias.length === 0) return null

  return (
    <section id="entregas" className="py-24 bg-graphite-darker">
      <div className="max-w-6xl mx-auto px-6">
        <InstagramStoriesCarousel historias={historias} />
      </div>
    </section>
  )
}
