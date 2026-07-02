import React, { useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onUploaded: (url: string) => void;
}

const AvatarUpload = ({ userId, currentImageUrl, onUploaded }: AvatarUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId);

      if (profileError) throw profileError;

      onUploaded(publicUrl);
      toast({ title: 'Photo Updated', description: 'Your profile photo has been updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not upload photo.';
      toast({ title: 'Upload Failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <User className="h-7 w-7 text-gray-300" />
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Change Photo'}
        </button>
        <p className="text-xs text-gray-400 font-medium mt-1">JPG, PNG, WEBP, or GIF. Max 5MB.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
