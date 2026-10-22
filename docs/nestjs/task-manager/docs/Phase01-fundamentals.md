
## Các bảng 

- `users`

```
Field	PostgreSQL Type	Constraint
id	BIGINT	PRIMARY KEY, IDENTITY
username	VARCHAR(100)	NOT NULL, UNIQUE
password	VARCHAR(255)	NOT NULL
role	VARCHAR(20)	NOT NULL, DEFAULT 'USER'
created_at	TIMESTAMPTZ	DEFAULT NOW()
```


- `tasks`

```
Field	PostgreSQL Type	Constraint
id	BIGINT	PRIMARY KEY, IDENTITY
title	VARCHAR(150)	NOT NULL
description	TEXT	NULL
status	VARCHAR(20)	DEFAULT 'TODO'
created_by	BIGINT	FK → users(id), NOT NULL
created_at	TIMESTAMPTZ	DEFAULT NOW()
updated_at	TIMESTAMPTZ	DEFAULT NOW()
```

- checklist_items

```
Field	PostgreSQL Type	Constraint
id	BIGINT	PRIMARY KEY, IDENTITY
content	VARCHAR(255)	NOT NULL
is_completed	BOOLEAN	DEFAULT FALSE
task_id	BIGINT	FK → tasks(id), NOT NULL
```