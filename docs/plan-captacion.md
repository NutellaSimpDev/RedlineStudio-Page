# Plan de captación de Redline Studio

Objetivo: cerrar proyectos de alto valor (4.900 €+) y sumar clientes de soporte
mensual. Los proyectos dan caja; los planes mensuales dan estabilidad.

## 1. Oferta y precios (publicados en la web)

| Servicio | Desde | Tipo |
| --- | --- | --- |
| Sistema de gestión a medida | 4.900 € | Proyecto |
| Web corporativa que vende | 2.400 € | Proyecto |
| Branding y packaging | 1.800 € | Proyecto |
| Automatización con IA | 1.200 € | Proyecto |
| SEO + Google Ads | 450 €/mes | Mensual |
| Soporte, hosting y mejoras | 190 €/mes | Mensual |

Regla: todo proyecto se vende con un plan mensual de soporte. Diez clientes de
soporte son 1.900 €/mes sin buscar clientes nuevos.

Cuenta rápida para 10.000 € (≈ 40.000 soles): un sistema de gestión
(4.900 €) + una web (2.400 €) + un branding (1.800 €) + cinco meses de
soporte de un cliente. Son tres o cuatro clientes, no cuarenta.

## 2. Canales, del más rápido al más lento

### A. Venta directa (empieza hoy, cuesta 0 €)

Es el canal más rápido. Nada automatizado reemplaza escribirle a una persona.

**Perú (cobro rápido, en soles):** restaurantes de menú con reparto o venta en
la calle. Tienes el caso exacto. Visítalos en persona con el sistema de Ají en
el celular: la demo en vivo vende sola. Precio sugerido: implementación
S/ 3.500–6.000 + S/ 250–400 al mes.

**España (ticket alto, en euros):** pymes de restauración, distribución y
alimentación. LinkedIn + correo.

Meta diaria: 20 contactos nuevos personalizados + seguimiento a los de hace
3 y 7 días.

Mensaje de conexión en LinkedIn (máx. 300 caracteres):

> Hola [Nombre], vi que [empresa] trabaja con [reparto / varias tiendas /
> venta directa]. Hace poco hicimos un sistema para un restaurante con 300
> clientes al día que no registraba casi la mitad de sus ventas. ¿Te puedo
> contar en 2 líneas cómo lo resolvimos?

Seguimiento (si acepta):

> Gracias por aceptar. Resumen: registraban a mano y unos 90–100 platos al día
> salían a la calle sin control. Hoy cada pedido entra en segundos desde el
> celular y la caja cuadra al momento. Si en [empresa] algo se lleva en Excel o
> WhatsApp, en 30 minutos te digo dónde se está yendo el dinero. Sin coste.
> ¿Te va bien el martes o el jueves?

Importante: LinkedIn bloquea cuentas que envían mensajes automáticos. Automatiza
las publicaciones (ya tienes `linkedin_bot.py`), pero los mensajes escríbelos tú.

### B. Google Ads (contactos desde la primera semana)

Configuración común:

- **Ubicación:** España, opción "Presencia: personas que están en la ubicación".
- **Horario:** lunes a viernes, 8:00–20:00.
- **Red:** solo búsqueda. Desactiva Red de Display y socios de búsqueda.
- **Conversión:** importa el evento `generate_lead` de GA4 a Google Ads y
  márcalo como conversión principal (la web ya lo envía al enviar el formulario).
- **Puja:** empieza con "Maximizar clics" con un CPC máximo; cuando tengas 15–30
  conversiones, cambia a "Maximizar conversiones".

**Campaña 1: Software a medida** (10–15 €/día) → landing `/caso-aji-como-en-casa`

Palabras clave (concordancia de frase y exacta):

- "software a medida para empresas"
- "desarrollo de software a medida"
- "programa de gestión a medida"
- "software de gestión a medida"
- "software para restaurantes a medida"
- "aplicación de gestión para pymes"

Títulos (máx. 30 caracteres):

