# 1) Build the Angular app into api/src/main/resources/static
FROM node:24-slim AS web
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npx ng build --configuration production,bundle

# 2) Build the Spring Boot jar with the Angular files inside
FROM eclipse-temurin:21-jdk AS api
WORKDIR /app/api
COPY api/ ./
COPY --from=web /app/api/src/main/resources/static ./src/main/resources/static
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q clean package -DskipTests

# 3) Run it
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=api /app/api/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]