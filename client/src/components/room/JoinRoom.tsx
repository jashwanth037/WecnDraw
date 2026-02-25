import React, { useState } from 'react';
import { Hash, Lock, Loader2 } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const JoinRoom: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');
    const [needsPassword, setNeedsPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId.trim()) return;
        setIsLoading(true);
        try {
            await roomService.joinRoom(roomId.trim(), password || undefined);
            onClose?.();
            navigate(`/room/${roomId.trim()}`);
            toast.success('Joined room!');
        } catch (err: any) {
            if (err.response?.status === 401) {
                setNeedsPassword(true);
                toast.error('This room requires a password');
            } else {
                toast.error(err.response?.data?.message || 'Failed to join room');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Hash size={13} /> Room ID</label>
                <input className="input-field" placeholder="Enter 8-character room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} maxLength={8} required />
            </div>

            {needsPassword && (
                <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={13} /> Room Password</label>
                    <input className="input-field" type="password" placeholder="••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading || !roomId} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : '🔗 Join Room'}
            </button>
        </form>
    );
};

export default JoinRoom;
