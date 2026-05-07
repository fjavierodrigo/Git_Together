# Usamos una imagen ligera de Java 17
FROM eclipse-temurin:17-jdk-jammy

# Directorio de trabajo
WORKDIR /app

# Copiamos el .jar que GitHub ya ha compilado y enviado a la carpeta target/
COPY target/GitTogether-0.0.1-SNAPSHOT.jar app.jar

# Exponemos el puerto 8080
EXPOSE 8080

# Comando para arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
