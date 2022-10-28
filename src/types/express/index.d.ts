declare namespace Express {
  export interface Request {
    authenticatedUserId: number;
    user: import('../../models/user').default;
  }
}
