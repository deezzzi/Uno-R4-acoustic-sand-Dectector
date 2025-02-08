// types/toast.d.ts
import '@radix-ui/react-toast';

declare module '@radix-ui/react-toast' {
  export interface ToastProps {
    variant?: 'default' | 'destructive' | 'warning';
  }
}