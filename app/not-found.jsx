import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="pt-32 pb-24 sm:pt-40 bg-graphite min-h-screen">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold text-white">Página no encontrada</h1>
        <p className="mt-3 text-white/60">
          El contenido que buscás no existe, se movió, o el vehículo ya se vendió.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-acento text-ink font-semibold px-6 py-3 rounded-full shadow-soft hover:bg-acento-dark transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </section>
  )
}
