declare namespace Express {
  export interface Request {
    authenticatedUserId: number;
    updateParams: object;
    user: import('../../models/user').default;
  }
}
