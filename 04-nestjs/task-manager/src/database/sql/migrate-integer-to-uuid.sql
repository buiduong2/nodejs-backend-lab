-- BEGIN;

-- Thêm 5 cột DDL UUID_future ID tương tứng
ALTER TABLE users
    ADD COLUMN future_id UUID;

ALTER TABLE tasks
    ADD COLUMN future_id UUID,
    ADD COLUMN future_created_by UUID;

ALTER TABLE checklist_items
    ADD COLUMN future_id UUID,
    ADD COLUMN future_task_id UUID;


-- Tạo ra các UUID cho các cột mới
UPDATE users SET future_id = gen_random_uuid();
UPDATE tasks SET future_id = gen_random_uuid();
UPDATE checklist_items SET future_id = gen_random_uuid();

-- Update Các Future FK
UPDATE tasks as t
SET future_created_by = u.future_id
FROM users u
WHERE u.id = t.created_by;

UPDATE checklist_items as c
SET future_task_id = t.future_id
FROM tasks t
WHERE t.id = c.task_id;

-- Validate trước khi switch schema
-- Không có ID trùng
-- Mapping FK chính xác
DO $$
    DECLARE
            v_is_users_unique BOOLEAN;
            v_is_tasks_unique BOOLEAN;
            v_is_checklist_unique BOOLEAN;

            v_is_task_user_FK_correct BOOLEAN;
            v_is_checklist_item_FK_correct BOOLEAN;
    BEGIN
        -- Check Unique users
        SELECT (COUNT(DISTINCT future_id) = COUNT(*)) INTO v_is_users_unique FROM users;
        SELECT (COUNT(DISTINCT future_id) = COUNT(*)) INTO v_is_tasks_unique FROM tasks;
        SELECT (COUNT(DISTINCT future_id) = COUNT(*)) INTO v_is_checklist_unique FROM checklist_items;


        IF NOT (v_is_users_unique AND v_is_tasks_unique AND v_is_checklist_unique) THEN
            RAISE EXCEPTION 'Backfill failed: UUID is NOT unique';
        END IF;

        -- Check MAPPING FK
        SELECT NOT EXISTS (SELECT 1
                           FROM checklist_items AS c
                                    LEFT JOIN tasks AS t ON c.task_id = t.id
                           WHERE (c.task_id IS NULL AND c.future_task_id IS NOT NULL)
                              OR (c.future_task_id IS DISTINCT FROM t.future_id))
        INTO v_is_checklist_item_FK_correct;

        SELECT NOT EXISTS (SELECT 1
                           FROM tasks AS t
                                    LEFT JOIN users AS u ON t.created_by = u.id
                           WHERE (t.created_by IS NULL AND t.future_created_by IS NOT NULL)
                              OR (t.future_created_by IS DISTINCT FROM u.future_id))
        INTO v_is_task_user_FK_correct;


        IF NOT (v_is_checklist_item_FK_correct AND v_is_task_user_FK_correct) THEN
            RAISE EXCEPTION 'Backfill failed: FK mappign not correct';
        END IF;
    END
$$;

