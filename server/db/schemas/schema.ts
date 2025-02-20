import { pgTable, unique, check, serial, varchar, text, timestamp, foreignKey, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 16 }).notNull(),
	email: text(),
	displayName: varchar("display_name", { length: 24 }).notNull(),
	profilePicture: text("profile_picture").default(''),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
	check("users_username_check", sql`((length((username)::text) >= 6) AND (length((username)::text) <= 16)) AND ((username)::text ~ '^[a-zA-Z0-9_-]+$'::text)`),
	check("users_email_check", sql`email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text`),
	check("users_display_name_check", sql`((length((display_name)::text) >= 3) AND (length((display_name)::text) <= 16)) AND ((display_name)::text ~ '^[a-zA-Z0-9 ]+$'::text)`),
]);

export const authCredentials = pgTable("auth_credentials", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	passwordHash: text("password_hash").notNull(),
	refreshToken: text("refresh_token").default(''),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_credentials_user_id_fkey"
		}).onDelete("cascade"),
	unique("auth_credentials_user_id_key").on(table.userId),
]);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 55 }).notNull(),
	deadlineDate: timestamp("deadline_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	description: text().default(''),
	createdBy: integer("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "projects_created_by_fkey"
		}).onDelete("cascade"),
	check("projects_name_check", sql`(name)::text ~ '^[a-zA-Z0-9\s-]+$'::text`),
]);

export const comments = pgTable("comments", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	createdBy: integer("created_by").notNull(),
	projectId: integer("project_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "comments_created_by_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "comments_project_id_fkey"
		}).onDelete("cascade"),
	check("comments_content_check", sql`(length(content) <= 280) AND (content ~ '^[a-zA-Z0-9\s-]+$'::text)`),
]);

export const projectMembers = pgTable("project_members", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	userId: integer("user_id").notNull(),
	role: varchar({ length: 20 }).default('member').notNull(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_members_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "project_members_user_id_fkey"
		}).onDelete("cascade"),
	unique("project_members_project_id_user_id_key").on(table.projectId, table.userId),
	check("project_members_role_check", sql`(role)::text = ANY ((ARRAY['owner'::character varying, 'member'::character varying, 'admin'::character varying])::text[])`),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 64 }).notNull(),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
	deadlineDate: timestamp("deadline_date", { withTimezone: true, mode: 'string' }),
	parentProject: integer("parent_project"),
	priority: varchar({ length: 20 }).default('no-priority').notNull(),
	status: varchar({ length: 20 }).default('backlog').notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	archive: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentProject],
			foreignColumns: [projects.id],
			name: "tasks_parent_project_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "tasks_created_by_fkey"
		}).onDelete("cascade"),
	check("tasks_name_check", sql`(name)::text ~ '^[A-Za-z0-9 ]+$'::text`),
	check("tasks_priority_check", sql`(priority)::text = ANY ((ARRAY['urgent'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying, 'no-priority'::character varying])::text[])`),
	check("tasks_status_check", sql`(status)::text = ANY ((ARRAY['todo'::character varying, 'done'::character varying, 'doing'::character varying, 'cancelled'::character varying, 'backlog'::character varying, 'in-review'::character varying])::text[])`),
]);
