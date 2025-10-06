import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const memorialStatusEnum = pgEnum('memorial_status', ['draft', 'published']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 120 }),
  isOwner: boolean('is_owner').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tokenHash: text('token_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export const themes = pgTable('themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  description: varchar('description', { length: 255 }),
  primaryColor: varchar('primary_color', { length: 32 }).notNull().default('#1d4ed8'),
  secondaryColor: varchar('secondary_color', { length: 32 }).notNull().default('#f97316'),
  accentColor: varchar('accent_color', { length: 32 }).notNull().default('#10b981'),
  backgroundColor: varchar('background_color', { length: 32 }).notNull().default('#ffffff'),
  headingFont: varchar('heading_font', { length: 80 }).notNull().default('Playfair Display'),
  bodyFont: varchar('body_font', { length: 80 }).notNull().default('Inter'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export const pets = pgTable('pets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  species: varchar('species', { length: 80 }).notNull(),
  breed: varchar('breed', { length: 120 }),
  birthDate: timestamp('birth_date', { withTimezone: false }),
  passingDate: timestamp('passing_date', { withTimezone: false }),
  memorialized: boolean('memorialized').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export const memorialPages = pgTable('memorial_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  petId: uuid('pet_id')
    .references(() => pets.id, { onDelete: 'cascade' })
    .notNull(),
  themeId: uuid('theme_id').references(() => themes.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 180 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  summary: text('summary'),
  story: text('story'),
  status: memorialStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  memorialId: uuid('memorial_id')
    .references(() => memorialPages.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 180 }),
  altText: varchar('alt_text', { length: 255 }),
  caption: text('caption'),
  mediaType: mediaTypeEnum('media_type').notNull().default('image'),
  fileKey: varchar('file_key', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const themesRelations = relations(themes, ({ many }) => ({
  memorialPages: many(memorialPages)
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id]
  }),
  memorialPages: many(memorialPages)
}));

export const memorialPagesRelations = relations(memorialPages, ({ one, many }) => ({
  pet: one(pets, {
    fields: [memorialPages.petId],
    references: [pets.id]
  }),
  theme: one(themes, {
    fields: [memorialPages.themeId],
    references: [themes.id]
  }),
  mediaAssets: many(mediaAssets)
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  memorial: one(memorialPages, {
    fields: [mediaAssets.memorialId],
    references: [memorialPages.id]
  })
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;
export type MemorialPage = typeof memorialPages.$inferSelect;
export type InsertMemorialPage = typeof memorialPages.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type Theme = typeof themes.$inferSelect;
export type InsertTheme = typeof themes.$inferInsert;
