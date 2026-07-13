import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingBag, Plus, Phone, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

interface ListingRow {
  id: string;
  title: string;
  description: string;
  price: number;
  photo_url: string | null;
  status: string;
  resident_id: string;
  seller: string;
  sellerPhone: string | null;
}

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resident, setResident] = useState<{ id: string; estate_id: string } | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewListing, setShowNewListing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', photo: null as File | null });
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = useCallback(async (estateId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('id, title, description, price, photo_url, status, resident_id, resident:residents(user_id)')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    type Row = {
      id: string; title: string; description: string; price: number; photo_url: string | null; status: string; resident_id: string;
      resident: { user_id: string } | null;
    };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setListings(rows.map((row) => {
      const profile = row.resident ? profileMap[row.resident.user_id] : undefined;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: Number(row.price),
        photo_url: row.photo_url,
        status: row.status,
        resident_id: row.resident_id,
        seller: profile?.full_name || 'Resident',
        sellerPhone: profile?.phone || null,
      };
    }));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('residents')
        .select('id, estate_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      if (data?.id && data.estate_id) {
        setResident({ id: data.id, estate_id: data.estate_id });
        void fetchListings(data.estate_id);
      } else {
        setLoading(false);
      }
    })();
  }, [user, fetchListings, toast]);

  const handleCreateListing = async () => {
    if (!resident || !form.title.trim() || !form.price) return;
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: 'Invalid Price', description: 'Enter a valid price.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: created, error } = await supabase
        .from('marketplace_listings')
        .insert({
          estate_id: resident.estate_id,
          resident_id: resident.id,
          title: form.title.trim(),
          description: form.description.trim(),
          price,
          photo_url: null,
          status: 'active',
        })
        .select('id')
        .single();

      if (error) throw error;

      if (form.photo) {
        const safeName = form.photo.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filePath = `${resident.estate_id}/${created.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('marketplace-listings')
          .upload(filePath, form.photo, { cacheControl: '3600', upsert: false, contentType: form.photo.type || undefined });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('marketplace-listings').getPublicUrl(filePath);
        const { error: updateError } = await supabase
          .from('marketplace_listings')
          .update({ photo_url: publicUrlData.publicUrl })
          .eq('id', created.id);
        if (updateError) throw updateError;
      }

      toast({ title: 'Listing Posted', description: 'Your item is now visible to the estate.' });
      setForm({ title: '', description: '', price: '', photo: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowNewListing(false);
      void fetchListings(resident.estate_id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not post listing.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const markSold = async (listing: ListingRow) => {
    const { error } = await supabase.from('marketplace_listings').update({ status: 'sold' }).eq('id', listing.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Marked as Sold' });
    if (resident) void fetchListings(resident.estate_id);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-gray-500 font-medium mt-1">Buy and sell within your estate</p>
        </div>
        <Button onClick={() => setShowNewListing(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
          <Plus className="h-4 w-4 mr-2" /> New Listing
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400 font-medium">Loading listings...</p>
      ) : listings.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
          <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No listings yet</h3>
          <p className="text-gray-500 mt-1">Be the first to list something for sale.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-50 flex items-center justify-center">
                {listing.photo_url ? (
                  <img src={listing.photo_url} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="h-10 w-10 text-gray-200" />
                )}
              </div>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                  {listing.status === 'sold' && <Badge className="bg-gray-100 text-gray-500 shrink-0">SOLD</Badge>}
                </div>
                <p className="text-lg font-black text-blue-600">₦{listing.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{listing.seller}</p>
                {listing.status === 'active' && listing.resident_id !== resident?.id && listing.sellerPhone && (
                  <Button size="sm" variant="outline" className="w-full mt-2 border-gray-200" onClick={() => window.open(`tel:${listing.sellerPhone}`)}>
                    <Phone className="h-3.5 w-3.5 mr-2" /> Contact Seller
                  </Button>
                )}
                {listing.status === 'active' && listing.resident_id === resident?.id && (
                  <Button size="sm" variant="outline" className="w-full mt-2 border-gray-200" onClick={() => markSold(listing)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-2" /> Mark as Sold
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewListing} onOpenChange={setShowNewListing}>
        <DialogContent className="bg-white border-none rounded-3xl shadow-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-slate-900">List an Item</DialogTitle>
            <DialogDescription className="text-slate-500">
              Sell directly to your neighbors. Payment is arranged directly with the buyer for now.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Item title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold"
            />
            <Input
              type="number"
              min="0"
              placeholder="Price (NGN)"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold"
            />
            <Textarea
              placeholder="Describe the item..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="bg-gray-50 border-gray-100 rounded-xl"
            />
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setForm((p) => ({ ...p, photo: e.target.files?.[0] || null }))}
              className="border-gray-100 bg-gray-50 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListing(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleCreateListing} disabled={submitting || !form.title.trim() || !form.price} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
              {submitting ? 'Posting...' : 'Post Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplacePage;
