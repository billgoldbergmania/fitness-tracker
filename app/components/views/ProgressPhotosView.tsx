'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Trash2, X, ZoomIn } from 'lucide-react';
import { getPhotos, savePhoto, deletePhoto } from '@/lib/actions-client';

interface ProgressPhoto {
    id: string;
    date: string;
    url: string;
    caption: string;
}

interface ProgressPhotosViewProps {
    cardBg: string;
    isLight: boolean;
}

export default function ProgressPhotosView({ cardBg, isLight }: ProgressPhotosViewProps) {
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
    const [photoCaption, setPhotoCaption] = useState('');
    const [photoFile, setPhotoFile] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

    const loadPhotos = async () => {
        const fetched = await getPhotos();
        setPhotos(fetched as ProgressPhoto[]);
    };

    useEffect(() => {
        loadPhotos();
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setPhotoFile(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photoFile) return;
        const id = Math.random().toString(36).substr(2, 9);
        await savePhoto(id, photoDate, photoFile, photoCaption || 'Workout Progression Entry');
        setPhotoCaption('');
        setPhotoFile(null);
        await loadPhotos();
    };

    const handleDeletePhoto = async (id: string) => {
        if (confirm('Delete this photo?')) {
            await deletePhoto(id);
            await loadPhotos();
        }
    };

    const modalBg = isLight ? 'bg-white' : 'bg-[#1E1E22]';
    const modalOverlay = isLight ? 'bg-black/70' : 'bg-black/80';

    return (
        <div className="space-y-6">
        {/* Upload form */}
        <div className={`${cardBg} rounded-2xl p-5`}>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Log Progress Snapshot</h3>
        <form onSubmit={handleSavePhoto} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-end">
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-medium">Snapshot Date</label>
        <input type="date" value={photoDate} onChange={e => setPhotoDate(e.target.value)} className={`w-full border rounded-xl px-3 py-2 focus:outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
        </div>
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-medium">Log Image File</label>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 cursor-pointer" />
        </div>
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-medium">Caption / Linked Workout Note</label>
        <input type="text" placeholder="Conditioning check following workout..." value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className={`w-full border rounded-xl px-3 py-2 focus:outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
        </div>
        <div className="md:col-span-3 flex justify-end pt-1">
        <button type="submit" disabled={!photoFile} className="bg-amber-500 disabled:opacity-40 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-colors hover:bg-amber-400">
        Save Progression Photo
        </button>
        </div>
        </form>
        </div>

        {/* Photo grid */}
        <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chronological Image Log Grid</h4>
        {photos.length === 0 ? (
            <div className={`${cardBg} rounded-2xl p-10 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-2`}>
            <ImageIcon className="h-6 w-6 text-zinc-300" />
            <span>No visual records logged yet. Upload snapshots above.</span>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map(p => (
                <div key={p.id} className={`${cardBg} rounded-2xl overflow-hidden flex flex-col group transition-all hover:shadow-lg cursor-pointer`} onClick={() => setSelectedPhoto(p)}>
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                <img src={p.url} alt={p.caption} className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-300" />
                <button
                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(p.id); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 p-2 rounded-xl text-white transition-colors z-10"
                title="Delete snapshot"
                >
                <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(p); }}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-amber-500 p-1.5 rounded-lg text-white transition-colors z-10"
                title="View full size"
                >
                <ZoomIn className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                {p.date}
                </div>
                </div>
                <div className="p-3.5 flex-1">
                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium line-clamp-2">{p.caption}</p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>

        {/* Modal for full-size image */}
        {selectedPhoto && (
            <div className={`fixed inset-0 z-50 flex items-center justify-center ${modalOverlay} transition-all duration-200`} onClick={() => setSelectedPhoto(null)}>
            <div className={`${modalBg} rounded-2xl max-w-[90vw] max-h-[90vh] overflow-auto p-4 relative`} onClick={(e) => e.stopPropagation()}>
            <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
            <X className="h-5 w-5" />
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-3 text-center">
            <p className="text-xs text-zinc-500">{selectedPhoto.date}</p>
            <p className="text-sm font-medium">{selectedPhoto.caption}</p>
            </div>
            </div>
            </div>
        )}
        </div>
    );
}
