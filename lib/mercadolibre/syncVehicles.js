import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { refreshAccessToken } from './auth'
import { publishVehicleToInstagram } from '@/lib/instagram/publish'

const API = 'https://api.mercadolibre.com'

function attribute(item, id) {
    const value = item.attributes?.find((attr) => attr.id === id)

    return value?.value_name || value?.value_id || null
}

function numberFrom(value) {
    if (value === null || value === undefined) return null

    const match = String(value)
        .replace(/\./g, '')
        .match(/\d+/)

    return match ? Number(match[0]) : null
}

function mapDisponibilidad(item) {
    // ML no pone un ítem recién publicado en "active" al instante: primero
    // pasa unos minutos en "under_review" (revisión de calidad) y recién
    // después pasa a "active". Antes acá se marcaba como "Vendido" a todo lo
    // que no fuera "active", lo que ocultaba del sitio a los autos recién
    // publicados hasta que alguien sincronizara a mano (para ese momento ya
    // habían pasado a "active"). Ahora solo se oculta cuando el ítem está
    // realmente cerrado/pausado/vencido — "under_review" se sigue mostrando.
    const HIDDEN_STATUSES = ['closed', 'inactive', 'paused', 'payment_required']

    return HIDDEN_STATUSES.includes(item.status) ? 'Vendido' : 'Disponible'
}

function mapCondition(condition) {
    return condition === 'new' ? '0KM' : 'Usado'
}

function mapTransmission(item) {
    const value =
        attribute(item, 'TRANSMISSION') ||
        attribute(item, 'TRANSMISSION_CONTROL_TYPE') ||
        ''

    const normalized = String(value).toLowerCase()

    if (normalized.includes('auto')) return 'Automática'

    if (normalized.includes('manual')) return 'Manual'

    return value || null
}

function mapPrice(item) {
    const price = Number(item.price || 0)
    const currency = item.currency_id || ''

    return `${currency} ${new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: 0,
    }).format(price)}`
}

function getHighQualityImage(picture) {
    if (!picture) return null

    const originalUrl =
        picture.secure_url || picture.url

    if (!originalUrl) return null

    return originalUrl.replace(
        /-[A-Z](\.(jpg|jpeg|webp|png))$/i,
        '-F$1',
    )
}

function itemToVehicle(item) {
    const marca =
        attribute(item, 'BRAND') ||
        item.title?.split(' ')[0] ||
        'Sin marca'

    const model =
        attribute(item, 'MODEL') ||
        item.title ||
        'Sin modelo'

    const trim = attribute(item, 'TRIM')

    const modelo =
        trim && !model.includes(trim)
            ? `${model} ${trim}`
            : model

    return {
        meli_item_id: item.id,

        meli_permalink: item.permalink || null,

        marca,

        modelo,

        anio:
            numberFrom(attribute(item, 'VEHICLE_YEAR')) ||
            new Date().getFullYear(),

        km:
            numberFrom(attribute(item, 'KILOMETERS')) ||
            0,

        precio: mapPrice(item),

        tipo: mapCondition(item.condition),

        combustible:
            attribute(item, 'FUEL_TYPE') || null,

        transmision: mapTransmission(item),

        color:
            attribute(item, 'COLOR') || null,

        disponibilidad: mapDisponibilidad(item),

        destacado: false,

        imagenes: (item.pictures || [])
            .map((picture) => getHighQualityImage(picture))
            .filter(Boolean),
    }
}

async function getStoredToken() {
    const { data, error } = await supabaseAdmin
        .from('mercadolibre_tokens')
        .select('*')
        .order('updated_at', {
            ascending: false,
        })
        .limit(1)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    if (!data) {
        throw new Error(
            'Todavía no autorizaste una cuenta de Mercado Libre.',
        )
    }

    return data
}

async function getValidAccessToken() {
    const token = await getStoredToken()

    const expiresAt = new Date(
        token.expires_at,
    ).getTime()

    const shouldRefresh =
        !Number.isFinite(expiresAt) ||
        expiresAt - Date.now() < 5 * 60 * 1000

    if (!shouldRefresh) {
        return {
            accessToken: token.access_token,
            userId: token.user_id,
        }
    }

    const refreshed = await refreshAccessToken(
        token.refresh_token,
    )

    const expiresAtIso = new Date(
        Date.now() +
        refreshed.expires_in * 1000,
    ).toISOString()

    const { error } = await supabaseAdmin
        .from('mercadolibre_tokens')
        .update({
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token,
            expires_at: expiresAtIso,
            updated_at: new Date().toISOString(),
        })
        .eq('id', token.id)

    if (error) {
        throw new Error(error.message)
    }

    return {
        accessToken: refreshed.access_token,
        userId: token.user_id,
    }
}

