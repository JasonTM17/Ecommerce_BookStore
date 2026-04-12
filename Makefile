# Help target
.PHONY: help
help:
	@echo "BookStore E-Commerce Platform"
	@echo ""
	@echo "Available targets:"
	@echo "  docker-up       - Start all services with Docker Compose"
	@echo "  docker-down     - Stop all services"
	@echo "  backend         - Run Spring Boot backend with local profile"
	@echo "  backend-dev     - Run Spring Boot backend with dev profile"
	@echo "  frontend        - Run Next.js frontend"
	@echo "  test            - Run all tests"
	@echo "  clean           - Clean build artifacts"
	@echo "  help            - Show this help message"

# Docker targets
.PHONY: docker-up
docker-up:
	docker compose up -d --build
	@echo "Services started. Access:"
	@echo "  - Frontend: http://localhost:3001"
	@echo "  - Backend: http://localhost:8080"
	@echo "  - Swagger: http://localhost:8080/api/swagger-ui.html"

.PHONY: docker-down
docker-down:
	docker compose down

.PHONY: docker-build
docker-build:
	docker compose build

# Backend targets
.PHONY: backend
backend:
	cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

.PHONY: backend-dev
backend-dev:
	cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev

.PHONY: backend-test
backend-test:
	cd backend && mvn test

.PHONY: backend-package
backend-package:
	cd backend && mvn clean package -DskipTests

# Frontend targets
.PHONY: frontend
frontend:
	cd frontend && npm run dev

.PHONY: frontend-install
frontend-install:
	cd frontend && npm install

.PHONY: frontend-build
frontend-build:
	cd frontend && npm run build

# Database targets
.PHONY: db-init
db-init:
	docker compose -f docker-compose.dev.yml up -d postgres

.PHONY: db-shell
db-shell:
	docker exec -it bookstore-postgres psql -U postgres -d bookstore

# Clean targets
.PHONY: clean
clean:
	cd backend && mvn clean
	cd frontend && rm -rf .next build
	docker compose down -v
