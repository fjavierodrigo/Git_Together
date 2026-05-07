# ETAPA 1: Compilación
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Copiamos el pom.xml primero para descargar las librerías y ahorrar tiempo
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el código fuente y generamos el .jar
COPY src ./src
RUN mvn clean package -DskipTests

# ETAPA 2: Ejecución
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
# Copiamos solo el .jar generado (ajustado al nombre en pom.xml)
COPY --from=build /app/target/GitTogether-0.0.1-SNAPSHOT.jar app.jar

# Exponemos el puerto 8080
EXPOSE 8080

# Comando para arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
