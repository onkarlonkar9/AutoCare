import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface DemoContextType {
  isDemo: boolean;
  interactions: number;
  maxInteractions: number;
  interact: () => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ 
  children, 
  isDemo = false,
  maxInteractions = 5
}: { 
  children: ReactNode;
  isDemo?: boolean;
  maxInteractions?: number;
}) {
  const [interactions, setInteractions] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const interact = () => {
    if (!isDemo) return;
    
    const newCount = interactions + 1;
    setInteractions(newCount);
    
    if (newCount >= maxInteractions) {
      setShowUpgradeModal(true);
    } else {
      toast.info('Action simulated in demo mode.', {
        description: `${maxInteractions - newCount} more interactions before demo lock.`,
        duration: 2000,
      });
    }
  };

  return (
    <DemoContext.Provider value={{
      isDemo,
      interactions,
      maxInteractions,
      interact,
      showUpgradeModal,
      setShowUpgradeModal
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    // If used outside provider, default to non-demo mode
    return {
      isDemo: false,
      interactions: 0,
      maxInteractions: 0,
      interact: () => {},
      showUpgradeModal: false,
      setShowUpgradeModal: () => {}
    };
  }
  return context;
}
