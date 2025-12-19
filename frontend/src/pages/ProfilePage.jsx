import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-primary capitalize">{user?.role}</p>
                </div>
              </div>
              
              {user?.bio && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
