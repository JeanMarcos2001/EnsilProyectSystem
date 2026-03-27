---
trigger: always_on
---

# Guía de Mejores Prácticas - Sistema ENSIL

Este documento define directrices, estándares y criterios para el desarrollo del proyecto
**Sistema ENSIL**, una aplicación orientada a la gestión de matrículas, pagos, cartera, caja,
stock, roles, reportes y configuración por sede.

Su finalidad es establecer una base clara, escalable y mantenible, sin imponer una estructura
rígida ni anticipar carpetas o capas que aún no sean necesarias.

## 1. General

- Priorizar claridad, mantenibilidad y consistencia sobre complejidad técnica.
- Diseñar el sistema en función del negocio, no solo de la tecnología.
- Respetar las reglas operativas definidas para ENSIL.
- Permitir crecimiento por funcionalidades sin deteriorar el orden del proyecto.
- Considerar desde el inicio escenarios multi-sede, multi-rol y trazabilidad.
- Usar Supabase como fuente principal de datos, sin API propia en esta etapa.
- No mezclar acceso a datos directamente con la UI.
- La arquitectura debe servir como guía de evolución, no como restricción prematura.

## 2. Principios de Desarrollo

- **Claridad antes que ingenio.**
- **Responsabilidad única** por archivo, función y componente.
- **Alta cohesión y bajo acoplamiento.**
- **Reglas del negocio primero.**
- **Escalabilidad progresiva**, sin sobrearquitectura.
- **Consistencia** en nombres, validaciones, errores y organización.
- **Seguridad y trazabilidad** como parte del diseño, no como añadido posterior.

## 3. Criterio de Arquitectura

Se adopta una arquitectura **orientada al dominio y a funcionalidades del negocio**, cercana a
**Screaming Architecture**.

### Motivo

- ENSIL contiene varios dominios operativos: matrículas, pagos, cartera, caja, stock, reportes, usuarios, sedes.
- Una estructura basada solo en tipos técnicos dispersa la lógica del negocio.
- Una estructura por funcionalidad permite ubicar, mantener y escalar mejor cada parte del sistema.

### Regla de aplicación

- La arquitectura marca dirección, pero no obliga a crear toda la estructura desde el inicio.
- No crear carpetas “por si acaso”.
- Cada carpeta debe responder a una necesidad real.

## 4. Creación de Carpetas

### Crear una carpeta cuando

- agrupe archivos con una responsabilidad clara
- una funcionalidad empiece a crecer
- mejore navegación, mantenimiento o separación de responsabilidades
- exista una frontera clara entre UI, lógica, datos o configuración

### No crear una carpeta cuando

- solo contendrá uno o dos archivos sin proyección
- su propósito no está claro
- se crea solo por seguir una estructura teórica
- añade más ruido que orden

## 5. Organización General

La aplicación debe tender a organizarse por áreas del negocio antes que por tipos técnicos.

### Dominios esperables

- matrículas
- pagos
- cartera
- caja
- stock
- reportes
- usuarios
- roles
- sedes
- promociones
- configuración
- autenticación

### Regla

- Lo que pertenezca claramente a una funcionalidad debe vivir cerca de ella.
- Lo compartido debe moverse a una zona común solo cuando la reutilización sea real.
- No anticipar reutilización inexistente.

## 6. Separación de Responsabilidades

Debe mantenerse una separación clara, aunque la estructura sea progresiva.

- La UI no debe contener reglas críticas del negocio.
- La lógica del negocio no debe depender de componentes visuales.
- Supabase no debe usarse directamente desde páginas o componentes.
- El acceso a datos debe pasar por una capa intermedia clara, aunque sea simple.
- La separación debe aparecer cuando aporte claridad real.

## 7. Supabase y Datos

- Centralizar la configuración del cliente de Supabase.
- Encapsular consultas, mutaciones y operaciones relevantes.
- Estandarizar nombres de queries, filtros y mapeos.
- Evaluar vistas, funciones SQL o RPC para casos complejos o sensibles.
- Aprovechar RLS para proteger datos por rol, sede y operación.
- No confiar solo en validaciones del cliente.

## 8. Modelado de Dominio

Antes de implementar, debe existir claridad sobre entidades, relaciones y reglas.

### Entidades principales esperadas

- Alumno
- Titular
- Matrícula
- Programa
- Nivel
- Promoción
- Plan de pago
- Cuota
- Pago
- Voucher
- Sede
- Usuario
- Rol
- Material
- Entrega de material
- Movimiento de caja
- Reporte

### Regla

- No mezclar indiscriminadamente modelo de dominio, fila de Supabase, payload y modelo de UI.

## 9. Reglas de Negocio

Las reglas relevantes deben estar explícitas y centralizadas.

### Ejemplos

