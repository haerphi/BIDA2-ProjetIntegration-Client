export const UserGroup = {
  ADMIN: 'admin',
  PAID_MEMBER: 'paid_member',
  STAFF: 'staff',
};

export type UserGroupEnum = (typeof UserGroup)[keyof typeof UserGroup];
