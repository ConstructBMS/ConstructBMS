import React, { useEffect, useState } from 'react';
import {
  getUsersWithNoRoles,
  getAllRoles,
  assignRoleToUser,
} from '../../services/userService';

const UserRoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getUsersWithNoRoles(),
        getAllRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAssignRole = async (userId: string, roleId: string) => {
    await assignRoleToUser(userId, roleId);
    setUsers(users.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) return <div>Loading users...</div>;

  if (users.length === 0)
    return (
      <div className='p-4 bg-green-50 text-green-700 rounded'>
        All users have roles assigned.
      </div>
    );

  return (
    <div className='p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded mb-6'>
      <strong>Admin:</strong> The following users need a role assigned:
      <input
        type='text'
        placeholder='Search by name or email'
        className='mb-2 p-2 border rounded w-full'
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <table className='w-full mt-2'>
        <thead>
          <tr>
            <th className='text-left px-2 py-1'>Email</th>
            <th className='text-left px-2 py-1'>Name</th>
            <th className='text-left px-2 py-1'>Assign Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td className='px-2 py-1'>{user.email}</td>
              <td className='px-2 py-1'>
                {user.first_name} {user.last_name}
              </td>
              <td className='px-2 py-1'>
                <select
                  onChange={e => handleAssignRole(user.id, e.target.value)}
                  defaultValue=''
                  className='border rounded px-2 py-1'
                >
                  <option value='' disabled>
                    Assign role
                  </option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserRoleAssignment;
