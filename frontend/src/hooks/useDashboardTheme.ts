import { useState, useEffect } from 'react';
import { 
  getDashboardThemeConfig, 
  DashboardThemeConfig,
  hexToHsl,
  getContrastForegroundHsl
} from '@/lib/dashboardTheme';
import { getSCExtensionPacks } from '@/lib/featureExtensions';

export function useDashboardTheme() {
  const [themeProps, setThemeProps] = useState<{
    className: string;
    style: React.CSSProperties;
  }>({ className: 'app-theme-page-shell', style: {} });

  useEffect(() => {
    // Strip any legacy global classes that might be stuck on HTML from previous versions.
    const root = document.documentElement;
    root.classList.remove('app-theme-custom-enabled', 'app-theme-gradient-animated');
    root.className = root.className.replace(/\bapp-theme-pattern-[^\s]+\b/g, '');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--sc-gradient-from');
    root.style.removeProperty('--sc-gradient-via');
    root.style.removeProperty('--sc-gradient-to');

    const updateTheme = () => {
      let packs = getSCExtensionPacks();
      // Keep compatibility with older saved extension packs shape.
      if (typeof packs.dashboardThemeCustomizer !== 'boolean') {
        packs = { ...packs, dashboardThemeCustomizer: true };
      }

      if (!packs.dashboardThemeCustomizer) {
        setThemeProps({ className: 'app-theme-page-shell', style: {} });
        return;
      }

      const config = getDashboardThemeConfig();
      const style: React.CSSProperties = {
        '--primary': hexToHsl(config.primaryColor),
        '--primary-foreground': getContrastForegroundHsl(config.primaryColor),
        '--accent': hexToHsl(config.accentColor),
        '--accent-foreground': getContrastForegroundHsl(config.accentColor),
        '--ring': hexToHsl(config.accentColor),
        '--sc-gradient-from': config.gradientFrom,
        '--sc-gradient-via': config.gradientVia,
        '--sc-gradient-to': config.gradientTo,
      } as React.CSSProperties;

      const classes = [
        'app-theme-page-shell',
        'app-theme-custom-enabled',
        `app-theme-pattern-${config.patternMode}`,
      ];

      if (config.animatedGradient) {
        classes.push('app-theme-gradient-animated');
      }

      setThemeProps({ className: classes.join(' '), style });
    };

    updateTheme();

    window.addEventListener('storage', updateTheme);
    window.addEventListener('sc-extension-packs-updated', updateTheme);
    window.addEventListener('sc-dashboard-theme-config-updated', updateTheme);

    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('sc-extension-packs-updated', updateTheme);
      window.removeEventListener('sc-dashboard-theme-config-updated', updateTheme);
    };
  }, []);

  return themeProps;
}
