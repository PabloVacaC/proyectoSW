# SPEC-001 — Modernización de la página principal y navegación de Skylearn

## 1. Contexto y objetivo

Skylearn es una plataforma de aprendizaje en línea que ya cuenta con un sistema desarrollado. El objetivo de esta funcionalidad es modernizar su página principal, tomando como referencia visual plataformas como Platzi, pero manteniendo la identidad propia de Skylearn.

Se busca implementar una interfaz moderna, futurista, intuitiva y adaptable a diferentes dispositivos, utilizando una combinación de colores azul oscuro, azul eléctrico, morado, degradados y elementos visuales tecnológicos.

La página principal debe permitir que los visitantes conozcan la plataforma, busquen cursos, consulten las categorías disponibles, revisen los precios y puedan comenzar gratuitamente mediante el registro de una cuenta.

El inicio de sesión no debe mostrarse directamente al ingresar a la página. Solamente aparecerá cuando el usuario presione el botón **Acceder**.

La implementación debe aprovechar los módulos, componentes, servicios, endpoints, modelos y estructuras de base de datos que ya existen. No se debe reconstruir ni reemplazar funcionalidades que actualmente estén operativas.

## 2. Usuarios / actores

- **Visitante:** Persona que ingresa a la página principal sin autenticarse. Puede explorar cursos, utilizar el buscador, consultar precios y conocer la plataforma.
- **Estudiante registrado:** Usuario que tiene una cuenta y puede acceder a sus cursos y funcionalidades de aprendizaje.
- **Docente:** Usuario que utiliza las funcionalidades correspondientes a la gestión o impartición de cursos, según los permisos existentes.
- **Administrador:** Usuario encargado de las funcionalidades administrativas que ya existen en el sistema.
- **Sistema:** Se encarga de gestionar la navegación, autenticación, registro, consulta de cursos y presentación de información.

## 3. Historias de usuario

**H1. Página principal**

Como visitante quiero visualizar una página principal moderna y atractiva para conocer Skylearn y sus funcionalidades.

**H2. Buscador de cursos**

Como visitante quiero buscar temas o cursos desde el buscador principal para encontrar rápidamente contenido de mi interés.

**H3. Explorar cursos**

Como visitante quiero acceder a la sección Cursos para visualizar todos los cursos disponibles en el sistema.

**H4. Consultar precios**

Como visitante quiero acceder a la sección Precios para conocer los planes y modalidades disponibles.

**H5. Consultar información empresarial**

Como visitante quiero acceder a la sección Empresas para conocer las opciones que ofrece Skylearn para organizaciones.

**H6. Comenzar gratuitamente**

Como visitante quiero presionar Comienza gratis para crear una cuenta y comenzar mi experiencia de aprendizaje sin tener que iniciar sesión previamente.

**H7. Iniciar sesión**

Como usuario registrado quiero presionar Acceder para visualizar el formulario de inicio de sesión e ingresar a mi cuenta.

**H8. Acceder a mis cursos**

Como estudiante autenticado quiero visualizar mis cursos disponibles dentro de la plataforma para continuar mi aprendizaje.

**H9. Navegación sencilla**

Como usuario quiero navegar entre las diferentes secciones sin perder la continuidad de mi experiencia.

**H10. Mantener la estructura existente**

Como responsable del sistema quiero que las modificaciones aprovechen la arquitectura actual para evitar errores, duplicaciones o pérdida de funcionalidades.

**H11. Control de modificaciones mediante IA**

Como responsable del proyecto quiero que la IA explique previamente cada modificación propuesta para revisar y autorizar los cambios antes de que se realicen.

---

## 4. Requisitos funcionales (criterios de aceptación en EARS)

### RF-01. Página principal

CUANDO un visitante ingrese a la dirección principal de Skylearn, EL SISTEMA DEBE mostrar la nueva página de inicio sin solicitar autenticación.

La página debe contener:

- Logotipo de Skylearn.
- Buscador principal con el texto «¿Qué quieres aprender?».
- Opción Cursos.
- Opción Precios.
- Opción Empresas.
- Botón Acceder.
- Sección principal de presentación de Skylearn.
- Botones Comienza gratis y Ver planes y precios.
- Estadísticas de la plataforma, utilizando datos reales cuando estén disponibles.
- Categorías de aprendizaje.
- Sección de cursos destacados.

El diseño debe seguir la propuesta visual futurista aprobada.

### RF-02. Barra de navegación

CUANDO el visitante visualice la página principal, EL SISTEMA DEBE mostrar una barra de navegación con los siguientes elementos y en este orden:

1. Logo Skylearn.
2. Buscador «¿Qué quieres aprender?».
3. Cursos.
4. Precios.
5. Empresas.
6. Acceder.

No se deben incorporar las opciones Blog ni Comunidad.

### RF-03. Buscador principal

CUANDO el visitante introduzca una palabra o tema en el buscador, EL SISTEMA DEBE permitir buscar cursos relacionados utilizando la información existente en el sistema.

El buscador debe:

- Buscar por nombre del curso.
- Permitir búsquedas por temas o palabras clave cuando la información existente lo permita.
- Mostrar resultados relacionados.
- Permitir seleccionar un resultado para consultar el curso correspondiente.
- Mostrar un mensaje cuando no existan resultados.
- Evitar consultas innecesarias mientras el usuario todavía está escribiendo.

SI el campo de búsqueda está vacío, ENTONCES EL SISTEMA no debe ejecutar una búsqueda.

### RF-04. Sección Cursos

CUANDO el visitante presione Cursos, EL SISTEMA DEBE dirigirlo a la sección general del catálogo de cursos.

La sección debe mostrar los cursos existentes en la base de datos del sistema.

No se deben crear cursos ficticios ni utilizar información estática para sustituir los cursos reales.

Cada tarjeta de curso debe presentar, según los datos disponibles:

- Imagen o portada del curso.
- Nombre del curso.
- Descripción breve.
- Docente responsable.
- Categoría.
- Nivel de dificultad, si existe.
- Duración, si existe.
- Estado del curso.

El catálogo debe permitir visualizar todos los cursos que estén publicados y disponibles para consulta pública.

Los cursos que no estén publicados o que sean exclusivamente internos deben respetar las reglas de visibilidad y permisos existentes.

La sección debe contemplar:

- Listado de cursos.
- Filtrado por categorías.
- Búsqueda de cursos.
- Visualización de detalles.
- Estados de carga.
- Mensaje cuando no existan cursos disponibles.

La información debe obtenerse mediante los servicios y endpoints existentes, reutilizándolos siempre que sea posible.

### RF-05. Cursos destacados

CUANDO se muestre la página principal, EL SISTEMA DEBE presentar una sección de cursos destacados.

Los cursos deben obtenerse de los registros existentes.

No se deben inventar cursos, docentes, cantidades de estudiantes, valoraciones ni estadísticas.

SI actualmente no existe un mecanismo para identificar cursos destacados, ENTONCES LA IA debe proponer cómo aprovechar los datos o funcionalidades existentes antes de implementar un nuevo mecanismo.

### RF-06. Categorías de aprendizaje

CUANDO el visitante ingrese a la página principal, EL SISTEMA DEBE mostrar las categorías disponibles para explorar el contenido educativo.

Las categorías deben corresponder a las que realmente existan en el sistema.

Al seleccionar una categoría, el sistema debe mostrar los cursos asociados a ella.

No se deben crear categorías duplicadas si ya existe una estructura de categorías.

### RF-07. Botón Comienza gratis

CUANDO un visitante presione Comienza gratis, EL SISTEMA DEBE iniciar el proceso de registro de una nueva cuenta.

El proceso debe cumplir las siguientes condiciones:

- No debe solicitar que el visitante inicie sesión previamente.
- Debe mostrar el formulario de registro.
- Debe reutilizar el mecanismo de registro que actualmente tiene Skylearn.
- Debe validar los campos obligatorios.
- Debe respetar las reglas de seguridad y validación existentes.
- Debe evitar la creación de cuentas duplicadas.
- Debe utilizar el proceso actual de creación de usuarios y asignación de roles.

Una vez completado correctamente el registro, el usuario debe poder ingresar a su cuenta mediante el mecanismo de autenticación existente.

Si ya existe una sesión autenticada, el botón debe llevar al usuario a su espacio de aprendizaje, evitando solicitarle un registro innecesario.

### RF-08. Botón Acceder

CUANDO el visitante presione Acceder, EL SISTEMA DEBE mostrar el formulario de inicio de sesión.

El formulario debe conservar los campos y validaciones que actualmente existen:

- Correo electrónico.
- Contraseña.
- Botón para ingresar.
- Acceso a la opción de crear cuenta.

El formulario no debe mostrarse automáticamente al cargar la página principal.

Debe aparecer únicamente cuando el visitante seleccione Acceder.

La presentación puede realizarse mediante una página independiente, modal o panel superpuesto, según la solución más compatible con la arquitectura existente.

La autenticación debe seguir utilizando el mecanismo actual del sistema.

### RF-09. Diferencia entre registro e inicio de sesión

EL SISTEMA DEBE mantener separados los siguientes flujos:

**Comienza gratis:**

Página principal → Registro → Validación de datos → Creación de cuenta → Acceso al sistema.

**Acceder:**

Página principal → Formulario de inicio de sesión → Validación de credenciales → Acceso al sistema.

No se debe confundir el registro con el inicio de sesión ni obligar al visitante a iniciar sesión para crear su primera cuenta.

### RF-10. Sección Precios

CUANDO el visitante presione Precios, EL SISTEMA DEBE mostrar la sección correspondiente a los planes y precios disponibles.

La información debe respetar los planes, créditos, modalidades de acceso y reglas comerciales que actualmente existan en Skylearn.

No se deben inventar precios, planes o beneficios.

Si todavía no existe un módulo de precios, la IA debe identificarlo y proponer una implementación compatible antes de realizar cambios.

### RF-11. Sección Empresas

CUANDO el visitante presione Empresas, EL SISTEMA DEBE dirigirlo a la sección correspondiente a los servicios empresariales disponibles.

Debe reutilizar las funcionalidades existentes.

Si no existe una sección empresarial, debe presentarse una propuesta de implementación sin modificar otros módulos hasta recibir autorización.

### RF-12. Acceso a los cursos del estudiante

CUANDO un estudiante autenticado ingrese a su espacio de aprendizaje, EL SISTEMA DEBE mostrar los cursos que le corresponden según las inscripciones, asignaciones, créditos y permisos que actualmente maneja la plataforma.

La sección debe permitir:

- Visualizar los cursos disponibles para el estudiante.
- Identificar los cursos que ya está realizando.
- Consultar el progreso, si existe.
- Continuar una clase.
- Ingresar al contenido de un curso.
- Identificar los cursos finalizados, cuando esa funcionalidad exista.

No se deben mostrar como inscritos cursos que el estudiante no tiene asignados.

Tampoco se deben perder las relaciones existentes entre estudiantes, cursos, inscripciones y créditos.

### RF-13. Asistente de aprendizaje con IA

La página principal debe mantener la posibilidad de comunicar que Skylearn ofrece ayudas mediante IA para el aprendizaje.

Si ya existe un asistente de IA, se debe reutilizar.

La IA debe ayudar al estudiante a resolver dudas sobre temas relacionados con sus cursos, siempre respetando las funcionalidades y permisos existentes.

No se debe implementar un asistente paralelo si ya existe uno.

### RF-14. Diseño adaptable

EL SISTEMA DEBE adaptar la página principal a diferentes tamaños de pantalla.

Debe funcionar correctamente en:

- Computadoras de escritorio.
- Portátiles.
- Tablets.
- Teléfonos móviles.

La barra de navegación, buscador, tarjetas y formularios deben reorganizarse sin perder funcionalidades.

### RF-15. Navegación y sesión

MIENTRAS exista una sesión autenticada, EL SISTEMA DEBE conservar el estado de autenticación y aplicar las reglas de acceso existentes.

SI la sesión ha expirado, ENTONCES EL SISTEMA debe solicitar nuevamente la autenticación sin perder innecesariamente el contexto de navegación.

Los visitantes no autenticados no deben poder acceder a contenido privado.

---

## 5. Requisitos no funcionales

### RNF-01. Compatibilidad arquitectónica

Las nuevas funcionalidades deben adaptarse a la arquitectura, tecnologías, convenciones y patrones que actualmente utiliza Skylearn.

No se debe introducir una arquitectura nueva sin justificación y autorización.

### RNF-02. Rendimiento

- La página principal debe cargar eficientemente.
- Las imágenes deben estar optimizadas.
- El catálogo debe evitar cargar información innecesaria.
- Las consultas deben reutilizar los mecanismos existentes.
- Se deben evitar solicitudes repetitivas al backend.

### RNF-03. Seguridad

- Mantener el mecanismo actual de autenticación.
- No exponer contraseñas ni información sensible.
- Validar los datos en frontend y backend.
- Respetar los roles y permisos existentes.
- Evitar accesos no autorizados a cursos privados.
- Mantener la protección de sesiones y tokens existente.

### RNF-04. Diseño visual

La interfaz debe mantener una identidad visual coherente:

- Fondo azul oscuro o negro.
- Azul eléctrico.
- Morado.
- Degradados.
- Elementos con transparencias.
- Tarjetas modernas.
- Bordes redondeados.
- Animaciones suaves.
- Tipografía legible.

### RNF-05. Idioma

Toda la interfaz de esta funcionalidad debe estar en español.

### RNF-06. Mantenibilidad

Los nuevos componentes deben ser reutilizables y mantener las convenciones de organización del proyecto.

No se deben duplicar servicios, componentes o funcionalidades existentes.

### RNF-07. Integridad de datos

No se deben eliminar, sobrescribir ni modificar registros existentes durante la implementación.

No se deben realizar migraciones destructivas.

---

## 6. Casos límite

**CE-01. Registro con correo duplicado**

Si un visitante intenta registrarse con un correo electrónico existente, el sistema debe rechazar el registro y mostrar un mensaje apropiado.

**CE-02. Registro incompleto**

Si faltan campos obligatorios, el sistema debe indicar cuáles deben completarse.

**CE-03. Credenciales incorrectas**

Si el usuario introduce credenciales incorrectas, el sistema debe mostrar un mensaje de error sin revelar información sensible.

**CE-04. Catálogo vacío**

Si no existen cursos publicados, el sistema debe mostrar un mensaje indicando que todavía no hay cursos disponibles.

**CE-05. Error de conexión**

Si el backend no está disponible, el sistema debe mostrar un mensaje de error y permitir volver a intentar la operación.

**CE-06. Curso sin imagen**

Si un curso no tiene portada, debe utilizarse una imagen predeterminada sin romper la presentación de la tarjeta.

**CE-07. Curso sin docente asignado**

Si un curso no tiene docente disponible para mostrar, la tarjeta debe adaptarse sin presentar información inventada.

**CE-08. Sesión existente**

Si un estudiante autenticado presiona Comienza gratis, debe dirigirse a su espacio de aprendizaje y no crear otra cuenta.

**CE-09. Acceso directo a rutas**

Si un visitante intenta acceder directamente a una sección privada, el sistema debe aplicar las restricciones actuales de autenticación y autorización.

**CE-10. Cambios simultáneos**

La consulta del catálogo y la autenticación deben funcionar correctamente aunque varios usuarios utilicen el sistema simultáneamente.

**CE-11. Datos existentes**

Si hay cursos, usuarios, inscripciones, categorías o créditos registrados, estos deben conservarse después de la implementación.

**CE-12. Funcionalidades existentes**

Si un componente nuevo necesita integrarse con uno existente, no debe reemplazarlo sin analizar previamente sus dependencias.

---

## 7. Fuera de alcance

En esta iteración NO se contempla:

1. Reconstruir Skylearn desde cero.
2. Cambiar el framework frontend o backend.
3. Cambiar el motor de base de datos.
4. Reemplazar el sistema de autenticación.
5. Modificar el funcionamiento interno de los módulos administrativos.
6. Cambiar la lógica de asignación de créditos.
7. Cambiar las reglas de inscripción a cursos.
8. Eliminar funcionalidades existentes.
9. Eliminar usuarios, cursos o registros de la base de datos.
10. Crear un sistema paralelo de gestión de cursos.
11. Crear un nuevo sistema de roles.
12. Modificar las reglas de negocio existentes sin autorización.
13. Implementar Blog o Comunidad.
14. Crear cursos ficticios para completar visualmente la página.
15. Cambiar endpoints existentes sin una justificación técnica.

Cualquier necesidad adicional debe presentarse como propuesta independiente para su evaluación.

---

## 8. Protocolo obligatorio de trabajo para la IA de programación

**Este apartado es obligatorio y tiene prioridad sobre cualquier implementación automática.**

La IA debe trabajar sobre el proyecto existente, no asumir que está comenzando desde cero.

### Fase 1. Análisis del proyecto

Antes de escribir o modificar código, debe:

1. Analizar la estructura completa del proyecto.
2. Identificar las tecnologías utilizadas.
3. Identificar los módulos existentes.
4. Identificar los componentes de la página principal.
5. Identificar los componentes de registro e inicio de sesión.
6. Identificar los servicios de autenticación.
7. Identificar los endpoints relacionados con cursos.
8. Identificar los modelos y tablas relacionados con estudiantes y cursos.
9. Identificar las rutas existentes.
10. Identificar las dependencias entre los componentes.

Debe prestar especial atención a no duplicar funcionalidades.

### Fase 2. Informe previo de modificaciones

Antes de implementar cualquier cambio, la IA debe presentar un informe con el siguiente formato:

**A. Archivos que modificará**

| Archivo | Modificación propuesta | Motivo |
|---|---|---|
| Archivo existente | Descripción del cambio | Justificación |

**B. Archivos nuevos que agregará**

| Archivo | Función | Motivo |
|---|---|---|
| Nuevo archivo | Responsabilidad | Justificación |

**C. Componentes que reutilizará**

Debe identificar qué componentes, servicios, modelos y endpoints actuales pueden aprovecharse.

**D. Cambios en la base de datos**

Debe indicar expresamente si necesita realizar alguna modificación.

Si no es necesario modificar la base de datos, debe indicarlo.

**E. Riesgos**

Debe explicar si algún cambio puede afectar:

- Inicio de sesión.
- Registro.
- Roles y permisos.
- Cursos.
- Inscripciones.
- Créditos.
- Panel administrativo.
- Funcionalidades existentes.

**F. Estrategia de implementación**

Debe explicar el orden en que realizará los cambios y cómo comprobará que no se rompan las funcionalidades actuales.

### Fase 3. Autorización

La IA NO DEBE modificar ningún archivo hasta que el responsable del proyecto revise y autorice el informe.

Si el responsable solicita cambios en la propuesta, la IA debe actualizar el informe.

Si no recibe autorización, debe limitarse al análisis y explicación.

### Fase 4. Implementación controlada

Una vez autorizada la propuesta:

1. Realizar los cambios aprobados.
2. Reutilizar los componentes existentes.
3. Crear únicamente los archivos necesarios.
4. Evitar duplicar servicios.
5. Mantener compatibilidad con los módulos actuales.
6. No modificar archivos que no estén relacionados con la tarea sin autorización.
7. No realizar cambios destructivos.
8. Mantener las convenciones de código del proyecto.

Si durante la implementación descubre que necesita modificar un archivo adicional o cambiar el alcance aprobado, debe detenerse y solicitar autorización.

### Fase 5. Validación

Después de cada grupo de modificaciones debe:

- Comprobar que el frontend compile.
- Comprobar que el backend continúe funcionando.
- Verificar las rutas.
- Verificar el registro.
- Verificar el inicio de sesión.
- Verificar el catálogo.
- Verificar las relaciones entre estudiantes y cursos.
- Verificar los permisos.
- Ejecutar las pruebas disponibles.
- Corregir los errores introducidos por sus propios cambios.

No debe afirmar que una funcionalidad está terminada si no ha sido comprobada.

### Fase 6. Informe final

Al finalizar debe entregar:

- Archivos modificados.
- Archivos nuevos.
- Funcionalidades implementadas.
- Componentes reutilizados.
- Endpoints utilizados o agregados.
- Cambios en base de datos, si existieron.
- Pruebas realizadas.
- Resultados de las pruebas.
- Errores pendientes.
- Riesgos o limitaciones identificadas.

---

## 9. Criterios de finalización

La funcionalidad se considerará terminada cuando:

1. La página principal tenga el diseño futurista aprobado.
2. La navegación contenga únicamente Logo, Buscador, Cursos, Precios, Empresas y Acceder.
3. No aparezcan Blog ni Comunidad.
4. El formulario de inicio de sesión no aparezca automáticamente.
5. Acceder muestre el formulario de inicio de sesión.
6. Comienza gratis muestre el formulario de registro.
7. El registro utilice el mecanismo actual de creación de cuentas.
8. Cursos muestre los cursos reales publicados del sistema.
9. Las categorías utilicen información existente.
10. Los cursos destacados utilicen datos reales.
11. Los estudiantes autenticados puedan acceder a sus cursos correspondientes.
12. Se mantengan las relaciones actuales entre estudiantes, cursos, inscripciones y créditos.
13. La página funcione en computadoras y dispositivos móviles.
14. No se hayan perdido datos ni funcionalidades existentes.
15. Las pruebas de las funcionalidades afectadas estén aprobadas.
16. Se haya entregado el informe final de modificaciones.

---

## 10. Dudas abiertas

**[NECESITA ACLARACIÓN] DU-01.** ¿El registro gratuito debe asignar automáticamente el rol de estudiante utilizando el mecanismo actual de creación de cuentas?

**[NECESITA ACLARACIÓN] DU-02.** ¿Los cursos del catálogo público deben mostrar únicamente cursos publicados o también cursos que todavía no estén disponibles para inscripción?

**[NECESITA ACLARACIÓN] DU-03.** ¿La sección Empresas ya cuenta con una funcionalidad desarrollada o debe diseñarse como una nueva sección?

**[NECESITA ACLARACIÓN] DU-04.** ¿Los precios y planes actuales ya están implementados y deben reutilizarse?

**[NECESITA ACLARACIÓN] DU-05.** ¿El asistente de IA ya está integrado en Skylearn y debe reutilizarse desde la página principal?

Estas dudas deben resolverse mediante el análisis del código existente antes de implementar funcionalidades nuevas.

---

## 11. Instrucción inicial para la IA de programación

Antes de comenzar, lee completamente esta especificación y analiza el proyecto actual de Skylearn.

**IMPORTANTE: NO COMIENCES A PROGRAMAR TODAVÍA.**

Primero quiero que realices un análisis técnico de la estructura existente y me presentes el informe de la Fase 1 y Fase 2.

Quiero saber exactamente:

- Cómo está organizado actualmente el proyecto.
- Qué componentes y funcionalidades podemos reutilizar.
- Qué archivos necesitas modificar.
- Qué archivos nuevos necesitas crear.
- Qué endpoints actuales utilizarás.
- Si necesitas modificar la base de datos.
- Qué riesgos existen para las funcionalidades actuales.
- Cómo implementarás cada requisito sin romper la estructura.

No inventes archivos, endpoints, tablas ni funcionalidades. Comprueba que realmente existen antes de mencionarlos.

No reemplaces componentes existentes solo por comodidad.

No elimines información ni realices migraciones destructivas.

**Espera mi autorización explícita antes de modificar cualquier archivo.**

El objetivo es evolucionar Skylearn sobre su estructura actual, manteniendo todo lo que ya funciona y modernizando únicamente lo necesario.