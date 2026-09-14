# Chifle Store

MVP de e-commerce streetwear para Córdoba, Argentina. La tienda ofrece ropa y
zapatillas con envíos a todo el país, cadetería local y retiro en Córdoba Capital.

## Estado

La interfaz y los flujos base están listos para iterar. El catálogo actual usa
productos demo. Mercado Pago, Supabase, Andreani y Resend quedan pendientes de
credenciales para activar las operaciones reales.

## Desarrollo

```bash
npm install
npm run dev
```

Rutas disponibles:

- `/` storefront con catálogo demo, filtros y carrito.
- `/checkout` checkout de entrega preparado para Mercado Pago y Andreani.
- `/admin` panel inicial de administración.

## Calidad

```bash
npm run lint
npm run build
```

El workflow de GitHub ejecuta ambos comandos en cada push a `main` y en cada pull request.

## Integraciones pendientes de credenciales

La primera iteración incluye la experiencia y los puntos de integración. Para activar operaciones reales hay que completar `.env.local` con Supabase, Mercado Pago, Andreani y Resend. Las credenciales no se guardan en el repositorio.

- Mercado Pago: Checkout Pro, una única cuenta del dueño.
- Andreani: cotización real con fallback de configuración manual.
- Cadetería: tarifa y zonas editables desde el panel.
- Retiro local: configuración editable desde el panel.

El catálogo actual usa productos demo para validar el flujo de compra antes de cargar inventario real.

## Publicar en GitHub

```bash
git init
git add .
git commit -m "Initial Chifle Store MVP"
git branch -M main
git remote add origin https://github.com/USUARIO/chifle-store.git
git push -u origin main
```

Antes de publicar, copiá `.env.example` como `.env.local` y completá las credenciales únicamente en tu entorno local o en los secrets del proveedor de deploy.