async function meliFetch(path, accessToken) {
    const response = await fetch(
        `${API}${path}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    )

    const data = await response.json()

    if (!response.ok) {
        console.error(
            '[Mercado Libre API Error]',
            path,
            data,
        )

        throw new Error(
            data.message ||
            `Error consultando ${path}`,
        )
    }

    return data
}

// Publica en Instagram SOLO cuando: (a) el vehículo es nuevo (no existía
// antes en `vehiculos`, o sea es la primera vez que se sincroniza esta
// publicación de ML), (b) sigue disponible, y (c) tiene fotos. Así una
// actualización de precio/km de un auto que ya se había publicado en IG no
// genera un post duplicado.
//
// Un error acá NUNCA debe tirar abajo la sincronización con Mercado Libre
// — por eso todo el bloque va en su propio try/catch y solo deja un log +
// una columna de error en la fila, no relanza la excepción.
async function maybeAutoPublishToInstagram(savedVehicle, { wasNew }) {
    if (!wasNew) return
    if (!savedVehicle) return
    if (savedVehicle.instagram_media_id) return
    if (savedVehicle.disponibilidad !== 'Disponible') return
    if (!savedVehicle.imagenes || savedVehicle.imagenes.length === 0) return

    try {
        console.log(
            `[Instagram] Publicando vehículo nuevo (${savedVehicle.meli_item_id})...`,
        )

        const { mediaId, permalink } = await publishVehicleToInstagram(savedVehicle)

        await supabaseAdmin
            .from('vehiculos')
            .update({
                instagram_media_id: mediaId,
                instagram_permalink: permalink,
                instagram_posted_at: new Date().toISOString(),
                instagram_publish_error: null,
            })
            .eq('id', savedVehicle.id)

        console.log(
            `[Instagram] Publicado OK (${savedVehicle.meli_item_id}) -> ${permalink}`,
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido'

        console.error(
            `[Instagram] Error publicando vehículo (${savedVehicle.meli_item_id}):`,
            error,
        )

        // Se guarda el error en la fila para poder verlo después desde
        // Supabase sin tener que ir a buscar en los logs de Vercel.
        await supabaseAdmin
            .from('vehiculos')
            .update({ instagram_publish_error: message })
            .eq('id', savedVehicle.id)
    }
}

export async function syncMercadoLibreVehicles() {
    const {
        accessToken,
        userId,
    } = await getValidAccessToken()

    const search = await meliFetch(
        `/users/${userId}/items/search?search_type=scan&limit=100`,
        accessToken,
    )

    const itemIds = search.results || []

    const summary = {
        found: itemIds.length,
        createdOrUpdated: 0,
        errors: [],
    }

    console.log(
        `[Mercado Libre] Publicaciones encontradas: ${itemIds.length}`,
    )

    for (const itemId of itemIds) {
        try {
            console.log(
                `[Mercado Libre] Procesando publicación: ${itemId}`,
            )

            const item = await meliFetch(
                `/items/${itemId}`,
                accessToken,
            )

            const vehicle = itemToVehicle(item)

            console.log(
                '[Mercado Libre] Vehículo convertido:',
                JSON.stringify(
                    vehicle,
                    null,
                    2,
                ),
            )

            // Hay que saber si esta publicación ya existía ANTES del upsert:
            // de eso depende si corresponde auto-publicar en Instagram
            // (solo autos nuevos) o no (autos que solo se actualizaron).
            const { data: existing } = await supabaseAdmin
                .from('vehiculos')
                .select('id')
                .eq('meli_item_id', vehicle.meli_item_id)
                .maybeSingle()

            const wasNew = !existing

            const { data, error } = await supabaseAdmin
                .from('vehiculos')
                .upsert(vehicle, {
                    onConflict: 'meli_item_id',
                })
                .select()

            if (error) {
                console.error(
                    '[Supabase] Error guardando vehículo:',
                    error,
                )

                throw new Error(error.message)
            }

            console.log(
                '[Supabase] Vehículo guardado correctamente:',
                data,
            )

            summary.createdOrUpdated += 1

            await maybeAutoPublishToInstagram(data?.[0], { wasNew })
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Error desconocido'

            console.error(
                `[ERROR sincronizando ${itemId}]:`,
                error,
            )

            summary.errors.push({
                itemId,
                message,
            })
        }
    }

    console.log(
        '[Mercado Libre] Resumen de sincronización:',
        summary,
    )

    // El sitio usa cache de Next.js — sin esto, los cambios no se verían en
    // /stock ni en la home hasta que algo más disparara una revalidación
    // (por ejemplo editar un auto a mano desde el panel).
    revalidatePath('/', 'layout')

    return summary
}

// Sincroniza un único item de Mercado Libre (por id, ej: "MLA123456789").
// Pensada para el webhook: hace el trabajo mínimo posible (un solo fetch
// a la API de ML + un upsert) para que la respuesta sea rápida, en vez de
// recorrer todo el catálogo como hace syncMercadoLibreVehicles().
export async function syncSingleVehicle(itemId) {
    const { accessToken } = await getValidAccessToken()

    console.log(`[Mercado Libre] Webhook: sincronizando ${itemId}`)

    const item = await meliFetch(`/items/${itemId}`, accessToken)
    const vehicle = itemToVehicle(item)

    const { data: existing } = await supabaseAdmin
        .from('vehiculos')
        .select('id')
        .eq('meli_item_id', vehicle.meli_item_id)
        .maybeSingle()

    const wasNew = !existing

    const { data, error } = await supabaseAdmin
        .from('vehiculos')
        .upsert(vehicle, { onConflict: 'meli_item_id' })
        .select()

    if (error) {
        console.error('[Supabase] Error guardando vehículo (webhook):', error)
        throw new Error(error.message)
    }

    // El sitio usa cache de Next.js — sin esto, el cambio no se vería hasta
    // que algo más disparara una revalidación.
    revalidatePath('/', 'layout')

    console.log(`[Mercado Libre] Webhook: ${itemId} sincronizado OK`)

    await maybeAutoPublishToInstagram(data?.[0], { wasNew })

    return { itemId, vehicle: data?.[0] || null }
}