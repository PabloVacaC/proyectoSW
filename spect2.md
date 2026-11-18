# SPEC-002 — Modernización del reproductor de clases, comentarios y navegación de lecciones de Skylearn

## 1. Contexto y objetivo

Actualmente Skylearn cuenta con una pantalla de visualización de clases que permite reproducir videos, visualizar evaluaciones formativas, consultar recursos y acceder al Docente Virtual. Sin embargo, se busca mejorar la experiencia de aprendizaje incorporando una interfaz más moderna, organizada, interactiva y adaptable a diferentes dispositivos.

La nueva propuesta toma como referencia una plataforma educativa moderna, donde el contenido audiovisual tiene protagonismo y existe un espacio lateral para la interacción entre estudiantes.

El objetivo es incorporar un sistema de comentarios compartidos por lección, permitir que los usuarios participen en conversaciones sobre el contenido educativo, facilitar la navegación entre las clases de un curso y mejorar la distribución visual de los elementos existentes.

Se debe conservar toda la funcionalidad actual de Skylearn, incluyendo el reproductor, las evaluaciones, los recursos, el progreso, los créditos, el Docente Virtual y los permisos de los usuarios.

**IMPORTANTE:** Esta funcionalidad debe desarrollarse sobre el sistema existente. No se debe reconstruir el reproductor ni crear módulos paralelos innecesarios. Antes de realizar cualquier modificación, la IA de programación deberá analizar el proyecto y presentar una propuesta detallada de los cambios para obtener autorización.

---

## 2. Usuarios / actores

- **Estudiante:** Puede reproducir las clases, consultar los comentarios, publicar comentarios, responder a otros usuarios y navegar entre las lecciones disponibles.
- **Docente:** Puede visualizar las interacciones de los estudiantes y participar en los comentarios, siempre que sus permisos actuales lo permitan.
- **Administrador:** Puede acceder a las funcionalidades administrativas y gestionar el contenido según los permisos existentes.
- **Usuario autenticado:** Puede participar en los comentarios de las lecciones a las que tenga acceso.
- **Sistema:** Gestiona los comentarios, las respuestas, la navegación, los estados de las clases y la información presentada en pantalla.

Los comentarios deben ser compartidos entre los usuarios que tengan acceso a una misma lección. No deben existir conversaciones independientes para cada estudiante.

---

## 3. Historias de usuario

**H1. Visualización de clases**

Como estudiante quiero visualizar el video de una lección en una interfaz moderna para concentrarme en el contenido educativo.

**H2. Publicar comentarios**

Como estudiante quiero escribir comentarios debajo de una clase para compartir mis opiniones, dudas y aportes sobre el contenido.

**H3. Consultar comentarios**

Como estudiante quiero visualizar los comentarios publicados por otros usuarios para aprender de sus experiencias y resolver dudas.

**H4. Responder comentarios**

Como estudiante quiero responder a un comentario existente para participar en una conversación sobre la lección.

**H5. Identificar autores**

Como estudiante quiero visualizar el nombre y la información pública del usuario que publicó un comentario para identificar quién realizó el aporte.

**H6. Consultar cantidad de comentarios**

Como estudiante quiero visualizar la cantidad de comentarios de una lección para conocer el nivel de participación.

**H7. Navegar entre clases**

Como estudiante quiero tener un botón para visualizar todas las clases del curso actual y seleccionar la que deseo reproducir.

**H8. Siguiente clase**

Como estudiante quiero avanzar directamente a la siguiente lección para continuar mi aprendizaje sin regresar manualmente al temario.

**H9. Identificar última clase**

Como estudiante quiero que el sistema identifique cuando estoy en la última lección para evitar intentar avanzar a una clase inexistente.

**H10. Conservar evaluaciones**

Como estudiante quiero seguir utilizando las evaluaciones formativas existentes para comprobar mis conocimientos después de visualizar una lección.

**H11. Diseño adaptable**

Como estudiante quiero utilizar la plataforma desde una computadora, tablet o celular para acceder a mis clases desde cualquier dispositivo.

**H12. Conservar funcionalidades**

Como responsable del sistema quiero que las nuevas funcionalidades se integren con los módulos actuales para evitar pérdida de información o errores en el funcionamiento.

**H13. Integridad de comentarios**

Como administrador quiero que los comentarios estén relacionados con su autor y su lección correspondiente para mantener la integridad de la información.

---

# 4. Requisitos funcionales (criterios de aceptación en EARS)

## RF-01. Rediseño de la pantalla de visualización de clases

CUANDO un estudiante ingrese a una lección, EL SISTEMA DEBE mostrar una interfaz moderna, organizada y adaptable, conservando los elementos funcionales actuales.

La distribución de escritorio debe contemplar:

**A. Barra superior**

- Logotipo de Skylearn.
- Botón Cursos disponibles, si corresponde a la navegación actual.
- Acceso al Docente Virtual.
- Indicador de créditos, si actualmente existe.
- Selector de perfil o rol, respetando el funcionamiento actual.

**B. Área principal**

- Reproductor de video.
- Nombre de la lección.
- Nombre del curso.
- Sección de recursos.
- Evaluación formativa, si existe para esa lección.

**C. Panel lateral**

- Sección Pregúntame tus dudas, si ya existe esa funcionalidad.
- Sección Comentarios.
- Campo para escribir un comentario.
- Listado de comentarios.
- Opciones para responder y realizar las acciones permitidas.

**D. Barra inferior**

- Identificación de la clase actual.
- Número de clase y cantidad total de lecciones.
- Nombre del curso.
- Botón Clases.
- Botón Siguiente clase.

El diseño debe mantener la identidad visual de Skylearn, utilizando fondos oscuros, azul eléctrico, morado y componentes modernos.

No se deben eliminar elementos existentes que no estén expresamente contemplados en esta especificación.

## RF-02. Reproductor de video

CUANDO el estudiante ingrese a una lección, EL SISTEMA DEBE cargar el video correspondiente utilizando el mecanismo de reproducción que ya existe.

Debe conservar:

- Fuente del video.
- Controles de reproducción.
- Reproducción y pausa.
- Control de volumen.
- Pantalla completa.
- Integración con plataformas externas, si actualmente existe.
- Registro de progreso, si está implementado.

El rediseño visual no debe alterar la lógica de reproducción.

SI el video no puede cargarse, ENTONCES EL SISTEMA debe mostrar un mensaje indicando que no fue posible reproducirlo.

## RF-03. Sistema de comentarios por lección

CUANDO un usuario autenticado ingrese a una lección, EL SISTEMA DEBE mostrar una sección de comentarios compartidos correspondiente exclusivamente a esa lección.

La sección debe contener:

- Título Comentarios.
- Cantidad total de comentarios.
- Campo para escribir un comentario.
- Botón para publicar.
- Listado de comentarios existentes.
- Información del autor.
- Fecha de publicación.
- Opción para responder.

Los comentarios deben ser visibles para todos los usuarios que tengan autorización para acceder a la misma lección.

Los comentarios deben estar relacionados con:

- Identificador del comentario.
- Identificador del usuario que lo publicó.
- Identificador de la lección.
- Contenido del comentario.
- Fecha de creación.
- Fecha de modificación, cuando corresponda.
- Identificador del comentario padre, cuando sea una respuesta.

La IA debe investigar primero si ya existe alguna estructura de comentarios que pueda reutilizarse.

No debe crear una tabla o módulo duplicado si ya existe uno funcional.

## RF-04. Publicación de comentarios

CUANDO un usuario escriba un comentario y presione el botón Publicar, EL SISTEMA DEBE validar el contenido y registrar el comentario asociado al usuario y a la lección actual.

El sistema debe:

1. Verificar que el usuario esté autenticado.
2. Verificar que tenga acceso a la lección.
3. Verificar que el comentario no esté vacío.
4. Validar la longitud permitida.
5. Registrar el comentario.
6. Actualizar la cantidad de comentarios.
7. Mostrar el nuevo comentario en la conversación.

El comentario debe aparecer sin necesidad de recargar toda la página.

SI el comentario está vacío o contiene únicamente espacios, ENTONCES EL SISTEMA debe impedir su publicación.

SI ocurre un error al guardar el comentario, ENTONCES EL SISTEMA debe informar del problema y conservar el texto escrito para que el usuario pueda intentarlo nuevamente.

## RF-05. Comentarios compartidos

EL SISTEMA DEBE mantener una única conversación compartida por cada lección.

Esto significa que:

- Si un estudiante publica un comentario, los demás usuarios autorizados podrán visualizarlo.
- Si un docente publica un comentario, los estudiantes autorizados podrán visualizarlo.
- Si otro usuario responde, la respuesta debe aparecer en la misma conversación.
- Los comentarios de una lección no deben aparecer en otra lección.
- Los comentarios deben conservarse al salir y volver a ingresar.

Los comentarios no deben almacenarse únicamente en el navegador del usuario.

La información debe persistir en el backend y en el mecanismo de almacenamiento existente.

## RF-06. Responder comentarios

CUANDO un usuario seleccione Responder en un comentario, EL SISTEMA DEBE permitir escribir una respuesta relacionada con ese comentario.

Cada respuesta debe identificar:

- Usuario que responde.
- Comentario al que responde.
- Lección correspondiente.
- Contenido de la respuesta.
- Fecha de publicación.

Las respuestas deben mostrarse debajo del comentario original, con una separación visual que permita identificar la conversación.

Se debe evitar que las respuestas aparezcan como comentarios independientes sin relación.

Para esta primera iteración se debe utilizar un único nivel de respuestas, salvo que el sistema ya tenga una estructura de conversaciones más avanzada que pueda reutilizarse.

## RF-07. Edición y eliminación de comentarios

CUANDO un usuario solicite editar uno de sus comentarios, EL SISTEMA DEBE permitir la modificación únicamente si cumple los permisos existentes.

CUANDO un usuario solicite eliminar un comentario propio, EL SISTEMA DEBE solicitar confirmación antes de realizar la operación.

Las siguientes condiciones deben cumplirse:

- Un estudiante no debe modificar comentarios de otros estudiantes.
- Un usuario no debe eliminar comentarios ajenos.
- El administrador podrá realizar acciones de moderación únicamente si sus permisos actuales lo permiten.
- La eliminación de un comentario principal debe contemplar las respuestas asociadas.
- Se debe evitar dejar respuestas sin contexto.

Si ya existe un sistema de moderación, se debe reutilizar.

No se debe implementar un módulo administrativo nuevo de moderación sin presentar primero una propuesta.

## RF-08. Visualización y actualización de comentarios

CUANDO un usuario abra la sección de comentarios, EL SISTEMA DEBE consultar los comentarios existentes de la lección actual.

La consulta debe permitir:

- Mostrar los comentarios más recientes o utilizar el orden que ya tenga establecido el sistema.
- Mostrar la información del autor.
- Mostrar las respuestas correspondientes.
- Consultar la cantidad de comentarios.
- Cargar más comentarios cuando existan muchos registros.

La carga de comentarios debe ser independiente de la reproducción del video.

La publicación de un comentario no debe reiniciar el video ni provocar una recarga completa de la pantalla.

Si existe actualización en tiempo real mediante WebSocket u otra tecnología, se debe analizar su reutilización. No se debe incorporar una nueva infraestructura de tiempo real sin justificar su necesidad.

## RF-09. Formato JSON para comentarios

EL SISTEMA DEBE utilizar respuestas estructuradas en JSON en la comunicación entre frontend y backend, respetando el estándar y los mecanismos existentes del proyecto.

Ejemplo orientativo de respuesta:

```json
{
  "lesson_id": 15,
  "total_comments": 2,
  "comments": [
    {
      "id": 101,
      "user": {
        "id": 8,
        "name": "Carlos"
      },
      "content": "Me pareció interesante esta explicación.",
      "created_at": "2026-11-18T10:30:00",
      "replies": [
        {
          "id": 102,
          "user": {
            "id": 12,
            "name": "María"
          },
          "content": "Estoy de acuerdo.",
          "created_at": "2026-11-18T10:35:00"
        }
      ]
    }
  ]
}
```

Este ejemplo es una referencia del formato de intercambio, no una obligación de crear nuevos endpoints con esos nombres.

**Consideración técnica sobre el almacenamiento:**

No se debe guardar toda la conversación como un único documento JSON solamente con la intención de acelerar el sistema.

Se recomienda:

- Mantener los comentarios como registros independientes en la estructura de almacenamiento existente.
- Utilizar JSON para las respuestas de las API.
- Mantener las relaciones entre comentarios, usuarios y lecciones.
- Consultar los comentarios mediante paginación.
- Evitar devolver conversaciones completas cuando no sean necesarias.

Si el proyecto utiliza PostgreSQL, la IA debe evaluar las estructuras relacionales y los índices necesarios antes de proponer cambios.

Si ya existe un mecanismo adecuado, debe reutilizarlo.

## RF-10. Botón Clases

CUANDO el estudiante presione el botón Clases ubicado en la barra inferior, EL SISTEMA DEBE mostrar un listado de todas las lecciones pertenecientes al curso actual.

El listado debe incluir, según la información disponible:

- Número de lección.
- Nombre de la lección.
- Estado de la lección.
- Indicador de clase actual.
- Duración, si existe.
- Indicador de progreso, si existe.

El listado debe permitir identificar claramente qué clase se está visualizando.

Al seleccionar una lección, el sistema debe navegar a ella respetando las reglas de acceso y disponibilidad existentes.

No se deben mostrar clases de otros cursos en este listado.

El botón debe permitir abrir y cerrar el listado sin perder innecesariamente el estado de reproducción de la clase actual.

La presentación puede utilizar un panel lateral, menú desplegable o modal, dependiendo de la arquitectura y del diseño responsive.

## RF-11. Botón Siguiente clase

CUANDO el estudiante esté visualizando una lección y exista otra lección disponible después de la actual, EL SISTEMA DEBE permitir avanzar mediante el botón Siguiente clase.

Al presionarlo:

1. Identificar la siguiente lección del curso.
2. Verificar que el estudiante tenga acceso.
3. Cargar la siguiente lección.
4. Actualizar el título y número de clase.
5. Actualizar el reproductor.
6. Actualizar los comentarios correspondientes.
7. Actualizar los recursos y evaluaciones de la nueva lección.

La navegación debe respetar el orden real de las clases definido en el sistema.

No debe utilizar identificadores consecutivos como sustituto del orden de las lecciones.

## RF-12. Comportamiento cuando no existen más lecciones

SI el estudiante se encuentra en la última lección del curso, ENTONCES EL SISTEMA debe identificar que no existe una siguiente lección disponible.

En ese caso:

- El botón Siguiente clase debe quedar deshabilitado o no mostrarse, según el diseño aprobado.
- No debe ejecutar una navegación inválida.
- Debe evitar mostrar errores.
- Debe conservar disponible el botón Clases.

No se deben inventar lecciones ni redirigir al estudiante a otro curso automáticamente.

## RF-13. Navegación anterior

SI existe una lección anterior dentro del curso, EL SISTEMA puede ofrecer la opción de regresar a ella mediante un control de navegación.

Esta funcionalidad debe respetar el orden existente de las lecciones.

Si el sistema ya dispone de esta opción, se debe conservar.

No es obligatorio implementar un nuevo mecanismo si actualmente existe una navegación equivalente.

## RF-14. Conservación de evaluaciones formativas

EL SISTEMA DEBE mantener el funcionamiento actual de las evaluaciones relacionadas con cada lección.

Se debe conservar:

- Preguntas.
- Opciones de respuesta.
- Validación de respuestas.
- Resultados.
- Calificaciones o porcentajes.
- Indicadores de aprobación.
- Botón Volver a intentar.
- Registro de resultados, si existe.

Los comentarios no deben interferir con las evaluaciones.

Al cambiar de clase, las preguntas deben corresponder exclusivamente a la nueva lección.

No se deben perder resultados anteriores.

## RF-15. Conservación del Docente Virtual

EL SISTEMA DEBE mantener el acceso al Docente Virtual y sus funcionalidades actuales.

La nueva interfaz debe permitir acceder a esta funcionalidad sin interferir con el reproductor ni con los comentarios.

No se debe crear otro asistente de IA si ya existe uno integrado.

## RF-16. Conservación de recursos

EL SISTEMA DEBE mantener la sección de recursos correspondiente a cada lección.

Los recursos deben seguir vinculados a la clase correspondiente.

Si el usuario cambia de lección, los recursos mostrados deben actualizarse.

No se deben mezclar recursos de diferentes lecciones.

## RF-17. Registro de progreso

MIENTRAS el estudiante visualice una lección, EL SISTEMA DEBE conservar el mecanismo actual de seguimiento de progreso.

Al cambiar de clase, se debe mantener la información registrada de las lecciones anteriores.

No se deben reiniciar porcentajes, avances, créditos ni estados de finalización por el simple hecho de rediseñar la interfaz.

## RF-18. Diseño responsive

CUANDO el estudiante utilice Skylearn desde diferentes dispositivos, EL SISTEMA DEBE adaptar automáticamente la distribución de los componentes.

**En computadoras:**

- Reproductor en la zona principal.
- Panel de comentarios en el lateral derecho.
- Recursos debajo del reproductor.
- Evaluaciones en la distribución actual o una disposición optimizada.
- Barra inferior con información de la clase y navegación.

**En tablets:**

- Reproductor con ancho adaptable.
- Panel de comentarios reorganizado debajo o en un panel desplegable.
- Botones de navegación accesibles.
- Evaluaciones y recursos sin desbordamientos.

**En celulares:**

- Reproductor ocupando el ancho disponible.
- Nombre de la lección debajo del video.
- Botones Clases y Siguiente clase accesibles.
- Comentarios debajo del contenido o mediante un panel desplegable.
- Campo para escribir comentarios adaptado al ancho.
- Evaluaciones organizadas verticalmente.
- Recursos accesibles desde la misma pantalla.

No se debe obligar al usuario a utilizar desplazamiento horizontal.

Los botones deben tener un tamaño adecuado para pantallas táctiles.

## RF-19. Acceso y permisos

EL SISTEMA DEBE respetar las reglas actuales de autenticación y autorización.

Los usuarios solamente podrán comentar en las lecciones a las que tengan acceso.

Los visitantes no autenticados no podrán publicar comentarios.

Si el sistema tiene reglas de acceso basadas en créditos, inscripciones o roles, estas deben mantenerse.

No se deben modificar los permisos existentes para facilitar la implementación.

---

# 5. Requisitos no funcionales

## RNF-01. Rendimiento

- Los comentarios deben cargarse de manera eficiente.
- No se debe descargar toda la conversación si existen muchos comentarios.
- Utilizar paginación o carga progresiva.
- Evitar recargar toda la página al publicar una respuesta.
- No bloquear la reproducción del video mientras se consultan comentarios.
- Evitar solicitudes innecesarias al backend.

## RNF-02. Seguridad

- Validar comentarios en frontend y backend.
- Evitar inyección de código y ataques XSS.
- Proteger las operaciones de edición y eliminación.
- Verificar la identidad del usuario en el backend.
- No confiar únicamente en el identificador enviado desde el frontend.
- Aplicar las reglas de autorización existentes.
- Evitar exponer correos electrónicos, tokens u otros datos privados.

## RNF-03. Integridad de información

Cada comentario debe conservar su relación con el usuario y la lección.

No se deben perder comentarios al cambiar de clase, cerrar sesión o actualizar la página.

## RNF-04. Diseño responsive

La interfaz debe funcionar en:

- Computadoras de escritorio.
- Portátiles.
- Tablets.
- Teléfonos Android.
- Teléfonos iOS.

## RNF-05. Idioma

La interfaz debe estar en español.

## RNF-06. Mantenibilidad

Los nuevos componentes deben respetar la organización actual del proyecto.

No se deben duplicar servicios, modelos, controladores o funcionalidades existentes.

## RNF-07. Compatibilidad

La nueva interfaz debe ser compatible con el reproductor, backend, sistema de autenticación, evaluaciones y módulos actuales.

## RNF-08. Persistencia

Los comentarios deben conservarse permanentemente según las políticas actuales de almacenamiento y eliminación del sistema.

No deben depender exclusivamente de almacenamiento local del navegador.

---

# 6. Casos límite

**CE-01. Comentario vacío**

Si un usuario intenta publicar un comentario vacío, el sistema debe impedirlo.

**CE-02. Comentario demasiado largo**

Si el contenido supera el límite permitido, el sistema debe mostrar una validación y evitar el envío.

**CE-03. Usuario sin autenticación**

Si un visitante intenta comentar, el sistema debe solicitar autenticación.

**CE-04. Usuario sin acceso a la lección**

Si un usuario intenta publicar un comentario en una lección a la que no tiene acceso, el backend debe rechazar la operación.

**CE-05. Error al publicar**

Si falla la conexión con el backend, el sistema debe conservar el contenido escrito y permitir reintentar.

**CE-06. Muchos comentarios**

Si una lección tiene cientos o miles de comentarios, el sistema debe cargarlos progresivamente.

**CE-07. Comentario eliminado**

Si se elimina un comentario principal que contiene respuestas, el sistema debe mantener la integridad de la conversación y aplicar la política de eliminación definida.

**CE-08. Comentario duplicado**

Si el usuario presiona varias veces el botón Publicar debido a una respuesta lenta, el sistema debe evitar publicaciones duplicadas accidentales.

**CE-09. Lección sin comentarios**

Si una lección no tiene comentarios, el sistema debe mostrar un mensaje como «Todavía no hay comentarios. ¡Sé el primero en participar!».

**CE-10. Curso sin lecciones**

Si un curso no tiene lecciones disponibles, el sistema debe mostrar un mensaje apropiado y no presentar botones de navegación que no puedan funcionar.

**CE-11. Última lección**

Si el estudiante está en la última lección, el botón Siguiente clase debe quedar deshabilitado o desaparecer.

**CE-12. Primera lección**

Si el estudiante está en la primera lección, no debe intentar navegar a una lección anterior inexistente.

**CE-13. Cambio de lección**

Al cambiar de lección, los comentarios, video, recursos y evaluaciones deben corresponder a la nueva clase.

**CE-14. Actualización del navegador**

Si el usuario actualiza la página, debe recuperar la lección correspondiente y sus comentarios.

**CE-15. Lección eliminada o deshabilitada**

Si una lección deja de estar disponible, el sistema debe manejar el acceso de acuerdo con las reglas actuales sin provocar errores de navegación.

**CE-16. Dispositivo móvil**

Si el ancho de pantalla es reducido, los comentarios, videos, botones y evaluaciones deben adaptarse sin superponerse.

**CE-17. Concurrencia**

Si varios usuarios publican comentarios simultáneamente, todos los registros deben conservarse sin sobrescribir los anteriores.

---

# 7. Fuera de alcance

En esta iteración NO se contempla:

1. Reconstruir el reproductor de video desde cero.
2. Cambiar la plataforma de alojamiento de videos.
3. Crear un nuevo sistema de cursos.
4. Crear una nueva base de datos independiente.
5. Cambiar el sistema de autenticación.
6. Modificar el funcionamiento de los créditos.
7. Cambiar las reglas de inscripción.
8. Reemplazar las evaluaciones existentes.
9. Eliminar el Docente Virtual.
10. Crear una infraestructura nueva de WebSockets sin necesidad comprobada.
11. Crear un sistema de chat privado entre estudiantes.
12. Implementar mensajes privados.
13. Crear notificaciones push.
14. Implementar un sistema avanzado de moderación si no existe actualmente.
15. Cambiar la estructura de almacenamiento de videos.
16. Eliminar o modificar registros existentes.
17. Guardar toda la conversación como un único JSON para sustituir las relaciones de datos.
18. Modificar otros módulos que no estén relacionados con esta funcionalidad.

Cualquier funcionalidad adicional deberá presentarse como propuesta independiente antes de implementarse.

---

# 8. Protocolo obligatorio de trabajo para la IA de programación

**ESTA SECCIÓN ES OBLIGATORIA. LA IA NO DEBE COMENZAR A PROGRAMAR HASTA RECIBIR AUTORIZACIÓN.**

El proyecto Skylearn ya está desarrollado. La IA debe comprender su estructura antes de proponer modificaciones.

## Fase 1. Análisis del proyecto existente

Antes de modificar código debe investigar:

1. Estructura del frontend.
2. Estructura del backend.
3. Tecnología utilizada para reproducir los videos.
4. Componente actual de visualización de clases.
5. Sistema de navegación de cursos y lecciones.
6. Estructura de cursos y lecciones.
7. Sistema de autenticación.
8. Sistema de usuarios y roles.
9. Sistema actual de comentarios, si existe.
10. Servicios y endpoints relacionados con lecciones.
11. Sistema de evaluaciones formativas.
12. Recursos vinculados a las lecciones.
13. Docente Virtual.
14. Seguimiento del progreso.
15. Relaciones actuales de la base de datos.

Debe identificar si ya existe algún componente que permita realizar parte de lo solicitado.

No debe asumir que una funcionalidad no existe simplemente porque no la encuentra en la primera carpeta que revise.

## Fase 2. Informe de cambios propuestos

Antes de implementar debe presentar:

### A. Archivos que modificará

| Archivo | Cambio propuesto | Justificación |
|---|---|---|
| Archivo existente | Descripción concreta | Motivo técnico |

### B. Archivos nuevos

| Archivo | Responsabilidad | Justificación |
|---|---|---|
| Archivo nuevo | Funcionalidad | Por qué es necesario |

No debe crear archivos innecesarios.

### C. Componentes existentes que reutilizará

Debe indicar qué componentes actuales utilizará para:

- Reproductor.
- Comentarios.
- Evaluaciones.
- Navegación.
- Recursos.
- Docente Virtual.
- Progreso.

### D. Backend y API

Debe identificar:

- Endpoints existentes que reutilizará.
- Endpoints que necesitan modificaciones.
- Endpoints nuevos que realmente sean necesarios.
- Validaciones que deben agregarse.
- Autorizaciones necesarias.

No debe inventar rutas ni reemplazar endpoints sin justificación.

### E. Base de datos

Debe explicar:

- Cómo se almacenan actualmente los comentarios, si existe esa estructura.
- Cómo se relacionan los usuarios con las lecciones.
- Si es necesario agregar campos o tablas.
- Qué índices serían útiles.
- Si se necesita una migración.

Si no es necesario modificar la base de datos, debe indicarlo expresamente.

No debe ejecutar migraciones antes de recibir autorización.

### F. Riesgos

Debe identificar los posibles efectos sobre:

- Reproducción de videos.
- Progreso del estudiante.
- Evaluaciones.
- Créditos.
- Permisos.
- Recursos.
- Docente Virtual.
- Navegación de cursos.

### G. Estrategia de implementación

Debe explicar el orden de trabajo y cómo evitará afectar los módulos actuales.

## Fase 3. Autorización

La IA debe esperar la autorización explícita del responsable del proyecto.

No puede:

- Modificar archivos.
- Crear tablas.
- Ejecutar migraciones.
- Eliminar componentes.
- Cambiar endpoints.
- Instalar dependencias.
- Reemplazar funcionalidades existentes.

Hasta recibir autorización.

## Fase 4. Implementación controlada

Una vez autorizada:

1. Implementar únicamente los cambios aprobados.
2. Reutilizar los componentes existentes.
3. Mantener las convenciones del proyecto.
4. Crear componentes nuevos solo cuando sean necesarios.
5. Mantener la compatibilidad con los módulos existentes.
6. No modificar archivos ajenos al alcance.
7. No eliminar información.
8. No reemplazar servicios funcionales por implementaciones nuevas sin necesidad.

Si durante la implementación descubre que necesita realizar cambios adicionales, debe detenerse y solicitar autorización.

## Fase 5. Pruebas

Debe verificar:

- Reproducción de video.
- Publicación de comentarios.
- Consulta de comentarios.
- Respuestas a comentarios.
- Permisos de usuarios.
- Persistencia de información.
- Navegación entre lecciones.
- Funcionamiento de Siguiente clase.
- Comportamiento en la última lección.
- Botón Clases.
- Evaluaciones.
- Recursos.
- Docente Virtual.
- Seguimiento del progreso.
- Diseño responsive.

También debe comprobar que el frontend y backend continúen funcionando correctamente.

## Fase 6. Informe final

Al terminar debe entregar:

- Archivos modificados.
- Archivos creados.
- Funcionalidades incorporadas.
- Endpoints utilizados.
- Cambios de base de datos.
- Pruebas ejecutadas.
- Resultados obtenidos.
- Errores pendientes.
- Limitaciones identificadas.

---

# 9. Criterios de finalización

La funcionalidad se considerará terminada cuando:

1. La pantalla de clases tenga el diseño moderno aprobado.
2. El reproductor continúe funcionando.
3. Los comentarios se muestren por lección.
4. Los usuarios autorizados puedan publicar comentarios.
5. Los comentarios sean compartidos entre los usuarios de una misma lección.
6. Los usuarios puedan responder comentarios.
7. Se identifique al autor de cada comentario.
8. Los comentarios persistan después de actualizar la página.
9. Se mantenga la separación de comentarios entre lecciones.
10. El botón Clases muestre todas las lecciones del curso actual.
11. El estudiante pueda seleccionar otra lección disponible.
12. El botón Siguiente clase funcione cuando exista otra lección.
13. El botón Siguiente clase no permita avanzar cuando se encuentre en la última lección.
14. Las evaluaciones continúen funcionando.
15. Los recursos continúen funcionando.
16. El Docente Virtual continúe funcionando.
17. Se conserve el seguimiento del progreso.
18. La interfaz funcione correctamente en computadoras, tablets y celulares.
19. No se hayan eliminado datos ni funcionalidades existentes.
20. Las pruebas de los módulos afectados estén aprobadas.

---

# 10. Dudas abiertas

**[NECESITA ACLARACIÓN] DU-01.** ¿Los comentarios podrán ser publicados por estudiantes, docentes y administradores, siempre que tengan acceso a la lección, o únicamente por estudiantes?

**[NECESITA ACLARACIÓN] DU-02.** ¿Quieres que los comentarios puedan recibir un Me gusta, como aparece en la referencia visual?

**[NECESITA ACLARACIÓN] DU-03.** ¿Quieres permitir que los estudiantes editen y eliminen sus propios comentarios?

**[NECESITA ACLARACIÓN] DU-04.** ¿Los comentarios deben actualizarse automáticamente cuando otro usuario publique uno, sin recargar la página?

**[NECESITA ACLARACIÓN] DU-05.** ¿Quieres que el botón Clases abra un panel lateral con todas las lecciones o un modal centrado?

Estas dudas deben resolverse durante el análisis previo o antes de implementar los comportamientos correspondientes. No deben utilizarse como justificación para agregar funcionalidades no autorizadas.

---

# 11. Instrucción inicial para la IA de programación

Lee completamente esta especificación y analiza el proyecto actual de Skylearn.

**NO COMIENCES A PROGRAMAR TODAVÍA.**

Primero debes comprender cómo funciona actualmente el reproductor, cómo están relacionadas las clases con los cursos, cómo se gestionan los estudiantes y qué funcionalidades ya están implementadas.

Quiero que me presentes un informe técnico que identifique exactamente qué elementos existentes podemos reutilizar y cuáles necesitan modificaciones.

No quiero que agregues componentes, servicios, endpoints, tablas o archivos sin una necesidad comprobada.

No quiero que dupliques funcionalidades que ya existen.

No quiero que cambies la arquitectura ni que elimines información.

Quiero que trabajes de forma controlada, realizando únicamente modificaciones justificadas y aprobadas.

**Primero analiza, después propone, espera mi autorización y finalmente implementa.**

El objetivo es mejorar la experiencia de aprendizaje de Skylearn sin romper ninguna funcionalidad que ya esté desarrollada.