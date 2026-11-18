# SPEC-004 — Gestión y programación de reuniones en vivo por curso

## 1. Contexto y objetivo

Actualmente Skylearn permite que los estudiantes accedan a cursos, visualicen clases grabadas, realicen evaluaciones y utilicen herramientas de apoyo educativo. Se requiere incorporar una funcionalidad que permita a los docentes programar reuniones virtuales en vivo asociadas a los cursos que tienen asignados. El docente podrá establecer una fecha, hora, enlace de videoconferencia y descripción de los temas que se desarrollarán durante la reunión. Una vez publicada, la reunión aparecerá automáticamente en la página del curso correspondiente, en una sección ubicada después del contenido habitual del curso. Todos los estudiantes inscritos en ese curso podrán consultar la información y decidir voluntariamente si desean participar. La funcionalidad debe integrarse con los roles, permisos, cursos y relaciones de inscripción que ya existen en Skylearn, sin crear estructuras duplicadas ni modificar el funcionamiento de los módulos actuales.

## 2. Usuarios / actores

- **Docente:** Puede crear, programar, editar y cancelar reuniones de los cursos que tiene asignados, respetando sus permisos.
- **Estudiante:** Puede visualizar las reuniones de los cursos en los que está inscrito, consultar sus detalles e ingresar mediante el enlace proporcionado.
- **Administrador:** Puede consultar las reuniones programadas de la plataforma y gestionar su funcionamiento según sus permisos administrativos.
- **Sistema:** Gestiona la programación, almacenamiento, publicación, consulta y disponibilidad de las reuniones.

## 3. Historias de usuario

**H1. Crear reunión**

Como docente quiero crear una reunión para un curso que tengo asignado para organizar sesiones de aprendizaje en vivo.

**H2. Programar fecha y hora**

Como docente quiero establecer el día y la hora de una reunión para informar anticipadamente a mis estudiantes.

**H3. Agregar enlace de reunión**

Como docente quiero introducir un enlace de Google Meet para que los estudiantes puedan ingresar directamente a la videoconferencia.

**H4. Describir el contenido**

Como docente quiero escribir qué temas se desarrollarán durante la reunión para que los estudiantes sepan qué se tratará.

**H5. Publicar reunión**

Como docente quiero publicar una reunión para que todos los estudiantes inscritos en el curso puedan visualizarla.

**H6. Consultar reuniones**

Como estudiante quiero visualizar las reuniones programadas de mis cursos para conocer las próximas sesiones en vivo.

**H7. Consultar detalles**

Como estudiante quiero conocer la fecha, hora, docente, enlace y temas de una reunión para decidir si deseo participar.

**H8. Ingresar a reunión**

Como estudiante quiero presionar un botón para ingresar a la reunión mediante el enlace proporcionado por el docente.

**H9. Modificar reunión**

Como docente quiero modificar los datos de una reunión programada para corregir horarios, enlaces o contenidos.

**H10. Cancelar reunión**

Como docente quiero cancelar una reunión cuando no pueda realizarla para evitar que los estudiantes intenten ingresar a una sesión que ya no se llevará a cabo.

**H11. Consultar reuniones anteriores**

Como estudiante quiero consultar las reuniones anteriores del curso para conocer las actividades que se realizaron.

**H12. Mantener separación por cursos**

Como estudiante quiero visualizar únicamente las reuniones de los cursos en los que estoy inscrito para evitar confusiones con otros cursos.

---

# 4. Requisitos funcionales (criterios de aceptación en EARS)

## RF-01. Nuevo módulo de reuniones programadas

CUANDO un docente ingrese a la plataforma, EL SISTEMA DEBE permitir acceder a una funcionalidad denominada Reuniones programadas, siempre que tenga los permisos correspondientes.

La funcionalidad debe permitir:

- Consultar reuniones.
- Crear reuniones.
- Programar reuniones.
- Editar reuniones.
- Cancelar reuniones.
- Consultar reuniones anteriores.

Debe integrarse en la navegación actual del docente.

No se debe crear un segundo panel de gestión independiente.

## RF-02. Crear una reunión

CUANDO un docente seleccione Crear reunión, EL SISTEMA DEBE mostrar un formulario para registrar una nueva reunión.

El formulario debe contener los siguientes campos:

**1. Curso**

Permite seleccionar el curso al que estará asociada la reunión.

