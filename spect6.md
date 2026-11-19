# SPEC-006 — Panel académico y gestión docente en la aplicación móvil

## 1. Contexto y objetivo

Skylearn ya cuenta con una aplicación móvil desarrollada. En esta iteración se desea ampliar exclusivamente la experiencia móvil del **docente**, incorporando un espacio de seguimiento académico que le permita consultar sus cursos asignados, conocer la cantidad de estudiantes inscritos en cada curso, revisar el rendimiento de los estudiantes en los cuestionarios o exámenes asociados a las lecciones, identificar las lecciones y temas que presentan mayores dificultades y priorizar acciones de apoyo.

Desde este mismo módulo, el docente podrá consultar estudiantes por curso, revisar su progreso y programar reuniones para un curso, utilizando el mismo funcionamiento definido en SPEC-004 para las reuniones (fecha, hora, enlace externo y agenda).

El objetivo es brindar información útil para tomar decisiones pedagógicas desde el teléfono, reutilizando la estructura, servicios, autenticación, permisos y datos existentes de Skylearn, sin reconstruir la aplicación ni introducir funcionalidades innecesarias.

## 2. Usuarios / actores

- **Docente:** usuario principal. Consulta sus cursos, estudiantes, métricas de rendimiento, dificultades y programa reuniones.
- **Sistema:** obtiene, organiza y presenta los datos académicos existentes, calcula o consulta métricas y aplica permisos.
- **Administrador:** no es el usuario objetivo de esta funcionalidad móvil. Sus funciones administrativas actuales no deben modificarse.

## 3. Historias de usuario

**H1. Consultar mis cursos**  
Como docente quiero visualizar todos los cursos que tengo asignados para acceder al seguimiento académico de cada uno.

**H2. Conocer la cantidad de alumnos**  
Como docente quiero ver cuántos estudiantes están inscritos en cada curso para conocer su tamaño.

**H3. Consultar rendimiento por lección**  
Como docente quiero ver cuántos estudiantes aprobaron o no aprobaron los cuestionarios/exámenes de cada lección para identificar el nivel de comprensión.

**H4. Identificar temas difíciles**  
Como docente quiero conocer las lecciones o temas con mayor cantidad o proporción de dificultades para reforzar esos contenidos.

**H5. Revisar estudiantes que necesitan apoyo**  
Como docente quiero identificar qué estudiantes presentan dificultades recurrentes o bajo rendimiento para priorizar su seguimiento.

**H6. Consultar a un estudiante**  
Como docente quiero abrir el detalle de un estudiante de un curso para revisar su progreso y resultados de evaluaciones disponibles.

**H7. Priorizar el estudio**  
Como docente quiero visualizar qué cursos, lecciones y estudiantes requieren mayor atención para organizar mis acciones de apoyo.

**H8. Programar una reunión desde móvil**  
Como docente quiero crear una reunión para uno de mis cursos desde la aplicación móvil para coordinar sesiones de apoyo o clases en vivo.

**H9. Consultar reuniones programadas**  
Como docente quiero visualizar las reuniones de mis cursos para revisar fecha, hora, enlace y agenda.

**H10. Acceder rápidamente a los datos**  
Como docente quiero navegar entre cursos, métricas, estudiantes y reuniones de forma sencilla desde mi teléfono.

---

# 4. Requisitos funcionales (criterios de aceptación en EARS)

## RF-01. Acceso exclusivo al módulo docente

CUANDO un usuario autenticado con rol docente ingrese a la aplicación móvil, EL SISTEMA DEBE mostrar las opciones y funcionalidades de seguimiento docente aprobadas para su rol.

SI un usuario que no tenga permisos docentes intenta acceder a estas pantallas o endpoints, ENTONCES EL SISTEMA debe impedir el acceso según el mecanismo de autorización existente.

No se debe modificar el sistema actual de autenticación ni crear roles duplicados.

## RF-02. Vista de cursos del docente

CUANDO el docente acceda al apartado **Mis cursos**, EL SISTEMA DEBE mostrar todos los cursos que tiene asignados según las relaciones existentes.

Cada curso debe mostrar, cuando estos datos estén disponibles:

- Nombre del curso.
- Imagen o identificador visual del curso, reutilizando lo existente.
- Cantidad de estudiantes inscritos.
- Indicador de progreso/rendimiento general del curso, si existe información confiable.
- Acceso al detalle del curso.
- Acceso a reuniones del curso o programación de una reunión.

Los cursos deben mostrarse sin duplicados.

El docente no debe visualizar cursos que no tenga asignados, salvo que sus permisos actuales permitan explícitamente dicha consulta.

## RF-03. Conteo de estudiantes inscritos

CUANDO se muestre un curso, EL SISTEMA DEBE presentar la cantidad de estudiantes inscritos en ese curso, basada en la relación de inscripción existente.

El conteo debe:

- Excluir registros que el sistema actual considere no inscritos, inactivos o anulados, según las reglas existentes.
- Evitar contar dos veces a un mismo estudiante por duplicidad de datos.
- Mantenerse coherente con la lista de estudiantes del curso.
- No generar registros nuevos de inscripción.

Si no hay estudiantes inscritos, se debe mostrar **0 estudiantes**.

## RF-04. Detalle académico de un curso

CUANDO el docente seleccione un curso, EL SISTEMA DEBE abrir una pantalla de detalle que permita consultar, al menos:

