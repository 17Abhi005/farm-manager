
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useFinance } from '@/hooks/useFinance';

interface TransactionForm {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
  date: string;
  crop: string;
}

const FinanceManagement: React.FC = () => {
  const { transactions, loading, addTransaction } = useFinance();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const initialTransaction: TransactionForm = {
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    crop: ''
  };

  const [newTransaction, setNewTransaction] = useState<TransactionForm>(initialTransaction);

  const incomeCategories = [
    { id: 'crop_sale', name: 'Crop Sale' },
    { id: 'livestock', name: 'Livestock' },
    { id: 'dairy', name: 'Dairy Products' },
    { id: 'subsidy', name: 'Government Subsidy' },
    { id: 'other_income', name: 'Other Income' }
  ];

  const expenseCategories = [
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'labor', name: 'Labor' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'transport', name: 'Transportation' },
    { id: 'other_expense', name: 'Other Expenses' }
  ];

  const crops = ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Sorghum'];

  const resetForm = () => {
    setNewTransaction({
      ...initialTransaction,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      return;
    }

    const transactionData = {
      ...newTransaction,
      type: showIncomeForm ? 'income' as const : 'expense' as const
    };

    const result = await addTransaction(transactionData);
    if (result?.success) {
      resetForm();
      setShowIncomeForm(false);
      setShowExpenseForm(false);
    }
  };

  const handleShowIncomeForm = () => {
    resetForm();
    setNewTransaction(prev => ({ ...prev, type: 'income' }));
    setShowExpenseForm(false);
    setShowIncomeForm(true);
  };

  const handleShowExpenseForm = () => {
    resetForm();
    setNewTransaction(prev => ({ ...prev, type: 'expense' }));
    setShowIncomeForm(false);
    setShowExpenseForm(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowIncomeForm(false);
    setShowExpenseForm(false);
  };

  // Calculate financial summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const monthlyProfit = monthlyIncome - monthlyExpenses;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Financial Management</h2>
          <p className="text-muted-foreground">Track your farm income and expenses</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShowIncomeForm}>
            Add Income
          </Button>
          <Button onClick={handleShowExpenseForm}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500 text-white">
                <span className="text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500 text-white">
                <span className="text-xl">📉</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netProfit.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full text-white ${netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                <span className="text-xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{monthlyProfit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Forms */}
      {(showIncomeForm || showExpenseForm) && (
        <Card>
          <CardHeader>
            <CardTitle>
              Add New {showIncomeForm ? 'Income' : 'Expense'}
            </CardTitle>
            <CardDescription>
              Record your farm {showIncomeForm ? 'income' : 'expense'} transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="15000"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({...prev, amount: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(value) => setNewTransaction(prev => ({...prev, category: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(showIncomeForm ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({...prev, date: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop">Related Crop</Label>
                <Select 
                  value={newTransaction.crop} 
                  onValueChange={(value) => setNewTransaction(prev => ({...prev, crop: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter transaction description..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({...prev, description: e.target.value}))}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddTransaction} className="flex-1">
                Add {showIncomeForm ? 'Income' : 'Expense'}
              </Button>
              <Button variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => {
                const category = [...incomeCategories, ...expenseCategories].find(c => c.id === transaction.category);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className="text-lg">
                          {transaction.type === 'income' ? '📈' : '📉'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{category?.name}</span>
                          {transaction.crop && (
                            <>
                              <span>•</span>
                              <Badge variant="outline">{transaction.crop}</Badge>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">No transactions recorded</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first income or expense</p>
              <div className="space-x-2">
                <Button onClick={handleShowIncomeForm}>Add Income</Button>
                <Button variant="outline" onClick={handleShowExpenseForm}>Add Expense</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceManagement;
