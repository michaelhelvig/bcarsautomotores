// Genera, 100% por código (sin archivos de diseño externos), las imágenes
// que se publican en el carrusel de Instagram:
//
//   - generateCoverImageBuffer(vehicle): la portada (1ra foto) con la foto
//     del auto + degradé oscuro + líneas doradas decorativas + marca /
//     modelo / año / versión + specs (km, combustible, transmisión).
//   - generatePlainPhotoBuffer(imageUrl): el resto de las fotos, recortadas
//     EXACTAMENTE al mismo tamaño/relación de aspecto que la portada (sin
//     el texto encima).
//
// Por qué se recortan también las fotos "normales" acá y no se suben tal
// cual: si cada foto tiene una relación de aspecto distinta (fotos de auto
// sacadas con el celular casi nunca miden todas exactamente lo mismo),
// Instagram decide por su cuenta cómo encajarlas — a veces recortando de
// más (se ven "zoomeadas") y a veces agregando franjas negras arriba/abajo
// para no recortar. Generando todas las fotos del carrusel ya en el mismo
// tamaño exacto de acá, no queda nada librado a cómo Instagram decida
// procesarlas: entran todas iguales, sin bordes negros y sin recorte extra.
//
// Usa next/og (Satori + resvg, ya incluido en Next.js) para renderizar
// JSX -> PNG, así no hace falta agregar ninguna librería nueva.

import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import {
  POPPINS_EXTRABOLD_WOFF_BASE64,
  DANCING_SCRIPT_BOLD_WOFF_BASE64,
  LOGO_PNG_BASE64,
} from './embeddedAssets'

const WIDTH = 1080
// Instagram cambió su grilla de perfil a un recorte 3:4 (más alta que
// ancha) desde enero 2025, y para el feed recomienda subir directamente
// en 4:5 (1080x1350) — es el formato que mejor entra tanto en el feed
// como en la miniatura de la grilla, sin franjas negras ni recortes
// agresivos. Antes acá se usaba 4:3 (1080x810, más ANCHO que alto), que
// es la relación inversa a la que Instagram espera hoy: por eso las
// fotos se veían con franjas negras arriba/abajo (achicadas para entrar
// en un marco más alto) y por eso el diseño —pegado abajo del todo—
// casi no se veía en la miniatura recortada.
const HEIGHT = 1350

const GOLD = '#D4AF37'

// Las fuentes y el logo van embebidos en base64 (ver embeddedAssets.js) en
// vez de leerse con fs desde /public: en el entorno serverless de Vercel
// /public no siempre está disponible en el filesystem de la función (se
// sirve aparte, por CDN) — leerlo con fs.readFile funciona en `next dev`
// pero puede fallar en producción sin avisar demasiado, que es lo que
// terminaba haciendo fallar en silencio la generación de la portada.
let poppinsBoldBuffer = null
function getPoppinsBold() {
  if (!poppinsBoldBuffer) poppinsBoldBuffer = Buffer.from(POPPINS_EXTRABOLD_WOFF_BASE64, 'base64')
  return poppinsBoldBuffer
}

let scriptBoldBuffer = null
function getScriptBold() {
  if (!scriptBoldBuffer) scriptBoldBuffer = Buffer.from(DANCING_SCRIPT_BOLD_WOFF_BASE64, 'base64')
  return scriptBoldBuffer
}

const LOGO_DATA_URL = `data:image/png;base64,${LOGO_PNG_BASE64}`

