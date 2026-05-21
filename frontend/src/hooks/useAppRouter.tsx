import { useDemo } from '@/contexts/DemoContext';
import { useNavigate, useParams, Link as RouterLink, type NavigateOptions, type To, type LinkProps } from 'react-router-dom';
import type { MouseEvent, ReactNode } from 'react';

export function useAppRouter() {
  const { isDemo, interact } = useDemo();
  const routerNavigate = useNavigate();
  const routerParams = useParams();
  
  const navigate = (path: To | number, options?: NavigateOptions) => {
    if (isDemo) {
      interact(); 
      console.log(`[Demo] Intercepted nav:`, path);
      return;
    }
    if (typeof path === 'number') {
      routerNavigate(path);
      return;
    }
    routerNavigate(path, options);
  };
  
  const params = isDemo ? { id: 'jc-demo-1' } : routerParams;

  return { navigate, params };
}

type DemoLinkProps = Omit<LinkProps, 'to'> & {
  to: To;
  children: ReactNode;
};

export function DemoLink({ to, children, className, ...props }: DemoLinkProps) {
  const { isDemo, interact } = useDemo();
  
  if (isDemo) {
    return (
      <a 
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          interact();
          console.log(`[Demo] Intercepted link to:`, to);
        }}
        className={className}
        href={typeof to === 'string' ? to : '#'}
        {...props}
      >
        {children}
      </a>
    );
  }
  
  return (
    <RouterLink to={to} className={className} {...props}>
      {children}
    </RouterLink>
  );
}
