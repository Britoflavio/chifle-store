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
- `/login` acceso con Google para clientes y administración.
- `/perfil` datos personales y dirección principal persistidos.
- `/admin/envios` configuración de modalidades y tarifas de envío.

## Calidad

```bash
npm run lint
npm run build
```

El workflow de GitHub ejecuta ambos comandos en cada push a `main` y en cada pull request.

## Supabase y Google Login

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/migrations/20260915000000_auth_and_admin.sql` en el SQL Editor.
3. Ejecutar `supabase/migrations/20260915010000_profiles_and_addresses.sql` en el SQL Editor.
4. Activar Google en `Authentication > Providers > Google`.
5. Configurar en Google Cloud las URLs de callback de Supabase que muestra el dashboard.
6. Completar `.env.local` con las variables de Supabase.

El email `nachomartinez49@gmail.com` queda en la allowlist de administradores. La cuenta se crea automáticamente como admin cuando ese email inicia sesión por primera vez con Google. Los demás usuarios ingresan como `customer`.

El panel verifica sesión y rol en el servidor. Ocultar el enlace no se usa como mecanismo de seguridad.

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
