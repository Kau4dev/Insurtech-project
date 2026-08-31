# AGENTS.md

InsurTech: insurance claims/underwriting (P&C) platform, event-driven microservices. Design/spec lives in `insurtech-projeto(1).md` (Portuguese) — useful for domain context, but parts (Outbox, kafka-ui, frontend) are not yet implemented; trust code over that doc.

## Architecture

- 7 **independent** Spring Boot 3.5.16 / Java 21 Maven apps under `backend/`. Each has its own `pom.xml` + `./mvnw` wrapper. **No parent/root pom and no multi-module build** — build and test each service from its own directory.
- Clean Architecture inside every service: layers `interfaces` (controllers/exception handlers) → `application` (usecase + dto + port) → `domain` ↔ `infrastructure` (persistence, mapper, messaging, client, security). Tests mirror this as `unit/` and `integration/`.
- Ports: gateway `8080`, auth `8084`, segurados `8085`, apolices `8086`, sinistros `8087`, liquidacao `8088`, notificacao `8089`.
- One Postgres database **per service** (`auth_db`, `segurados_db`, ...) created by `init-databases.sql`. DB user/pass `insurtech`/`insurtech`, overridable via `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`. Kafka at `localhost:9092`.
- `liquidacao-service` and `notificacao-service` are **headless Kafka consumers** (no business REST API); `gateway-service` is reactive WebFlux and the only entry the frontend should call.
- Frontend is a React 19 + Vite + Tailwind v4 app (`frontend/`, own `AGENTS.md`). Scaffolded — routing/API/pages still being built; the backend gateway (`:8080`) is its only entry.

## Commands (run from `backend/<service>`)

- Build/test one service: `./mvnw test`
- Integr. tests: `./mvnw test -Dtest='*IT'` (plain `./mvnw test` **skips them**: no surefire/failsafe config, so `*IT` classes are compiled but not run by default). Unit tests are `*Test`.
- Run all of a service: `./mvnw test -Dtest='*Test,*IT'`
- Run a service locally: `./mvnw spring-boot:run`
- Infra only: `docker compose up -d postgres kafka`. Microservice builds are **commented out** in `docker-compose.yml` — they are run manually, not via compose.

## Testing gotchas

- Unit tests use JUnit 5 + Mockito, no Spring context.
- Integration tests (`*IT`) extend an abstract `IntegrationTestBase` and use **Testcontainers** (PostgreSQL 16 + Kafka) → **Docker must be running**; they self-provide the datasource (sinistros via `@ServiceConnection`, auth via `@DynamicPropertySource`). There is **no `application-test.properties`** — don't assume one exists.
- Test method names and domain exception classes are in **Portuguese** (e.g. `deveMarcarComoPagoQuandoReceberEvento...`, `SinistroNaoEncontradoException`). Follow this convention.

## Conventions & gotchas

- `spring.jpa.hibernate.ddl-auto=validate`: Hibernate never creates tables. Schema comes only from Flyway migrations under `src/main/resources/db/migration` (`V1__...`, `V2__...`). Add/rename columns via a new migration, not by editing entities alone.
- MapStruct + Lombok generate mappers/DTOs (see `maven-compiler-plugin` annotation processor paths). Don't hand-roll mapping that already has a `*Mapper`.
- DTO/domain mapping, validation, controller contracts (§use case → DTO). Keep interfaces in `interfaces/controller` doc'd (`*ControllerDocs`).

## Auth / security (recent WIP, applies to sinistros/segurados/apolices e.g.)

- `gateway-service` validates JWTs (shared secret with `auth-service`, `JWT_SECRET`) and forwards the authenticated user to downstream services (and cannot trust only self — see below).
- Services read the acting user from **headers `X-Usuario-Id` and `X-Usuario-Papel`** via `infrastructure/security/UserContextFilter` + `UserContextHolder`. Use cases verify the acting user's papel (e.g. `ANALISTA`/`GESTOR`/`ADMIN` in `Papel`) and throw domain exceptions like `AcessoNegadoException` / `UsuarioNaoAutenticadoException`.
- For authz tests/IT, set these headers (or mock the acting user) or they will behave as unauthenticated.

## Kafka notes

- JSON serialization; `sinistros` and `liquidacao` set `use.type.headers=false` + `value.default.type` to a specific DTO/event class; `spring.json.trusted.packages=*`. When adding a new event, match this envelope naming (`domain/event/...`) and the consumer's `value.default.type`.
- Consumers use `auto-offset-reset=earliest`; `sinistros` produces approval/payment events that `liquidacao`/`notificacao` consume.
- Cross-service sync calls go through **OpenFeign** clients (`infrastructure/client/*.java`) with Resilience4j circuit breaking; URLs via `services.<x>.url` (default to `localhost`).

## Style / standards

- Portuguese for everything user-facing and domain-facing; English is fine for private identifiers.
- Keep services decoupled: prefer events (Kafka) for cross-service propagation; use Feign for direct reads.
- Exact parity between commit scope and test coverage (recent work pairs every use case change with a unit `-UseCaseTest` and, where relevant, `*IT`).