CREATE DATABASE detalhador_de_chamados;

\c detalhador_de_chamados

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "public"."category" (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY(start 1) NOT NULL,
    name VARCHAR(250) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_id_category" PRIMARY KEY ("id")
);

CREATE TABLE "public"."problem" (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY(start 1),
    name VARCHAR(250),
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id INTEGER,

    CONSTRAINT "PK_id_problem" PRIMARY KEY ("id"),
    CONSTRAINT "FK_category_id" FOREIGN KEY ("category_id")
        REFERENCES "public"."category" ("id")
        ON DELETE RESTRICT

);

CREATE TABLE "public"."request" (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY(start 1),
    attendant_name VARCHAR(250) NOT NULL,
    applicant_name VARCHAR(250) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    place_id VARCHAR(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    workstation_id INTEGER,
    CONSTRAINT "PK_id_request" PRIMARY KEY ("id")
);

CREATE TYPE "public"."priority" AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE "public"."status" AS ENUM ('pending', 'in_progress', 'not_solved', 'outsourced', 'solved');

CREATE TABLE "public"."has" (
    id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY(start 1),
    category_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    request_id INTEGER NOT NULL,
    request_status "public"."status" NOT NULL DEFAULT 'pending',
    event_date TIMESTAMP,
    is_event BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    priority "public"."priority" NOT NULL DEFAULT 'normal',
    CONSTRAINT "PK_id_has" PRIMARY KEY ("id"),
    CONSTRAINT "FK_problem_id" FOREIGN KEY ("problem_id")
        REFERENCES "public"."problem" ("id")
        ON DELETE RESTRICT,
    CONSTRAINT "FK_request_id" FOREIGN KEY ("request_id")
        REFERENCES request ("id")
        ON DELETE SET NULL
);

CREATE TABLE "public"."alert_date" (
    has_id INTEGER NOT NULL,
    alert_date DATE NOT NULL,
    CONSTRAINT "FK_has_id" FOREIGN KEY ("has_id")
        REFERENCES "public"."has" ("id")
        ON DELETE CASCADE
);
