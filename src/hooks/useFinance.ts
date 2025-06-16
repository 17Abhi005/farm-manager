
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  crop: string | null;
  created_at: string;
  updated_at: string;
}

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: Transaction[] = (data || []).map(item => ({
        id: item.id,
        type: (item.type === 'income' || item.type === 'expense') ? item.type : 'expense',
        amount: item.amount,
        category: item.category,
        description: item.description,
        date: item.date,
        crop: item.crop,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description: string;
    date: string;
    crop: string;
  }) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: transactionData.type,
            amount: parseFloat(transactionData.amount),
            category: transactionData.category,
            description: transactionData.description,
            date: transactionData.date,
            crop: transactionData.crop || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Transaction = {
        id: data.id,
        type: (data.type === 'income' || data.type === 'expense') ? data.type : 'expense',
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
        crop: data.crop,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTransactions(prev => [transformedData, ...prev]);
      
      toast({
        title: "Success",
        description: `${transactionData.type === 'income' ? 'Income' : 'Expense'} has been recorded.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions
  };
};
