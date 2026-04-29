export const UserGroup = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export type UserGroupEnum = (typeof UserGroup)[keyof typeof UserGroup];
