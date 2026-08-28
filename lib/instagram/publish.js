// Publica automáticamente en el feed de Instagram cuando entra un vehículo
// NUEVO sincronizado desde Mercado Libre: arma un carrusel con las fotos +
// una descripción personalizada con las specs del auto.
//
// Requiere (ver .env.local.example):
//   - INSTAGRAM_BUSINESS_ACCOUNT_ID   ID de la cuenta profesional de IG
//   - META_PAGE_ACCESS_TOKEN          Token de acceso de la Página de FB
//                                     vinculada a esa cuenta de Instagram
//
// Requisitos del lado de Meta (esto no lo resuelve el código, hay que
// configurarlo una vez en developers.facebook.com):
//   1. La cuenta de Instagram tiene que ser Business o Creator, vinculada
//      a una Página de Facebook.
//   2. Una app de Meta con el producto "Instagram Graph API" agregado.
//   3. El permiso "instagram_business_content_publish" (antes
//      instagram_content_publish) aprobado por Meta App Review para poder
//      publicar en cuentas reales (no solo en usuarios de test) — este
//      review lo hace Meta manualmente y puede tardar semanas, es un paso
//      obligatorio y no depende de este código.

import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateCoverImageBuffer, generatePlainPhotoBuffer } from './coverImage'

const GRAPH_VERSION = 'v25.0'
const GRAPH_API = `https://graph.facebook.com/${GRAPH_VERSION}`

// Bucket donde ya se guardan las fotos de los vehículos (creado a mano en
// Supabase, con GRANTs explícitos). La portada generada para Instagram se
// guarda ahí adentro, en una subcarpeta aparte, para no tener que crear ni
// configurar permisos de un bucket nuevo.
const COVER_BUCKET = 'vehiculos-fotos'

// Genera la portada con diseño (foto + degradé + marca/modelo/specs) y la
// sube a Storage para tener una URL pública que la Graph API pueda leer.
async function uploadProcessedImage(vehicle, buffer, folder) {
    const path = `${folder}/${vehicle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`

    const { error } = await supabaseAdmin.storage.from(COVER_BUCKET).upload(path, buffer, {
        contentType: 'image/png',
        upsert: false,
    })

    if (error) {
        throw new Error(`No se pudo subir una imagen procesada para Instagram: ${error.message}`)
    }

    const { data } = supabaseAdmin.storage.from(COVER_BUCKET).getPublicUrl(path)
    return data.publicUrl
}

// Instagram no permite links clickeables en la descripción del post, por
// eso el caption invita a escribir por WhatsApp / mirar el link en la bio
// en vez de poner una URL que no va a funcionar como link.

// El texto "en negrita" que usa este caption no es negrita de verdad (acá
// no hay formato de texto real posible, Instagram no lo soporta) — son
// caracteres Unicode del bloque "Mathematical Sans-Serif Bold" que
// VISUALMENTE se ven en negrita en cualquier lado. Esta función convierte
// letras y números comunes (A-Z, a-z, 0-9) a esos caracteres especiales.
// Todo lo demás (espacios, tildes sueltas, signos de puntuación, emojis)
// queda igual. Con letras acentuadas (ej. "Año", "Transmisión") primero
// hay que separar la letra de su tilde (normalize NFD) porque ese bloque
// Unicode no tiene "ñ" ni "ó" ya armadas, solo letras sueltas — así que
// se pone en negrita la letra base y la tilde se deja pegada al lado tal
// cual, que es justo como se ve en el diseño que pediste.
function toBoldSansSerif(text) {
    const boldChar = (ch) => {
        const code = ch.charCodeAt(0)
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + (code - 65)) // A-Z
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + (code - 97)) // a-z
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + (code - 48)) // 0-9
        return ch
    }

    return Array.from(String(text).normalize('NFD')).map(boldChar).join('')
}

// Número de WhatsApp de la concesionaria, para el caption. Si cambia, se
// edita solo acá.
const WHATSAPP_NUMBER = '11 2384-9915'
const WEBSITE_URL = 'https://www.bcarsautomotores.com'

// Instagram corta un hashtag en el primer carácter que no sea letra o
// número (espacios, puntos, guiones, etc.), así que hay que sacar TODO
// lo que no sea alfanumérico antes de armar el tag. Ej: "Kwid 1.0 SCe" no
// puede quedar como "kwid1.0sce" (se corta en el punto) sino "kwid10sce".
function toHashtag(text) {
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // saca tildes/diacríticos
        .replace(/[^a-z0-9]/g, '') // saca espacios, puntos, guiones, etc.
}

function buildCaption(vehicle) {
    const { marca, modelo, anio, km, tipo, combustible, transmision } = vehicle

    // Mismo criterio que en la portada (coverImage.js): del campo
    // "modelo" completo, la primera palabra es el nombre del modelo (va
    // en mayúsculas, ej. "SANDERO") y el resto es la versión, tal cual
    // viene cargada (ej. "Stepway Intens CVT").
    const modeloWords = String(modelo || '').trim().split(/\s+/).filter(Boolean)
    const modeloPrincipal = modeloWords[0] || ''
    const version = modeloWords.slice(1).join(' ')

    const isZeroKm = Number(km) === 0 || String(tipo).toLowerCase() === '0km'
    const kmLine = isZeroKm ? '0 Kms' : `${Number(km).toLocaleString('es-AR')} Kms`

    const hashtags = [
        '#bcarsautomotores',
        '#autos',
        '#autousado',
        `#${toHashtag(marca)}`,
        `#${toHashtag(modelo)}`,
        '#autosusados',
        '#autosargentina',
        '#concesionaria',
    ].join(' ')

    const lineas = [
        `${toBoldSansSerif('VENTA')} ${String(marca).toUpperCase()} ${modeloPrincipal.toUpperCase()}${version ? ` ${version}` : ''}`,
        `${toBoldSansSerif('Año')}: ${anio}`,
        `${toBoldSansSerif('Kms')}: ${kmLine}`,
        combustible ? `${toBoldSansSerif('Combustible')}: ${combustible}` : null,
        transmision ? `${toBoldSansSerif('Transmisión')}: ${transmision}` : null,
        '',
        `${toBoldSansSerif('DETALLES Y PRECIO POR WHATSAPP')} 📲 ${WHATSAPP_NUMBER}`,
        '',
        'FINANCIACIÓN & PERMUTA . Más de 100 vehículos en stock 💻',
        `Visitanos en 🌐 ${WEBSITE_URL}`,
        '',
        hashtags,
    ].filter((linea) => linea !== null)

    return lineas.join('\n')
}

async function graphRequest(path, { method = 'GET', params = {} } = {}) {
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN

    if (!accessToken) {
        throw new Error(
            'Falta configurar META_PAGE_ACCESS_TOKEN en las variables de entorno.',
        )
    }

    const url = new URL(`${GRAPH_API}${path}`)

    const body = new URLSearchParams({
        ...params,
        access_token: accessToken,
    })

    const response = await fetch(
        method === 'GET' ? `${url}?${body}` : url,
        method === 'GET'
            ? { cache: 'no-store' }
            : { method, body, cache: 'no-store' },
    )

    const data = await response.json()

    if (!response.ok || data.error) {
        console.error('[Instagram API Error]', path, data.error || data)

        throw new Error(
            data.error?.error_user_msg ||
            data.error?.message ||
            `Error consultando ${path} en la API de Instagram`,
        )
    }

    return data
}

// Crea un contenedor de imagen individual. Con is_carousel_item lo arma
// como "hijo" de un futuro carrusel; sin ese flag, es directamente el
// contenedor final para un post de una sola foto.
async function createImageContainer(igUserId, imageUrl, { asCarouselItem, caption } = {}) {
    return graphRequest(`/${igUserId}/media`, {
        method: 'POST',
        params: {
            image_url: imageUrl,
            ...(asCarouselItem ? { is_carousel_item: 'true' } : {}),
            ...(caption ? { caption } : {}),
        },
    })
}

async function createCarouselContainer(igUserId, childrenIds, caption) {
    return graphRequest(`/${igUserId}/media`, {
        method: 'POST',
        params: {
            media_type: 'CAROUSEL',
            children: childrenIds.join(','),
            caption,
        },
    })
}

