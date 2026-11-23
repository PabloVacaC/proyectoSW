# SPEC-007 — Diagnóstico Inteligente y Recomendación de Aprendizaje

## Contexto y objetivo

El sistema actualmente cuenta con un Test de Recomendación que presenta preguntas genéricas para conocer las preferencias del estudiante. Sin embargo, estas preguntas no están vinculadas directamente con los módulos, lecciones ni contenidos reales del catálogo curricular.

El objetivo de esta funcionalidad es transformar el test actual en un sistema de diagnóstico inteligente de conocimientos previos, conectado al catálogo curricular y a la inteligencia artificial. El estudiante deberá seleccionar el módulo que desea aprender y la IA analizará las lecciones, objetivos, contenidos y conocimientos asociados a dicho módulo para generar preguntas personalizadas que permitan evaluar su nivel de dominio. A partir de las respuestas, el sistema identificará qué conocimientos domina, cuáles necesita reforzar y recomendará la lección más adecuada desde la cual comenzar su aprendizaje, evitando que el estudiante tenga que estudiar nuevamente contenidos que ya conoce o avanzar hacia temas para los cuales todavía no cuenta con los conocimientos necesarios.

## Usuarios / actores

- Estudiante: selecciona el módulo que desea aprender, responde el diagnóstico y recibe una recomendación personalizada.
- Inteligencia Artificial: analiza el contenido curricular, genera preguntas contextualizadas, evalúa las respuestas y determina una recomendación de aprendizaje.
- Sistema: proporciona a la IA la información curricular disponible, registra los resultados y presenta las recomendaciones.

## Historias de usuario

H1: Como estudiante, quiero seleccionar el módulo que deseo aprender para realizar un diagnóstico basado en sus contenidos reales.

H2: Como estudiante, quiero responder preguntas relacionadas con las lecciones del módulo seleccionado para conocer mi nivel de conocimiento previo.

H3: Como estudiante, quiero recibir una evaluación de mis conocimientos por tema para identificar qué contenidos domino y cuáles necesito aprender.

H4: Como estudiante, quiero recibir una recomendación de la lección desde la cual debería comenzar para aprovechar mejor mi tiempo de aprendizaje.

H5: Como estudiante, quiero conocer las razones de la recomendación para comprender por qué el sistema considera que debo comenzar desde determinada lección.

H6: Como estudiante, quiero poder acceder directamente a la lección recomendada para comenzar mi aprendizaje sin tener que buscarla manualmente.

H7: Como estudiante, quiero poder omitir el diagnóstico y acceder al catálogo curricular cuando no desee realizar la evaluación.

## Requisitos funcionales (criterios de aceptación en EARS)

### RF-1: Selección de módulo

CUANDO el estudiante inicia el Test de Recomendación, EL SISTEMA deberá mostrar los módulos disponibles en el catálogo curricular y permitir seleccionar el módulo que desea evaluar.

### RF-2: Información curricular del módulo

CUANDO el estudiante selecciona un módulo, EL SISTEMA deberá recuperar la información real del módulo seleccionado, incluyendo su descripción, lecciones, objetivos de aprendizaje, contenidos y demás información curricular disponible.

### RF-3: Contexto de la inteligencia artificial

CUANDO se genere una evaluación, EL SISTEMA deberá proporcionar a la IA el contexto curricular del módulo seleccionado y sus lecciones para que las preguntas y recomendaciones se encuentren fundamentadas en los contenidos existentes.

### RF-4: Generación de preguntas

CUANDO el estudiante inicie el diagnóstico de un módulo, EL SISTEMA deberá solicitar a la IA la generación de preguntas relacionadas con los conocimientos y contenidos de las lecciones pertenecientes al módulo seleccionado.

Las preguntas deberán evaluar conocimientos relevantes para determinar el nivel de dominio del estudiante y no limitarse únicamente a preguntas generales sobre sus preferencias.

### RF-5: Distribución de preguntas

CUANDO la IA genere la evaluación, EL SISTEMA deberá procurar que las preguntas evalúen diferentes temas y lecciones del módulo, evitando concentrar todas las preguntas en un único tema.

### RF-6: Tipos de preguntas

CUANDO se genere el diagnóstico, EL SISTEMA podrá presentar preguntas de selección múltiple, preguntas de verdadero o falso, preguntas conceptuales y preguntas orientadas a la resolución de situaciones o problemas relacionados con el contenido del módulo.

### RF-7: Cantidad de preguntas

CUANDO se inicie una evaluación, EL SISTEMA deberá presentar una cantidad controlada de preguntas, preferentemente entre 5 y 8 preguntas, procurando obtener información suficiente para realizar una recomendación confiable sin generar una evaluación excesivamente extensa.

La cantidad podrá ajustarse según la complejidad y cantidad de contenidos del módulo.

### RF-8: Presentación de preguntas

CUANDO el estudiante responda una pregunta, EL SISTEMA deberá permitir avanzar a la siguiente pregunta y mostrar el progreso de la evaluación.

EL SISTEMA deberá permitir visualizar el número de pregunta actual y el total de preguntas generadas.

### RF-9: Validación de respuestas

CUANDO el estudiante complete el diagnóstico, EL SISTEMA deberá enviar las respuestas proporcionadas junto con las preguntas generadas y el contexto curricular correspondiente para realizar el análisis de conocimientos.

### RF-10: Evaluación por conocimientos

CUANDO la IA analice las respuestas, EL SISTEMA deberá determinar el nivel de conocimiento demostrado por el estudiante en los diferentes temas evaluados.

EL análisis deberá considerar, cuando corresponda:

- Respuestas correctas.
- Respuestas incorrectas.
- Temas evaluados.
- Lecciones relacionadas.
- Dificultad de las preguntas.
- Evidencias de conocimientos demostrados.
- Conocimientos que requieren reforzamiento.

### RF-11: Evaluación por lección

CUANDO finalice el diagnóstico, EL SISTEMA deberá relacionar los resultados de las preguntas con las lecciones correspondientes del módulo para identificar el nivel de conocimiento demostrado en cada una.

### RF-12: Identificación de conocimientos dominados

CUANDO la IA determine que el estudiante demuestra conocimientos suficientes sobre determinados contenidos, EL SISTEMA deberá identificar dichos contenidos como conocimientos previamente adquiridos o dominados, evitando recomendar innecesariamente el inicio desde las primeras lecciones.

### RF-13: Identificación de conocimientos pendientes

CUANDO la IA determine que el estudiante presenta dificultades en determinados contenidos, EL SISTEMA deberá identificar dichos contenidos como conocimientos pendientes de aprendizaje o reforzamiento.

### RF-14: Recomendación de inicio

CUANDO finalice el diagnóstico, EL SISTEMA deberá recomendar una lección específica del módulo seleccionado desde la cual el estudiante debería comenzar su aprendizaje.

La recomendación deberá considerar:

- El resultado obtenido en las preguntas.
- El nivel de conocimiento demostrado.
- La relación entre preguntas y lecciones.
- El orden curricular de las lecciones.
- Los prerrequisitos existentes.
- Los conocimientos que el estudiante necesita reforzar.

### RF-15: Justificación de recomendación

CUANDO EL SISTEMA presente la lección recomendada, deberá mostrar una explicación comprensible de por qué se recomienda comenzar desde dicha lección, indicando los conocimientos que el estudiante demuestra dominar y los contenidos que necesita aprender o reforzar.

### RF-16: Presentación de resultados

CUANDO finalice el diagnóstico, EL SISTEMA deberá mostrar un resumen que incluya:

- Módulo evaluado.
- Resultado general del diagnóstico.
- Nivel de conocimiento estimado.
- Conocimientos dominados.
- Conocimientos por reforzar.
- Conocimientos pendientes.
- Lección recomendada para comenzar.
- Justificación de la recomendación.

### RF-17: Acceso a la lección recomendada

CUANDO el estudiante seleccione la opción de comenzar aprendizaje, EL SISTEMA deberá permitir acceder directamente a la lección recomendada dentro del módulo evaluado.

### RF-18: Omitir diagnóstico

CUANDO el estudiante seleccione la opción de omitir el diagnóstico, EL SISTEMA deberá permitir acceder al catálogo curricular sin realizar la evaluación.

### RF-19: Módulos sin contenido suficiente

SI el módulo seleccionado no dispone de suficientes lecciones, objetivos o contenidos para generar una evaluación confiable, ENTONCES EL SISTEMA deberá informar al estudiante que no es posible realizar un diagnóstico adecuado para ese módulo y permitirle acceder al contenido disponible.

### RF-20: Contexto exclusivo del módulo seleccionado

CUANDO se genere una evaluación, EL SISTEMA deberá utilizar como contexto principal el contenido del módulo seleccionado y sus lecciones, evitando utilizar información curricular perteneciente a módulos diferentes que no tenga relación con el diagnóstico.

### RF-21: Resultados fundamentados en contenido curricular

CUANDO la IA genere preguntas, evalúe respuestas o realice recomendaciones, EL SISTEMA deberá fundamentar sus resultados en la información curricular disponible.

La IA no deberá inventar lecciones, módulos, objetivos ni recomendar contenidos que no existan en el catálogo curricular.

### RF-22: Recomendación según resultados insuficientes

SI los resultados obtenidos no permiten determinar con suficiente confianza el nivel de conocimientos del estudiante, ENTONCES EL SISTEMA deberá recomendar comenzar desde una lección inicial o solicitar una evaluación complementaria, evitando realizar recomendaciones avanzadas sin evidencia suficiente.

### RF-23: Finalización del diagnóstico

CUANDO el estudiante complete todas las preguntas, EL SISTEMA deberá procesar y mostrar los resultados sin permitir que el diagnóstico quede en un estado incompleto debido a una falla de procesamiento.

## Requisitos no funcionales

### RNF-1: Usabilidad

La interfaz deberá mantener un flujo sencillo, claro e intuitivo, permitiendo al estudiante seleccionar un módulo, responder preguntas y visualizar su recomendación sin pasos innecesarios.

### RNF-2: Rendimiento

La generación de preguntas y el análisis de resultados deberán ejecutarse dentro de tiempos razonables. EL SISTEMA deberá mostrar indicadores de carga mientras la IA genera o analiza información.

### RNF-3: Integridad curricular

Las preguntas y recomendaciones deberán estar vinculadas a identificadores reales de módulos y lecciones existentes.

### RNF-4: Consistencia de resultados

La estructura de respuestas de la IA deberá ser consistente y validable por el sistema antes de presentar los resultados al estudiante.

### RNF-5: Manejo de errores

Si la IA no responde, genera información inválida o ocurre un error de conexión, EL SISTEMA deberá informar el problema y permitir reintentar el diagnóstico sin perder innecesariamente el progreso del estudiante.

### RNF-6: Seguridad

EL SISTEMA deberá validar que el estudiante únicamente pueda acceder a los módulos, diagnósticos y resultados que le correspondan según las reglas de acceso establecidas.

### RNF-7: Idioma

Las preguntas, evaluaciones, explicaciones y recomendaciones deberán presentarse en español, salvo que el módulo o la configuración del estudiante establezcan otro idioma.

### RNF-8: Adaptabilidad

La funcionalidad deberá adaptarse a módulos con diferentes cantidades de lecciones y distintos niveles de complejidad curricular.

## Casos límite

- El módulo seleccionado no contiene lecciones.
- El módulo contiene lecciones, pero no dispone de contenido suficiente para generar preguntas.
- La IA genera preguntas repetidas.
- La IA genera preguntas que no corresponden al módulo seleccionado.
- Una pregunta no tiene una respuesta válida.
- La IA genera una evaluación incompleta.
- El estudiante abandona el diagnóstico antes de finalizar.
- El estudiante no responde alguna pregunta.
- Todas las respuestas del estudiante son correctas.
- Todas las respuestas del estudiante son incorrectas.
- El estudiante obtiene resultados contradictorios entre preguntas de un mismo tema.
- No existe suficiente evidencia para recomendar una lección específica.
- La lección recomendada no está disponible o fue eliminada.
- El módulo cambia sus contenidos mientras se realiza una evaluación.
- La conexión con el servicio de inteligencia artificial falla.
- La IA devuelve una respuesta que no cumple la estructura esperada.
- El estudiante intenta acceder a la lección recomendada mientras no tiene permisos o acceso correspondiente.

## Fuera de alcance

- Modificar el contenido curricular de los módulos.
- Crear o eliminar módulos automáticamente mediante la IA.
- Crear o modificar lecciones automáticamente mediante la IA.
- Reemplazar el sistema de inscripción o acceso a cursos.
- Evaluar permanentemente al estudiante durante todas las clases.
- Generar un plan académico completo para todos los módulos simultáneamente.
- Realizar seguimiento de rendimiento a largo plazo en esta funcionalidad.
- Sustituir los exámenes oficiales de cada lección.
- Garantizar que el estudiante domina completamente un tema únicamente mediante un diagnóstico corto.
- Modificar el sistema de créditos o sus reglas actuales, salvo que sea necesario para la integración del test existente.

## Criterios de finalización

- El estudiante puede seleccionar un módulo existente del catálogo.
- El sistema obtiene las lecciones y contenidos reales del módulo seleccionado.
- La IA recibe el contexto curricular correspondiente.
- Las preguntas generadas están relacionadas con el contenido real del módulo.
- El estudiante puede completar la evaluación.
- Las respuestas son analizadas por la IA.
- El sistema presenta resultados diferenciados por temas o lecciones cuando exista información suficiente.
- El sistema identifica conocimientos dominados y conocimientos pendientes.
- El sistema recomienda una lección real existente.
- La recomendación incluye una explicación comprensible.
- El estudiante puede acceder a la lección recomendada.
- El estudiante puede omitir el test y acceder al catálogo.
- Se manejan errores de generación, evaluación y conexión.
- Los requisitos funcionales cuentan con pruebas satisfactorias.
- Se realiza una demostración manual del flujo completo desde la selección del módulo hasta el inicio de la lección recomendada.

## Dudas abiertas

[NECESITA ACLARACIÓN] ¿El diagnóstico debe consumir créditos o mantenerse completamente gratuito como el test inicial actual?

[NECESITA ACLARACIÓN] ¿El estudiante podrá realizar nuevamente el diagnóstico del mismo módulo cuando quiera actualizar su nivel de conocimiento?

[NECESITA ACLARACIÓN] ¿Se deberá guardar el historial de diagnósticos realizados para comparar la evolución del estudiante?

[NECESITA ACLARACIÓN] ¿La recomendación deberá permitir comenzar desde una lección posterior cuando el estudiante demuestre dominar varios contenidos consecutivos?

[NECESITA ACLARACIÓN] ¿Se deberá permitir que la IA genere preguntas de respuesta abierta que el estudiante responda con texto, o en esta primera iteración se utilizarán principalmente preguntas de selección múltiple?

[NECESITA ACLARACIÓN] ¿La evaluación deberá adaptarse dinámicamente según las respuestas anteriores, aumentando o disminuyendo la dificultad, o se generará un conjunto fijo de preguntas al iniciar el diagnóstico?
