// backend/prisma/seed.ts
import { PrismaClient, Role, CourseStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos demo oficiales de Skylearn con Resumen Pedagógico curricular...');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('Password123!', saltRounds);

  // 1. Usuario Estudiante Demo (con 3 créditos iniciales)
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      name: 'Estudiante Demo',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  await prisma.creditAccount.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, balance: 3 },
  });

  // 2. Usuario Docente Demo
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      email: 'teacher@test.com',
      name: 'Profesor Demo',
      passwordHash,
      role: Role.TEACHER,
    },
  });

  // 3. Usuario Administrador Demo
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Administrador Demo',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 4. Categoría 1: Desarrollo Web
  const categoryWeb = await prisma.courseCategory.upsert({
    where: { name: 'Desarrollo Web' },
    update: {},
    create: {
      name: 'Desarrollo Web',
      description: 'Cursos de frontend, backend y arquitectura de software moderna',
    },
  });

  // Curso 1: Desarrollo Web Fullstack
  const course1 = await prisma.course.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Desarrollo Web Fullstack con React y NestJS',
      description: 'Aprende a construir aplicaciones escalables desacopladas con TypeScript, Three.js y Postgres',
      teacherId: teacher.id,
      categoryId: categoryWeb.id,
      status: CourseStatus.PUBLISHED,
    },
  });

  // Módulo 1.1: Fundamentos de React
  const moduleReact = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      title: 'Módulo 1: Fundamentos de React y Componentes Modernos',
      order: 1,
      courseId: course1.id,
    },
  });

  // Lecciones Módulo 1.1 con Resumen Pedagógico de la Clase y Videos Educativos Propios
  const lesson1 = await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000100' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=7iobxzd_2wY',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase enseña la anatomía básica de React, qué es JSX frente a HTML, cómo declarar componentes funcionales y renderizar propiedades (props). Objetivos clave: identificar etiquetas JSX, comprender la transpilación de Babel y crear el primer componente modular.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000100',
      title: 'Introducción a JSX y Componentes Funcionales',
      videoUrl: 'https://www.youtube.com/watch?v=7iobxzd_2wY',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase enseña la anatomía básica de React, qué es JSX frente a HTML, cómo declarar componentes funcionales y renderizar propiedades (props). Objetivos clave: identificar etiquetas JSX, comprender la transpilación de Babel y crear el primer componente modular.',
      order: 1,
      moduleId: moduleReact.id,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=4ORZ1GmrfMc',
      contextText: 'Resumen Pedagógico de la Clase: Esta lección cubre el Hook useState, el concepto fundamental de inmutabilidad en el estado, cómo actualizar arrays y objetos sin mutación directa, y cómo disparar re-renderizados ante eventos del usuario en formularios interactivos.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Gestión de Estado Reactivo con useState',
      videoUrl: 'https://www.youtube.com/watch?v=4ORZ1GmrfMc',
      contextText: 'Resumen Pedagógico de la Clase: Esta lección cubre el Hook useState, el concepto fundamental de inmutabilidad en el estado, cómo actualizar arrays y objetos sin mutación directa, y cómo disparar re-renderizados ante eventos del usuario en formularios interactivos.',
      order: 2,
      moduleId: moduleReact.id,
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000102' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase profundiza en la gestión del ciclo de vida y efectos secundarios. Se explican peticiones asíncronas con fetch/axios, el array de dependencias, la prevención de bucles infinitos y la función de limpieza (cleanup function) para fugas de memoria.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      title: 'Efectos Secundarios y Conexión de APIs con useEffect',
      videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase profundiza en la gestión del ciclo de vida y efectos secundarios. Se explican peticiones asíncronas con fetch/axios, el array de dependencias, la prevención de bucles infinitos y la función de limpieza (cleanup function) para fugas de memoria.',
      order: 3,
      moduleId: moduleReact.id,
    },
  });

  const lesson4 = await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000103' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
      contextText: 'Resumen Pedagógico de la Clase: Esta lección enseña a encapsular lógica de negocio compleja en Hooks personalizados (Custom Hooks). Objetivos: separar la lógica de presentación de la lógica de datos, respetar las reglas de los hooks y componer múltiples hooks en arquitecturas limpias.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000103',
      title: 'Arquitectura de Componentes y Custom Hooks',
      videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
      contextText: 'Resumen Pedagógico de la Clase: Esta lección enseña a encapsular lógica de negocio compleja en Hooks personalizados (Custom Hooks). Objetivos: separar la lógica de presentación de la lógica de datos, respetar las reglas de los hooks y componer múltiples hooks en arquitecturas limpias.',
      order: 4,
      moduleId: moduleReact.id,
    },
  });

  // Módulo 1.2: Backend con NestJS
  const moduleNest = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      title: 'Módulo 2: Arquitectura Backend con NestJS y APIs REST',
      order: 2,
      courseId: course1.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=0M8AYU_hPas',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      title: 'Fundamentos de NestJS: Controladores y Rutas',
      videoUrl: 'https://www.youtube.com/watch?v=0M8AYU_hPas',
      contextText: 'Resumen Pedagógico de la Clase: Introducción a la arquitectura modular de NestJS inspirada en Angular. Se explica el uso de decoradores HTTP (@Controller, @Get, @Post), la estructura de módulos y el manejo de parámetros de ruta y queries.',
      order: 1,
      moduleId: moduleNest.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000202' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=8_X0nSrzrCw',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000202',
      title: 'Inyección de Dependencias y Capa de Servicios',
      videoUrl: 'https://www.youtube.com/watch?v=8_X0nSrzrCw',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase trata el principio de inversión de control y el contenedor IoC de NestJS. Se enseña a crear proveedores con @Injectable(), inyectar servicios en controladores y desacoplar la lógica de negocio de la capa de transporte.',
      order: 2,
      moduleId: moduleNest.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000203' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=uAKzFhE3rxA',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000203',
      title: 'Validación de DTOs y Seguridad con JWT',
      videoUrl: 'https://www.youtube.com/watch?v=uAKzFhE3rxA',
      contextText: 'Resumen Pedagógico de la Clase: En esta clase se implementa validación rigurosa de entradas mediante class-validator y ValidationPipe global. Además, se cubre la autenticación con JSON Web Tokens, AuthGuards personalizados y protección de rutas privadas.',
      order: 3,
      moduleId: moduleNest.id,
    },
  });

  // 5. Categoría 2: Inteligencia Artificial
  const categoryAI = await prisma.courseCategory.upsert({
    where: { name: 'Inteligencia Artificial' },
    update: {},
    create: {
      name: 'Inteligencia Artificial',
      description: 'Modelos de lenguaje, agentes autónomos y visión computacional',
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Inteligencia Artificial y Modelos Multimodales',
      description: 'Domina los LLMs, ingeniería de prompts avanzada, tool calling y arquitecturas agénticas',
      teacherId: teacher.id,
      categoryId: categoryAI.id,
      status: CourseStatus.PUBLISHED,
    },
  });

  const moduleAI = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000030' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000030',
      title: 'Módulo 1: Fundamentos de Modelos de Lenguaje y Prompts',
      order: 1,
      courseId: course2.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000301' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000301',
      title: 'Introducción a los LLMs y Arquitectura Transformer',
      videoUrl: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase presenta los fundamentos de las redes Transformer, el mecanismo de auto-atención (self-attention), la diferencia entre modelos base y fine-tuned, y cómo los tokens componen la ventana de contexto.',
      order: 1,
      moduleId: moduleAI.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000302' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=_ZvnD93Mr5Q',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000302',
      title: 'Ingeniería de Prompts y Few-Shot Learning',
      videoUrl: 'https://www.youtube.com/watch?v=_ZvnD93Mr5Q',
      contextText: 'Resumen Pedagógico de la Clase: Esta lección enseña técnicas avanzadas para guiar a los LLMs: formulación con rol de sistema, delimitadores semánticos, few-shot prompting con ejemplos y mitigación activa de alucinaciones.',
      order: 2,
      moduleId: moduleAI.id,
    },
  });

  await prisma.lesson.upsert({
    where: { id: '00000000-0000-0000-0000-000000000303' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=j0b2pgeZk48',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000303',
      title: 'Llamadas a Funciones y Agentes Inteligentes',
      videoUrl: 'https://www.youtube.com/watch?v=j0b2pgeZk48',
      contextText: 'Resumen Pedagógico de la Clase: Esta clase aborda la integración de modelos con herramientas externas (Function Calling / Tool Calling). Se explica cómo definir esquemas JSON, orquestar bucles de razonamiento y ejecutar acciones en sistemas externos.',
      order: 3,
      moduleId: moduleAI.id,
    },
  });

  // Examen de la lección 1 con preguntas y opciones para compatibilidad con suites
  const exam1 = await prisma.exam.upsert({
    where: { id: '00000000-0000-0000-0000-000000001000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000001000',
      lessonId: lesson1.id,
      title: 'Examen de Comprobación: JSX y Componentes',
      passScore: 70.0,
    },
  });

  const q1 = await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000010000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000010000',
      examId: exam1.id,
      text: '¿Qué es JSX en el ecosistema de React?',
      points: 1.0,
    },
  });

  await prisma.option.upsert({
    where: { id: '00000000-0000-0000-0000-000000100001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000100001',
      questionId: q1.id,
      text: 'Una extensión de sintaxis de JavaScript que permite escribir estructuras similares a HTML',
      isCorrect: true,
    },
  });

  await prisma.option.upsert({
    where: { id: '00000000-0000-0000-0000-000000100002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000100002',
      questionId: q1.id,
      text: 'Un motor de base de datos relacional embebido',
      isCorrect: false,
    },
  });

  console.log('✅ Base de datos sembrada con 2 cursos, 3 módulos y 10 lecciones con Resumen Pedagógico.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
