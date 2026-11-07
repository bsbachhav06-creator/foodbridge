# Stage 1: Build application with Maven
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copy pom.xml and download dependencies first (leveraging Docker layer cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system group and user
RUN addgroup -S spring && adduser -S spring -G spring

# Create uploads directory with appropriate permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copy the built jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/foodbridge-backend-*.jar app.jar

USER spring:spring

EXPOSE 8080

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
