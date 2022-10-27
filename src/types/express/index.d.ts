declare namespace Express {
  interface Request {
    requestedUserId: number;
    verificationToken: string;
  }
}
