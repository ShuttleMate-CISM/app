import React from 'react';
import { useRoleAccess } from '../hooks/useRoleAccess';

const RoleBasedComponent = () => {
  const { canAccess, userRole } = useRoleAccess();

  return (
    <div className="p-4">
      <h2>Role-Based Features</h2>
      <p>Your role: <span className="font-bold capitalize">{userRole}</span></p>
      
      {canAccess.admin && (
        <div className="mt-4 p-3 bg-red-100 rounded">
          <h3 className="font-bold">Admin Features</h3>
          <p>Only admins can see this content</p>
        </div>
      )}
      
      {canAccess.coach && (
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <h3 className="font-bold">Coach Features</h3>
          <p>Coach-specific content here</p>
        </div>
      )}
      
      {canAccess.courtowner && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <h3 className="font-bold">Court Owner Features</h3>
          <p>Court management tools</p>
        </div>
      )}
      
      {canAccess.shopowner && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <h3 className="font-bold">Shop Owner Features</h3>
          <p>Shop management tools</p>
        </div>
      )}
      
      {canAccess.any(['coach', 'admin']) && (
        <div className="mt-4 p-3 bg-purple-100 rounded">
          <h3 className="font-bold">Special Features</h3>
          <p>Available to coaches and admins</p>
        </div>
      )}
    </div>
  );
};

export default RoleBasedComponent;