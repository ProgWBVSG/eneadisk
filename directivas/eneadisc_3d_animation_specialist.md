# Directiva: Especialista en Páginas Animadas 3D y Scroll-Linked Animations

## Objetivo
Definir los estándares, herramientas y mejores prácticas para crear landing pages inmersivas con elementos 3D, videos de fondo y animaciones vinculadas al scroll (scroll-linked animations) en aplicaciones React/Vite.

## Principios Fundamentales
1. **Inmersión sin penalizar el rendimiento:** Los videos o modelos 3D deben estar optimizados (compresión, formatos modernos).
2. **Fallback Elegante:** Siempre debe existir un fondo oscuro (`bg-[#21346e]` o `bg-slate-950`) que se vea bien si el video tarda en cargar.
3. **Control del Scroll:** Para animaciones avanzadas o videos que reaccionan al scroll, se debe interceptar el progreso del scroll usando librerías como `framer-motion` (ej. `useScroll`, `useTransform`).

## Herramientas Preferidas
- **Videos de Fondo (Background Video):** Etiquetas `<video autoPlay loop muted playsInline object-cover>` para compatibilidad móvil.
- **Botones Customizados (SVG Background):** Uso de SVG integrados (`absolute inset-0`) en lugar de `border-radius` tradicionales para lograr formas tipo "tech" o recortadas.
- **Animaciones (Microinteracciones):** Clases de Tailwind (`hover:scale-105 active:scale-95 transition-all duration-300`) para UI. `framer-motion` para secuencias complejas.

## Restricciones y Casos Borde (Trampas Conocidas)
- **Error:** Los videos no se reproducen en móviles iOS (Safari).
  - **Solución:** Es obligatorio que la etiqueta `<video>` incluya el atributo `playsInline` junto a `muted`.
- **Error:** Textos ilegibles sobre el video.
  - **Solución:** Aplicar una capa superpuesta semi-transparente (`bg-black/40` o degradado) entre el video y el texto.
- **Error:** Renderizado de fuentes erróneo.
  - **Solución:** Asegurar que las fuentes personalizadas (ej. Rubik) se pre-carguen en `index.html` e importar el estilo globalmente.
- **Error:** El scroll-linked video puede ser muy pesado si se decodifica en tiempo real.
  - **Solución:** Si el video avanza con el scroll, considerar pre-extraer los frames o comprimirlo con baja tasa de keyframes (all-intra) para facilitar la búsqueda en el reproductor (seeking), o utilizar la librería `@gsap/react` y su plugin `ScrollTrigger`.

## Procedimiento Estándar (SOP)
1. Establecer el contenedor padre como `min-h-screen relative overflow-hidden`.
2. Insertar el recurso audiovisual (video o lottie) con posicionamiento absoluto y `z-index` negativo (`-z-10`).
3. Crear una capa superpuesta (overlay) para asegurar contraste (`z-0`).
4. Insertar el contenido principal alineado según las especificaciones de diseño (ej. centrado o alineado arriba con `pt-32`), con `z-10`.
5. Asegurar consistencia tipográfica (tracking, leading, uppercase) con clases de Tailwind exactas.
