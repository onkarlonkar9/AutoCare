import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, RotateCcw, Copy, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function JobCardCalculator() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const isCreateJobPage = location.pathname === '/service-center/jobs/create';

  useEffect(() => {
    const handleToggle = () => setOpen(prev => !prev);
    window.addEventListener('toggle-job-card-calculator', handleToggle);
    return () => window.removeEventListener('toggle-job-card-calculator', handleToggle);
  }, []);

  // Hide the entire component if not on the Create Job page
  if (!isCreateJobPage) return null;

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const result = new Function(`return ${fullEquation.replace('×', '*').replace('÷', '/')}`)();
      const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(2);
      
      setHistory(prev => [fullEquation + ' = ' + resultStr, ...prev].slice(0, 5));
      setDisplay(resultStr);
      setEquation('');
    } catch (e) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    toast.success('Result copied to clipboard');
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'text-destructive bg-destructive/10' },
    { label: 'DEL', onClick: deleteLast, icon: Delete, className: 'bg-muted/50' },
    { label: '÷', onClick: () => handleOperator('/'), className: 'text-accent bg-accent/10' },
    { label: '×', onClick: () => handleOperator('*'), className: 'text-accent bg-accent/10' },
    { label: '7', onClick: () => handleNumber('7') },
    { label: '8', onClick: () => handleNumber('8') },
    { label: '9', onClick: () => handleNumber('9') },
    { label: '-', onClick: () => handleOperator('-'), className: 'text-accent bg-accent/10' },
    { label: '4', onClick: () => handleNumber('4') },
    { label: '5', onClick: () => handleNumber('5') },
    { label: '6', onClick: () => handleNumber('6') },
    { label: '+', onClick: () => handleOperator('+'), className: 'text-accent bg-accent/10' },
    { label: '1', onClick: () => handleNumber('1') },
    { label: '2', onClick: () => handleNumber('2') },
    { label: '3', onClick: () => handleNumber('3') },
    { label: '=', onClick: calculate, className: 'row-span-2 gradient-primary text-white h-full' },
    { label: '0', onClick: () => handleNumber('0'), className: 'col-span-2' },
    { label: '.', onClick: () => handleNumber('.') },
  ];

  return (
    <>
      {/* Floating Button - Placed Left of the AI Bot */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-[76px] z-50 w-12 h-12 rounded-2xl bg-secondary border border-border/50 text-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
        title="Job Card Calculator"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Calculator className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Calculator Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-[76px] z-50 w-[300px] glass-card rounded-3xl p-6 flex flex-col shadow-2xl border border-border/60 overflow-hidden"
          >
            {/* Industry Grade Header Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 gradient-primary opacity-80" />
            
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Calculator className="h-3 w-3 text-primary" />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimation Engine</span>
               </div>
               <Badge variant="outline" className="text-[8px] h-4 py-0 px-1.5 border-primary/20 text-primary">v2.0 PRO</Badge>
            </div>

            {/* Display Area */}
            <div className="mb-6 space-y-1 text-right bg-secondary/20 p-4 rounded-2xl border border-border/20 backdrop-blur-md">
              <div className="h-4 text-[10px] text-muted-foreground font-mono truncate opacity-60">{equation || '\u00A0'}</div>
              <div className="text-3xl font-bold font-mono tracking-tight truncate text-foreground">{display}</div>
              <div className="flex justify-between items-center bg-background/40 rounded-lg p-1 mt-2">
                 <button onClick={() => setHistory([])} className="text-[9px] uppercase font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                   <RotateCcw className="h-2.5 w-2.5" /> Reset
                 </button>
                 <button onClick={copyToClipboard} className="text-[9px] uppercase font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                   <Copy className="h-2.5 w-2.5" /> Copy
                 </button>
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className={`
                    flex items-center justify-center p-3 rounded-xl text-xs font-bold transition-all active:scale-95
                    ${btn.className || 'bg-secondary/60 hover:bg-secondary text-foreground border border-border/30'}
                    ${btn.label === '0' ? 'col-span-2' : ''}
                    ${btn.label === '=' ? 'row-span-2' : ''}
                  `}
                >
                  {btn.icon ? <btn.icon className="h-4 w-4" /> : btn.label}
                </button>
              ))}
            </div>

            {/* Recent Calculations */}
            {history.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">Recent</p>
                <div className="space-y-1.5">
                  {history.map((h, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground font-mono flex items-center justify-between group cursor-pointer hover:text-foreground" onClick={() => {
                        const val = h.split('=')[1].trim();
                        setDisplay(val);
                    }}>
                      <span>{h.split('=')[0]}</span>
                      <span className="font-bold text-foreground">={h.split('=')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
