'use client';

import { useEffect, useState } from 'react';
import { getUsers, addUser } from '@/lib/actions-client';
import { setCurrentUserId, getCurrentUserId } from '@/lib/user-client';
import { Users, Plus } from 'lucide-react';

interface UserSwitcherProps {
    onUserChange: () => void;
}

export default function UserSwitcher({ onUserChange }: UserSwitcherProps) {
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    const [currentId, setCurrentId] = useState<number>(1);
    const [showAdd, setShowAdd] = useState(false);
    const [newUserName, setNewUserName] = useState('');

    const loadUsers = async () => {
        const allUsers = await getUsers();
        setUsers(allUsers);
        const storedId = getCurrentUserId();
        setCurrentId(storedId);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = parseInt(e.target.value);
        setCurrentUserId(newId);
        setCurrentId(newId);
        onUserChange();
    };

    const handleAddUser = async () => {
        if (!newUserName.trim()) return;
        await addUser(newUserName.trim());
        setNewUserName('');
        setShowAdd(false);
        await loadUsers();
    };

    return (
        <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-zinc-400" />
        <select
        value={currentId}
        onChange={handleChange}
        className={`text-xs border rounded-lg px-2 py-1.5 font-medium outline-none`}
        >
        {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
        ))}
        </select>
        <button
        onClick={() => setShowAdd(!showAdd)}
        className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title="Add new user"
        >
        <Plus className="h-3.5 w-3.5" />
        </button>
        {showAdd && (
            <div className="flex gap-1">
            <input
            type="text"
            placeholder="Name"
            value={newUserName}
            onChange={e => setNewUserName(e.target.value)}
            className="text-xs border rounded-lg px-2 py-1"
            autoFocus
            />
            <button
            onClick={handleAddUser}
            className="text-xs bg-amber-500 text-black px-2 py-1 rounded-lg"
            >
            Add
            </button>
            </div>
        )}
        </div>
    );
}
