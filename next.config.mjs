/** @type {import('next').NextConfig} */
const nextConfig = {
    // Permite acceder al servidor de desarrollo desde otros dispositivos
    // de la misma red y desde ngrok.
    allowedDevOrigins: [
        '26.27.101.63',
        'grill-unfailing-darkened.ngrok-free.dev',
        '192.168.1.38',
    ],

    // El límite por defecto para los Server Actions es 1MB. Lo subimos acá
    // porque /panel/historias sube varias fotos/videos juntos en un mismo
    // envío (puede superar varios MB fácil).
    //
    // OJO: esto solo no alcanza. Desde Next.js 16, además del límite de
    // Server Actions, hay un límite APARTE (10MB por defecto) para el
    // buffer interno que arma Next al procesar el request — se llamaba
    // "middlewareClientMaxBodySize" pero está deprecado a favor de
    // "proxyClientMaxBodySize" (no se pueden usar los dos juntos, tira
    // error). Sin subir también este valor, /panel/historias corta el
    // formulario a los 10MB y tira "Unexpected end of form" apenas subís
    // varias fotos o algún video.
    experimental: {
        serverActions: {
            bodySizeLimit: '30mb',
        },
        proxyClientMaxBodySize: '30mb',
    },

    // Dominios externos permitidos para next/image.
    images: {
        // Necesario desde Next.js 16: por defecto next/image bloquea
        // cualquier query string en imágenes locales (las de /public) por
        // seguridad. Esto autoriza específicamente /logo.png a llevar un
        // ?v=N — es lo que usamos para "romper" la caché de imágenes
        // cuando se reemplaza el archivo del logo (ver Navbar/Footer/
        // LoadingScreen, que arman el src como /logo.png?v=2). Al omitir
        // `search`, se permite cualquier valor de ?v= sin tener que tocar
        // este archivo cada vez que se suba una versión nueva.
        localPatterns: [
            {
                pathname: '/logo.png',
            },
        ],

        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'qryvklartdoydfznectp.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'http2.mlstatic.com',
                pathname: '/**',
            },
        ],

        // Desde Next.js 14.2, el optimizador de imágenes manda por defecto
        // el header Content-Disposition: attachment — eso hace que el
        // navegador fuerce la descarga al abrir una imagen directamente
        // (ej. clic derecho > "Abrir imagen en nueva pestaña"). Con
        // 'inline' se muestra la imagen en la pestaña como es esperable.
        contentDispositionType: 'inline',
    },
}

export default nextConfig