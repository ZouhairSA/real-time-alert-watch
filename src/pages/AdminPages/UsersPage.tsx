
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users } from 'lucide-react';

// Mock data for users
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-15T08:30:00Z' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2023-02-20T14:45:00Z' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', createdAt: '2023-03-10T11:20:00Z' },
  { id: 4, username: 'security1', email: 'security1@example.com', role: 'user', createdAt: '2023-04-05T09:15:00Z' },
  { id: 5, username: 'manager1', email: 'manager1@example.com', role: 'user', createdAt: '2023-05-12T16:30:00Z' },
];

const UsersPage = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                System Users
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge className="bg-primary">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      {user.username !== 'admin' && (
                        <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UsersPage;
