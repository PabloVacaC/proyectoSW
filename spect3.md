# SPEC-003 — Panel de inteligencia académica y KPIs del administrador de Skylearn

## 1. Contexto y objetivo

Actualmente Skylearn dispone de funcionalidades educativas para que los estudiantes puedan acceder a cursos, visualizar clases, realizar evaluaciones y consultar contenidos con ayuda del Docente Virtual. Se requiere incorporar un panel de inteligencia académica dentro del módulo de administración, que permita conocer el comportamiento de los estudiantes, la demanda de los cursos y el rendimiento académico de la plataforma. El objetivo es transformar los datos que ya genera Skylearn en información útil para la toma de decisiones, mediante indicadores KPI, gráficos estadísticos, tablas y reportes. El administrador podrá identificar qué cursos tienen mayor demanda, cuántos estudiantes están inscritos en cada curso, qué preguntas y temas presentan mayores dificultades, qué estudiantes destacan académicamente y cuáles necesitan reforzar determinados conocimientos. Toda la información deberá obtenerse de los registros reales del sistema, reutilizando los modelos, servicios, evaluaciones e inscripciones existentes.

## 2. Usuarios / actores

- **Administrador:** Tiene acceso completo al panel de indicadores académicos y puede consultar estadísticas generales, cursos, estudiantes y resultados.
- **Docente:** No tendrá acceso al panel administrativo completo, salvo que los permisos existentes permitan consultar estadísticas de sus propios cursos.
- **Estudiante:** No tiene acceso a los indicadores administrativos ni a información académica privada de otros estudiantes.
- **Sistema:** Procesa los datos existentes, calcula indicadores, agrupa resultados y presenta información mediante gráficos y tablas.

## 3. Historias de usuario

**H1. Resumen académico**

Como administrador quiero visualizar indicadores generales de Skylearn para conocer el estado académico de la plataforma.

**H2. Estudiantes por curso**

Como administrador quiero conocer cuántos estudiantes están inscritos en cada curso para identificar cuáles tienen mayor participación.

**H3. Cursos más solicitados**

Como administrador quiero visualizar cuáles son los cursos más solicitados para conocer los intereses de los estudiantes.

**H4. Distribución de estudiantes**

Como administrador quiero visualizar una gráfica que muestre cómo se distribuyen los estudiantes entre los diferentes cursos.

**H5. Rendimiento de evaluaciones**

Como administrador quiero conocer qué preguntas y evaluaciones presentan mayores porcentajes de respuestas incorrectas para identificar dificultades de aprendizaje.

**H6. Temas difíciles**

Como administrador quiero identificar los temas que presentan mayores dificultades entre los estudiantes para mejorar el contenido educativo.

**H7. Estudiantes destacados**

Como administrador quiero identificar a los estudiantes con mejores resultados académicos para conocer quiénes presentan un buen rendimiento.

**H8. Estudiantes con dificultades**

Como administrador quiero identificar a los estudiantes que tienen dificultades en determinados temas para detectar oportunidades de refuerzo académico.

**H9. Fortalezas académicas**

Como administrador quiero visualizar cuáles son los temas que dominan los estudiantes para conocer sus fortalezas.

**H10. Análisis individual**

Como administrador quiero consultar el rendimiento de un estudiante específico para conocer sus avances, resultados y dificultades.

**H11. Filtrado de estadísticas**

Como administrador quiero filtrar los indicadores por fechas, cursos y categorías para analizar diferentes períodos y grupos de estudiantes.

**H12. Visualización gráfica**

Como administrador quiero visualizar los indicadores mediante gráficos interactivos para interpretar fácilmente los resultados.

**H13. Integridad de información**

Como responsable del proyecto quiero que las estadísticas utilicen información real del sistema para evitar resultados incorrectos o inventados.

---

# 4. Requisitos funcionales (criterios de aceptación en EARS)

## RF-01. Nuevo módulo de KPIs administrativos

