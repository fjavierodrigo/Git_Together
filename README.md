# 📚 Git Together - Foro para desarrolladores

![Java](https://img.shields.io/badge/Java-17+-007396?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-20+-DD0031?logo=angular)
![MySQL](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3-FF9900?logo=amazonaws)
![Docker](https://img.shields.io/badge/Docker-24+-2496ED?logo=docker)

## 📖 Descripción

**Git Together** es un foro colaborativo orientado al desarrollo de aplicaciones multiplataforma. Permite a los usuarios publicar dudas o consultas técnicas y responder a otros miembros de la comunidad, fomentando el intercambio de conocimiento, la resolución de problemas y el aprendizaje colaborativo..

## ✨ Características principales

| Área | Funcionalidades |
|:---|:---|
| **Gestión de colecciones** | CRUD completo de recursos, categorías, etiquetas, autores y tipos |
| **Autenticación** | Registro/login con JWT, contraseñas encriptadas con BCrypt |
| **Búsqueda avanzada** | Filtros combinados (tags, categorías, temas) |
| **Almacenamiento de archivos** | Subida y descarga de archivos a AWS S3 con URLs prefirmadas |
| **Documentación API** | Swagger/OpenAPI disponible en `/swagger-ui/index.html` |
| **CI/CD** | Pipeline automatizado con GitHub Actions (tests, build, Docker, GHCR) |
| **Markdown** | Edición de texto con librerías de markdown |

## 🛠️ Tecnologías

### Backend
- Java 17+
- Spring Boot 3.4.4
- Spring Data MySQL
- Spring Security (JWT)
- MySQL
- Maven

### Frontend
- TypeScript
- Angular 20+

### Infraestructura
- AWS EC2
- AWS S3
- Docker
- GitHub Actions

## 🚀 Instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/fjavierodrigo/Git_Together.git
mirar comando de cd
```

### Backend (Spring Boot)
```bash
cd theca-backend
mvn clean package
java -jar target/theca-backend-0.0.1-SNAPSHOT.jar
```
La API estará disponible en http://localhost:8080

### Frontend (Angular)
```bash
cd theca-frontend
npm install
ng serve
```
La aplicación estará disponible en http://localhost:4200

### Markdown
```bash
cd gittogether-frontend
npm install
ng serve
```

Con Docker
```bash
docker build -t theca-backend .
docker run -p 8080:8080 theca-backend
```

## 📚 Documentación de la API
Una vez ejecutado el backend, la documentación Swagger está disponible en http://localhost:8080/swagger-ui/index.html

## 📁 Estructura del proyecto
```bash
Git_Together/
├── gittogether-backend/                     # Backend Spring Boot
│   ├── src/main/java/gittogether/tfg        # Código fuente
│   ├── src/main/resources/                  # Configuración
│   └── pom.xml
├── gittogether-frontend/                    # Frontend Angular (en desarrollo)
├── Dockerfile
├── .github/workflows/ci-cd.yml              # Pipeline CI/CD
└── README.md
```

## 🧪 Pruebas
```bash
cd theca-backend
mvn test
```

## 👤 Autor
Francisco Javier Rodrigo Espinosa — IES Virgen de la Paloma  
Alejandro Julián López Gamito — IES Virgen de la Paloma
Tutor: Isidoro Nevares Martín

## 📄 Licencia
Proyecto académico sin fines comerciales.
