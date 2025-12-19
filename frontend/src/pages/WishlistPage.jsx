import React, { useEffect, useState } from 'react';
import { Heart, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { wishlistAPI } from '../services/api';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.wishlist);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      await wishlistAPI.removeFromWishlist(wishlistId);
      setWishlist(wishlist.filter(item => item.wishlist_id !== wishlistId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">Courses you want to take</p>
          </div>

          {wishlist.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-4">Browse courses and add them to your wishlist</p>
                <Link to="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card key={item.wishlist_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={item.thumbnail || '/placeholder-course.jpg'}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {item.instructor_name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{item.category_name}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">
                        ${item.price === 0 ? 'Free' : item.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{item.average_rating || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link to={`/course/${item.id}`} className="block">
                        <Button className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          View Course
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleRemove(item.wishlist_id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove from Wishlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