Solamente deben aparecer los cursos que el docente tenga asignados o sobre los cuales tenga permisos de gestión.

**2. Título de la reunión**

Campo obligatorio para identificar la sesión.

Ejemplo:

«Clase en vivo: Introducción a las bases de datos».

**3. Fecha**

Campo obligatorio para seleccionar el día de la reunión.

Ejemplo:

01/12/2026.

**4. Hora de inicio**

Campo obligatorio para establecer la hora de inicio.

Ejemplo:

19:00.

**5. Hora de finalización**

Campo para indicar la hora estimada de finalización.

Ejemplo:

20:30.

Este campo permitirá informar la duración prevista de la reunión.

**6. Enlace de reunión**

Campo obligatorio para introducir el enlace de la videoconferencia.

Ejemplo:

https://meet.google.com/xxx-xxxx-xxx

Debe aceptar enlaces de plataformas de videoconferencia compatibles.

**7. Descripción o agenda**

Campo obligatorio para explicar qué se desarrollará durante la reunión.

Ejemplo:

«Durante esta reunión estudiaremos los siguientes temas:

- Introducción a las bases de datos.
- Modelo entidad-relación.
- Creación de tablas.
- Relaciones entre tablas.
- Resolución de ejercicios prácticos».

**8. Botón Guardar reunión**

Registra la reunión y la publica para los estudiantes del curso seleccionado.

El formulario debe presentar validaciones antes de guardar.

## RF-03. Validación de reuniones

CUANDO el docente intente guardar una reunión, EL SISTEMA DEBE validar que todos los campos obligatorios estén completos.

Se deben verificar:

- Curso seleccionado.
- Título.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Enlace válido.
- Descripción.

SI falta un campo obligatorio, ENTONCES EL SISTEMA debe impedir el registro y mostrar un mensaje indicando qué información falta.

SI la hora de finalización es anterior o igual a la hora de inicio, ENTONCES EL SISTEMA debe rechazar la programación.

SI el enlace no tiene un formato permitido, ENTONCES EL SISTEMA debe impedir su publicación.

SI la fecha y hora seleccionadas ya pasaron, ENTONCES EL SISTEMA debe solicitar una nueva programación.

## RF-04. Asociación de reuniones con cursos

EL SISTEMA DEBE mantener una relación entre cada reunión y un único curso.

Cada reunión debe identificar:

- Identificador de la reunión.
- Identificador del curso.
- Identificador del docente responsable.
- Título.
- Descripción.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Enlace.
- Estado.
- Fecha de creación.
- Fecha de modificación.

La relación debe utilizar los identificadores existentes de cursos y usuarios.

No se deben crear reuniones globales que aparezcan automáticamente en todos los cursos.

## RF-05. Publicación de reuniones para estudiantes

CUANDO un docente guarde correctamente una reunión, EL SISTEMA DEBE hacerla visible para los estudiantes inscritos en el curso correspondiente.

Por ejemplo:

El docente de Bases de Datos programa una reunión para el 1 de diciembre de 2026 a las 19:00.

El sistema debe mostrar esa reunión a todos los estudiantes inscritos en Bases de Datos.

Los estudiantes de Programación, Redes u otros cursos no deben visualizarla, salvo que también estén inscritos en Bases de Datos.

La visibilidad debe depender de las relaciones de inscripción existentes.

No se deben crear registros individuales de reuniones para cada estudiante si basta con relacionar una reunión con el curso.

## RF-06. Sección de reuniones dentro del curso

CUANDO un estudiante ingrese a la página de un curso, EL SISTEMA DEBE mostrar una sección denominada:

**Reuniones en vivo**

Esta sección debe aparecer al final del contenido habitual del curso, después de las clases, lecciones o elementos que actualmente se muestran.

Debe presentar las reuniones correspondientes al curso actual.

Cada reunión debe mostrarse mediante una tarjeta que contenga:

- Título de la reunión.
- Nombre del docente.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Descripción.
- Estado.
- Botón para ingresar, cuando corresponda.

Ejemplo visual de contenido:

**Reuniones en vivo**

< Tarjeta de reunión >

Clase en vivo: Introducción a las bases de datos

<text>Docente: Juan Pérez</text>

<text>Fecha: 1 de diciembre de 2026</text>

<text>Horario: 19:00 - 20:30</text>

**Temas que se desarrollarán:**

