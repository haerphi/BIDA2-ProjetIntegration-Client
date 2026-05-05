export const UserGroup = {
  ADMIN: 'admin',
  MEMBER: 'member',
  STAFF: 'staff',
};

export type UserGroupEnum = (typeof UserGroup)[keyof typeof UserGroup];