- Información básica del curso.
- Cantidad de estudiantes inscritos.
- Resumen de rendimiento disponible.
- Lecciones del curso.
- Resultados de cuestionarios o exámenes asociados a las lecciones.
- Lecciones o temas con mayores dificultades.
- Lista de estudiantes.
- Prioridades de seguimiento.
- Reuniones del curso.
- Acción para programar una reunión.

La pantalla debe organizar la información en secciones claras y utilizables en móvil.

## RF-05. Métricas generales del curso

CUANDO el docente abra el detalle de un curso, EL SISTEMA DEBE mostrar métricas académicas generales calculadas a partir de los datos disponibles.

Métricas sugeridas, siempre que existan datos que permitan calcularlas correctamente:

- Total de estudiantes inscritos.
- Estudiantes que han realizado al menos una evaluación.
- Estudiantes que aún no han realizado evaluaciones.
- Total o porcentaje de aprobados en evaluaciones.
- Total o porcentaje de no aprobados.
- Promedio de resultados, si las calificaciones tienen una escala comparable.
- Lecciones evaluadas.
- Lecciones con mayor dificultad.

Los indicadores deben especificar claramente qué representan y qué población se utilizó en el cálculo.

No se deben mostrar porcentajes sin denominador o con datos insuficientes.

## RF-06. Rendimiento por lección

CUANDO el docente consulte las lecciones de un curso, EL SISTEMA DEBE permitir ver el rendimiento de cada lección que tenga cuestionario, examen u otra evaluación registrada.

Cada lección debe mostrar, cuando existan datos:

- Nombre de la lección.
- Cantidad de estudiantes que realizaron la evaluación.
- Cantidad de estudiantes aprobados.
- Cantidad de estudiantes no aprobados.
- Cantidad de estudiantes pendientes/sin intento.
- Porcentaje de aprobación.
- Promedio de puntuación, si la escala es comparable.
- Indicador visual del nivel de dificultad basado en datos.

Los cálculos deben usar las reglas de aprobación y resultados que ya utiliza el sistema.

No se deben inventar umbrales de aprobación ni alterar la lógica de calificación existente.

## RF-07. Identificación de lecciones con mayores dificultades

EL SISTEMA DEBE ayudar al docente a identificar las lecciones que presentan más dificultades.

Cuando existan datos suficientes, podrá ordenar o destacar las lecciones utilizando indicadores como:

- Menor porcentaje de aprobación.
- Mayor cantidad de estudiantes no aprobados.
- Mayor cantidad de estudiantes que repitieron intentos, si el sistema registra intentos.
- Mayor cantidad de estudiantes sin completar la evaluación.
- Menor puntuación promedio, si es comparable.

El sistema debe diferenciar entre **cantidad** y **porcentaje** de dificultades. Una lección con muchos estudiantes puede tener más estudiantes con problemas debido al tamaño del curso, mientras que otra puede presentar una tasa de dificultad mayor.

La interfaz debe mostrar el criterio utilizado para destacar una lección, por ejemplo: “Mayor porcentaje de no aprobados” o “12 estudiantes no aprobaron”.

No se deben etiquetar temas como problemáticos si no existen suficientes datos.

## RF-08. Temas o preguntas con dificultades

CUANDO el sistema disponga de resultados por pregunta, tema, concepto o agrupación del cuestionario, EL SISTEMA DEBE permitir identificar los contenidos en los que los estudiantes presentan más errores.

La visualización podrá mostrar:

- Tema o concepto asociado.
- Pregunta o agrupación, solo si está permitido mostrarla.
- Cantidad de respuestas incorrectas.
- Porcentaje de respuestas incorrectas.
- Cantidad de estudiantes que respondieron.
- Tendencia o comparación, si hay datos históricos suficientes.

Si las evaluaciones actuales no almacenan resultados por pregunta o tema, la IA de programación debe informar esta limitación en el análisis previo y proponer únicamente los cambios mínimos necesarios.

No debe inventar datos ni afirmar que se puede medir dificultad temática si el sistema solo almacena una nota final.

## RF-09. Lista de estudiantes por curso

CUANDO el docente ingrese a la sección **Estudiantes** de un curso, EL SISTEMA DEBE mostrar los estudiantes inscritos según las relaciones existentes.

Cada fila o tarjeta debe mostrar, cuando esté disponible:

- Nombre del estudiante.
- Identificador o avatar ya utilizado por el sistema.
- Estado de actividad académica.
- Resumen de evaluaciones realizadas.
- Aprobaciones/no aprobaciones.
- Indicador de prioridad de seguimiento, basado en datos existentes.
- Acceso al detalle académico del estudiante.

La lista debe permitir búsqueda por nombre u otro identificador permitido que ya exista.

No debe exponer datos personales que no sean necesarios para el seguimiento académico.

## RF-10. Detalle de rendimiento de un estudiante

CUANDO el docente seleccione un estudiante dentro de un curso, EL SISTEMA DEBE mostrar un detalle académico limitado a la información que el docente está autorizado a consultar.

Debe incluir, cuando existan:

- Nombre del estudiante.
- Curso.
- Lecciones evaluadas.
- Resultados por lección.
- Evaluaciones aprobadas.
- Evaluaciones no aprobadas.
- Evaluaciones pendientes.
- Intentos registrados, si están disponibles.
- Temas con mayores errores, si se registran.
- Progreso general disponible.
- Recomendación de seguimiento basada en los datos.

