CREATE TABLE
    users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL
    );

CREATE TABLE
    tasks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_by BIGINT REFERENCES users (id)
    );

CREATE TABLE
    checklist_items (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        task_id BIGINT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        content VARCHAR(255) NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE
    );