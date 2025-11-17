import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useToken = (): string | null => {
  return useSelector((state: RootState) => state.auth.token);
};