El sistema debe evitar mostrar información de cursos que el docente no administra, salvo permisos existentes que lo permitan.

## RF-11. Prioridad de seguimiento académico

EL SISTEMA DEBE presentar una sección denominada **Prioridad de seguimiento** o equivalente, que ayude al docente a identificar qué requiere atención.

La prioridad debe basarse en información verificable del sistema, por ejemplo:

- Estudiantes con varias evaluaciones no aprobadas.
- Estudiantes que no han completado evaluaciones importantes.
- Lecciones con bajo porcentaje de aprobación.
- Estudiantes con resultados bajos recurrentes.
- Temas con una elevada proporción de respuestas incorrectas.

La prioridad podrá clasificarse visualmente, por ejemplo:

- Alta: existen señales recurrentes o múltiples de dificultad.
- Media: existen algunas señales de dificultad.
- Baja: el rendimiento disponible no muestra dificultades relevantes.

Los criterios y umbrales deben ser configurables o acordados durante el análisis del sistema. No se deben inventar umbrales definitivos.

La prioridad no debe presentarse como una etiqueta permanente del estudiante ni como una conclusión sobre su capacidad. Debe ser una ayuda para el docente basada en resultados y contexto.

## RF-12. Resumen de prioridades por curso

CUANDO el docente consulte sus cursos, EL SISTEMA DEBE permitir identificar qué cursos requieren mayor atención académica, si existen datos suficientes.

El resumen podrá destacar:

- Curso con mayor cantidad de estudiantes no aprobados.
- Curso con mayor porcentaje de no aprobación.
- Curso con mayor cantidad de evaluaciones pendientes.
- Curso con lecciones de dificultad elevada.

El sistema debe distinguir entre cantidades absolutas y porcentajes para no inducir a conclusiones incorrectas.

## RF-13. Filtros y ordenamiento

EL SISTEMA DEBE permitir, cuando sea útil y compatible con los componentes existentes:

- Filtrar lecciones por rendimiento.
- Ordenar lecciones por porcentaje de aprobación.
- Ordenar por cantidad de no aprobados.
- Consultar estudiantes con evaluaciones pendientes.
- Consultar estudiantes con resultados bajos.
- Buscar estudiantes por nombre.
- Consultar prioridades altas, medias o bajas.

Los filtros deben ser sencillos de utilizar en pantallas móviles.

## RF-14. Programar reunión desde el móvil

CUANDO el docente seleccione **Programar reunión** dentro de un curso, EL SISTEMA DEBE permitir crear una reunión asociada a ese curso, utilizando el funcionamiento definido en SPEC-004.

El formulario debe incluir:

- Curso, preseleccionado cuando se inicia desde el detalle del curso.
- Título.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Enlace de videoconferencia.
- Descripción o agenda de temas.
- Acción Guardar/Programar.

El docente debe poder seleccionar únicamente cursos que tenga permiso para gestionar.

La reunión creada desde móvil debe aparecer en las interfaces web y móviles que consuman la misma fuente de datos, respetando las reglas de visibilidad establecidas en SPEC-004.

No se debe crear un sistema de reuniones diferente para móvil.

## RF-15. Consultar reuniones del curso

CUANDO el docente abra la sección Reuniones de un curso, EL SISTEMA DEBE mostrar las reuniones asociadas a ese curso.

Debe permitir visualizar:

- Título.
- Fecha.
- Horario.
- Enlace.
- Agenda.
- Estado.
- Acciones permitidas de edición o cancelación.

Las reuniones deben distinguirse entre próximas, finalizadas y canceladas.

## RF-16. Editar o cancelar reuniones desde móvil

CUANDO el docente seleccione una reunión que tiene permiso de gestionar, EL SISTEMA DEBE permitir editar sus datos o cancelarla, conforme a las reglas de SPEC-004.

La cancelación debe solicitar confirmación.

No se deben eliminar físicamente las reuniones canceladas como comportamiento predeterminado.

Las modificaciones deben reflejarse en las demás interfaces que consuman la misma información.

## RF-17. Visualización de gráficos

CUANDO existan datos académicos suficientes, EL SISTEMA DEBE presentar gráficos o visualizaciones simples que permitan comprender el rendimiento.

Visualizaciones sugeridas:

- Aprobados vs. no aprobados por lección.
- Porcentaje de aprobación por lección.
- Lecciones ordenadas por dificultad.
- Distribución de resultados por curso.
- Comparación entre cursos asignados al docente, cuando las métricas sean comparables.

Los gráficos deben tener etiquetas legibles, valores accesibles y una alternativa textual.

No se deben agregar gráficos decorativos sin información útil.

## RF-18. Actualización de información

EL SISTEMA DEBE obtener información actualizada de las fuentes existentes cuando el docente refresque los datos o vuelva a ingresar a una pantalla, según la estrategia actual de sincronización.

Si la información no puede actualizarse, debe indicar que se muestran datos no actualizados o presentar un mensaje de error, sin inventar resultados.

## RF-19. Responsive y usabilidad móvil

EL SISTEMA DEBE mantener una experiencia adecuada para teléfonos y tablets.