// Trae la foto nosotros mismos (en vez de dejar que next/og la pida "por
// dentro"): así, si falla, tiramos un error de verdad que se puede atajar
// más arriba — antes, cuando fallaba adentro de la librería, no tiraba
// error y terminaba generando una imagen sólo con el fondo negro, sin la
// foto, que se subía igual porque técnicamente "no explotó".
async function fetchImageAsPngBuffer(imageUrl, { retries = 2 } = {}) {
  let lastError

  for (let intento = 0; intento <= retries; intento++) {
    try {
      const response = await fetch(imageUrl, {
        cache: 'no-store',
        // Sin esto, algunos CDNs (Mercado Libre incluido) le devuelven un
        // 403 a pedidos "de servidor a servidor" sin User-Agent de
        // navegador — algo que curiosamente no salta al probar la misma
        // URL a mano desde el navegador, así que puede pasar
        // desapercibido hasta que se corre desde Vercel en producción.
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })

      if (!response.ok) {
        throw new Error(`La foto respondió ${response.status} al traerla: ${imageUrl}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())

      if (buffer.length === 0) {
        throw new Error(`La foto llegó vacía: ${imageUrl}`)
      }

      // Mercado Libre sirve las fotos en formato WEBP, y ahí está la causa
      // real de que la generación de imágenes viniera fallando siempre
      // (portada Y recorte de fotos normales): Satori —el motor que usa
      // next/og para convertir el JSX en imagen— solo sabe leer PNG y JPEG
      // embebidos en un <img>. Con WEBP tira un error interno crítico
      // ("u2 is not iterable") sin ninguna pista de que el formato es el
      // problema. Por eso acá SIEMPRE se re-codifica lo que sea que haya
      // llegado a PNG con sharp antes de dárselo a Satori — así no importa
      // en qué formato venga la foto original (webp, avif, etc.), lo que
      // entra al render siempre es un PNG que sabe leer sin problema.
      return await sharp(buffer).png().toBuffer()
    } catch (err) {
      lastError = err
      if (intento < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (intento + 1)))
      }
    }
  }

  throw lastError
}

async function fetchImageAsDataUrl(imageUrl, opts) {
  const pngBuffer = await fetchImageAsPngBuffer(imageUrl, opts)
  return `data:image/png;base64,${pngBuffer.toString('base64')}`
}

// Íconos simples dibujados a mano (mismo criterio que los del panel), en
// vez de depender de un set de íconos con licencia o de un archivo aparte.
function SpecIcon({ type, size = 26 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' }
  const stroke = { stroke: '#fff', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (type === 'km') {
    return (
      <svg {...common}>
        <path d="M4 15.5a8 8 0 1 1 16 0" {...stroke} />
        <path d="M12 15.5l3.6-4.6" {...stroke} />
        <circle cx="12" cy="15.5" r="1.4" fill="#fff" />
      </svg>
    )
  }

  if (type === 'fuel') {
    return (
      <svg {...common}>
        <path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h4A1.5 1.5 0 0 1 13 6.5V20" {...stroke} />
        <path d="M4.5 20h10" {...stroke} />
        <path d="M13 9.5h1.6a1.4 1.4 0 0 1 1.4 1.4V16a1.5 1.5 0 0 0 3 0v-4.3l-2-2" {...stroke} />
        <path d="M7.5 5V3.5" {...stroke} />
      </svg>
    )
  }

  // transmisión
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="2.6" {...stroke} />
      <path
        d="M12 3.8v2.6M12 17.6v2.6M20.2 12h-2.6M6.4 12H3.8M17.5 6.5l-1.8 1.8M8.3 15.7l-1.8 1.8M17.5 17.5l-1.8-1.8M8.3 8.3 6.5 6.5"
        {...stroke}
      />
    </svg>
  )
}

function kmTexto(vehicle) {
  const isZeroKm = Number(vehicle.km) === 0 || String(vehicle.tipo).toLowerCase() === '0km'
  if (isZeroKm) return '0 KM'
  return `${Number(vehicle.km).toLocaleString('es-AR')} KMS`
}

// Altura de la franja de foto arriba de la portada: un poco más de la
// mitad del canvas. El resto (abajo) es la zona oscura con marca/
// modelo/specs, centrado. (Usada solo por generateCoverImageBuffer, la
// portada — actualmente suspendida en publish.js.)
const IMAGE_HEIGHT = Math.round(HEIGHT * 0.56)

// Ancho máximo al que se normalizan las fotos del carrusel. Instagram
// acepta hasta 1440px de ancho — no tiene sentido subir más pesado que
// eso. withoutEnlargement en el resize de abajo evita agrandar (y
// pixelar) una foto que ya sea más chica que esto.
const MAX_PHOTO_WIDTH = 1440

// Normaliza cualquier foto del vehículo para el carrusel: achicada (nunca
// agrandada) a un ancho razonable para Instagram, sin tocar la relación
// de aspecto original.
//
// Antes esto ponía cada foto sobre un canvas fijo de 1080x1350: primero
// con la propia foto de fondo difuminada + oscurecida rellenando lo que
// sobraba, después con un color sólido en vez del difuminado — pero en
// cualquiera de los dos casos, si la foto no era exactamente 4:5, seguía
// quedando una franja (barra) arriba y/o abajo. Pedido (28/08): CERO
// barras, de ningún color. Por eso ahora no hay canvas ni fondo de
// ningún tipo — se sube directamente la foto, completa, tal cual su
// relación de aspecto, así no hay nada que rellenar ni recortar.
export async function generatePlainPhotoBuffer(imageUrl) {
  const original = await fetchImageAsPngBuffer(imageUrl)

  return sharp(original)
    .resize(MAX_PHOTO_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer()
}

// Devuelve el buffer PNG de la portada ya armada para el vehículo dado.
// vehicle necesita: marca, modelo, anio, km, tipo, combustible,
// transmision, imagenes (usa imagenes[0] como foto de fondo).
export async function generateCoverImageBuffer(vehicle) {
  const fotoPortada = vehicle.imagenes?.[0]
  if (!fotoPortada) {
    throw new Error('El vehículo no tiene fotos, no se puede generar la portada.')
  }

  const fotoPortadaDataUrl = await fetchImageAsDataUrl(fotoPortada)

  const modeloWords = String(vehicle.modelo || '').trim().split(/\s+/).filter(Boolean)
  const modeloPrincipal = modeloWords[0] || ''
  const version = modeloWords.slice(1).join(' ')

  const specs = [
    { type: 'km', label: kmTexto(vehicle) },
    vehicle.combustible ? { type: 'fuel', label: String(vehicle.combustible).toUpperCase() } : null,
    vehicle.transmision ? { type: 'gear', label: String(vehicle.transmision).toUpperCase() } : null,
  ].filter(Boolean)

  const image = new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          position: 'relative',
          backgroundColor: '#141110',
        }}
      >
        {/* Foto del auto: solo ocupa la franja de arriba (poco más de la
            mitad del canvas), no el alto completo — así abajo queda una
            zona oscura sólida y despejada para el texto, en vez de texto
            encima de la propia foto. */}
        <img
          src={fotoPortadaDataUrl}
          width={WIDTH}
          height={IMAGE_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: IMAGE_HEIGHT,
            objectFit: 'cover',
          }}
        />

        {/* Degradé para que la foto se funda suavemente con la zona
            oscura de abajo, en vez de cortar en seco */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: IMAGE_HEIGHT - 260,
            height: 260,
            display: 'flex',
            backgroundImage: 'linear-gradient(to top, #141110 0%, rgba(20,17,16,0) 100%)',
          }}
        />

        {/* Líneas doradas decorativas (aproximación hecha con SVG, no un archivo de diseño) */}
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <circle cx="-140" cy={HEIGHT - 160} r="440" fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="2" />
          <circle cx="20" cy={HEIGHT + 60} r="260" fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth="2" />
          <circle cx={WIDTH + 120} cy={HEIGHT - 300} r="400" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeWidth="2" />
          <path
            d={`M -100 ${HEIGHT - 430} C ${Math.round(WIDTH * 0.28)} ${HEIGHT - 540}, ${Math.round(
              WIDTH * 0.62,
            )} ${HEIGHT - 330}, ${WIDTH + 100} ${HEIGHT - 460}`}
            fill="none"
            stroke={GOLD}
            strokeOpacity="0.4"
            strokeWidth="2"
          />
        </svg>

        {/* Logo, chico y semitransparente arriba de la foto */}
        <img
          src={LOGO_DATA_URL}
          width={100}
          height={34}
          style={{
            position: 'absolute',
            top: 32,
            left: WIDTH / 2 - 50,
            opacity: 0.92,
            objectFit: 'contain',
          }}
        />

        {/* Todo el bloque de texto + specs, centrado, ocupando la zona
            oscura debajo de la foto */}
        <div
          style={{
            position: 'absolute',
            top: IMAGE_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 26,
            paddingBottom: 46,
          }}
        >
          {/* Marca / modelo / año / versión, todo centrado */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Dancing Script',
                fontSize: 96,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {vehicle.marca}
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Poppins',
                fontWeight: 800,
                fontSize: 138,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: -3,
                lineHeight: 1,
                marginTop: -8,
              }}
            >
              {modeloPrincipal}
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Poppins',
                fontWeight: 800,
                fontSize: 50,
                color: GOLD,
                marginTop: 20,
              }}
            >
              {vehicle.anio}
            </div>

            {version && (
              <div
                style={{
                  display: 'flex',
                  marginTop: 26,
                  backgroundColor: GOLD,
                  color: '#161616',
                  fontFamily: 'Poppins',
                  fontWeight: 800,
                  fontSize: 34,
                  padding: '15px 36px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                }}
              >
                {version}
              </div>
            )}
          </div>

          {/* Fila de specs, centrada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {specs.map((spec, i) => (
              <div key={spec.type} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                {i > 0 && (
                  <div style={{ display: 'flex', width: 3, height: 54, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <SpecIcon type={spec.type} size={44} />
                  <div style={{ display: 'flex', fontFamily: 'Poppins', fontWeight: 700, fontSize: 30, color: '#fff' }}>
                    {spec.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Poppins', data: getPoppinsBold(), weight: 800, style: 'normal' },
        { name: 'Dancing Script', data: getScriptBold(), weight: 700, style: 'normal' },
      ],
    },
  )

  return Buffer.from(await image.arrayBuffer())
}