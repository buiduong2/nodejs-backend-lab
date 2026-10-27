import { Role } from '../../users/entities/user.entity';

export interface AuthInfo {
  username: string;
  userId: string;
  role: Role;
}