CUANDO un administrador ingrese al panel administrativo, EL SISTEMA DEBE permitir acceder a una nueva sección denominada:

**Inteligencia Académica**

Esta sección debe integrarse al menú administrativo existente.

No se debe crear un segundo panel administrativo independiente.

El nuevo módulo debe presentar información organizada en las siguientes áreas:

1. Resumen general.
2. Análisis de cursos.
3. Demanda de cursos.
4. Rendimiento académico.
5. Análisis de evaluaciones.
6. Fortalezas y dificultades de estudiantes.
7. Análisis individual de estudiantes.

La ubicación exacta del acceso debe determinarse después de analizar la estructura actual del panel administrativo.

## RF-02. Resumen general de indicadores

CUANDO el administrador ingrese a Inteligencia Académica, EL SISTEMA DEBE mostrar una sección de indicadores generales.

Se deben contemplar los siguientes KPI:

**KPI 1. Total de estudiantes registrados**

Cantidad total de estudiantes registrados en la plataforma.

**KPI 2. Estudiantes activos**

Cantidad de estudiantes que tuvieron actividad académica durante el período seleccionado.

La actividad debe definirse utilizando eventos reales, como ingreso a cursos, visualización de clases o realización de evaluaciones.

**KPI 3. Total de cursos disponibles**

Cantidad de cursos publicados y disponibles en la plataforma.

**KPI 4. Total de inscripciones**

Cantidad de inscripciones registradas en los cursos.

Debe diferenciarse el número de inscripciones del número de estudiantes únicos, porque un mismo estudiante puede estar inscrito en varios cursos.

**KPI 5. Promedio general de rendimiento**

Promedio de los resultados de las evaluaciones realizadas, utilizando el método de cálculo que ya tenga implementado Skylearn.

**KPI 6. Tasa de aprobación**

Porcentaje de evaluaciones aprobadas respecto de las evaluaciones finalizadas y calificadas.

No se deben incluir evaluaciones pendientes como si fueran reprobadas.

**KPI 7. Participación académica**

Cantidad de estudiantes que realizaron actividades educativas durante el período seleccionado.

Los indicadores deben mostrar información real y permitir identificar el período al que corresponden.

## RF-03. KPI de estudiantes por curso

CUANDO el administrador consulte el análisis de cursos, EL SISTEMA DEBE mostrar cuántos estudiantes están inscritos en cada curso.

Se debe presentar:

- Nombre del curso.
- Cantidad de estudiantes inscritos.
- Cantidad de estudiantes activos.
- Cantidad de estudiantes que finalizaron el curso, si existe ese estado.
- Cantidad de estudiantes que todavía están cursándolo.
- Porcentaje de participación.
- Categoría del curso.

La información debe visualizarse mediante gráficos.

Se deben incluir:

**Gráfico de barras:** Comparación de estudiantes inscritos por curso.

**Gráfico circular o de anillo:** Distribución porcentual de estudiantes entre cursos.

**Tabla de cursos:** Listado detallado con las cantidades correspondientes.

El administrador debe poder seleccionar un curso y consultar los estudiantes inscritos en él.

No se deben contabilizar dos veces las inscripciones del mismo estudiante al mismo curso.

## RF-04. KPI de cursos más solicitados

CUANDO el administrador consulte la sección de demanda de cursos, EL SISTEMA DEBE presentar un ranking de los cursos con mayor interés por parte de los usuarios.

Se deben analizar los datos que realmente existan, considerando:

- Cantidad de estudiantes inscritos.
- Cantidad de estudiantes únicos interesados.
- Cantidad de consultas o visualizaciones de cursos, si existe registro.
- Cantidad de búsquedas relacionadas con los cursos, si existe registro.
- Cantidad de solicitudes de inscripción, si existe ese mecanismo.

El sistema debe diferenciar entre:

**Popularidad:** Cursos que tienen mayor cantidad de estudiantes inscritos.

**Interés:** Cursos que reciben más consultas o visualizaciones.

**Demanda:** Cursos que reciben más solicitudes de inscripción, cuando exista ese registro.

