import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import { fetchProfilesByUserIds } from '@/lib/residentProfiles';

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
      .select('id, title, price, status, created_at, resident:residents(user_id)')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    type Row = { id: string; title: string; price: number; status: string; created_at: string; resident: { user_id: string } | null };
    const rows = (data ?? []) as Row[];
    const profileMap = await fetchProfilesByUserIds(rows.map((r) => r.resident?.user_id).filter((id): id is string => !!id));
    setListings(rows.map((row) => ({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      status: row.status,
      created_at: row.created_at,
      seller: (row.resident && profileMap[row.resident.user_id]?.full_name) || 'Resident',
    })));
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
        <h1 className="text-2xl font-semibold text-gray-900">Marketplace Moderation</h1>
        <p className="text-gray-500">Review resident listings</p>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> All Listings</CardTitle>
          <CardDescription className="text-gray-500">{listings.length} listing{listings.length === 1 ? '' : 's'} in your estate</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-gray-400 text-sm">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                      {listing.status === 'sold' && <Badge className="bg-gray-100 text-gray-500">Sold</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">₦{listing.price.toLocaleString()} &middot; {listing.seller} &middot; {new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-gray-50 border-rose-200 text-rose-600 hover:bg-rose-50 shrink-0" onClick={() => removeListing(listing)}>
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
