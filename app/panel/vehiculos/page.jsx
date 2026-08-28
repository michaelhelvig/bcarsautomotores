import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { slugify } from '@/lib/vehicles'
import DeleteButton from '../DeleteButton'
import SyncMercadoLibreButton from '../SyncMercadoLibreButton'
import VolverALaWebButton from '../VolverALaWebButton'

export default async function VehiculosPage({ searchParams }) {
  const supabase = await createClient()

  const { data: vehiculos } = await supabase
    .from('vehiculos')
    .select('*')
    .order('id', { ascending: true })

  const { data: meliToken, error: meliTokenError } = await supabaseAdmin
    .from('mercadolibre_tokens')
    .select('user_id')
    .limit(1)
    .maybeSingle()

  if (meliTokenError) {
    console.error(
      'Error verificando conexión de Mercado Libre:',
      meliTokenError.message,
    )
  }

  const params = await searchParams
  const meliStatus = params?.meli

  return (
    <div>
      <div className="flex justify-end mb-4">
        <VolverALaWebButton />
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-graphite-darker p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold">Mercado Libre</h2>
            <p className="text-white/50 text-sm mt-1">
              {meliToken
                ? 'Cuenta conectada. Podés importar y actualizar el stock.'
                : 'Primero conectá la cuenta que publica los vehículos.'}
            </p>
          </div>

          {meliToken ? (
            <SyncMercadoLibreButton />
          ) : (
            <a
              href="/api/mercadolibre/auth"
              className="bg-yellow-400 hover:bg-yellow-300 transition-colors text-black text-sm font-semibold rounded-full px-5 py-2 text-center"
            >
              Conectar Mercado Libre
            </a>
          )}
        </div>

        {meliStatus === 'connected' && (
          <p className="text-sm text-plata mt-3">✓ Mercado Libre se conectó correctamente.</p>
        )}
        {meliStatus === 'error' && (
          <p className="text-sm text-white font-medium mt-3">
            No se pudo completar la conexión con Mercado Libre.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Vehículos ({vehiculos?.length ?? 0})
        </h2>
        <Link
          href="/panel/nuevo"
          className="bg-acento hover:bg-acento-dark transition-colors text-ink text-sm font-semibold rounded-full px-5 py-2"
        >
          + Agregar auto
        </Link>
      </div>

      <div className="bg-graphite-darker rounded-2xl divide-y divide-white/10 overflow-hidden">
        {vehiculos?.map((car) => (
          <div key={car.id} className="flex items-center justify-between px-5 py-4">
            <div>
              {car.disponibilidad !== 'Vendido' ? (
                <Link
                  href={`/stock/${slugify(`${car.marca} ${car.modelo}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-acento transition-colors"
                >
                  {car.marca} {car.modelo} <span className="text-white/40">· {car.anio}</span>
                </Link>
              ) : (
                <p className="text-white font-medium">
                  {car.marca} {car.modelo} <span className="text-white/40">· {car.anio}</span>
                </p>
              )}
              <p className="text-white/50 text-sm">
                {car.precio} ·{' '}
                <span
                  className={
                    car.disponibilidad === 'Disponible'
                      ? 'text-green-500'
                      : car.disponibilidad === 'Vendido'
                        ? 'text-red-500'
                        : 'text-white/50'
                  }
                >
                  {car.disponibilidad}
                </span>
                {car.destacado && <span className="ml-2 text-plata">★ Destacado</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/panel/${car.id}/editar`}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Editar
              </Link>
              <DeleteButton id={car.id} label={`${car.marca} ${car.modelo}`} />
            </div>
          </div>
        ))}

        {(!vehiculos || vehiculos.length === 0) && (
          <p className="text-white/50 text-sm px-5 py-8 text-center">
            Todavía no hay autos cargados.
          </p>
        )}
      </div>
    </div>
  )
}