- Software a Medida para Pymes
- Precio Cerrado por Escrito
- Diagnóstico Gratis en 30 Min
- Caso Real: 300 Clientes/Día
- Deja de Perder Dinero
- Pedidos, Caja y Costes
- Desde 4.900 €
- El Código es Tuyo
- Entregas Cada Semana
- Sin Permanencia

Descripciones (máx. 90 caracteres):

- Sistema de gestión a medida: pedidos, caja, costes y reportes. Diagnóstico gratis.
- Precio cerrado por escrito en 48 h. Avances que pruebas desde la primera semana.
- Caso real: restaurante con 300 clientes al día que hoy cuadra cada plato y cada sol.
- Tu equipo lo usa desde el celular. El código y los datos son de tu empresa.

**Campaña 2: Diseño web** (8–10 €/día) → landing `/servicios#web`

Palabras clave:

- "diseño web para empresas"
- "empresa de diseño web"
- "desarrollo web corporativo"
- "página web profesional para empresa"
- "rediseño web empresa"

Títulos:

- Webs que Traen Clientes
- Diseño Web a Medida
- SEO Técnico Incluido
- Desde 2.400 €
- Lista en 3 a 5 Semanas
- Sin Plantillas
- Precio Cerrado por Escrito
- Diagnóstico Gratis

Descripciones:

- Web corporativa rápida, a medida y preparada para Google desde el primer día.
- Textos de venta, formularios conectados y analítica. Presupuesto cerrado en 48 h.

**Palabras negativas (en las dos campañas):** gratis, gratuito, curso, cursos,
tutorial, empleo, trabajo, prácticas, salario, sueldo, plantilla, plantillas,
descargar, wordpress gratis, wix, qué es, definición, pdf, ejemplos, freelance.

**Rutina semanal (15 minutos):**

1. Informe de términos de búsqueda: añade como negativa toda búsqueda que no
   venda.
2. Pausa las palabras con gasto alto y cero contactos tras 2 semanas.
3. Sube presupuesto solo en la campaña que trae contactos a menor coste.

Antes de lanzar, revisa en el Planificador de palabras clave de Google Ads el
coste por clic real de cada palabra en España, y ajusta el presupuesto para
tener al menos 10–15 clics al día por campaña.

### C. SEO (resultados en 3–6 meses, luego gratis)

Ya hecho en la web:

- Títulos y descripciones nuevas orientadas a búsquedas de compra.
- Datos estructurados: empresa, servicios con precio, preguntas frecuentes,
  artículo del caso y migas de pan.
- HTTPS forzado, compresión y caché en `.htaccess`.
- Página del caso de éxito en el sitemap.

Pendiente (en este orden):

1. **Google Search Console:** verifica el dominio y envía `sitemap.xml`.
2. **Google Business Profile** de Redline Studio, con servicios y precios.
3. **Seis artículos de blog** con intención de compra (uno por semana):
   - ¿Cuánto cuesta un software a medida en 2026?
   - Software para restaurantes: genérico o a medida
   - Cómo controlar la venta en la calle de un restaurante
   - ¿Cuánto cuesta una página web para empresas en España?
   - Cómo calcular el coste real de un plato
   - 7 tareas de tu negocio que puedes automatizar con IA
4. Reescribir los tres artículos actuales del blog (SEO B2B, leads, web
   corporativa) con el tono nuevo, o redirigirlos a los nuevos.
5. Traducir la web nueva al inglés y al alemán (hoy esas versiones siguen con
   los textos antiguos).

## 3. Lo que se automatiza

| Tarea | Cómo |
| --- | --- |
| Publicar la web | GitHub Actions → Hostinger en cada push (ver `despliegue-hostinger.md`) |
| Publicaciones en LinkedIn | `linkedin_bot.py` con `posts.json` |
| Informe semanal de tráfico | `node scripts/weekly-traffic-report.mjs analytics/weekly-traffic.csv` |
| Aviso de nuevo contacto | `send-lead.php` envía cada formulario a contacto@redlinestudio.es |
| Medición de conversiones | GA4 `generate_lead` → Google Ads |

Lo que no se automatiza: hablar con clientes. Responde cada contacto en menos
de una hora en horario laboral; es lo que más sube el cierre.
