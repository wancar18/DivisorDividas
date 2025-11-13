import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { localDb } from '@/lib/localDb';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Check if user already exists
      const existingUser = await localDb.getUserByEmail(email);
      if (existingUser) {
        return { error: { message: 'Usuário já existe' } };
      }

      const newUser = await localDb.createUser(email, password);
      const userData = { id: newUser.id, email: newUser.email };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'Erro ao criar conta' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const existingUser = await localDb.getUserByEmail(email);
      
      if (!existingUser || existingUser.password !== password) {
        return { error: { message: 'Email ou senha inválidos' } };
      }

      const userData = { id: existingUser.id, email: existingUser.email };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      navigate('/');
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/auth');
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
