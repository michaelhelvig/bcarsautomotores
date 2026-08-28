import { createClient } from '@/lib/supabase/server'
import HistoriasManager from './HistoriasManager'
import VolverALaWebButton from '../VolverALaWebButton'

export default async function EntregasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('historias_clientes')
    .select('items')
    .eq('id', 1)
    .maybeSingle()

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-lg font-semibold text-white">Entregas</h1>
        <VolverALaWebButton />
      </div>
      <p className="text-white/50 text-sm mt-1">
        Estas fotos son las que se muestran en la sección "Entregas reales" de la página
        principal, con formato de historia de Instagram.
      </p>

      <div className="mt-6">
        <HistoriasManager initialItems={data?.items || []} />
      </div>
    </div>
  )
}