El administrador debe poder identificar:

- Curso más popular.
- Curso con mayor cantidad de inscripciones.
- Curso con mayor interés.
- Cursos con menor participación.
- Evolución de la demanda por período.

Si el sistema no registra búsquedas, solicitudes o visualizaciones, no debe inventar estos datos.

En ese caso, debe presentar únicamente las métricas disponibles y señalar cuáles requieren instrumentación adicional.

## RF-05. Análisis de demanda mediante gráficos

EL SISTEMA DEBE permitir visualizar la demanda mediante:

1. Gráfico de barras con los cursos más solicitados.
2. Gráfico de líneas con la evolución de inscripciones por período.
3. Gráfico circular con la distribución de estudiantes por categoría.
4. Tabla comparativa de cursos.

Los gráficos deben actualizarse al cambiar los filtros.

El administrador debe poder identificar tendencias de crecimiento o disminución de interés.

## RF-06. Análisis de rendimiento académico

CUANDO el administrador ingrese al apartado Rendimiento Académico, EL SISTEMA DEBE mostrar estadísticas relacionadas con los resultados obtenidos por los estudiantes en las evaluaciones.

Se deben contemplar:

- Promedio general de calificaciones.
- Porcentaje de aprobados.
- Porcentaje de reprobados.
- Cantidad de evaluaciones realizadas.
- Cantidad de evaluaciones pendientes.
- Distribución de calificaciones.
- Evolución del rendimiento por período.

Los resultados deben calcularse utilizando las respuestas y calificaciones registradas.

No se deben considerar como incorrectas las evaluaciones que todavía no fueron realizadas.

## RF-07. Identificación de preguntas difíciles

CUANDO el administrador consulte el análisis de evaluaciones, EL SISTEMA DEBE identificar las preguntas que presentan mayores dificultades para los estudiantes.

Se debe analizar:

- Pregunta evaluada.
- Curso al que pertenece.
- Lección relacionada.
- Tema o categoría asociada.
- Cantidad de estudiantes que respondieron.
- Cantidad de respuestas correctas.
- Cantidad de respuestas incorrectas.
- Porcentaje de respuestas correctas.
- Porcentaje de respuestas incorrectas.

Se debe utilizar como indicador principal el porcentaje de respuestas incorrectas.

Ejemplo:

| Pregunta | Correctas | Incorrectas | Dificultad |
|---|---:|---:|---:|
| Pregunta 1 | 80% | 20% | Baja |
| Pregunta 2 | 35% | 65% | Alta |
| Pregunta 3 | 50% | 50% | Media |
| Pregunta 4 | 15% | 85% | Muy alta |

La clasificación es orientativa y deberá utilizar umbrales configurables.

El sistema debe permitir ordenar las preguntas desde las que presentan mayor dificultad hasta las que presentan menor dificultad.

Las preguntas con pocas respuestas deben identificarse como muestras insuficientes, para evitar conclusiones engañosas.

## RF-08. Identificación de temas difíciles

CUANDO el administrador consulte el análisis de temas, EL SISTEMA DEBE agrupar los resultados de las evaluaciones por tema.

El objetivo es identificar qué contenidos educativos generan mayores dificultades.

Se deben presentar:

- Nombre del tema.
- Curso correspondiente.
- Cantidad de preguntas relacionadas.
- Cantidad de estudiantes evaluados.
- Porcentaje promedio de respuestas incorrectas.
- Porcentaje promedio de respuestas correctas.
- Nivel de dificultad estimado.

Ejemplo:

| Tema | Respuestas incorrectas | Nivel |
|---|---:|---|
| Normalización de bases de datos | 78% | Alto |
| Consultas SQL | 25% | Bajo |
| Relaciones entre tablas | 62% | Alto |
| Modelo entidad-relación | 38% | Medio |

El administrador debe poder seleccionar un tema para consultar las preguntas que están generando dificultades.

