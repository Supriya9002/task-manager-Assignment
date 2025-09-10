import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getMe, login, register, logout, clearError } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is logged in on app start
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  const signIn = async (email: string, password: string) => {
    return dispatch(login({ email, password }));
  };

  const signUp = async (name: string, email: string, password: string) => {
    return dispatch(register({ name, email, password }));
  };

  const signOut = async () => {
    return dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError: clearAuthError,
  };
}