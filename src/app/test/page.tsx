'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, phoneNumber }),
      });

      const data = await res.json();
      setResponse(data.success ? 'Message sent successfully!' : data.error);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('Error sending message');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test WhatsApp Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>

          {response && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
} 