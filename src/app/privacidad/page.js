export const metadata = { title: "Política de Privacidad — BellaOS" };

const S = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#2E2270", lineHeight: 1.7 },
  h1: { fontSize: 28, marginBottom: 8 },
  h2: { fontSize: 20, marginTop: 32, marginBottom: 8 },
  muted: { color: "#6b6b8a", fontSize: 14 },
};

export default function Privacidad() {
  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Política de Privacidad</h1>
      <p style={S.muted}>BellaOS — un producto de ConectaIA Pro. Última actualización: julio 2026.</p>

      <h2 style={S.h2}>Quiénes somos</h2>
      <p>
        BellaOS es una plataforma de automatización con inteligencia artificial para negocios de estética,
        peluquería y bienestar, operada por ConectaIA Pro (contacto: info@conectaiapro.com).
      </p>

      <h2 style={S.h2}>Qué datos tratamos</h2>
      <p>
        Tratamos los datos que los negocios que usan BellaOS cargan o reciben en la plataforma: nombre y
        teléfono de sus clientas, mensajes intercambiados por canales como WhatsApp, turnos agendados y
        preferencias de contacto. Estos datos se usan exclusivamente para prestar el servicio: responder
        consultas, agendar turnos, enviar recordatorios y campañas autorizadas por el negocio.
      </p>

      <h2 style={S.h2}>WhatsApp y Meta</h2>
      <p>
        BellaOS utiliza la API de WhatsApp Business (Meta) para enviar y recibir mensajes en nombre de los
        negocios. Los mensajes se procesan para generar respuestas automáticas y se almacenan de forma segura
        para que el negocio pueda ver sus conversaciones. No vendemos ni compartimos estos datos con terceros
        ajenos a la prestación del servicio.
      </p>

      <h2 style={S.h2}>Almacenamiento y seguridad</h2>
      <p>
        Los datos se almacenan en bases de datos con acceso restringido por negocio (aislamiento por tenant) y
        se transmiten cifrados. Solo el personal autorizado y el negocio dueño de los datos pueden acceder a ellos.
      </p>

      <h2 style={S.h2}>Tus derechos</h2>
      <p>
        Podés solicitar el acceso, la corrección o la eliminación de tus datos personales escribiendo a
        info@conectaiapro.com, o pidiéndoselo directamente al negocio con el que te comunicás. También podés
        pedir dejar de recibir mensajes (opt-out) respondiendo a cualquier mensaje del negocio.
      </p>

      <h2 style={S.h2} id="eliminacion-de-datos">Eliminación de datos</h2>
      <p>
        Para solicitar la eliminación completa de tus datos, escribí a info@conectaiapro.com indicando tu número
        de teléfono y el negocio con el que interactuaste. Procesamos las solicitudes dentro de los 30 días.
      </p>

      <h2 style={S.h2}>Contacto</h2>
      <p>ConectaIA Pro — info@conectaiapro.com</p>
    </main>
  );
}