IMPORTANTE: Para que este análisis sea confiable, cada pregunta debe estar relacionada con su tema correspondiente. La IA debe comprobar si esta clasificación ya existe en el sistema.

Si no existe, deberá proponer una manera de relacionar las preguntas con los temas sin alterar innecesariamente la estructura actual.

## RF-09. Identificación de estudiantes con mayores dificultades

CUANDO el administrador ingrese al apartado Análisis de Estudiantes, EL SISTEMA DEBE permitir identificar estudiantes que presentan dificultades académicas.

Se deben considerar indicadores como:

- Promedio de evaluaciones.
- Porcentaje de respuestas incorrectas.
- Cantidad de evaluaciones reprobadas.
- Temas con menor rendimiento.
- Evolución de resultados.
- Evaluaciones pendientes, cuando corresponda.

El sistema debe permitir identificar:

- Estudiantes con bajo rendimiento general.
- Estudiantes que presentan dificultades en determinados temas.
- Estudiantes cuyo rendimiento está disminuyendo.
- Estudiantes que tienen evaluaciones pendientes.

No se debe clasificar automáticamente a un estudiante como deficiente por una única respuesta incorrecta.

Se debe utilizar un número suficiente de evaluaciones y resultados para obtener una conclusión razonable.

La clasificación debe ser orientativa y no debe utilizarse para penalizar automáticamente al estudiante.

## RF-10. Identificación de estudiantes destacados

CUANDO el administrador consulte los estudiantes destacados, EL SISTEMA DEBE presentar aquellos que tengan mejores resultados académicos.

Se deben considerar:

- Promedio general.
- Porcentaje de evaluaciones aprobadas.
- Cantidad de evaluaciones completadas.
- Rendimiento por curso.
- Progreso académico.

Se debe poder visualizar un ranking de estudiantes destacados.

La clasificación debe considerar una cantidad mínima de evaluaciones realizadas para evitar que un estudiante aparezca primero por haber aprobado solamente una evaluación.

No se deben confundir créditos disponibles con rendimiento académico.

## RF-11. Análisis de fortalezas académicas

CUANDO el administrador consulte el análisis de fortalezas, EL SISTEMA DEBE identificar los temas en los que los estudiantes presentan mejores resultados.

Se debe mostrar:

- Tema dominado.
- Curso correspondiente.
- Porcentaje de respuestas correctas.
- Cantidad de estudiantes evaluados.
- Cantidad de preguntas relacionadas.
- Evolución del rendimiento.

Ejemplo:

| Tema | Respuestas correctas | Nivel |
|---|---:|---|
| Fundamentos de programación | 92% | Fortaleza |
| Consultas SQL | 88% | Fortaleza |
| Estructuras de datos | 45% | Necesita refuerzo |

El sistema debe permitir identificar los temas en los que existe mayor dominio colectivo.

También debe permitir analizar las fortalezas de un estudiante individual.

## RF-12. Perfil académico individual del estudiante

CUANDO el administrador seleccione un estudiante, EL SISTEMA DEBE mostrar un perfil de rendimiento académico.

Debe contener:

**Información general**

- Nombre del estudiante.
- Identificador del estudiante.
- Estado de la cuenta.
- Fecha de registro, si existe.

**Información académica**

- Cursos inscritos.
- Cursos finalizados.
- Cursos en progreso.
- Evaluaciones realizadas.
- Promedio de calificaciones.
- Porcentaje de aprobación.
- Progreso académico, si existe.

**Fortalezas**

- Temas con mejores resultados.
- Preguntas con respuestas correctas.
- Cursos con mejor rendimiento.

**Dificultades**

- Temas con mayor porcentaje de respuestas incorrectas.
- Evaluaciones con resultados bajos.
- Temas que requieren refuerzo.

El administrador debe poder consultar la evolución del rendimiento del estudiante.

La información debe obtenerse de los registros existentes.

No se debe exponer información sensible que no sea necesaria para el análisis académico.

## RF-13. Comparación de rendimiento entre cursos