-- Thực hiện switch schema
-- DROP 2 FK
DO $$
    DECLARE
        v_contraint_FK_task TEXT;
        v_contraint_FK_checklist_item TEXT;
        v_contraint_PK_user TEXT;
        v_contraint_PK_task TEXT;
        v_contraint_PK_checklist_item TEXT;
    BEGIN

        -- Contraint Tasks
        SELECT con.conname INTO v_contraint_FK_task
        FROM pg_constraint con
                 JOIN pg_class cl ON con.conrelid = cl.oid
                 JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
        WHERE cl.relname = 'tasks'
          AND con.contype = 'f'
          AND att.attname = 'created_by';

        SELECT con.conname INTO v_contraint_PK_task
        FROM pg_constraint con
                 JOIN pg_class cl ON con.conrelid = cl.oid
                 JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
        WHERE cl.relname = 'tasks'
          AND con.contype = 'p'
          AND att.attname = 'id';

        -- Contraint users
        SELECT con.conname INTO v_contraint_PK_user
        FROM pg_constraint con
                 JOIN pg_class cl ON con.conrelid = cl.oid
                 JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
        WHERE cl.relname = 'users'
          AND con.contype = 'p'
          AND att.attname = 'id';

        -- Contraint checklistitem
        SELECT con.conname INTO v_contraint_PK_checklist_item
        FROM pg_constraint con
                 JOIN pg_class cl ON con.conrelid = cl.oid
                 JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
        WHERE cl.relname = 'checklist_items'
          AND con.contype = 'p'
          AND att.attname = 'id';

        SELECT con.conname INTO v_contraint_FK_checklist_item
        FROM pg_constraint con
                 JOIN pg_class cl ON con.conrelid = cl.oid
                 JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
        WHERE cl.relname = 'checklist_items'
          AND con.contype = 'f'
          AND att.attname = 'task_id';

        -- Nếu tìm thấy thì tiến hành DROP
        IF v_contraint_FK_task IS NOT NULL AND
           v_contraint_FK_checklist_item IS NOT NULL AND
           v_contraint_PK_user IS NOT NULL AND
           v_contraint_PK_task IS NOT NULL AND
           v_contraint_PK_checklist_item IS NOT NULL THEN
            EXECUTE format('ALTER TABLE tasks DROP CONSTRAINT %I', v_contraint_FK_task);
            EXECUTE format('ALTER TABLE checklist_items DROP CONSTRAINT %I', v_contraint_FK_checklist_item);

            EXECUTE format('ALTER TABLE tasks DROP CONSTRAINT %I', v_contraint_PK_task);
            EXECUTE format('ALTER TABLE checklist_items DROP CONSTRAINT %I', v_contraint_PK_checklist_item);
            EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', v_contraint_PK_user);


            RAISE NOTICE 'Đã xóa thành công constraint: %', v_contraint_FK_task;
        ELSE
            RAISE EXCEPTION 'Không tìm thấy constraint nào trỏ qua cột created_by!';
        END IF;
    END $$;

-- Thực hiện đổi tên cột cũ

ALTER TABLE users
    RENAME COLUMN id TO legacy_id;
ALTER TABLE tasks
    RENAME COLUMN id TO legacy_id;
ALTER TABLE checklist_items
    RENAME COLUMN id TO legacy_id;

ALTER TABLE tasks
    RENAME COLUMN created_by TO legacy_created_by;
ALTER TABLE checklist_items
    RENAME COLUMN task_id TO legacy_task_id;

-- Cho phép các cột FK cũ nhận NULL
ALTER TABLE tasks
    ALTER COLUMN legacy_created_by DROP NOT NULL;

ALTER TABLE checklist_items
    ALTER COLUMN legacy_task_id DROP NOT NULL;

-- Thực hiện đổi tên cột mới
ALTER TABLE users
    RENAME COLUMN future_id TO id;
ALTER TABLE tasks
    RENAME COLUMN future_id TO id;
ALTER TABLE checklist_items
    RENAME COLUMN future_id TO id;

ALTER TABLE tasks
    RENAME COLUMN future_created_by TO created_by;
ALTER TABLE checklist_items
    RENAME COLUMN future_task_id TO task_id;

-- Tạo các PK mới

ALTER TABLE users
    ADD CONSTRAINT pk_users_id PRIMARY KEY (id);
ALTER TABLE tasks
    ADD CONSTRAINT pk_tasks_id PRIMARY KEY (id);
ALTER TABLE checklist_items
    ADD CONSTRAINT pk_checklist_items_id PRIMARY KEY (id);

-- Tạo FK mới

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by)
            REFERENCES users(id);

ALTER TABLE checklist_items
    ADD CONSTRAINT fk_task_id
        FOREIGN KEY (task_id)
            REFERENCES tasks(id);
