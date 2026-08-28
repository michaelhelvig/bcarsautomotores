// TODO: reemplazar por el número de WhatsApp real de BCARS AUTOMOTORES (formato: 549 + código de área sin 0 + número sin 15).
export const WHATSAPP_PHONE = '5491100000000'

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
