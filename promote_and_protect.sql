-- PUYOKO Database Updates: Director Promotion & Data Protection
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query > Run)

-- 1. Promote malouadmin@puyoko.ph to Director
INSERT INTO user_roles (email, role)
VALUES ('malouadmin@puyoko.ph', 'director')
ON CONFLICT (email)
DO UPDATE SET role = 'director';

-- 2. Ensure that deleting a user account NEVER deletes their property listings (Cascading Safety Check)
-- We search the database schema for any foreign keys on the 'properties' table that point to
-- user role tables or auth tables, and dynamically drop them to prevent cascade deletion.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            tc.constraint_name, 
            tc.table_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu 
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'properties'
            AND (ccu.table_name = 'user_roles' OR ccu.table_name = 'users')
    LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint % from properties to ensure listings safety', r.constraint_name;
    END LOOP;
END $$;

-- 3. Ensure that deleting a user account NEVER deletes their request logs
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            tc.constraint_name, 
            tc.table_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu 
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'property_requests'
            AND (ccu.table_name = 'user_roles' OR ccu.table_name = 'users')
    LOOP
        EXECUTE 'ALTER TABLE property_requests DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint % from property_requests to ensure requests safety', r.constraint_name;
    END LOOP;
END $$;
