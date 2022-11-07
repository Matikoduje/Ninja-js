import app from '../../app/_app';
import User from '../../models/user';

export const cleanUpTestUser = async (username: string) => {
  const user = await User.loadUser(username);
  if (!user.isDeleted()) {
    await user.delete();
  }
};

export default app;
