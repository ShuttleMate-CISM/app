import { useAuth } from '../context/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();

  const hasRole = (roles = []) => {
    if (!user?.role) return false;
    if (typeof roles === 'string') roles = [roles];
    return roles.includes(user.role) || user.role === 'admin';
  };

  const canAccess = {
    coach: hasRole(['coach']),
    courtowner: hasRole(['courtowner']),
    shopowner: hasRole(['shopowner']),
    admin: hasRole(['admin']),
    any: (roles) => hasRole(roles)
  };

  return { hasRole, canAccess, userRole: user?.role };
};