CUANDO el administrador seleccione dos o más cursos, EL SISTEMA DEBE permitir comparar su rendimiento académico.

Se deben contemplar:

- Cantidad de estudiantes inscritos.
- Promedio de calificaciones.
- Tasa de aprobación.
- Porcentaje de evaluaciones completadas.
- Porcentaje de respuestas incorrectas.
- Nivel de participación.

La comparación debe permitir identificar qué cursos presentan mejores resultados y cuáles requieren revisión de contenido.

## RF-14. Filtros de información

EL SISTEMA DEBE permitir filtrar los indicadores según los datos disponibles.

Se deben contemplar los siguientes filtros:

- Fecha inicial.
- Fecha final.
- Curso.
- Categoría.
- Estudiante.
- Estado del curso.
- Estado de la evaluación.

Cuando se modifique un filtro, los gráficos y tablas relacionados deben actualizarse.

El sistema debe permitir restablecer los filtros.

Los filtros deben aplicarse de forma coherente a los indicadores correspondientes.

## RF-15. Gráficos interactivos

EL SISTEMA DEBE presentar la información mediante gráficos visuales.

Se contemplan:

- Gráficos de barras.
- Gráficos circulares.
- Gráficos de líneas.
- Gráficos de distribución.
- Tablas estadísticas.

Al seleccionar un elemento de un gráfico, el administrador debe poder consultar información más detallada cuando corresponda.

Los gráficos deben mostrar:

- Título.
- Valores.
- Etiquetas.
- Leyenda.
- Período analizado.
- Información al pasar el cursor.
- Mensajes cuando no existan datos.

No se deben presentar gráficos con valores inventados o datos de ejemplo en producción.

## RF-16. Actualización de estadísticas

CUANDO el administrador abra el panel o modifique un filtro, EL SISTEMA DEBE consultar los datos actualizados según el mecanismo de consulta existente.

Las estadísticas deben reflejar las operaciones registradas en la plataforma.

No se requiere actualizar todos los gráficos en tiempo real si ello genera consultas innecesarias.

Se puede utilizar actualización bajo demanda o una estrategia de caché, siempre que se mantenga la precisión de los datos.

## RF-17. Información insuficiente

SI una métrica no cuenta con suficientes registros para calcularse correctamente, ENTONCES EL SISTEMA debe mostrar un mensaje indicando que no existen datos suficientes.

No debe mostrar porcentajes engañosos ni asumir que un estudiante domina un tema cuando no existen evaluaciones suficientes.

## RF-18. Control de acceso

EL SISTEMA DEBE permitir el acceso a Inteligencia Académica únicamente a los usuarios que tengan permisos administrativos correspondientes.

El backend debe validar los permisos en cada solicitud.

No debe confiar únicamente en ocultar opciones del menú en el frontend.

Los docentes y estudiantes no deben acceder a estadísticas privadas de otros usuarios sin autorización.

---

# 5. Requisitos no funcionales

## RNF-01. Rendimiento

- Los gráficos deben cargar eficientemente.
- Las consultas deben evitar recuperar registros innecesarios.
- Se deben evaluar índices y agregaciones para consultas estadísticas.
- Se debe evitar consultar individualmente cada estudiante cuando sea posible realizar consultas agrupadas.
- Se puede utilizar caché para indicadores que no requieran actualización inmediata.
- El panel debe seguir siendo utilizable cuando existan muchos estudiantes y cursos.

## RNF-02. Seguridad

- Acceso restringido por roles y permisos.
- Validación de consultas en backend.
- Protección de información personal.
- No exponer datos privados en respuestas públicas.
- Control de acceso a perfiles individuales.
- No permitir que estudiantes consulten los indicadores administrativos.

## RNF-03. Integridad de información

- Los resultados deben corresponder a los registros reales.
- No duplicar inscripciones.
- No contabilizar dos veces una evaluación.
- Diferenciar evaluaciones pendientes de evaluaciones reprobadas.
- Mantener coherencia entre cursos, estudiantes, lecciones y evaluaciones.