- Las tarjetas y métricas deben adaptarse a pantallas pequeñas.
- Los gráficos no deben desbordarse.
- Los botones deben tener áreas táctiles adecuadas.
- Los filtros deben ser fáciles de utilizar.
- Las listas extensas deben permitir desplazamiento eficiente.
- Los detalles deben organizarse por secciones o pestañas si la estructura actual lo permite.
- No debe existir desplazamiento horizontal innecesario.
- Los estados de carga, error y ausencia de datos deben ser claros.

## RF-20. Conservación de la aplicación móvil actual

EL SISTEMA DEBE conservar las funcionalidades móviles existentes.

La incorporación de este módulo no debe modificar innecesariamente:

- Autenticación.
- Roles.
- Navegación existente.
- Funciones del estudiante.
- Cursos.
- Evaluaciones.
- Reproducción de clases.
- Funciones que no pertenezcan al seguimiento docente.

Debe integrarse dentro de la estructura actual y utilizar componentes y servicios existentes cuando sea posible.

---

# 5. Requisitos no funcionales

## RNF-01. Rendimiento

- La pantalla de cursos debe cargar sin consultas innecesarias.
- Las métricas deben evitar cálculos excesivos en el dispositivo si el backend ya proporciona datos agregados.
- Las listas grandes deben manejarse de manera eficiente.
- No se deben realizar múltiples solicitudes redundantes por cada tarjeta o estudiante.
- Las gráficas deben renderizarse sin afectar significativamente la navegación.

## RNF-02. Seguridad y autorización

- El módulo es exclusivo para docentes autorizados.
- El backend debe validar permisos en cada consulta.
- Un docente no debe acceder a cursos o estudiantes de cursos no asignados.
- No debe depender únicamente de ocultar botones en la interfaz.
- Deben respetarse las reglas actuales de privacidad de los estudiantes.

## RNF-03. Integridad de métricas

- Las métricas deben derivarse de datos reales.
- Deben respetar la lógica de aprobación vigente.
- Deben especificar su denominador cuando se muestran porcentajes.
- Deben manejar ausencia de datos.
- No deben mezclar escalas de calificación incompatibles.
- Debe evitarse contar intentos duplicados de forma incorrecta.

## RNF-04. Compatibilidad

Debe integrarse con la aplicación móvil ya existente y con el backend actual.

No se debe reconstruir la aplicación ni cambiar la tecnología utilizada.

## RNF-05. Mantenibilidad

- Reutilizar componentes, servicios, navegación y modelos existentes cuando sea adecuado.
- Evitar duplicar lógica de métricas en diferentes pantallas.
- Evitar dependencias nuevas sin justificación.
- Mantener separación entre presentación, acceso a datos y reglas de negocio según la estructura actual.

## RNF-06. Usabilidad

La información debe permitir al docente comprender rápidamente:

- Qué cursos administra.
- Cuántos estudiantes tiene cada curso.
- Qué lecciones presentan dificultades.
- Qué estudiantes necesitan seguimiento.
- Qué acciones puede realizar.

## RNF-07. Accesibilidad

- Textos legibles.
- Contraste adecuado.
- Gráficos con alternativas textuales.
- Controles identificables.
- No depender únicamente del color para indicar aprobados, dificultades o prioridades.

---

# 6. Casos límite

**CE-01. Docente sin cursos asignados**  
Mostrar un estado vacío indicando que actualmente no tiene cursos asignados. No mostrar cursos de otros docentes.

**CE-02. Curso sin estudiantes**  
Mostrar 0 estudiantes y evitar cálculos porcentuales que tengan denominador cero.

**CE-03. Curso sin evaluaciones**  
Mostrar que todavía no hay resultados de evaluaciones disponibles. No mostrar porcentajes ni promedios inventados.

**CE-04. Lección sin cuestionario**  
Mostrar la lección sin métricas de evaluación y diferenciarla de una lección evaluada sin intentos.

**CE-05. Estudiantes que no realizaron evaluaciones**  
Contabilizarlos como pendientes/sin intento, de acuerdo con las reglas existentes, y no como aprobados ni como reprobados si el sistema no los considera así.

**CE-06. Evaluaciones con varios intentos**  
Usar la regla actual del sistema para determinar el resultado representativo (por ejemplo, último intento, mejor intento o resultado oficial). La IA debe identificar dicha regla durante el análisis; no debe cambiarla.

**CE-07. Datos insuficientes para detectar dificultades**  
Mostrar “Datos insuficientes” cuando la cantidad de respuestas no permita realizar una interpretación confiable.

**CE-08. Diferencia entre cantidad y porcentaje**  
Una lección con más estudiantes no debe ser automáticamente considerada la más difícil. Mostrar ambos indicadores cuando sea pertinente.

**CE-09. Estudiante con información incompleta**  
Mostrar únicamente los datos disponibles y evitar errores de pantalla.

**CE-10. Estudiante sin evaluaciones**  
Mostrar que no tiene evaluaciones registradas o que aún no inició, según el estado real.

**CE-11. Curso eliminado, archivado o no disponible**  
Respetar las reglas actuales de acceso y evitar errores si la relación deja de estar disponible.

**CE-12. Reunión sin enlace válido**  
No permitir publicar una reunión con un enlace inválido, siguiendo las validaciones de SPEC-004.

**CE-13. Error de conexión**  
Mostrar un mensaje apropiado, permitir reintentar y evitar duplicar operaciones.

**CE-14. Métricas desactualizadas**  
Si el backend informa fecha de actualización o estado de sincronización, mostrarlo cuando sea útil. No presentar datos antiguos como si fueran recién calculados.

**CE-15. Curso con gran cantidad de estudiantes**  
Utilizar paginación, carga incremental o mecanismos existentes, evitando cargar toda la información innecesariamente.

**CE-16. Curso con muchas lecciones**  
La lista debe mantenerse navegable, permitiendo ordenar o filtrar según las capacidades implementadas.

**CE-17. Acceso directo no autorizado**  
Si un docente intenta acceder mediante una ruta o identificador a un curso ajeno, el backend debe impedirlo.

**CE-18. Reunión modificada desde web**  
Los datos deben reflejarse en móvil al volver a consultar o refrescar, sin mantener una copia independiente que quede desactualizada.

---

# 7. Fuera de alcance

En esta iteración NO se contempla:

1. Crear una aplicación móvil nueva.
2. Reescribir la aplicación existente.
3. Cambiar el lenguaje, framework o arquitectura actual.
4. Modificar las funcionalidades del estudiante.
5. Crear un nuevo sistema de autenticación.
6. Crear nuevos roles si ya existen roles docentes.
7. Crear cursos o modificar inscripciones desde este módulo, salvo que ya exista una función autorizada y se apruebe explícitamente.
8. Crear un sistema de calificación diferente.
9. Modificar las reglas de aprobación de cuestionarios.
10. Inventar resultados o métricas que no estén respaldados por datos.
11. Implementar inteligencia artificial predictiva que diagnostique estudiantes.
12. Etiquetar estudiantes permanentemente por capacidad.
13. Enviar notificaciones push, correos o mensajes automáticos en esta iteración, salvo que exista una funcionalidad actual que se pueda reutilizar y se apruebe.
14. Implementar asistencia automática a reuniones.
15. Grabar reuniones.
16. Crear videoconferencias propias.
17. Crear un nuevo sistema de reuniones separado del SPEC-004.
18. Modificar el panel web del administrador.
19. Eliminar registros, cursos, evaluaciones o estudiantes.
20. Realizar refactorizaciones amplias no necesarias para el alcance.

Cualquier funcionalidad adicional debe ser presentada como propuesta y aprobada antes de implementarse.

---

# 8. Protocolo obligatorio de trabajo para la IA de programación

**IMPORTANTE: LA APLICACIÓN MÓVIL YA ESTÁ DESARROLLADA. ESTA ES UNA AMPLIACIÓN, NO UNA RECONSTRUCCIÓN.**

## Fase 1. Análisis previo obligatorio

Antes de realizar modificaciones, la IA debe analizar el proyecto móvil y el backend relacionado.

Debe investigar:

1. Estructura actual de la aplicación móvil.
2. Navegación y rutas existentes.
3. Sistema de autenticación.
4. Identificación del rol docente.
5. Pantallas actuales para docentes, si existen.
6. Servicios utilizados para obtener cursos.
7. Relación docente-curso.
8. Relación estudiante-curso.
9. Modelo o estructura de inscripciones.
10. Estructura de lecciones.
11. Estructura de cuestionarios/exámenes.
12. Cómo se almacenan las respuestas.
13. Cómo se almacenan los resultados o calificaciones.
14. Cómo se determina si una evaluación está aprobada.
15. Cómo se manejan los intentos.
16. Si se almacenan resultados por pregunta o tema.
17. Endpoints existentes de cursos y evaluaciones.
18. Endpoints existentes de métricas o reportes.
19. Mecanismo de permisos del backend.
20. Componentes de gráficos existentes.
21. Servicios y componentes reutilizables.
22. Funcionamiento actual de reuniones según SPEC-004.
23. Cómo se sincronizan los datos entre web y móvil.

No debe asumir que existen datos por tema o pregunta. Debe verificarlo en los modelos, endpoints y almacenamiento reales.

## Fase 2. Informe previo de cambios

Antes de programar, presentar:

### A. Funcionalidades existentes que se reutilizarán

Identificar pantallas, servicios, componentes, modelos y endpoints actuales que pueden reutilizarse.

### B. Archivos que se modificarán

| Archivo | Cambio propuesto | Motivo |
|---|---|---|
| Archivo existente | Cambio concreto | Justificación |

### C. Archivos que se crearán

| Archivo nuevo | Responsabilidad | Por qué es necesario |
|---|---|---|
| Nombre del archivo | Responsabilidad específica | Justificación |

Crear únicamente los archivos indispensables.

### D. Datos y métricas disponibles

Presentar una tabla indicando:

| Métrica solicitada | Datos existentes | Cómo se obtendría | ¿Requiere cambios? |
|---|---|---|---|
| Cursos del docente | Verificar | Relación existente | Confirmar |
| Estudiantes inscritos | Verificar | Inscripciones | Confirmar |
| Aprobados por lección | Verificar | Resultados de evaluación | Confirmar |
| No aprobados | Verificar | Resultados de evaluación | Confirmar |
| Pendientes | Verificar | Inscripciones/intentos | Confirmar |
| Dificultad por tema | Verificar | Respuestas por pregunta/tema | Confirmar |
| Prioridad de estudiante | Verificar | Resultados disponibles | Confirmar |
| Reuniones | Verificar SPEC-004 | Funcionalidad compartida | Confirmar |

### E. Cambios en backend

Explicar:

- Endpoints existentes que se utilizarán.
- Endpoints que se modificarán.
- Endpoints nuevos necesarios.
- Datos agregados que deberían devolver.
- Validaciones de autorización.
- Posibles optimizaciones.

No crear endpoints duplicados.

### F. Cambios en base de datos

Identificar si la implementación requiere cambios en la base de datos.

Si se requieren:

- Explicar el motivo.
- Indicar tablas o estructuras afectadas.
- Explicar cómo se preservarán los datos existentes.
- Presentar la migración propuesta.
- No ejecutar la migración todavía.

### G. Riesgos

Identificar riesgos para:

- Autenticación.
- Roles.
- Cursos.
- Inscripciones.
- Evaluaciones.
- Calificaciones.
- Aplicación móvil.
- Backend.
- Sincronización web/móvil.
- Rendimiento.
- Privacidad.

### H. Plan de implementación

Presentar un plan ordenado y las pruebas previstas.

## Fase 3. Autorización

La IA debe detenerse después del análisis y esperar autorización explícita.

No debe:

- Modificar archivos.
- Crear componentes.
- Crear servicios.
- Modificar endpoints.
- Instalar paquetes.
- Modificar base de datos.
- Ejecutar migraciones.
- Cambiar navegación.
- Eliminar código.
- Realizar refactorizaciones.

Sin autorización.

Si durante la implementación descubre cambios adicionales, debe detenerse y presentar una nueva propuesta antes de realizarlos.

## Fase 4. Implementación controlada

Una vez autorizada:

1. Implementar solamente el alcance aprobado.
2. Reutilizar la estructura actual.
3. Mantener la autenticación y permisos.
4. Reutilizar servicios y componentes.
5. Utilizar la fuente de datos oficial para cursos, estudiantes, evaluaciones y reuniones.
6. Evitar duplicar cálculos en varias pantallas.
7. Implementar estados de carga, vacío y error.
8. Mantener una interfaz móvil clara.
9. No modificar funcionalidades ajenas al SPEC-006.
10. No eliminar datos.
11. No realizar cambios de arquitectura innecesarios.
12. Mantener compatibilidad con el backend y las interfaces actuales.

## Fase 5. Validación

Probar:

- Acceso docente.
- Restricción para otros roles.
- Visualización de cursos asignados.
- Conteo de inscritos.
- Curso sin estudiantes.
- Curso sin evaluaciones.
- Rendimiento por lección.
- Aprobados y no aprobados.
- Pendientes.
- Intentos múltiples.
- Lecciones con dificultades.
- Disponibilidad de datos por tema.
- Lista de estudiantes.
- Detalle individual.
- Prioridad de seguimiento.
- Filtros y ordenamientos.
- Gráficos.
- Programación de reuniones.
- Edición y cancelación de reuniones.
- Sincronización con web.
- Responsive en teléfonos y tablets.
- Errores de conexión.
- Permisos y acceso a cursos ajenos.

Verificar también que las funcionalidades anteriores de la aplicación sigan funcionando.

## Fase 6. Informe final

Al terminar, entregar:

- Archivos modificados.
- Archivos nuevos.
- Componentes reutilizados.
- Funcionalidades implementadas.
- Métricas implementadas y sus fórmulas.
- Endpoints utilizados o agregados.
- Cambios en base de datos.
- Pruebas ejecutadas.
- Resultado de cada prueba.
- Limitaciones de los datos.
- Errores pendientes.
- Confirmación de que no se eliminaron datos ni funcionalidades existentes.

---

# 9. Criterios de finalización

La funcionalidad se considerará terminada cuando:

1. El docente pueda acceder al módulo móvil.
2. Pueda visualizar todos sus cursos asignados.
3. Cada curso muestre correctamente la cantidad de estudiantes inscritos.
4. Pueda abrir el detalle académico de un curso.
5. Pueda consultar el rendimiento por lección.
6. Pueda ver aprobados, no aprobados y pendientes cuando los datos existan.
7. Los porcentajes estén correctamente calculados.
8. Pueda identificar lecciones con mayores dificultades.
9. La dificultad se diferencie por cantidad y porcentaje.
10. Pueda consultar temas difíciles si los datos actuales lo permiten.
11. Pueda visualizar la lista de estudiantes inscritos.
12. Pueda abrir el detalle académico de un estudiante.
13. Pueda identificar estudiantes que necesitan seguimiento.
14. Pueda consultar prioridades por curso.
15. Pueda filtrar u ordenar los datos según las funcionalidades aprobadas.
16. Los gráficos sean legibles y útiles en móvil.
17. Pueda programar reuniones desde un curso.
18. Las reuniones utilicen la funcionalidad y datos compartidos definidos en SPEC-004.
19. Las reuniones creadas desde móvil se reflejen en web.
20. Los permisos sean validados en backend.
21. La interfaz sea responsive.
22. No se hayan eliminado datos ni funcionalidades existentes.
23. Todas las pruebas aprobadas estén documentadas.

---

# 10. Dudas abiertas

**[NECESITA ACLARACIÓN] DU-01.** ¿Qué regla utiliza actualmente el sistema cuando un estudiante tiene varios intentos: mejor intento, último intento u otro resultado oficial? La implementación debe reutilizar esa regla.

**[NECESITA ACLARACIÓN] DU-02.** ¿Existe actualmente almacenamiento de respuestas por pregunta o tema, o solamente una calificación final por evaluación? Esto determinará si se puede identificar dificultad por tema sin ampliar el modelo de datos.

**[NECESITA ACLARACIÓN] DU-03.** ¿Qué criterio deseas para clasificar una prioridad como alta, media o baja? Si no está definido, la IA debe proponer criterios basados en los datos existentes y esperar aprobación.

**[NECESITA ACLARACIÓN] DU-04.** ¿Los docentes deben poder ver todos los resultados de intentos o solamente el resultado que el sistema considera oficial?

**[NECESITA ACLARACIÓN] DU-05.** ¿Deseas que las métricas se actualicen automáticamente al ingresar a la pantalla, o basta con refrescar manualmente mediante una acción existente?

Estas dudas no autorizan a la IA a inventar reglas. Debe verificar primero cómo funciona el sistema actual y presentar las decisiones necesarias antes de implementar.

---

# 11. Instrucción inicial para la IA de programación

Lee completamente este SPEC-006 y analiza el proyecto móvil existente de Skylearn, junto con el backend y los módulos web relacionados cuando sea necesario para comprender los datos.

**NO COMIENCES A PROGRAMAR. NO MODIFIQUES ARCHIVOS TODAVÍA.**

Primero verifica cómo funciona actualmente:

- El rol docente.
- Los cursos asignados.
- Las inscripciones.
- Los estudiantes.
- Las lecciones.
- Los cuestionarios y exámenes.
- Los resultados y calificaciones.
- Los intentos.
- Los datos por pregunta o tema.
- Las reuniones del SPEC-004.

---

# 12. Informe Técnico de Factibilidad y Arquitectura (Respuesta a la Sección 11)

A continuación se presenta el informe técnico detallado, basado en la inspección rigurosa del esquema de datos (`backend/prisma/schema.prisma`), los servicios del backend (`analytics.service.ts`, `courses.service.ts`, `live-meetings.service.ts`) y la aplicación móvil actual (`frontend-mobile/App.tsx`).

### 1. Estado actual de la aplicación móvil
* **Estructura:** La aplicación móvil está implementada en **React Native (Expo v57/v58) + TypeScript**.
* **Estado:** Actualmente cuenta con una pantalla principal única en `frontend-mobile/App.tsx` que maneja autenticación JWT para el rol `TEACHER`, visualización de los **3 KPIs superiores** (Alumnos activos, Lecciones completadas, Tasa promedio de aprobación), tarjetas con semáforo pedagógico (`leaf`, `sun`, `coral`) de los cursos del docente, alerta de la lección crítica y registro automático del token de notificaciones push de Expo (`expo-notifications`).

### 2. Funcionalidades y componentes reutilizables
* `src/theme/skylearn.ts`: Sistema de diseño accesible Skylearn (paleta de colores `leaf`, `sun`, `coral`, `sky`, `ink`, radios ergonómicos y sombras).
* `src/services/notifications.ts`: Servicio probado de registro y gestión de notificaciones push de Expo.
* Patrón de autenticación JWT y headers autorizados (`Bearer token`) con Axios.
* Componentes de tarjetas de KPIs y semáforo pedagógico ya validados en el dashboard docente.

### 3. Archivos que se modificarían
* `frontend-mobile/App.tsx`: Para soportar navegación o renderizado por pestañas/vistas modulares (Lista de cursos, Detalle de curso, Lista de estudiantes, Programador de reuniones) sin perder la sesión del docente.
* `frontend-mobile/src/services/notifications.ts`: Para asegurar que la variable `BACKEND_URL` tome `EXPO_PUBLIC_API_URL` apuntando a producción (`http://18.219.151.60/api/v1`).
* `backend/src/modules/analytics/analytics.service.ts`: Para incorporar las consultas detalladas de alumnos por curso y lecciones con dificultad sin alterar la lógica existente.
* `backend/src/modules/analytics/analytics.controller.ts`: Para exponer los endpoints de consulta docente detallada con `Roles(Role.TEACHER)`.

### 4. Archivos nuevos que se crearían
* `frontend-mobile/src/screens/TeacherCourseDetail.tsx`: Pantalla de detalle del curso con desglose de lecciones, tasas de aprobación por examen y botón de reunión.
* `frontend-mobile/src/screens/TeacherStudentsList.tsx`: Vista de alumnos inscritos en el curso con su progreso y estado pedagógico individual.
* `frontend-mobile/src/screens/MeetingSchedulerModal.tsx`: Formulario modal ergonómico para programar reuniones en vivo (título, fecha, hora inicio, fin, enlace Meet/Zoom y agenda).
* `frontend-mobile/src/types/academic.types.ts`: Tipos estrictos de TypeScript para las respuestas de analítica académica y reuniones.

### 5. Datos disponibles en el sistema (Evidencia Prisma)
* **Rol docente:** `User.role === Role.TEACHER`.
* **Cursos asignados:** `Course.teacherId` (relación `User` 1:N `Course`).
* **Inscripciones de estudiantes:** Modelo `Enrollment` (`userId`, `courseId`, `enrolledAt`).
* **Lecciones y temas:** Modelos `Module` y `Lesson` (orden, título, `contextText`).
* **Cuestionarios y preguntas:** Modelos `Exam`, `Question` (`text`, `points`), `Option` (`isCorrect`).
* **Resultados e intentos:** Modelo `ExamAttempt` (`score`, `isPassed`, `createdAt`).
* **Respuestas atómicas por pregunta:** Modelo `AttemptAnswer` (`attemptId`, `questionId`, `selectedOptionId`). **¡Los datos por pregunta ya existen y están persistidos!**
* **Reuniones en vivo (SPEC-004):** Modelo `LiveMeeting` (`title`, `description`, `date`, `startTime`, `endTime`, `meetingUrl`, `status`, `courseId`, `teacherId`).

### 6. Métricas que pueden implementarse sin cambiar la base de datos
**El 100% de las métricas solicitadas en SPEC-006 pueden implementarse sin modificar la base de datos:**
1. Cantidad de alumnos inscritos por curso (`COUNT(Enrollment)`).
2. Tasa de aprobación por lección (`passedAttempts / totalAttempts * 100`).
3. Temas y preguntas más difíciles (ordenados por porcentaje de selección de opciones incorrectas en `AttemptAnswer`).
4. Estudiantes en riesgo o que necesitan apoyo (estudiantes con promedio < 60% o más de 2 evaluaciones reprobadas).
5. Progreso individual del estudiante (`completedLessons / totalLessons * 100` desde `LessonProgress`).

### 7. Métricas que requieren cambios de base de datos
* **Ninguna.** Toda la información necesaria ya cuenta con tablas, índices y relaciones en PostgreSQL.

### 8. Endpoints existentes que se reutilizarán
* `POST /api/v1/auth/login`: Autenticación de docentes.
* `GET /api/v1/teacher/dashboard`: 3 KPIs y semáforo general de cursos.
* `GET /api/v1/courses/:id`: Información básica del curso, módulos y lecciones.
* `GET /api/v1/meetings/course/:courseId`: Lista de reuniones del curso.
* `POST /api/v1/meetings`: Creación de reunión en vivo (SPEC-004).
* `POST /api/v1/teacher/device-token`: Registro de push token.

### 9. Endpoints nuevos estrictamente necesarios
Solo se requieren 2 endpoints de lectura optimizados para móvil:
1. `GET /api/v1/teacher/courses/:id/academic-detail`: Devuelve el desglose del curso, métricas de cada lección, lista de preguntas con mayor tasa de error y lección crítica.
2. `GET /api/v1/teacher/courses/:id/students`: Devuelve el listado de estudiantes inscritos en ese curso con su avance (%) y su último resultado de examen.

### 10. Cambios propuestos en la base de datos
* **CERO cambios de esquema.** No se requiere ninguna migración (`prisma migrate`) adicional. La base de datos actual es completamente suficiente.

### 11. Fórmulas de cada indicador
* **Tasa de Aprobación de Lección ($TA_L$):**
  $$TA_L = \left( \frac{\text{Intentos Aprobados}}{\text{Total de Intentos}} \right) \times 100$$
* **Índice de Dificultad de Pregunta ($ID_P$):**
  $$ID_P = \left( \frac{\text{Respuestas Incorrectas}}{\text{Total de Respuestas en la Pregunta}} \right) \times 100$$
* **Progreso de Alumno ($P_E$):**
  $$P_E = \left( \frac{\text{Lecciones Completadas}}{\text{Total de Lecciones del Curso}} \right) \times 100$$

### 12. Cálculo de la Prioridad Académica
* **Semáforo y Alerta:**
  * 🔴 **Prioridad Alta (Coral):** Cursos o lecciones con $TA < 60\%$ o estudiantes con más de 2 exámenes reprobados sin aprobar.
  * 🟡 **Prioridad Media (Sun):** Cursos o lecciones con $60\% \le TA < 80\%$.
  * 🟢 **Prioridad Normal (Leaf):** Cursos o lecciones con $TA \ge 80\%$.

### 13. Riesgos de romper funcionalidades existentes
* **Riesgo:** Sobrecargar la navegación móvil y romper el flujo actual de Expo Go.
  * *Mitigación:* Usar renderizado condicional con estado local en lugar de reestructurar bibliotecas de navegación pesadas, manteniendo la compatibilidad estricta con Expo.
* **Riesgo:** Afectar los cálculos analíticos del Administrador.
  * *Mitigación:* Los nuevos métodos del backend se encapsulan exclusivamente bajo el guard `Role.TEACHER` y filtran estrictamente por `course.teacherId === req.user.id`.

### 14. Plan de implementación en 3 fases
1. **Fase 1 (Backend - Endpoints Docentes):** Implementar `GET /teacher/courses/:id/academic-detail` y `GET /teacher/courses/:id/students` reutilizando las relaciones existentes de Prisma.
2. **Fase 2 (Frontend Móvil - Vistas Académicas):** Integrar la vista de detalle de curso con desglose de lecciones, semáforos e identificación de temas difíciles.
3. **Fase 3 (Frontend Móvil - Reuniones y Alumnos):** Integrar el modal para programar reuniones en vivo (SPEC-004) y la lista de estudiantes con estado de apoyo.

### 15. Pruebas que se ejecutarían
* **Unitarias/Integración (Backend):** Tests en Jest para verificar que un docente solo pueda consultar métricas de sus propios cursos asignados (403 si intenta acceder a cursos de otro docente).
* **Validación en Dispositivo Móvil:** Verificación de renderizado ergonómico, actualización de datos por pull-to-refresh y programación de reunión en vivo contra la API de AWS (`http://18.219.151.60/api/v1`).