- Modelo entidad-relación.
- Creación de tablas.
- Relaciones entre tablas.
- Ejercicios prácticos.

**Estado: Próxima reunión**

Botón: Ingresar a reunión.

</ Tarjeta de reunión >

Si no existen reuniones programadas, EL SISTEMA debe mostrar:

«Todavía no hay reuniones programadas para este curso».

La sección no debe alterar la estructura de las clases existentes.

## RF-07. Visualización de próximas reuniones

CUANDO un estudiante consulte las reuniones de un curso, EL SISTEMA DEBE ordenar las reuniones por fecha y hora, mostrando primero las próximas sesiones.

Debe identificar claramente:

- Próxima reunión.
- Reuniones futuras.
- Reuniones en curso.
- Reuniones finalizadas.
- Reuniones canceladas.

Las reuniones canceladas deben diferenciarse visualmente y no deben permitir el ingreso.

Las reuniones anteriores pueden permanecer visibles en un apartado de historial.

## RF-08. Consultar detalles de una reunión

CUANDO un estudiante seleccione una reunión, EL SISTEMA DEBE mostrar toda la información publicada por el docente.

Debe incluir:

- Nombre de la reunión.
- Curso.
- Docente.
- Fecha.
- Hora.
- Duración estimada.
- Descripción.
- Temas que se desarrollarán.
- Estado de la reunión.
- Enlace de acceso, cuando corresponda.

La información debe ser de solo lectura para los estudiantes.

## RF-09. Ingresar a la reunión

CUANDO un estudiante presione Ingresar a reunión, EL SISTEMA DEBE abrir el enlace externo proporcionado por el docente.

El enlace debe abrirse preferentemente en una nueva pestaña o mediante el mecanismo de apertura externa disponible en el dispositivo.

El sistema no debe reproducir ni alojar la videoconferencia dentro de Skylearn.

La videoconferencia se realizará mediante la plataforma externa correspondiente.

El estudiante debe poder decidir voluntariamente si desea ingresar.

No se debe obligar al estudiante a participar.

## RF-10. Disponibilidad del enlace

EL SISTEMA DEBE conservar el enlace registrado por el docente y presentarlo junto con los detalles de la reunión.

El botón de ingreso debe respetar el estado de la reunión.

La disponibilidad del botón debe seguir estas reglas:

- Próxima reunión: mostrar la opción de ingreso cuando esté habilitada según la configuración del sistema.
- Reunión en curso: permitir ingresar.
- Reunión finalizada: no presentar la opción de ingreso activo.
- Reunión cancelada: impedir el ingreso.

La disponibilidad no debe depender de que el docente tenga abierta la página de Skylearn.

La sesión de Meet o de otra plataforma será administrada externamente.

## RF-11. Editar una reunión

CUANDO el docente seleccione Editar reunión, EL SISTEMA DEBE permitir modificar los datos de una reunión que tenga autorización para gestionar.

Se podrán modificar:

- Título.
- Fecha.
- Hora de inicio.
- Hora de finalización.
- Enlace.
- Descripción.
- Temas que se desarrollarán.

Al guardar los cambios, EL SISTEMA debe actualizar la información visible para los estudiantes del curso.

Debe conservar el identificador de la reunión y su relación con el curso.

Si se modifica el curso asociado, el sistema debe actualizar la visibilidad según las nuevas relaciones y permisos, previa validación de la operación.

## RF-12. Cancelar una reunión

CUANDO el docente decida cancelar una reunión, EL SISTEMA DEBE solicitar confirmación antes de realizar la operación.

Una vez confirmada:

- La reunión debe cambiar a estado Cancelada.
- Debe dejar de mostrarse como una próxima reunión activa.
- Los estudiantes deben poder identificar que fue cancelada.
- El botón de ingreso debe quedar deshabilitado.
- Debe conservarse el registro de la reunión.

No se deben eliminar físicamente los registros de reuniones canceladas como comportamiento predeterminado.

## RF-13. Historial de reuniones

CUANDO una reunión haya finalizado, EL SISTEMA DEBE identificarla como reunión finalizada según su fecha y hora programadas.

Los estudiantes podrán consultar las reuniones anteriores en el historial del curso.

El historial debe mostrar:

- Título.
- Fecha.
- Docente.
- Descripción.
- Estado.

No se debe afirmar que una reunión fue grabada si no existe una grabación registrada.

No se debe crear automáticamente una grabación de Google Meet.

## RF-14. Gestión de reuniones del docente

CUANDO un docente ingrese a su sección de reuniones programadas, EL SISTEMA DEBE mostrar las reuniones que tiene permiso para gestionar.

Debe permitir:

- Consultar reuniones próximas.
- Consultar reuniones finalizadas.
- Consultar reuniones canceladas.
- Crear reuniones.
- Editar reuniones.
- Cancelar reuniones.

El docente no debe poder modificar reuniones de otros docentes salvo que tenga permisos administrativos para hacerlo.

## RF-15. Gestión administrativa

EL SISTEMA DEBE permitir que el administrador consulte las reuniones programadas de la plataforma.

Debe poder visualizar:

- Reuniones por curso.
- Reuniones por docente.
- Reuniones próximas.
- Reuniones finalizadas.
- Reuniones canceladas.

Las operaciones administrativas de modificación o cancelación deben respetar los permisos actuales.

No es obligatorio crear un panel administrativo independiente si el panel existente permite integrar esta funcionalidad.

## RF-16. Separación de reuniones por curso

EL SISTEMA DEBE garantizar que cada estudiante visualice únicamente las reuniones correspondientes a sus cursos.

Ejemplo:

- Estudiante A está inscrito en Bases de Datos y Programación.
- Docente de Bases de Datos programa una reunión.
- Docente de Programación programa otra reunión.

El estudiante A debe visualizar ambas reuniones en sus respectivos cursos.

Si un estudiante no está inscrito en Redes, no debe acceder a las reuniones privadas de ese curso.

La validación debe realizarse en el backend, no solamente en el frontend.

## RF-17. Fecha y hora

EL SISTEMA DEBE gestionar las fechas y horarios de acuerdo con la zona horaria configurada para la plataforma.

Debe garantizar:

- Almacenamiento consistente de fechas y horas.
- Visualización de horarios en la zona horaria correspondiente.
- Comparación correcta entre la hora actual y la hora programada.
- Identificación correcta de reuniones futuras y finalizadas.

Se debe evitar que una reunión programada para una hora determinada aparezca con una hora diferente debido a conversiones incorrectas de zona horaria.

## RF-18. Diseño responsive

CUANDO los usuarios accedan a la funcionalidad desde diferentes dispositivos, EL SISTEMA DEBE adaptar la interfaz automáticamente.

Debe funcionar correctamente en:

- Computadoras de escritorio.
- Portátiles.
- Tablets.
- Teléfonos Android.
- Teléfonos iOS.

Las tarjetas de reuniones deben reorganizarse para pantallas pequeñas.

Los botones de ingreso deben ser accesibles desde dispositivos táctiles.

Los formularios de programación deben adaptarse al tamaño de pantalla.

No debe existir desplazamiento horizontal innecesario.

## RF-19. Conservación de funcionalidades actuales

EL SISTEMA DEBE mantener todas las funcionalidades existentes relacionadas con:

- Cursos.
- Docentes.
- Estudiantes.
- Inscripciones.
- Roles.
- Permisos.
- Panel administrativo.
- Página de visualización de clases.

La incorporación de reuniones no debe modificar el funcionamiento de estos módulos.

---

# 5. Requisitos no funcionales

## RNF-01. Rendimiento

- Las reuniones deben cargarse de forma eficiente.
- Se deben consultar únicamente las reuniones del curso correspondiente.
- No se deben generar consultas individuales innecesarias para cada estudiante.
- Las consultas deben aprovechar las relaciones existentes.
- La sección de reuniones no debe ralentizar la carga del curso.

## RNF-02. Seguridad

- Solamente los docentes autorizados podrán crear reuniones.
- Los docentes solamente podrán gestionar sus cursos asignados.
- Los estudiantes solamente podrán consultar reuniones de cursos a los que tengan acceso.
- El backend debe validar todos los permisos.
- Los enlaces deben validarse antes de guardarse.
- No se deben permitir enlaces que utilicen protocolos inseguros como javascript:.
- Los enlaces externos deben abrirse utilizando mecanismos seguros.

## RNF-03. Integridad de información

Cada reunión debe estar relacionada con un curso y un docente existente.

No se deben generar reuniones sin curso asociado.

No se deben perder los datos de reuniones al modificar otros elementos del curso.

## RNF-04. Compatibilidad

La nueva funcionalidad debe integrarse con el frontend y backend actuales.

No debe cambiar el sistema de autenticación ni la estructura general de Skylearn.

## RNF-05. Diseño

La interfaz debe mantener la identidad visual de Skylearn, utilizando sus colores, componentes y estilos existentes.

Debe ser moderna, intuitiva y responsive.

## RNF-06. Mantenibilidad

Se deben reutilizar componentes, servicios, modelos y endpoints existentes cuando sea posible.

No se deben agregar dependencias innecesarias.

## RNF-07. Zona horaria

La aplicación debe manejar correctamente las fechas y horas de las reuniones, evitando errores de conversión entre el backend y los dispositivos de los usuarios.

---

# 6. Casos límite

**CE-01. Docente sin cursos asignados**

Si un docente no tiene cursos asignados, no debe poder crear reuniones para cursos que no administra.

**CE-02. Curso inexistente**

Si el curso asociado ya no existe o dejó de estar disponible, el sistema debe impedir la creación o actualización de la reunión.

**CE-03. Fecha pasada**

Si el docente selecciona una fecha y hora anteriores al momento actual, el sistema debe rechazar la programación.

**CE-04. Hora incorrecta**

Si la hora de finalización es anterior o igual a la hora de inicio, el sistema debe impedir guardar la reunión.

**CE-05. Enlace inválido**

Si el enlace no tiene un formato válido o utiliza un protocolo no permitido, el sistema debe rechazarlo.

**CE-06. Curso sin estudiantes**

Si el curso no tiene estudiantes inscritos, la reunión podrá programarse si el docente tiene permisos, pero no habrá estudiantes a quienes mostrarla.

**CE-07. Estudiante sin inscripción**

Si un estudiante intenta consultar directamente una reunión de un curso al que no está inscrito, el backend debe rechazar el acceso.

**CE-08. Reunión duplicada**

Si un docente programa dos reuniones similares para el mismo curso y horario, el sistema debe advertirle para evitar duplicaciones accidentales. No debe bloquear automáticamente reuniones distintas sin comprobar que realmente sean duplicadas.

**CE-09. Reunión modificada**

Si el docente cambia la fecha u hora, los estudiantes deben visualizar los nuevos datos y no conservar información desactualizada.

**CE-10. Reunión cancelada**

Si una reunión se cancela, debe seguir apareciendo identificada como cancelada en lugar de permitir el ingreso.

**CE-11. Reunión finalizada**

Si ya pasó la hora de finalización, el sistema debe identificarla como finalizada.

**CE-12. Cambio de inscripción**

Si un estudiante deja de estar inscrito en un curso, debe perder el acceso a las reuniones privadas correspondientes, respetando las reglas actuales de acceso.

**CE-13. Error de conexión**

Si ocurre un error al guardar una reunión, el sistema debe mostrar un mensaje y conservar los datos del formulario para reintentar.

**CE-14. Zona horaria**

Si el usuario accede desde otro dispositivo o zona horaria, la fecha y hora deben mostrarse de manera coherente con la configuración de la plataforma.

**CE-15. Muchos estudiantes**

Si un curso tiene cientos o miles de estudiantes, la reunión debe publicarse mediante una relación con el curso y no mediante la creación innecesaria de registros individuales para cada estudiante.

**CE-16. Reunión sin descripción**

El sistema debe impedir guardar una reunión sin la descripción obligatoria de los temas que se desarrollarán.

---

# 7. Fuera de alcance

En esta iteración NO se contempla:

1. Crear una plataforma de videoconferencias propia.
2. Implementar un servidor de videollamadas.
3. Integrar obligatoriamente la API de Google Meet.
4. Crear automáticamente reuniones en Google Meet.
5. Generar enlaces automáticamente.
6. Grabar las reuniones.
7. Almacenar videos de las reuniones.
8. Crear un chat durante las reuniones.
9. Implementar asistencia automática mediante reconocimiento facial.
10. Obligar a los estudiantes a participar.
11. Implementar un sistema de calificación por asistencia.
12. Crear un sistema de pagos para reuniones.
13. Crear reuniones globales para todos los cursos.
14. Crear notificaciones por correo o WhatsApp en esta iteración.
15. Cambiar el sistema de inscripción a cursos.
16. Crear una nueva estructura de roles.
17. Eliminar registros existentes.
18. Modificar funcionalidades ajenas al módulo de reuniones.

Cualquier funcionalidad adicional debe presentarse como una propuesta independiente antes de implementarse.

---

# 8. Protocolo obligatorio de trabajo para la IA de programación

**IMPORTANTE: SKYLEARN YA ESTÁ DESARROLLADO. NO SE DEBE PROGRAMAR ANTES DE ANALIZAR LA ESTRUCTURA EXISTENTE.**

## Fase 1. Análisis del proyecto

Antes de realizar cualquier modificación, la IA debe investigar:

1. Estructura del frontend.
2. Estructura del backend.
3. Sistema de autenticación.
4. Roles existentes.
5. Relación entre docentes y cursos.
6. Relación entre estudiantes y cursos.
7. Sistema de inscripciones.
8. Página actual de visualización de cursos.
9. Panel actual del docente.
10. Panel actual del administrador.
11. Servicios relacionados con cursos.
12. Endpoints existentes.
13. Estructura de la base de datos.
14. Componentes visuales reutilizables.

Debe identificar cómo se determina actualmente qué estudiantes pertenecen a cada curso.

No debe asumir que todos los docentes pueden administrar todos los cursos.

## Fase 2. Informe previo de modificaciones

Antes de programar debe presentar un informe con los siguientes apartados:

### A. Archivos que modificará

| Archivo | Modificación | Justificación |
|---|---|---|
| Archivo existente | Cambio propuesto | Motivo |

### B. Archivos nuevos

| Archivo | Funcionalidad | Justificación |
|---|---|---|
| Archivo nuevo | Responsabilidad | Motivo |

### C. Componentes existentes que reutilizará

Debe identificar qué componentes pueden reutilizarse para:

- Formularios.
- Selección de cursos.
- Tarjetas.
- Calendarios.
- Navegación.
- Paneles del docente.
- Visualización de cursos.

### D. Backend y API

Debe identificar:

- Endpoints existentes.
- Endpoints que pueden reutilizarse.
- Endpoints que necesitan modificaciones.
- Endpoints nuevos que sean realmente necesarios.
- Validaciones y permisos necesarios.

No debe inventar rutas ni duplicar servicios.

### E. Base de datos

Debe comprobar:

- Cómo se representan los cursos.
- Cómo se relacionan con docentes.
- Cómo se relacionan con estudiantes.
- Si existe algún módulo de eventos o actividades programadas.
- Si se necesita una nueva tabla o se puede reutilizar una estructura existente.

Debe explicar los cambios mínimos necesarios.

No debe ejecutar migraciones antes de recibir autorización.

### F. Riesgos

Debe identificar los riesgos relacionados con:

- Inscripciones.
- Roles.
- Permisos.
- Cursos.
- Docentes.
- Estudiantes.
- Navegación.
- Fechas y horarios.

### G. Plan de implementación

Debe presentar un orden de trabajo y las pruebas que realizará.

## Fase 3. Autorización

La IA debe esperar autorización explícita antes de modificar cualquier archivo.

No debe:

- Crear tablas.
- Ejecutar migraciones.
- Crear endpoints.
- Instalar dependencias.
- Modificar componentes.
- Eliminar código.
- Cambiar permisos.

Sin autorización.

Si necesita ampliar el alcance aprobado, debe detenerse y solicitar autorización.

## Fase 4. Implementación controlada

Una vez autorizada:

1. Implementar únicamente lo aprobado.
2. Reutilizar la estructura existente.
3. Mantener los roles y permisos actuales.
4. Utilizar las relaciones existentes entre docentes y cursos.
5. Utilizar las relaciones existentes entre estudiantes y cursos.
6. Crear únicamente los componentes necesarios.
7. Mantener el diseño responsive.
8. No duplicar funcionalidades.
9. No eliminar información.
10. No cambiar módulos que no estén relacionados con esta funcionalidad.

## Fase 5. Validación

Debe comprobar:

- Creación de reuniones.
- Validación de fechas.
- Validación de horarios.
- Validación de enlaces.
- Asociación correcta con cursos.
- Permisos del docente.
- Visibilidad para estudiantes inscritos.
- Restricción para estudiantes no inscritos.
- Visualización en la página del curso.
- Funcionamiento del enlace externo.
- Edición de reuniones.
- Cancelación de reuniones.
- Identificación de reuniones finalizadas.
- Diseño responsive.

También debe verificar que las funcionalidades anteriores de Skylearn sigan funcionando.

## Fase 6. Informe final

Al finalizar debe entregar:

- Archivos modificados.
- Archivos nuevos.
- Funcionalidades implementadas.
- Endpoints utilizados o agregados.
- Cambios en base de datos.
- Pruebas ejecutadas.
- Resultados.
- Errores pendientes.
- Limitaciones identificadas.

---

# 9. Criterios de finalización

La funcionalidad se considerará terminada cuando:

1. El docente pueda crear reuniones.
2. Pueda seleccionar uno de sus cursos asignados.
3. Pueda establecer fecha y hora.
4. Pueda establecer duración mediante hora de finalización.
5. Pueda introducir un enlace de videoconferencia.
6. Pueda describir los temas de la reunión.
7. Pueda publicar la reunión.
8. Los estudiantes inscritos puedan visualizarla.
9. Los estudiantes de otros cursos no puedan acceder a reuniones privadas.
10. Las reuniones aparezcan al final de la página del curso.
11. Los estudiantes puedan consultar todos los detalles.
12. Los estudiantes puedan ingresar mediante el enlace.
13. El docente pueda editar sus reuniones.
14. El docente pueda cancelar reuniones.
15. Las reuniones canceladas se identifiquen correctamente.
16. Las reuniones finalizadas se identifiquen correctamente.
17. Se mantenga el historial de reuniones.
18. El diseño sea responsive.
19. Se respeten los roles y permisos existentes.
20. No se hayan eliminado datos ni funcionalidades anteriores.
21. Todas las pruebas correspondientes estén aprobadas.

---

# 10. Dudas abiertas

[NECESITA ACLARACIÓN] DU-01. ¿El docente podrá programar varias reuniones para un mismo curso?

[NECESITA ACLARACIÓN] DU-02. ¿Quieres que las reuniones tengan un botón para que los estudiantes confirmen su asistencia o solamente puedan consultar la información y entrar voluntariamente?

[NECESITA ACLARACIÓN] DU-03. ¿Quieres que el sistema envíe notificaciones cuando el docente publique o modifique una reunión, o por ahora basta con mostrarla dentro del curso?

[NECESITA ACLARACIÓN] DU-04. ¿Las reuniones finalizadas deben permanecer visibles únicamente en el historial del curso o también en la sección principal?

[NECESITA ACLARACIÓN] DU-05. ¿El docente debe poder programar reuniones para cualquier fecha futura o quieres limitar la programación a un período determinado?

[NECESITA ACLARACIÓN] DU-06. ¿El administrador debe poder editar y cancelar las reuniones de cualquier docente?

Estas dudas deben resolverse antes de implementar los comportamientos correspondientes. No se deben agregar funcionalidades adicionales sin autorización.

---

# 11. Instrucción inicial para la IA de programación

Lee completamente esta especificación y analiza el proyecto actual de Skylearn.

**NO COMIENCES A PROGRAMAR TODAVÍA.**

Primero quiero que investigues cómo están organizados actualmente los docentes, estudiantes, cursos e inscripciones.

Necesito que compruebes cómo se determina qué docente administra un curso y qué estudiantes están inscritos en él.

Después debes presentarme un informe técnico indicando:

1. Cómo implementarías la programación de reuniones.
2. Qué componentes actuales puedes reutilizar.
3. Qué archivos necesitas modificar.
4. Qué archivos nuevos necesitas crear.
5. Qué endpoints existentes puedes aprovechar.
6. Qué endpoints nuevos serían necesarios.
7. Si necesitas modificar la base de datos.
8. Cómo garantizarás que cada reunión aparezca únicamente en su curso correspondiente.
9. Cómo controlarás los permisos.
10. Cómo gestionarás correctamente las fechas y horas.
11. Qué riesgos existen para el funcionamiento actual.
12. En qué orden propones realizar la implementación.

No inventes archivos, endpoints, tablas ni funcionalidades.

No dupliques relaciones que ya existen.

No crees una plataforma de videoconferencias propia.

No agregues notificaciones, asistencia u otras funcionalidades sin autorización.

No elimines información ni modifiques módulos ajenos al alcance.

**Primero analiza, después presenta tu propuesta, espera mi autorización y finalmente implementa.**

El objetivo es ampliar Skylearn con reuniones virtuales programadas por curso, manteniendo la estructura y todas las funcionalidades que ya están desarrolladas.