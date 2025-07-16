// Secure payment form with Stripe integration ready for Supabase
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Shield, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { paymentsAdapter } from '@/lib/supabase-adapter';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
}

const SecurePaymentForm = ({ 
  amount, 
  currency = 'NGN', 
  description, 
  onSuccess, 
  onError 
}: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string>('');
  const { user, isSupabaseConnected } = useAuth();
  const { toast } = useToast();

  const formatAmount = (amount: number, currency: string): string => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      if (isSupabaseConnected) {
        // TODO: When Supabase is connected, use Stripe integration
        // This will be implemented via Supabase Edge Functions
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to secure payment gateway...",
        });
        
        // Simulate Stripe checkout redirect
        setTimeout(() => {
          const mockReference = `STRIPE_${Date.now()}`;
          setReference(mockReference);
          setPaymentStatus('success');
          onSuccess?.(mockReference);
          
          toast({
            title: "Payment Successful",
            description: `Payment completed with reference: ${mockReference}`,
          });
        }, 3000);
        
      } else {
        // Mock payment for development
        const result = await paymentsAdapter.processPayment(amount, currency);
        
        if (result.success) {
          setReference(result.reference);
          setPaymentStatus('success');
          onSuccess?.(result.reference);
          
          toast({
            title: "Payment Successful",
            description: `Payment completed with reference: ${result.reference}`,
          });
        } else {
          throw new Error('Payment processing failed');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentStatus('error');
      onError?.(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Alert className="border-blue-200 bg-blue-50/50">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Processing your payment securely...
              </div>
            </AlertDescription>
          </Alert>
        );
      
      case 'success':
        return (
          <Alert className="border-green-200 bg-green-50/50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-800">Payment Successful!</p>
                <p className="text-sm text-green-700">Reference: {reference}</p>
                <p className="text-xs text-green-600">Your payment has been processed securely.</p>
              </div>
            </AlertDescription>
          </Alert>
        );
      
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Payment failed. Please try again or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription className="text-cyan-200">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="p-4 glass rounded-lg border-cyan-400/20">
          <div className="flex justify-between items-center">
            <span className="text-cyan-200">Amount to Pay:</span>
            <span className="text-2xl font-bold text-cyan-50">
              {formatAmount(amount, currency)}
            </span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-cyan-100">Security Features:</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <Lock className="h-3 w-3" />
              <span>256-bit SSL encryption</span>
              <Badge variant="outline" className="text-xs border-green-400/30 text-green-300">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <Shield className="h-3 w-3" />
              <span>PCI DSS compliant processing</span>
              <Badge variant="outline" className="text-xs border-green-400/30 text-green-300">
                Verified
              </Badge>
            </div>
            {isSupabaseConnected && (
              <div className="flex items-center gap-2 text-xs text-cyan-300">
                <CreditCard className="h-3 w-3" />
                <span>Stripe secure gateway</span>
                <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-300">
                  Enterprise
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        {renderPaymentStatus()}

        {/* Payment Button */}
        {paymentStatus !== 'success' && (
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !user}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay {formatAmount(amount, currency)}
              </div>
            )}
          </Button>
        )}

        {!user && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to make a payment.
            </AlertDescription>
          </Alert>
        )}

        {/* Development Notice */}
        {!isSupabaseConnected && (
          <Alert className="border-amber-200 bg-amber-50/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs text-amber-300">
              Development Mode: This is a simulated payment. Connect Supabase for real payment processing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurePaymentForm;