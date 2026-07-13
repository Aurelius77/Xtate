import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';

interface ListingRow {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  seller: string;
}

const MarketplaceModerationPage = () => {
  const estateId = useEstateId();
  const { toast } = useToast();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    if (!estateId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('id, title, price, status, created_at, resident:residents(profile:profiles!residents_user_id_fkey(full_name))')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      type Row = { id: string; title: string; price: number; status: string; created_at: string; resident: { profile: { full_name: string | null } | null } | null };
      setListings(((data ?? []) as Row[]).map((row) => ({
        id: row.id,
        title: row.title,
        price: Number(row.price),
        status: row.status,
        created_at: row.created_at,
        seller: row.resident?.profile?.full_name || 'Resident',
      })));
    }
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => { void loadListings(); }, [loadListings]);

  const removeListing = async (listing: ListingRow) => {
    if (!confirm(`Remove listing "${listing.title}"?`)) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', listing.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Listing Removed' });
    void loadListings();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-cyan-50">Marketplace Moderation</h1>
        <p className="text-cyan-200">Review resident listings</p>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-cyan-50 flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> All Listings</CardTitle>
          <CardDescription className="text-cyan-200">{listings.length} listing{listings.length === 1 ? '' : 's'} in your estate</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-300 text-sm">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-cyan-300 text-sm">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 glass rounded-lg">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-cyan-50 truncate">{listing.title}</h3>
                      {listing.status === 'sold' && <Badge className="bg-gray-500/20 text-gray-300">Sold</Badge>}
                    </div>
                    <p className="text-xs text-cyan-300 mt-1">₦{listing.price.toLocaleString()} &middot; {listing.seller} &middot; {new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="glass border-red-400/30 text-red-300 hover:bg-red-500/20 shrink-0" onClick={() => removeListing(listing)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceModerationPage;
