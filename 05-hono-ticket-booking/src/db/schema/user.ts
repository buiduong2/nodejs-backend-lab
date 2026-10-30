import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export enum Role {
	ADMIN = 'ADMIN',
	CUSTOMER = 'CUSTOMER'
}

export const roleValues = Object.values(Role) as [Role, ...Role[]]
export const roleEnum = pgEnum('role', roleValues)

export const users = pgTable('users', {
  id: bigint({ mode: 'number' })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  role: roleEnum('role').notNull().default(Role.CUSTOMER),
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
  updatedAt: timestamp({withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});


export default users