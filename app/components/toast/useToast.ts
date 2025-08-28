// useToast.ts
import { toast } from 'react-toastify';

type ToastType = 'info' | 'success' | 'warn' | 'error' | 'default';

export const useToast = () => {
  const notify = (message: string, type: ToastType = 'default') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'warn':
        toast.warn(message);
        break;
      case 'default':
      default:
        toast(message);
        break;
    }
  };

  return { notify };
};
