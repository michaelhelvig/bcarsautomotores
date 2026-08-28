import { WhatsAppIcon, InstagramIcon, TikTokIcon } from './icons'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { INSTAGRAM_URL } from '@/lib/social'

// TODO: reemplazar por la dirección real de BCARS AUTOMOTORES.
const ADDRESS = 'Dirección a confirmar, Buenos Aires'
const MAPS_SEARCH_QUERY = 'BCARS AUTOMOTORES, Buenos Aires, Argentina'
const MAPS_EMBED_SRC =
  'https://maps.google.com/maps?q=' + encodeURIComponent(MAPS_SEARCH_QUERY) + '&t=&z=16&ie=UTF8&iwloc=&output=embed'
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(MAPS_SEARCH_QUERY)

const WHATSAPP_MESSAGE = 'Hola, quiero contactarme con BCARS AUTOMOTORES!'

const SOCIAL_LINKS = [
  {
    label: 'WhatsApp',
    href: buildWhatsAppUrl(WHATSAPP_MESSAGE),
    Icon: WhatsAppIcon,
  },
  {
    label: 'Instagram',
    href: INSTAGRAM_URL,
    Icon: InstagramIcon,
  },
  {
    label: 'TikTok',
    // TODO: confirmar el usuario real de TikTok de BCARS AUTOMOTORES.
    href: 'https://www.tiktok.com/@bcarsautomotores',
    Icon: TikTokIcon,
  },
]

export default function Location() {
  return (
    <section id="ubicacion" className="py-24 bg-graphite-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-sm font-semibold text-acento uppercase tracking-wide">
            Ubicación
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Visitanos en nuestra sucursal</h2>
          <p className="mt-3 text-white/60">
            Te esperamos de lunes a sábados para que conozcas nuestro stock personalmente.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-card border border-white/10 min-h-[320px]">
            <iframe
              title="Ubicación de BCARS AUTOMOTORES en el mapa"
              src={MAPS_EMBED_SRC}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="lg:col-span-2 bg-graphite-light rounded-2xl shadow-card border border-white/10 p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">BCARS AUTOMOTORES</h3>
                <div className="flex items-center gap-2 shrink-0">
                  {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-white border border-white/20 hover:bg-white hover:text-ink hover:scale-105 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-white/60 text-sm leading-relaxed">{ADDRESS}</p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/50">Lunes a viernes</dt>
                  <dd className="font-medium text-white">09:00hs - 18:00hs</dd>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/50">Sábados</dt>
                  <dd className="font-medium text-white">09:00hs - 18:00hs</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">Domingos</dt>
                  <dd className="font-medium text-white">Cerrado</dd>
                </div>
              </dl>
            </div>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 bg-acento text-ink font-semibold px-5 py-3 rounded-full hover:bg-acento-dark transition-colors"
            >
              Cómo llegar →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}