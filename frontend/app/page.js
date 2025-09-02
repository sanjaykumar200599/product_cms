'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, RefreshCw } from 'lucide-react';

const ProductsCMS = () => {
  const [products, setProducts] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cms');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser] = useState('admin'); // In real app, get from auth
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    product_desc: '',
    status: 'Draft'
  });

  // API Base URL
  const API_BASE = 'http://localhost:5000/api';

  // Fetch products for CMS
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products. Make sure the backend server is running.');
    }
  };

  // Fetch live products
  const fetchLiveProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/live`);
      if (!response.ok) {
        throw new Error('Failed to fetch live products');
      }
      const data = await response.json();
      setLiveProducts(data);
    } catch (error) {
      console.error('Error fetching live products:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchLiveProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingProduct 
        ? `${API_BASE}/products/${editingProduct.product_id}`
        : `${API_BASE}/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        [editingProduct ? 'updated_by' : 'created_by']: currentUser
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        await Promise.all([fetchProducts(), fetchLiveProducts()]);
        resetForm();
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        alert(`Error: ${result.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updated_by: currentUser }),
      });

      const result = await response.json();

      if (response.ok) {
        await Promise.all([fetchProducts(), fetchLiveProducts()]);
        alert('Product deleted successfully!');
      } else {
        alert(`Error: ${result.error || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please check your connection.');
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_desc: product.product_desc || '',
      status: product.status
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_desc: '',
      status: 'Draft'
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchLiveProducts()]);
    setLoading(false);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-300',
      Published: 'bg-green-100 text-green-800 border-green-300',
      Archived: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-xl text-gray-600">Loading Products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Products CMS</h1>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('cms')}
                className={`px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === 'cms'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                CMS Management
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-3 py-2 font-medium text-sm rounded-md transition-colors flex items-center space-x-1 ${
                  activeTab === 'live'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Live Website</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* CMS Management Tab */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Product Management ({products.length} products)
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">No products found</div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Product
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.product_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.product_desc || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {product.created_by}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(product.updated_at).toLocaleDateString()} {new Date(product.updated_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.product_id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Live Website Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Live Website Preview ({liveProducts.length} published products)
            </h2>
            
            {liveProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-gray-500 text-lg">No published products yet</div>
                <div className="text-sm text-gray-400 mt-2">
                  Create products and set their status to "Published" to see them here
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveProducts.map((product) => (
                  <div key={product.product_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {product.product_desc || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Published</span>
                      <span>{new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.product_desc}
                  onChange={(e) => setFormData({...formData, product_desc: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !formData.product_name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCMS;