# SPEC-007 — Diagnóstico Inteligente de Conocimientos Previos y Recomendación de Inicio Curricular

## 1. Contexto y Visión del Producto

El sistema educativo Skylearn permite a los estudiantes explorar los cursos y módulos disponibles en su catálogo curricular. Para optimizar el tiempo de aprendizaje y evitar la frustración de repetir contenidos ya dominados o saltar a temas demasiado avanzados sin bases sólidas, esta especificación define el **Sistema de Diagnóstico Inteligente de Conocimientos Previos**.

Al acceder a la plataforma o a la sección de recomendaciones:
1. El estudiante puede visualizar los cursos y módulos activos del catálogo curricular.
2. Selecciona el módulo específico en el que desea formarse.
3. El sistema y la Inteligencia Artificial (Google Gemini con fallback determinista) analizan el **Resumen Pedagógico de la Clase** (`contextText`) de cada lección del módulo para generar un cuestionario diagnóstico personalizado de opción múltiple.
4. El estudiante responde las preguntas y el sistema evalúa su nivel de dominio tema por tema.
5. **Determinación del Punto de Partida:**
   - **Regla Incondicional de Fallo Total**: Si el estudiante responde mal en todo el cuestionario (o reprueba los conceptos de la primera lección), **debe comenzar obligatoriamente desde la primera lección (Lección 1)** para aprender los fundamentos desde cero.
   - **Regla de Avance Progresivo (No empezar desde cero)**: Si el estudiante demuestra dominar las lecciones iniciales (por ejemplo, Lecciones 1 y 2), el sistema lo exonera de cursarlas de nuevo y le recomienda comenzar directamente en la lección donde requiere nuevo aprendizaje (ejemplo: Lección 3).
   - **Regla de Dominio Completo**: Si el estudiante responde correctamente todas las preguntas, se le recomienda la lección final de consolidación práctica o el avance al siguiente módulo.
6. El diagnóstico es **100% gratuito (costo 0 créditos)** y proporciona acceso directo con un clic a la lección recomendada.

---

## 2. Usuarios y Actores

- **Estudiante**: Explora el catálogo de cursos, selecciona un módulo para evaluarse, responde el cuestionario y recibe su punto de partida recomendado con justificación pedagógica comprensible.
- **Inteligencia Artificial (Gemini API + Fallback Resiliente)**: Lee el "Resumen Pedagógico de la Clase" de cada lección para generar preguntas de opción múltiple pertinentes y evaluar el nivel de dominio.
- **Sistema (Backend NestJS + Prisma)**: Proporciona la información curricular real (`contextText`, títulos, orden), procesa las respuestas, inscribe al alumno en el curso a costo 0 créditos y emite la redirección a la lección recomendada.

---

## 3. Historias de Usuario

- **H1**: Como estudiante, quiero explorar los cursos y módulos disponibles para seleccionar cuál deseo evaluar mediante un diagnóstico inteligente.
- **H2**: Como estudiante, quiero responder preguntas basadas directamente en el "Resumen Pedagógico" de las lecciones del módulo para demostrar mis conocimientos previos reales.
- **H3**: Como estudiante con conocimientos previos, quiero que el sistema reconozca los temas que ya domino para no tener que empezar desde la primera lección (no empezar desde 0).
- **H4**: Como estudiante sin conocimientos o que responde mal las preguntas, quiero que el sistema me recomiende comenzar desde la primera lección para aprender las bases pedagógicas paso a paso.
- **H5**: Como estudiante, quiero conocer una justificación clara y empática de mi recomendación, sabiendo qué temas domino y cuáles debo aprender o reforzar.
- **H6**: Como estudiante, quiero acceder directamente a la lección recomendada con un solo clic sin tener que buscarla manualmente en el catálogo.
- **H7**: Como estudiante, quiero tener la opción de omitir el diagnóstico en cualquier momento para explorar libremente el catálogo general.

---

## 4. Requisitos Funcionales (Formato EARS)

### RF-1: Exploración y Selección de Módulos Curriculares
CUANDO el estudiante accede al test diagnóstico o a la sección de recomendaciones, EL SISTEMA deberá mostrar la lista de cursos y módulos disponibles en el catálogo curricular, indicando su título, categoría y número de lecciones para permitir la selección del módulo a evaluar.

### RF-2: Contextualización con el "Resumen Pedagógico de la Clase"
CUANDO el estudiante selecciona un módulo para diagnóstico, EL SISTEMA deberá recopilar los datos reales de sus lecciones, extrayendo obligatoriamente para cada una su identificador, título, orden y su campo de contenido educativo (`contextText` o Resumen Pedagógico de la Clase).

### RF-3: Generación Inteligente de Preguntas Diagnósticas
CUANDO se inicialice el diagnóstico de un módulo, EL SISTEMA deberá suministrar a la IA el Resumen Pedagógico de cada lección y solicitar la generación de un cuestionario de entre 4 y 6 preguntas de opción múltiple (4 alternativas por pregunta, exactamente 1 correcta).

### RF-4: Trazabilidad Lección-Pregunta
CUANDO se genere cada pregunta del diagnóstico, EL SISTEMA deberá vincularla explícitamente al `lessonId` de la lección cuyo Resumen Pedagógico evalúa, garantizando que ninguna pregunta sea ajena al contenido curricular del módulo.

### RF-5: Flujo Interactivo de Evaluación
CUANDO el estudiante responda el cuestionario, EL SISTEMA deberá presentar las preguntas de forma secuencial, mostrando el número de pregunta actual, el total de preguntas, el título de la lección evaluada y una barra de progreso visual.

### RF-6: Regla Incondicional de Fallo Total (Inicio en Lección 1)
SI el estudiante responde incorrectamente todas las preguntas del cuestionario (o no demuestra dominio en los conceptos de la primera lección), ENTONCES EL SISTEMA deberá obligatoriamente recomendar comenzar desde la primera lección (orden 1) del módulo, explicando que es necesario construir los fundamentos pedagógicos desde cero.

### RF-7: Regla de Avance Progresivo (No Empezar de Cero)
SI el estudiante responde correctamente las preguntas asociadas a las lecciones iniciales consecutivas (por ejemplo, lección 1 y lección 2), ENTONCES EL SISTEMA deberá identificar dichas lecciones como "Conocimientos Dominados" y recomendar comenzar en la primera lección posterior no dominada (ejemplo: lección 3), evitando que el estudiante repita temas que ya conoce.

### RF-8: Regla de Dominio Completo
SI el estudiante responde correctamente todas las preguntas del diagnóstico, ENTONCES EL SISTEMA deberá clasificar su nivel como "Avanzado", felicitarlo por dominar los conceptos del módulo y recomendarle la lección final de consolidación práctica o proyecto.

### RF-9: Justificación Pedagógica y Desglose Temático
CUANDO finalice la evaluación, EL SISTEMA deberá presentar un resumen visual que incluya:
- Nivel de conocimiento estimado (`Principiante`, `Intermedio`, `Avanzado`).
- Puntuación obtenida (número de aciertos y porcentaje).
- Lista de **Conocimientos Dominados** con distintivos verdes de verificación.
- Lista de **Contenidos por Reforzar o Aprender** con avisos pedagógicos.
- Tarjeta destacada con la **Lección Recomendada para comenzar** y su explicación comprensible.

### RF-10: Matrícula y Navegación Directa a Costo 0
CUANDO se emita la recomendación, EL SISTEMA deberá inscribir automáticamente al estudiante en el curso correspondiente sin deducir créditos (`balance` intacto) y ofrecer un botón de acción principal para redirigir directamente a la lección recomendada (`/lessons/:id`).

### RF-11: Opción de Omisión Directa
CUANDO el estudiante decida no realizar el diagnóstico, EL SISTEMA deberá permitirle omitir el proceso mediante un botón visible ("Omitir y ver catálogo") sin penalizaciones ni bloqueos de acceso.

### RF-12: Sembrado de Datos Curriculares de Prueba
EL SISTEMA deberá contar en su archivo de inicialización (`seed.ts`) con cursos y módulos estructurados con múltiples lecciones (mínimo 3 a 4 lecciones por módulo), cada una provista de un "Resumen Pedagógico de la Clase" exhaustivo en `contextText`, permitiendo pruebas completas del algoritmo de diagnóstico y salto de lecciones.

---

## 5. Criterios de Aceptación (Gherkin BDD)

### Escenario 1: Estudiante nuevo responde mal en todo el cuestionario (Inicio desde la Lección 1)
```gherkin
Given un estudiante con 3 créditos que inicia el diagnóstico del módulo "Fundamentos de React"
And el módulo contiene 4 lecciones ordenadas pedagógicamente (1: JSX, 2: useState, 3: useEffect, 4: Custom Hooks)
When el estudiante responde incorrectamente todas las preguntas del diagnóstico
Then el sistema calcula un puntaje de 0% y nivel "Principiante"
And el sistema recomienda obligatoriamente comenzar en la "Lección 1: JSX" (orden 1)
And la justificación explica que debe construir las bases desde el inicio
And el saldo de créditos del estudiante se mantiene en 3 créditos
```

### Escenario 2: Estudiante domina lecciones iniciales y no empieza desde cero
```gherkin
Given un estudiante que toma el diagnóstico del módulo "Fundamentos de React"
When el estudiante responde correctamente las preguntas de la Lección 1 (JSX) y Lección 2 (useState)
And responde incorrectamente las preguntas de la Lección 3 (useEffect) y Lección 4 (Custom Hooks)
Then el sistema identifica como "Conocimientos Dominados" a la Lección 1 y Lección 2
And el sistema identifica como "Contenidos por Reforzar" a la Lección 3 y Lección 4
And el sistema recomienda comenzar directamente en la "Lección 3: useEffect" (orden 3)
And la justificación destaca que no empezará desde cero gracias a sus conocimientos previos
```

### Escenario 3: Estudiante con dominio total del módulo
```gherkin
Given un estudiante que domina todos los temas del módulo evaluado
When responde con 100% de aciertos las preguntas generadas a partir del Resumen Pedagógico
Then el sistema clasifica su nivel como "Avanzado"
And muestra todas las lecciones en la sección de Conocimientos Dominados
And recomienda acceder a la última lección del módulo para consolidación o proyecto práctico
```

### Escenario 4: Omisión del diagnóstico
```gherkin
Given un estudiante en el selector de módulos de diagnóstico
When hace clic en "Omitir diagnóstico y ver catálogo general"
Then el modal de diagnóstico se cierra
And el estudiante visualiza el catálogo general de cursos sin deducción de créditos
```

---

## 6. Contratos de Datos (API REST)

### 6.1 Listar Módulos Disponibles para Diagnóstico
- **Ruta**: `GET /api/v1/recommendations/modules`
- **Autenticación**: Pública / Opcional
- **Respuesta 200 OK**:
```json
[
  {
    "id": "uuid-modulo-1",
    "title": "Fundamentos de React y Componentes Modernos",
    "order": 1,
    "courseId": "uuid-curso-1",
    "courseTitle": "Desarrollo Web Fullstack con React y NestJS",
    "category": "Desarrollo Web",
    "lessonsCount": 4,
    "lessons": [
      { "id": "uuid-l1", "title": "Introducción a JSX y Componentes Funcionales", "order": 1 },
      { "id": "uuid-l2", "title": "Gestión de Estado Reactivo con useState", "order": 2 },
      { "id": "uuid-l3", "title": "Efectos Secundarios y Conexión de APIs con useEffect", "order": 3 },
      { "id": "uuid-l4", "title": "Arquitectura de Componentes y Custom Hooks", "order": 4 }
    ]
  }
]
```

### 6.2 Generar Cuestionario Diagnóstico por Módulo
- **Ruta**: `GET /api/v1/recommendations/diagnostic/:moduleId`
- **Autenticación**: Pública / Opcional
- **Respuesta 200 OK**:
```json
{
  "title": "Diagnóstico de Conocimientos Previos: Fundamentos de React",
  "moduleId": "uuid-modulo-1",
  "moduleTitle": "Fundamentos de React y Componentes Modernos",
  "courseId": "uuid-curso-1",
  "courseTitle": "Desarrollo Web Fullstack con React y NestJS",
  "questions": [
    {
      "id": "diag-q-1",
      "lessonId": "uuid-l1",
      "lessonTitle": "Introducción a JSX y Componentes Funcionales",
      "text": "¿Cuál es la principal ventaja de utilizar JSX al componer interfaces en React según el Resumen Pedagógico?",
      "options": [
        "Permite escribir una sintaxis declarativa similar a HTML que se compila a llamadas React.createElement",
        "Reemplaza el motor de bases de datos embebido en el navegador",
        "Obliga a utilizar variables globales sin control de tipos",
        "Impide el uso de funciones y componentes reutilizables"
      ],
      "correctOptionIndex": 0
    }
  ]
}
```

### 6.3 Evaluar Respuestas y Recomendar Inicio Curricular
- **Ruta**: `POST /api/v1/recommendations/diagnostic/evaluate`
- **Autenticación**: Bearer JWT (Estudiante)
- **Cuerpo de Solicitud (DTO)**:
```json
{
  "moduleId": "uuid-modulo-1",
  "answers": [
    {
      "questionId": "diag-q-1",
      "lessonId": "uuid-l1",
      "selectedOptionIndex": 0,
      "isCorrect": true
    },
    {
      "questionId": "diag-q-2",
      "lessonId": "uuid-l2",
      "selectedOptionIndex": 0,
      "isCorrect": true
    },
    {
      "questionId": "diag-q-3",
      "lessonId": "uuid-l3",
      "selectedOptionIndex": 1,
      "isCorrect": false
    }
  ]
}
```
- **Respuesta 201 Created**:
```json
{
  "moduleId": "uuid-modulo-1",
  "moduleTitle": "Fundamentos de React y Componentes Modernos",
  "courseId": "uuid-curso-1",
  "courseTitle": "Desarrollo Web Fullstack con React y NestJS",
  "knowledgeLevel": "Intermedio",
  "scorePercentage": 67,
  "totalQuestions": 3,
  "correctAnswers": 2,
  "masteredLessons": [
    { "id": "uuid-l1", "title": "Introducción a JSX y Componentes Funcionales", "order": 1 },
    { "id": "uuid-l2", "title": "Gestión de Estado Reactivo con useState", "order": 2 }
  ],
  "pendingLessons": [
    { "id": "uuid-l3", "title": "Efectos Secundarios y Conexión de APIs con useEffect", "order": 3, "reason": "Presentó dudas en la evaluación de ciclo de vida y dependencias" }
  ],
  "recommendedLesson": {
    "id": "uuid-l3",
    "title": "Efectos Secundarios y Conexión de APIs con useEffect",
    "order": 3,
    "url": "/lessons/uuid-l3"
  },
  "justification": "¡Excelente progreso! Has demostrado dominar los contenidos iniciales (Introducción a JSX, Gestión de Estado con useState), por lo que no necesitas empezar desde cero. Te recomendamos comenzar directamente en la lección 3 ('Efectos Secundarios y Conexión de APIs con useEffect')."
}
```

---

## 7. Preguntas y Decisiones Resueltas

1. **¿El diagnóstico consume créditos?**  
   **Resuelto**: No. Es 100% gratuito (0 créditos consumidos), garantizando que cualquier estudiante nuevo o existente pueda ubicarse curricularmente sin restricciones financieras.
2. **¿Qué ocurre si el estudiante responde mal a todo el cuestionario?**  
   **Resuelto**: Comienza obligatoriamente desde la **Lección 1 (orden 1)** del módulo seleccionado para aprender los fundamentos paso a paso.
3. **¿Cómo se determina el salto de lecciones para no empezar desde cero?**  
   **Resuelto**: Si el estudiante aprueba los temas de las lecciones consecutivas iniciales (1, 2...), el sistema las marca como dominadas y recomienda arrancar en la primera lección no dominada (ej. Lección 3).
4. **¿Qué insumo utiliza la IA para crear las preguntas?**  
   **Resuelto**: Utiliza el **Resumen Pedagógico de la Clase** (`Lesson.contextText`), garantizando que cada pregunta examine conocimientos reales del contenido de esa clase.
5. **¿El estudiante puede repetir el diagnóstico?**  
   **Resuelto**: Sí, puede evaluarse nuevamente o evaluar distintos módulos las veces que lo requiera.
6. **¿El estudiante puede omitir el diagnóstico?**  
   **Resuelto**: Sí, dispone de un botón visible para omitir y entrar al catálogo general.
