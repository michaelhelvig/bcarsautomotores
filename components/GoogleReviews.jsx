import { GoogleIcon } from './icons'

// TODO: estas 6 reseñas son de ejemplo (placeholder) — reemplazar por
// reseñas reales de Google de Bcars Automotores antes de publicar el sitio.
// El promedio (RATING_AVERAGE) y el total (RATING_COUNT) de acá abajo
// también son de ejemplo, actualizarlos junto con las reseñas.
const RATING_AVERAGE = '5,0'
const RATING_COUNT = 42

const REVIEWS = [
    {
        nombre: 'Alberto Gabriel Servia',
        tiempo: 'Hace 11 meses',
        texto:
            'Fue todo muy bien, salió todo como lo acordado, cumplieron con todo lo pactado, el auto estaba en excelente estado. Los recomiendo 100 %',
    },
    {
        nombre: 'Pedro Angel Contreras',
        tiempo: 'Hace 1 mes',
        texto:
            'Muy buena atención, te atienden súper rápido. Son atentos, muy cordiales, buenos precios, hermosos autos la verdad que lo recomiendo!',
    },
    {
        nombre: 'Antonella Soria',
        tiempo: 'Hace 1 mes',
        texto:
            'Tuve una experiencia excelente al comprar mi auto en esta agencia. Desde el primer momento, Bruno, el vendedor que me atendió, fue sumamente profesional y amable. Me explicó todo con claridad, resolvió todas mis dudas y me acompañó en cada paso del proceso de compra. ¡Cinco estrellas!',
    },
    {
        nombre: 'Gabriel Calabeiro',
        tiempo: 'Hace 4 meses',
        texto:
            'Esta agencia la recomiendo el 100x100. Mas alla de tener unos autos hermosos, la atencion personalizada de Bruno es exelente.',
    },
    {
        nombre: 'Tomas Ramirez',
        tiempo: 'Hace 1 año',
        texto:
            'Como primera experiencia comprando un auto, realmente fue la mejor. Los chicos me guiaron en todo el proceso, súper transparente. Solamente queda decirles GRACIAS! Hasta la próxima..',
    },
    {
        nombre: 'Marcos Caruso',
        tiempo: 'Hace 1 semana',
        texto:
            'La verdad todo un lujo. Los autos se los ven todos en excelente estado. La atención de Bruno espectacular. Desde primer momento buena onda y muy honesto. 100% recomendable!',
    },
]

function Stars({ className = '' }) {
    return (
        <div className={`flex gap-0.5 ${className}`} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" className="w-4 h-4 text-acento" fill="currentColor">
                    <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L10 1.5z" />
                </svg>
            ))}
        </div>
    )
}

export default function GoogleReviews() {
    return (
        <section id="resenas" className="py-24 bg-graphite-dark">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-px bg-acento" />
                    <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                        Testimonios
                    </span>
                </div>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                    Lo que dicen nuestros clientes.
                </h2>

                <div className="mt-8 inline-flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-graphite-light px-6 py-5">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">{RATING_AVERAGE}</span>
                        <Stars />
                    </div>
                    <p className="text-sm text-white/50">{RATING_COUNT} reseñas en Google</p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {REVIEWS.map((r, index) => (
                        <figure
                            key={index}
                            className="bg-graphite-light rounded-2xl p-6 shadow-card border border-white/10 flex flex-col"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-white/10 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                                        {r.nombre
                                            .split(' ')
                                            .map((part) => part.charAt(0))
                                            .join('')}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{r.nombre}</p>
                                        <p className="text-xs text-white/50">{r.tiempo}</p>
                                    </div>
                                </div>
                                <GoogleIcon className="w-5 h-5 shrink-0" />
                            </div>

                            <Stars className="mt-4" />

                            <blockquote className="mt-3 text-white/70 text-sm leading-relaxed flex-1">
                                {r.texto}
                            </blockquote>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
}