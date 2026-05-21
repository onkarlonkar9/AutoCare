import React from 'react';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { MOCK_CENTER_ID, MOCK_OWNER_ID } from '@/data/mockDemoData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DemoModal() {
  const { showUpgradeModal, setShowUpgradeModal } = useDemo();
  const navigate = useNavigate();

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Unlock Full Access
          </DialogTitle>
          <DialogDescription>
            You've reached the interactive limit for this demo. To save your changes, add real data, and access all features, start your subscription today.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="w-full sm:w-auto">
            Continue Demo
          </Button>
          <Button onClick={() => navigate('/signup')} className="w-full sm:w-auto gradient-primary text-primary-foreground">
            Start Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// A wrapper that intercepts interactions 
function DemoInteractionCatcher({ children }: { children: React.ReactNode }) {
  const { interact } = useDemo();

  return (
    <div 
      className="relative w-full h-full"
      onClickCapture={(e) => {
        // We capture clicks on buttons, inputs, links to count as interactions
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('.cursor-pointer')) {
          interact();
        }
      }}
    >
      {/* Demo watermark */}
      <div className="absolute top-2 right-2 z-50 pointer-events-none">
        <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg border border-primary-foreground/20">
          Interactive Demo
        </div>
      </div>
      
      {/* Main content */}
      <div className="w-full h-full demo-container pb-8">
         {children}
      </div>

      <DemoModal />
    </div>
  );
}

export function DemoWrapper({ 
  children, 
  maxInteractions = 5 
}: { 
  children: React.ReactNode;
  maxInteractions?: number;
}) {
  return (
    <DemoProvider isDemo={true} maxInteractions={maxInteractions}>
      <DemoInteractionCatcher>
        {children}
      </DemoInteractionCatcher>
    </DemoProvider>
  );
}
