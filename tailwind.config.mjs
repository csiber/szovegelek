/** Szövegelek.hu paletta — barátságos magenta-coral + krém alap.
 *  Más design-DNA mint a NavBot (NAV-blue) vagy PromNET (amber-tech) —
 *  a brand-személyiség "kreatív SMB-segítő copywriter". */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: warm-coral + creamy bg (nem kiabálós, nem dev-tech)
        'sz-bg':       '#fffbf5',  // krém
        'sz-bg-2':     '#fef5e7',
        'sz-bg-3':     '#fdebd0',
        'sz-text':     '#2d1f1a',  // warm-dark-brown
        'sz-text-mid': '#5b4842',
        'sz-text-dim': '#8a7570',
        'sz-text-muted':'#b5a39e',
        'sz-border':   '#f0d9b5',
        'sz-border-2': '#e6c293',
        'sz-accent':   '#e44a6b',  // coral-magenta
        'sz-accent-h': '#c8395a',
        'sz-accent-l': '#fde7eb',
        'sz-accent-d': '#9c2d48',
        'sz-secondary':'#f59e0b',  // mustard accent (magyaros)
        'sz-success':  '#16a34a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
};
