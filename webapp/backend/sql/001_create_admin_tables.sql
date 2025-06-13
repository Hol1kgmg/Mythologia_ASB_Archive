-- Mythologia Admin Tables Migration
-- Created: 2025-01-13
-- Description: Create admin, admin_sessions, and admin_activity_logs tables

-- Create admin role enum
CREATE TYPE admin_role AS ENUM('super_admin', 'admin', 'viewer');

-- Create admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role DEFAULT 'admin' NOT NULL,
    permissions JSON DEFAULT '[]'::json NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_super_admin BOOLEAN DEFAULT false NOT NULL,
    created_by UUID,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Create admin_activity_logs table  
CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE admins 
ADD CONSTRAINT admins_created_by_fk 
FOREIGN KEY (created_by) REFERENCES admins(id);

ALTER TABLE admin_sessions 
ADD CONSTRAINT admin_sessions_admin_id_fk 
FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;

ALTER TABLE admin_activity_logs 
ADD CONSTRAINT admin_activity_logs_admin_id_fk 
FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);