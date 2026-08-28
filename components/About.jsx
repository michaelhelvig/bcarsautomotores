export default function About() {
  return (
    <section id="nosotros" className="py-24 bg-graphite-darker">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-sm font-bold text-acento uppercase tracking-wide">
            ¿Quienes somos?
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
            Confianza, calidad y respaldo en cada operación
          </h2>
        </div>

        <div className="mt-12 space-y-6 text-white/70 leading-relaxed text-base sm:text-lg">
          <p>
            En Bcars Automotores trabajamos con transparencia y compromiso en cada operación,
            acompañando a cada cliente durante todo el proceso.
          </p>
          <p>
            Nos especializamos en la compra y venta de autos multimarca, tomando permutas y
            consignaciones para que cada cliente tenga la mejor opción al momento de cambiar
            su vehículo.
          </p>
          <p>
            Contamos con un espacio propio pensado para que cada visita sea cómoda, donde
            podés recorrer el stock disponible con total confianza.
          </p>
          <p>
            Ofrecemos un servicio integral que incluye gestoría profesional y financiación
            adaptada a cada necesidad.
          </p>
          <p className="font-medium text-white">
            Nuestro objetivo es simple: ayudarte a encontrar el auto que buscás, con la
            seguridad y confianza que merecés.
          </p>
        </div>
      </div>
    </section>
  )
}