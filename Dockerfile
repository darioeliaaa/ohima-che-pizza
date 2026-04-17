# Fase 1: Compila il codice usando Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Fase 2: Crea l'ambiente leggero per far girare l'app
FROM eclipse-temurin:21-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Espone la porta usata di default da Spring Boot
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]