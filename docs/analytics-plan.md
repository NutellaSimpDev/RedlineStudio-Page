# Plan semanal de tráfico web

Objetivo: medir visitas reales y estimar visitas futuras sin herramientas pagadas.

## Stack gratuito

- Google Analytics 4: sesiones, usuarios, páginas y eventos.
- Google Tag Manager: instalación y administración de eventos sin tocar el HTML cada vez.
- Google Search Console: clics orgánicos, impresiones, CTR, posición media y consultas.
- Microsoft Clarity: mapas de calor y grabaciones para detectar fricción visual.

## Eventos recomendados

- `cta_contact_click`: clics en CTAs hacia contacto.
- `service_detail_click`: clics desde home hacia cada servicio.
- `form_start`: primer foco en el formulario.
- `generate_lead`: envío del formulario.
- `mailto_click`: clic en correo.
- `social_click`: clic en redes sociales.
- `scroll_75`: usuario llega al 75% de la página.

## CSV semanal

Exporta o completa `analytics/weekly-traffic.csv` cada lunes con:

```csv
week_start,users,sessions,views,organic_clicks,impressions,ctr,avg_position,leads,form_start,cta_clicks,social_clicks,top_source,notes
2026-06-01,120,150,310,40,900,4.44,21.3,4,12,28,8,organic,Semana base
```

## Comando de reporte

```bash
node scripts/weekly-traffic-report.mjs analytics/weekly-traffic.csv
```

El script calcula variación semanal, conversión, tasa de inicio de formulario, forecast de la próxima semana y rango estimado.
