export type UpdateOperation = {
  op: 'replace';
  path: string;
  value: any;
};

const permittedUpdateUserParams = [
  '/username',
  '/password',
  '/confirm_password'
];

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
