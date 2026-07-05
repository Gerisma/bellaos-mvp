export const metadata = { title: "Términos del Servicio — BellaOS" };

const S = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#2E2270", lineHeight: 1.7 },
  h1: { fontSize: 28, marginBottom: 8 },
  h2: { fontSize: 20, marginTop: 32, marginBottom: 8 },
  muted: { color: "#6b6b8a", fontSize: 14 },
};

export default function Terminos() {
  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Términos del Servicio</h1>
      <p style={S.muted}>BellaOS — un producto de ConectaIA Pro. Última actualización: julio 2026.</p>

      <h2 style={S.h2}>Aceptación de los términos</h2>
      <p>
        Al usar BellaOS aceptás estos Términos del Servicio. BellaOS es una plataforma de automatización con
        inteligencia artificial para negocios de estética, peluquería y bienestar, operada por ConectaIA Pro
        (contacto: info@conectaiapro.com). Si no estás de acuerdo con estos términos, no utilices el servicio.
      </p>

      <h2 style={S.h2}>Descripción del servicio</h2>
      <p>
        BellaOS permite a los negocios responder consultas, agendar turnos, enviar recordatorios y ejecutar
        campañas de reactivación a través de canales como WhatsApp, utilizando respuestas automáticas generadas
        con inteligencia artificial. El servicio se presta en modalidad multi-negocio: cada negocio administra su
        propia voz, sus datos y sus clientas de forma aislada.
      </p>

      <h2 style={S.h2}>Uso de WhatsApp y Meta</h2>
      <p>
        BellaOS utiliza la API de WhatsApp Business (Meta) para enviar y recibir mensajes en nombre de los
        negocios. Cada negocio es responsable de cumplir las políticas de WhatsApp y de Meta, de obtener el
        consentimiento de sus clientas para recibir mensajes, y de respetar las solicitudes de baja (opt-out).
        BellaOS no se responsabiliza por el uso indebido de los canales por parte del negocio.
      </p>

      <h2 style={S.h2}>Responsabilidades del negocio</h2>
      <p>
        El negocio que usa BellaOS es responsable de la veracidad de la información que carga (servicios, precios,
        horarios), del contenido de las campañas que envía, y del cumplimiento de la normativa aplicable en su
        jurisdicción, incluida la protección de datos personales de sus clientas.
      </p>

      <h2 style={S.h2}>Pagos y planes</h2>
      <p>
        Algunos planes incluyen un paquete de mensajes de campaña; el excedente puede facturarse por separado
        según las condiciones informadas al contratar. Los precios y límites vigentes se comunican dentro de la
        plataforma. La falta de pago puede derivar en la suspensión del servicio.
      </p>

      <h2 style={S.h2}>Limitación de responsabilidad</h2>
      <p>
        El servicio se presta "tal cual". BellaOS procura la máxima disponibilidad y precisión de las respuestas
        automáticas, pero no garantiza que estén libres de errores ni que los canales de terceros (como WhatsApp)
        estén siempre disponibles. En la medida permitida por la ley, ConectaIA Pro no será responsable por daños
        indirectos derivados del uso del servicio.
      </p>

      <h2 style={S.h2}>Privacidad</h2>
      <p>
        El tratamiento de datos personales se rige por nuestra <a href="/privacidad" style={{ color: "#6D4AFF" }}>Política de Privacidad</a>,
        que forma parte de estos términos.
      </p>

      <h2 style={S.h2}>Cambios y contacto</h2>
      <p>
        Podemos actualizar estos términos; los cambios relevantes se comunicarán dentro de la plataforma. Para
        consultas escribí a info@conectaiapro.com.
      </p>

      <h2 style={S.h2}>Contacto</h2>
      <p>ConectaIA Pro — info@conectaiapro.com</p>
    </main>
  );
}
