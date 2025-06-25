
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, QrCode, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACCESS_CODE_PURPOSES, GenerateCodeForm } from '@/types/visitor-access';

const generateCodeSchema = z.object({
  visitor_name: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitor_phone: z.string().optional(),
  purpose: z.string().min(1, 'Please select a purpose'),
  valid_from: z.string().min(1, 'Please select start date and time'),
  valid_until: z.string().min(1, 'Please select end date and time'),
});

const GenerateAccessCodePage = () => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateCodeForm>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      visitor_name: '',
      visitor_phone: '',
      purpose: '',
      valid_from: '',
      valid_until: '',
    },
  });

  const generateAccessCode = () => {
    // Generate a 6-digit unique code
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const onSubmit = async (data: GenerateCodeForm) => {
    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCode = generateAccessCode();
      setGeneratedCode(newCode);
      
      toast({
        title: "Access Code Generated",
        description: `Code ${newCode} has been created for ${data.visitor_name}`,
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate access code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCode = () => {
    if (generatedCode) {
      const shareText = `Your access code is: ${generatedCode}. Please present this code to security.`;
      if (navigator.share) {
        navigator.share({
          title: 'Visitor Access Code',
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Access code details copied to clipboard",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-50">Generate Access Code</h1>
          <p className="text-cyan-200">Create temporary access codes for your visitors</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Plus className="h-5 w-5" />
              Create New Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="visitor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-200">Visitor Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter visitor's full name" 
                          className="glass border-cyan-400/30 text-cyan-100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visitor_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-200">Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter visitor's phone number" 
                          className="glass border-cyan-400/30 text-cyan-100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-200">Purpose of Visit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass border-cyan-400/30 text-cyan-100">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass border-cyan-400/30">
                          {ACCESS_CODE_PURPOSES.map((purpose) => (
                            <SelectItem key={purpose} value={purpose} className="text-cyan-100">
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valid_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-200">Valid From</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            className="glass border-cyan-400/30 text-cyan-100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valid_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-200">Valid Until</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            className="glass border-cyan-400/30 text-cyan-100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Access Code'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {generatedCode && (
          <Card className="glass-card border-green-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <QrCode className="h-5 w-5" />
                Generated Code
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-mono font-bold text-green-400 bg-green-400/10 p-4 rounded-lg">
                {generatedCode}
              </div>
              <p className="text-cyan-200">
                Share this code with your visitor. They'll need to present it to security.
              </p>
              <Button 
                onClick={shareCode}
                className="w-full glass bg-green-600/20 hover:bg-green-600/30 text-green-400"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GenerateAccessCodePage;
