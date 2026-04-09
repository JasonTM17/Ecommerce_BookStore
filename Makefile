# Help target
.PHONY: help
help:
	@echo "BookStore E-Commerce Platform"
	@echo ""
	@echo "Available targets:"
	@echo "  docker-up       - Start all services with Docker Compose"
	@echo "  docker-down     - Stop all services"
	@echo "  backend         - Run Spring Boot backend"
	@echo "  frontend        - Run Next.js frontend"
	@echo "  test            - Run all tests"
	@echo "  clean           - Clean build artifacts"
	@echo "  help            - Show this help message"

# Docker targets
.PHONY: docker-up
docker-up:
	docker-compose up -d
	@echo "Services started. Access:"
	@echo "  - Frontend: http://localhost:3000"
	@echo "  - Backend: http://localhost:8080"
	@echo "  - Swagger: http://localhost:8080/api/swagger-ui.html"

.PHONY: docker-down
docker-down:
	docker-compose down

.PHONY: docker-build
docker-build:
	docker-compose build

# Backend targets
.PHONY: backend
backend:
	cd Backend_Java && mvn spring-boot:run

.PHONY: backend-test
backend-test:
	cd Backend_Java && mvn test

.PHONY: backend-package
backend-package:
	cd Backend_Java && mvn clean package -DskipTests

# Frontend targets
.PHONY: frontend
frontend:
	cd Frontend_NextJS && npm run dev

.PHONY: frontend-install
frontend-install:
	cd Frontend_NextJS && npm install

.PHONY: frontend-build
frontend-build:
	cd Frontend_NextJS && npm run build

# Database targets
.PHONY: db-init
db-init:
	docker-compose -f docker-compose.dev.yml up -d postgres

.PHONY: db-shell
db-shell:
	docker exec -it bookstore-postgres psql -U postgres -d bookstore

# Clean targets
.PHONY: clean
clean:
	cd Backend_Java && mvn clean
	cd Frontend_NextJS && rm -rf .next build
	docker-compose down -v
