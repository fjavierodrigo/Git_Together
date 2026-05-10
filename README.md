# 📚 GitTogether - Foro para desarrolladores

![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.14-6DB33F?logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--time-blue?logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?logo=docker&logoColor=white)

**GitTogether** es una plataforma colaborativa diseñada para desarrolladores, donde pueden compartir conocimientos, resolver dudas técnicas y colaborar en proyectos. El sistema ofrece una experiencia fluida con soporte para Markdown, gestión avanzada de usuarios y almacenamiento seguro en la nube.

---

## 🛠️ Tecnologías y Guía Técnica

Este proyecto está dividido en dos grandes bloques: un backend robusto basado en microservicios (Spring Boot) y un frontend dinámico y reactivo (Angular).

### 🖥️ Backend (Core API)
Ubicado en la carpeta `gittogether-backend/`.

- **Lenguaje:** Java 17
- **Framework:** Spring Boot 3.5.14
- **Seguridad:** Spring Security con **JWT (JSON Web Tokens)** para autenticación Stateless.
- **Comunicación:** WebSockets (STOMP) para chat en tiempo real.
- **Validación:** Jakarta Bean Validation (Validación de Beans de entrada).
- **Persistencia:** Spring Data JPA con **MySQL**.
- **Almacenamiento:** Integración con **AWS S3** para el manejo de archivos multimedia.
- **Documentación:** Swagger / OpenAPI UI 3.0.
- **Otras dependencias:** Lombok (Productividad), Jackson (Serialización JSON).

### 🌐 Frontend (Interfaz de Usuario)
Ubicado en la carpeta `gittogether-frontend/`.

- **Framework:** Angular 21.2.0
- **Lenguaje:** TypeScript 5.9
- **Estilos:** Vanilla CSS (Diseño Custom, Responsive y Modo Oscuro).
- **Markdown:** `ngx-markdown` para renderizado de posts y comentarios.
- **Resaltado de Código:** `prismjs`.
- **Pruebas:** Vitest y JSDOM.

### 🏗️ Infraestructura y DevOps
- **Contenedores:** Docker para despliegue consistente.
- **CI/CD:** Pipelines automatizados mediante **GitHub Actions** (`backend-cicd.yml` y `frontend-cicd.yml`).
- **Cloud:** Despliegue en AWS (EC2/S3).

---

## ✨ Características Principales

| Módulo | Funcionalidad |
| :--- | :--- |
| **🛡️ Seguridad** | Control de acceso (RBAC), Sistema de Baneo con restricciones en UI/API, Encriptación BCrypt. |
| **💬 Chat** | Comunicación instantánea mediante WebSockets. |
| **📝 Editor** | Soporte completo para Markdown en temas y comentarios. |
| **📁 Archivos** | Gestión de archivos con URLs prefirmadas de AWS S3. |
| **🔍 Búsqueda** | Sistema de filtrado por etiquetas, categorías y palabras clave. |
| **👨‍💼 Panel Admin** | Gestión total de usuarios, temas y moderación de contenido. |

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **JDK 17** o superior.
- **Node.js 20+** y **npm**.
- **MySQL 8.0** en ejecución.
- **Maven 3.x**.

### 2. Configuración del Backend
1. Navega a la carpeta del backend:
   ```bash
   cd gittogether-backend
   ```
2. Configura tus credenciales en `src/main/resources/application.properties` (Base de datos, AWS, JWT secret).
3. Compila y ejecuta:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *La API estará disponible en `http://localhost:8080`*

### 3. Configuración del Frontend
1. Navega a la carpeta del frontend:
   ```bash
   cd gittogether-frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
   *La aplicación estará disponible en `http://localhost:4200`*

---

## 📚 Guía de Uso de la API (Swagger)

Una vez que el backend esté en funcionamiento, puedes acceder a la interfaz interactiva de Swagger para probar los endpoints:
👉 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 🧪 Ejecución de Pruebas

- **Backend:** `mvn test` (Incluye pruebas unitarias con **JUnit 5** y **Mockito** para validación de datos).
- **Frontend:** `npm test`

---

## 👤 Autores y Tutor

- **Francisco Javier Rodrigo Espinosa** — *Desarrollador* (IES Virgen de la Paloma)
- **Alejandro Julián López Gamito** — *Desarrollador* (IES Virgen de la Paloma)
- **Isidoro Nevares Martín** — *Tutor del proyecto*

---

## 📄 Licencia
Proyecto académico desarrollado como Trabajo de Fin de Grado (TFG). Todos los derechos reservados para fines educativos.
