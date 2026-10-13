// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const content=sqliteTable('content',{id:text('id').primaryKey(),body:text('body').notNull(),revision:integer('revision').notNull().default(1),updated:text('updated').notNull()});
export const orders=sqliteTable('orders',{id:text('id').primaryKey(),requestKey:text('request_key').notNull().unique(),body:text('body').notNull(),created:text('created').notNull()});
export const audits=sqliteTable('audits',{id:text('id').primaryKey(),actor:text('actor').notNull(),action:text('action').notNull(),created:text('created').notNull()});
export const members=sqliteTable('members',{email:text('email').primaryKey(),role:text('role').notNull()});
export const media=sqliteTable('media',{id:text('id').primaryKey(),name:text('name').notNull(),type:text('type').notNull(),created:text('created').notNull()});