## RNF-04. Diseño responsive

El panel debe adaptarse a:

- Computadoras.
- Portátiles.
- Tablets.
- Teléfonos móviles.

En dispositivos pequeños, los gráficos y tablas deben reorganizarse para facilitar la lectura.

No debe existir desplazamiento horizontal innecesario.

## RNF-05. Idioma

Toda la interfaz debe estar en español.

## RNF-06. Mantenibilidad

Se deben reutilizar los componentes, servicios y librerías gráficas que ya existan en el proyecto.

No se deben instalar librerías adicionales si la infraestructura actual permite implementar los gráficos solicitados.

## RNF-07. Escalabilidad

El diseño debe soportar el crecimiento de estudiantes, cursos, evaluaciones y registros académicos sin provocar consultas excesivamente costosas.

---

# 6. Casos límite

**CE-01. Plataforma sin estudiantes:** Mostrar indicadores en cero y mensajes apropiados.

**CE-02. Curso sin inscripciones:** Mostrar cero estudiantes sin generar errores.

**CE-03. Curso sin evaluaciones:** No calcular promedios ni dificultades inexistentes.

**CE-04. Estudiante sin evaluaciones:** Identificarlo como sin datos suficientes, no como estudiante reprobado.

**CE-05. Evaluación incompleta:** No contabilizarla como reprobada.

**CE-06. Pregunta sin tema asociado:** Identificarla como pregunta sin clasificar, sin inventar su temática.

**CE-07. Tema con pocas respuestas:** Mostrar que la muestra es insuficiente.

**CE-08. Estudiante inscrito en varios cursos:** Contabilizar correctamente sus inscripciones sin duplicar el total de estudiantes únicos.

**CE-09. Cursos sin actividad reciente:** Diferenciar entre cursos con inscripciones históricas y cursos activos durante el período seleccionado.

**CE-10. Filtros sin resultados:** Mostrar un mensaje indicando que no se encontraron registros.

**CE-11. Cambio de período:** Actualizar todos los indicadores afectados por el período seleccionado.

**CE-12. Datos inconsistentes:** Evitar que registros incompletos provoquen errores en los gráficos.

**CE-13. Evaluaciones repetidas:** Definir cómo se contabilizan los intentos para evitar duplicaciones y mantener la lógica de calificación actual.

**CE-14. Acceso no autorizado:** Rechazar solicitudes de usuarios sin permisos administrativos.

**CE-15. Muchos registros:** Utilizar consultas optimizadas y paginación para las tablas de estudiantes y cursos.

**CE-16. Error del servidor:** Mostrar un mensaje apropiado sin presentar datos antiguos como si fueran actuales.

---

# 7. Fuera de alcance

En esta iteración NO se contempla:

1. Reconstruir el módulo administrativo.
2. Crear una nueva base de datos.
3. Reemplazar el sistema actual de evaluaciones.
4. Cambiar la forma en que se asignan los créditos.
5. Modificar las calificaciones históricas.
6. Eliminar estudiantes o cursos.
7. Modificar las inscripciones existentes.
8. Crear un sistema de inteligencia artificial independiente.
9. Implementar predicciones automáticas de abandono.
10. Calificar automáticamente a estudiantes mediante IA.
11. Enviar notificaciones automáticas a estudiantes.
12. Crear un sistema de recomendaciones personalizado.
13. Implementar reportes financieros.
14. Crear un sistema nuevo de gestión académica.
15. Modificar permisos existentes sin autorización.

Si se considera necesaria alguna funcionalidad adicional, debe presentarse como propuesta independiente.

---

# 8. Protocolo obligatorio de trabajo para la IA de programación

**IMPORTANTE: Skylearn ya está desarrollado. NO SE DEBE PROGRAMAR NADA ANTES DE ANALIZAR EL PROYECTO Y PRESENTAR UNA PROPUESTA.**

## Fase 1. Análisis de la estructura existente

La IA debe investigar:

1. Estructura del frontend.
2. Estructura del backend.
3. Panel administrativo actual.
4. Componentes de estadísticas existentes.
5. Modelos de estudiantes.
6. Modelos de cursos.
7. Relaciones de inscripciones.
8. Modelos de evaluaciones.
9. Preguntas y respuestas.
10. Resultados de evaluaciones.
11. Registro de intentos.
12. Relación entre preguntas y temas.
13. Sistema de seguimiento del progreso.
14. Roles y permisos.
15. Endpoints existentes.
16. Librerías gráficas instaladas.

Debe identificar qué información ya está disponible y qué información no se está registrando actualmente.

## Fase 2. Informe previo de modificaciones

Antes de programar debe entregar:

### A. Archivos que modificará

| Archivo | Modificación | Justificación |
|---|---|---|
| Archivo existente | Cambio propuesto | Motivo |

### B. Archivos nuevos

| Archivo | Funcionalidad | Necesidad |
|---|---|---|
| Archivo nuevo | Responsabilidad | Justificación |

### C. Componentes que reutilizará

Debe identificar los componentes actuales del panel administrativo que pueden reutilizarse.

### D. Datos disponibles

Debe presentar una tabla:

| Indicador | ¿Existen datos? | Fuente actual |
|---|---|---|
| Estudiantes por curso | Por verificar | Inscripciones |
| Cursos más populares | Por verificar | Inscripciones |
| Búsquedas de cursos | Por verificar | Registros de actividad |
| Promedio de evaluaciones | Por verificar | Resultados |
| Preguntas difíciles | Por verificar | Respuestas |
| Temas difíciles | Por verificar | Preguntas y temas |
| Fortalezas individuales | Por verificar | Resultados por tema |

Debe completar esta tabla después de inspeccionar el proyecto, no asumir que todos los datos existen.

### E. Cambios en la base de datos

Debe explicar si realmente necesita agregar campos, tablas o relaciones.

No debe duplicar modelos existentes.

Si falta información para algún KPI, debe explicar cómo podría obtenerse y qué modificación mínima sería necesaria.

### F. Estrategia de cálculo

Debe documentar las fórmulas que utilizará para cada indicador.

Debe identificar cómo manejará intentos repetidos, evaluaciones pendientes, muestras insuficientes y estudiantes inscritos en varios cursos.

### G. Riesgos

Debe identificar los posibles efectos sobre:

- Panel administrativo.
- Inscripciones.
- Cursos.
- Evaluaciones.
- Calificaciones.
- Créditos.
- Estudiantes.
- Docentes.
- Permisos.

### H. Plan de implementación

Debe presentar el orden de implementación y las pruebas necesarias.

## Fase 3. Autorización

La IA debe esperar autorización explícita antes de modificar cualquier archivo.

No puede crear tablas, migraciones, endpoints o componentes hasta recibir aprobación.

Si el responsable solicita modificaciones al plan, debe actualizar la propuesta.

## Fase 4. Implementación

Una vez autorizada:

1. Reutilizar modelos y servicios existentes.
2. Implementar únicamente los indicadores aprobados.
3. Utilizar consultas agrupadas y optimizadas.
4. Crear componentes reutilizables.
5. Mantener las reglas de negocio actuales.
6. No modificar calificaciones históricas.
7. No eliminar registros.
8. No instalar dependencias innecesarias.
9. Detenerse y solicitar aprobación si descubre que necesita ampliar el alcance.

## Fase 5. Validación

Debe verificar:

- Exactitud de los totales.
- Cálculo de promedios.
- Porcentajes de aprobación.
- Cantidad de estudiantes por curso.
- Ranking de cursos.
- Cálculo de dificultades.
- Identificación de fortalezas.
- Filtrado por fechas.
- Filtrado por cursos.
- Seguridad administrativa.
- Rendimiento de las consultas.
- Visualización responsive.

Los resultados de los gráficos deben compararse con consultas directas a los registros correspondientes.

## Fase 6. Informe final

Debe entregar:

- Archivos modificados.
- Archivos creados.
- KPIs implementados.
- Fórmulas utilizadas.
- Endpoints utilizados o agregados.
- Cambios de base de datos.
- Pruebas ejecutadas.
- Resultados obtenidos.
- Limitaciones.
- Funcionalidades pendientes.

---

# 9. Criterios de finalización

La funcionalidad se considerará terminada cuando:

1. El administrador pueda acceder a Inteligencia Académica.
2. Se visualicen los indicadores generales.
3. Se muestre la cantidad de estudiantes por curso.
4. Se identifiquen los cursos más populares.
5. Se pueda consultar la evolución de inscripciones.
6. Se muestren los resultados de las evaluaciones.
7. Se identifiquen preguntas con mayor dificultad.
8. Se identifiquen temas con mayor dificultad.
9. Se puedan visualizar estudiantes destacados.
10. Se puedan identificar estudiantes que necesitan reforzar determinados temas.
11. Se pueda consultar el rendimiento individual.
12. Se puedan aplicar filtros.
13. Los gráficos utilicen información real.
14. Los indicadores se calculen correctamente.
15. Los usuarios sin permisos no puedan acceder al panel.
16. La interfaz sea responsive.
17. No se hayan perdido datos ni funcionalidades existentes.
18. Las pruebas estén aprobadas.

---

# 10. Dudas abiertas

[NECESITA ACLARACIÓN] DU-01. ¿Los docentes podrán consultar las estadísticas de sus propios cursos o solamente el administrador tendrá acceso?

[NECESITA ACLARACIÓN] DU-02. ¿El ranking de estudiantes destacados debe considerar el promedio general o también la cantidad de cursos y evaluaciones completadas?

[NECESITA ACLARACIÓN] DU-03. ¿Quieres que el administrador pueda seleccionar un estudiante y consultar un historial completo de su rendimiento?

[NECESITA ACLARACIÓN] DU-04. ¿El análisis de cursos más solicitados debe considerar únicamente inscripciones o también búsquedas y visualizaciones?

[NECESITA ACLARACIÓN] DU-05. ¿Quieres que posteriormente el sistema utilice IA para sugerir qué contenidos debería mejorar un docente según los resultados de sus estudiantes?

Estas dudas deben resolverse durante el análisis o antes de implementar las funcionalidades correspondientes.

---

# 11. Instrucción inicial para la IA de programación

Lee completamente esta especificación y analiza el proyecto actual de Skylearn.

**NO COMIENCES A PROGRAMAR TODAVÍA.**

Primero quiero que investigues qué información académica ya almacena el sistema y qué datos pueden utilizarse para construir los indicadores solicitados.

No quiero que inventes métricas, estudiantes, cursos, resultados o estadísticas.

Quiero que compruebes cómo se relacionan actualmente los estudiantes con los cursos, cómo se almacenan las evaluaciones, cómo se registran las respuestas y cómo se identifican los temas de cada pregunta.

Después debes entregarme un informe técnico que indique:

1. Qué KPIs se pueden implementar inmediatamente con los datos actuales.
2. Qué KPIs necesitan información adicional.
3. Qué componentes existentes puedes reutilizar.
4. Qué archivos necesitas modificar.
5. Qué archivos nuevos necesitas crear.
6. Qué endpoints existentes utilizarás.
7. Si necesitas modificar la base de datos.
8. Qué fórmulas utilizarás para calcular cada indicador.
9. Qué riesgos existen.
10. En qué orden propones implementar todo.

No crees una nueva estructura de base de datos sin comprobar primero la existente.

No dupliques funcionalidades.

No modifiques las calificaciones ni las inscripciones actuales.

No elimines información.

No agregues IA, notificaciones ni módulos adicionales sin autorización.

**Primero analiza, después presenta la propuesta, espera mi autorización y finalmente implementa.**

El objetivo es convertir los datos que ya genera Skylearn en un sistema de inteligencia académica que permita al administrador tomar decisiones basadas en información real.