ALTER TABLE tasks
    ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE checklist_items
    ALTER COLUMN task_id SET NOT NULL;
-- Thiết lập tự sinh UUID
ALTER TABLE users
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE tasks
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE checklist_items
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
-- DROP 3 PK
-- Đổi tên cột cũ -- Legacy để giữ để đối chiếu
-- ĐỔi tên 5 cột mới
-- Thiết lập PK mới
-- Tạo lại 2 FK Constraint
-- Thiết lập DEFAULT Sinh UUID

-- Validate sau khi switch schema
DO $$
    DECLARE
        v_users_count BIGINT;
        v_tasks_count BIGINT;
        v_checklist_count BIGINT;

        v_is_users_pk_valid BOOLEAN;
        v_is_tasks_pk_valid BOOLEAN;
        v_is_checklist_pk_valid BOOLEAN;

        v_is_task_user_fk_correct BOOLEAN;
        v_is_checklist_task_fk_correct BOOLEAN;

        v_is_uuid_default_valid BOOLEAN;
    BEGIN
        -- 1. Kiểm tra số lượng bản ghi
        SELECT COUNT(*) INTO v_users_count FROM users;
        SELECT COUNT(*) INTO v_tasks_count FROM tasks;
        SELECT COUNT(*) INTO v_checklist_count FROM checklist_items;

        IF v_users_count <> 1
            OR v_tasks_count <> 10
            OR v_checklist_count <> 19 THEN
            RAISE EXCEPTION
                'Record count mismatch: users=%, tasks=%, checklist=%',
                v_users_count, v_tasks_count, v_checklist_count;
        END IF;

        -- 2. Kiểm tra UUID PK không NULL và không trùng
        SELECT COUNT(DISTINCT id) = COUNT(*)
        INTO v_is_users_pk_valid
        FROM users;

        SELECT COUNT(DISTINCT id) = COUNT(*)
        INTO v_is_tasks_pk_valid
        FROM tasks;

        SELECT COUNT(DISTINCT id) = COUNT(*)
        INTO v_is_checklist_pk_valid
        FROM checklist_items;

        IF NOT (
            v_is_users_pk_valid
                AND v_is_tasks_pk_valid
                AND v_is_checklist_pk_valid
            ) THEN
            RAISE EXCEPTION 'Post-switch validation failed: Invalid UUID primary key';
        END IF;

        -- 3. Kiểm tra mapping Task -> User
        SELECT NOT EXISTS (
            SELECT 1
            FROM tasks AS t
                     LEFT JOIN users AS u
                               ON t.legacy_created_by = u.legacy_id
            WHERE t.created_by IS DISTINCT FROM u.id
        )
        INTO v_is_task_user_fk_correct;

        -- 4. Kiểm tra mapping ChecklistItem -> Task
        SELECT NOT EXISTS (
            SELECT 1
            FROM checklist_items AS c
                     LEFT JOIN tasks AS t
                               ON c.legacy_task_id = t.legacy_id
            WHERE c.task_id IS DISTINCT FROM t.id
        )
        INTO v_is_checklist_task_fk_correct;

        IF NOT (
            v_is_task_user_fk_correct
                AND v_is_checklist_task_fk_correct
            ) THEN
            RAISE EXCEPTION 'Post-switch validation failed: Foreign key mapping incorrect';
        END IF;

        -- 5. Kiểm tra default sinh UUID cho 3 bảng
        SELECT COUNT(*) = 3
        INTO v_is_uuid_default_valid
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('users', 'tasks', 'checklist_items')
          AND column_name = 'id'
          AND data_type = 'uuid'
          AND is_nullable = 'NO'
          AND column_default = 'gen_random_uuid()';

        IF NOT v_is_uuid_default_valid THEN
            RAISE EXCEPTION 'Post-switch validation failed: UUID column/default incorrect';
        END IF;

        RAISE NOTICE 'Post-switch validation completed successfully';
    END
$$;

-- ROLLBACK;