- una matrícula no debe permitir cambios prohibidos según reglas vigentes
- las promociones deben validarse por configuración y elegibilidad
- pagos al contado y cartera pueden tener lógicas distintas
- el stock debe afectarse en el momento correcto
- los traslados deben preservar integridad de matrícula y planes
- los permisos deben condicionar acceso, edición y visualización
- los reportes deben basarse en criterios consistentes y auditables

## 10. Estado y Gestión de Datos

- Diferenciar estado de servidor, formulario y estado local.
- No duplicar información sin necesidad.
- Mantener el estado cerca de la funcionalidad que lo usa.
- Evitar estado global innecesario.
- Mantener criterios consistentes para carga, error, vacío, filtros y paginación.

## 11. Convenciones de Código

- **Código:** inglés.
- **Comentarios y documentación interna:** español, salvo acuerdo distinto del equipo.
- **Componentes:** PascalCase.
- **Funciones y variables:** camelCase.
- **Tipos e interfaces:** PascalCase.
- Usar nombres claros y evitar ambigüedades.
- Los booleanos deben expresar intención real: `isPaid`, `canEdit`, `hasPendingDebt`.

## 12. Clean Code

- Funciones pequeñas y enfocadas.
- Evitar anidaciones innecesarias.
- Usar early returns cuando mejoren legibilidad.
- Evitar duplicación.
- No mezclar validación, render, transformación y persistencia en un mismo bloque.
- Eliminar código muerto, comentarios obsoletos y complejidad innecesaria.

## 13. UI, Formularios y Validaciones

- Separar presentación, interacción y vistas.
- Los componentes compartidos deben ser realmente reutilizables.
- Toda entrada crítica debe validarse antes de persistirse.
- Diferenciar validación visual, de formulario y de negocio.
- Los errores deben ser claros y útiles.
- Las reglas complejas no deben quedar ocultas solo en formularios.

## 14. Errores, Seguridad y Auditoría

- Toda operación asíncrona debe contemplar carga, éxito, error y recuperación cuando aplique.
- No exponer errores técnicos crudos al usuario.
- Diseñar permisos por rol desde el inicio.
- Reforzar acceso con políticas en Supabase.
- Auditar operaciones sensibles como matrículas, pagos, caja, stock, promociones, traslados y permisos.

## 15. Reportes, Testing y Documentación

- Evitar lógica de reportes improvisada en UI.
- Priorizar pruebas sobre reglas críticas del negocio.
- Documentar decisiones arquitectónicas, reglas sensibles y flujos relevantes.
- Mantener la documentación alineada con la evolución del sistema.

## 16. Workflow de Desarrollo

- Trabajar por funcionalidades y entregables claros.
- No mezclar grandes refactors con cambios de negocio si puede evitarse.
- Delimitar alcance antes de implementar.
- Verificar siempre funcionamiento, reglas de negocio, permisos y trazabilidad antes de cerrar una tarea.

## 17. Comportamiento Esperado ante Prompts en IDE

Antes de ejecutar cualquier desarrollo en la IDE, se debe analizar el prompt.

### Regla obligatoria

- No implementar directamente si el requerimiento no está suficientemente claro.

### Debe hacer

- interpretar el objetivo funcional y técnico
- detectar ambigüedades, omisiones, contradicciones o riesgos
- proponer una versión mejor estructurada del prompt antes de ejecutar
- hacer preguntas concretas si falta información importante
- delimitar alcance, impacto y supuestos
- sugerir un enfoque técnico razonable antes de comenzar

### Criterios de revisión

- qué funcionalidad se desea construir o modificar
- qué parte del sistema será afectada
- qué reglas del negocio intervienen
- qué datos entran, cambian y se persisten
- qué roles o permisos participan
- si es creación, edición, refactor o corrección

### No debe hacer

- asumir reglas críticas no definidas
- crear estructuras innecesarias
- introducir complejidad no solicitada
- ejecutar cambios amplios sin delimitar alcance

## 18. Antipatrones a Evitar

- usar Supabase directamente en UI
- crear carpetas por anticipación
- usar nombres genéricos como `helpers`, `misc`, `general`
- duplicar lógica de negocio
- mover cosas a compartido demasiado pronto
- mezclar permisos con render sin criterio
- postergar seguridad para después
- imponer una estructura completa antes de necesitarla

## 19. Conclusión

La arquitectura oficial de **Sistema ENSIL** se define como una guía **orientada al dominio y a las
funcionalidades del negocio**, con separación clara de responsabilidades y crecimiento progresivo.

La estructura no busca mostrar la tecnología utilizada, sino reflejar qué hace el sistema y permitir
que evolucione con orden, claridad y sin sobrearquitectura.

Toda implementación futura deberá respetar esta guía como base de desarrollo.