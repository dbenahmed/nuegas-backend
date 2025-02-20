import { relations } from "drizzle-orm/relations";
import { users, authCredentials, projects, comments, projectMembers, tasks } from "./schema";

export const authCredentialsRelations = relations(authCredentials, ({one}) => ({
	user: one(users, {
		fields: [authCredentials.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	authCredentials: many(authCredentials),
	projects: many(projects),
	comments: many(comments),
	projectMembers: many(projectMembers),
	tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.createdBy],
		references: [users.id]
	}),
	comments: many(comments),
	projectMembers: many(projectMembers),
	tasks: many(tasks),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	user: one(users, {
		fields: [comments.createdBy],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [comments.projectId],
		references: [projects.id]
	}),
}));

export const projectMembersRelations = relations(projectMembers, ({one}) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectMembers.userId],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	project: one(projects, {
		fields: [tasks.parentProject],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [tasks.createdBy],
		references: [users.id]
	}),
}));