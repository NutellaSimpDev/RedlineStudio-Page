# Despliegue automático: GitHub → Hostinger

Cada vez que haces `git push` a `main` con cambios en `public_html/`, GitHub sube
la carpeta a Hostinger con lftp, que reintenta solo si Hostinger corta la conexión. El archivo que lo hace es
`.github/workflows/deploy.yml`.

## Antes de la primera vez: haz una copia de lo que hay en Hostinger

La web publicada hoy no es igual a este repositorio (por ejemplo, tiene una
página de Precios que aquí no existe). El primer despliegue sobrescribe los
archivos con el mismo nombre.

1. hPanel → **Sitios web** → redlinestudio.es → **Administrador de archivos**.
2. Selecciona todo dentro de `public_html` → **Comprimir** → descarga el `.zip`.

## Paso 1: datos FTP de Hostinger

hPanel → **Sitios web** → redlinestudio.es → **Archivos** → **Cuentas FTP**.
Anota:

- **Host / IP FTP** (algo como `ftp.redlinestudio.es` o una IP).
- **Usuario FTP** (algo como `u123456789` o `u123456789.redlinestudio.es`).
- **Contraseña**: si no la recuerdas, usa *Cambiar contraseña FTP* ahí mismo.

Comprueba también **a qué carpeta entra esa cuenta**:

- Si al conectar ves directamente `index.html`, `.htaccess`, etc., la carpeta
  es la raíz: no hace falta configurar nada más.
- Si ves una carpeta `public_html`, tendrás que crear la variable del paso 3.

## Paso 2: guarda los datos en GitHub (como secretos)

En GitHub: repositorio **RedlineStudio-Page** → **Settings** → **Secrets and
variables** → **Actions** → pestaña **Secrets** → **New repository secret**.
Crea estos tres:

| Nombre | Valor |
| --- | --- |
| `HOSTINGER_FTP_HOST` | el host FTP |
| `HOSTINGER_FTP_USER` | el usuario FTP |
| `HOSTINGER_FTP_PASSWORD` | la contraseña FTP |

Los secretos van cifrados: nadie los ve, ni siquiera en los registros.

## Paso 3 (solo si viste la carpeta `public_html`)

Misma pantalla → pestaña **Variables** → **New repository variable**:

| Nombre | Valor |
| --- | --- |
| `HOSTINGER_SERVER_DIR` | `public_html/` |

## Paso 4: primer despliegue

GitHub → pestaña **Actions** → **Deploy to Hostinger** → **Run workflow**.
Tarda uno o dos minutos. Si sale en verde, abre https://redlinestudio.es.

Desde ahí, cada `git push` a `main` publica solo.

## Qué no toca

- El subdominio `ajicomoencasa.redlinestudio.es` y cualquier archivo que hayas
  subido a mano: el despliegue sube y reemplaza archivos, nunca borra nada.
- Los archivos fuera de `public_html/` del repositorio (`docs/`, `analytics/`,
  `firma.html`, etc.) nunca se publican.

## Si falla

- **"Login authentication failed"**: usuario o contraseña mal copiados en los
  secretos.
- **"getaddrinfo ENOTFOUND"** o **"Name or service not known"**: el host FTP
  está mal escrito. Debe ir solo la IP o el dominio, sin `ftp://`, sin puerto y
  sin espacios.
- **La web se ve igual que antes**: revisa el paso 3 (carpeta equivocada) y
  borra la caché del navegador.
- **Quieres borrar páginas viejas que ya estaban en el servidor** (como la de
  Precios): bórralas a mano en el Administrador de archivos de Hostinger.
