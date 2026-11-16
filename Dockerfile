# Multi-service build pointer - see docker-compose.yml for complete stack orchestration
# Individual services:
# - Backend: backend-springboot/Dockerfile
# - Frontend: frontend-react/Dockerfile

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
EXPOSE 8080
CMD ["echo", "Please use 'docker-compose up --build' to run the full application suite (Frontend + Backend + Zeebe + Operate + Elasticsearch)."]

