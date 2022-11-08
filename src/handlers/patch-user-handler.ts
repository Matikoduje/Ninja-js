import { StatusCodeError } from './error-handler';
import Role from '../models/role';

export type UpdateOperation = {
  op: 'replace';
  path: string;
  value: any;
};

const permittedUpdateUserParams = [
  '/username',
  '/password',
  '/confirm_password',
  '/roles'
];

const permittedUpdateUserRoles = ['admin', 'user'];

export const isUpdateOperation = (
  operation: any
): operation is UpdateOperation => {
  return (
    operation.op === 'replace' &&
    typeof operation.path !== 'undefined' &&
    permittedUpdateUserParams.includes(operation.path) &&
    typeof operation.value !== 'undefined'
  );
};

export const setUpdateParam = (params: any, operation: UpdateOperation) => {
  switch (operation.path) {
    case '/username':
      params.username = operation.value;
      break;
    case '/password':
      params.password = operation.value;
      break;
    case '/confirm_password':
      params.confirm_password = operation.value;
      break;
  }
  return params;
};

export const verifyUpdatePasswordMatches = (params: any) => {
  const { password, confirm_password } = params;
  if (password !== undefined && confirm_password !== undefined) {
    return password === confirm_password;
  }
  return password === undefined && confirm_password === undefined;
};

export const verifyUpdateUserRoles = (roles: Array<string>) => {
  if (!roles.includes('user')) {
    throw new StatusCodeError(
      "Role user can't' be remove manually. Should be added for every /roles operation replace.",
      422
    );
  }

  roles.forEach((roleName) => {
    if (!permittedUpdateUserRoles.includes(roleName)) {
      throw new StatusCodeError(
        'You can use only existing user roles: admin and user',
        422
      );
    }
  });
};