// Los contenedores se procesan de forma asíncrona del lado de Meta (más
// que nada los de carrusel). Publicar antes de que estén en FINISHED tira
// error, así que hay que sondear el status_code un rato antes de publicar.
async function waitUntilContainerReady(containerId, { timeoutMs = 60_000, intervalMs = 2_000 } = {}) {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
        const { status_code: status } = await graphRequest(`/${containerId}`, {
            params: { fields: 'status_code' },
        })

        if (status === 'FINISHED') return

        if (status === 'ERROR' || status === 'EXPIRED') {
            throw new Error(
                `El contenedor de Instagram ${containerId} terminó en estado ${status}.`,
            )
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(
        `El contenedor de Instagram ${containerId} no llegó a FINISHED a tiempo.`,
    )
}

async function publishContainer(igUserId, creationId) {
    return graphRequest(`/${igUserId}/media_publish`, {
        method: 'POST',
        params: { creation_id: creationId },
    })
}

async function getPermalink(mediaId) {
    const { permalink } = await graphRequest(`/${mediaId}`, {
        params: { fields: 'permalink' },
    })

    return permalink || null
}

// Instagram acepta como máximo 10 imágenes por carrusel.
const MAX_CAROUSEL_ITEMS = 10

// Publica un vehículo en el feed de Instagram: 1 foto -> post simple,
// 2 o más -> carrusel (recortado a 10 si trae más). Devuelve
// { mediaId, permalink }.
export async function publishVehicleToInstagram(vehicle) {
    const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!igUserId) {
        throw new Error(
            'Falta configurar INSTAGRAM_BUSINESS_ACCOUNT_ID en las variables de entorno.',
        )
    }

    const fotosReales = (vehicle.imagenes || []).slice(0, MAX_CAROUSEL_ITEMS)

    if (fotosReales.length === 0) {
        throw new Error('El vehículo no tiene fotos, no se puede publicar en Instagram.')
    }

    // Todas las fotos del carrusel se recortan acá mismo, al mismo tamaño
    // exacto (1080x810) — así no queda librado a cómo Instagram decida
    // encajar cada una (ahí es donde aparecían las franjas negras o el
    // zoom de más).
    //
    // Se procesan de a una (no con Promise.all) porque generarlas todas en
    // simultáneo hacía fallar la carga de alguna foto puntual sin tirar
    // error — el resultado era una imagen sólo con el fondo negro, sin la
    // foto encima, que se subía igual porque técnicamente "no explotó".
    // Por eso también se descarta cualquier resultado sospechosamente
    // liviano (una imagen en negro pesa mucho menos que una con una foto
    // real) y en ese caso se usa la URL original de la foto en su lugar.
    const MIN_BYTES_FOTO_VALIDA = 40_000

    const fotosNormalizadas = []
    for (const url of fotosReales) {
        try {
            const buffer = await generatePlainPhotoBuffer(url)

            if (buffer.length < MIN_BYTES_FOTO_VALIDA) {
                console.error(
                    `[Instagram] Una foto salió sospechosamente liviana (${buffer.length} bytes), probablemente no se pudo traer la imagen original — se publica sin recortar:`,
                    url,
                )
                fotosNormalizadas.push(url)
                continue
            }

            fotosNormalizadas.push(await uploadProcessedImage(vehicle, buffer, 'carousel'))
        } catch (err) {
            console.error('[Instagram] No se pudo normalizar una foto, se publica sin recortar:', err)
            fotosNormalizadas.push(url)
        }
    }

    // La portada con diseño va primero en el carrusel; si por lo que sea
    // no se puede generar o subir (falla al traer una fuente, etc.), se
    // publica igual con las fotos reales del auto en vez de cortar toda
    // la publicación — mismo criterio que el resto de este flujo.
    //
    // OJO: antes, este catch solo dejaba un console.error y seguía. El
    // problema es que como el resto de la publicación sí funcionaba (se
    // subían las fotos normales igual), la fila en Supabase terminaba
    // con instagram_publish_error = null (éxito), y no quedaba ningún
    // rastro de que la portada había fallado — solo se veía en los logs
    // de Vercel, que no todos revisan. Ahora se guarda el motivo en
    // `coverError` para que quien llama a esta función pueda persistirlo
    // en la fila del vehículo y verlo directamente en Supabase.
    let images = fotosNormalizadas
    let coverError = null
    try {
        const coverBuffer = await generateCoverImageBuffer(vehicle)
        const coverUrl = await uploadProcessedImage(vehicle, coverBuffer, 'covers')
        images = [coverUrl, ...fotosNormalizadas].slice(0, MAX_CAROUSEL_ITEMS)
    } catch (err) {
        coverError = err instanceof Error ? err.message : 'Error desconocido generando la portada'
        console.error('[Instagram] No se pudo generar la portada con diseño, se publica sin ella:', err)
    }

    const caption = buildCaption(vehicle)

    let creationId

    if (images.length === 1) {
        const container = await createImageContainer(igUserId, images[0], { caption })
        creationId = container.id
    } else {
        const children = []

        for (const imageUrl of images) {
            const child = await createImageContainer(igUserId, imageUrl, {
                asCarouselItem: true,
            })
            children.push(child.id)
        }

        const carouselContainer = await createCarouselContainer(igUserId, children, caption)
        creationId = carouselContainer.id
    }

    await waitUntilContainerReady(creationId)

    const { id: mediaId } = await publishContainer(igUserId, creationId)
    const permalink = await getPermalink(mediaId)

    return { mediaId, permalink, coverError }
}