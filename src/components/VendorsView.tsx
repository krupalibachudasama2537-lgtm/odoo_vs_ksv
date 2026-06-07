import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Star, 
  X,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import type { Vendor } from '../mockData';

interface VendorsViewProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  onAddLog: (action: string, module: 'Vendor' | 'RFQ' | 'Quotation' | 'Approval' | 'PO' | 'Invoice' | 'System') => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  setVendors,
  onAddLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Sort state
  const [sortField, setSortField] = useState<keyof Vendor>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Vendor for Profile drawer
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Form Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Vendor | null>(null);

  // Add Vendor state
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    gstNumber: '',
    category: 'Electronics',
    status: 'Pending',
    rating: 5,
    spend: 0,
    activeRfqs: 0,
    deliveryRate: 100,
    qualityScore: 100
  });

  // Unique categories list
  const categories = useMemo(() => {
    const list = new Set(vendors.map(v => v.category));
    return ['All', ...Array.from(list)];
  }, [vendors]);

  const handleSort = (field: keyof Vendor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        const matchesSearch = 
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.id.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        
        return 0;
      });
  }, [vendors, searchTerm, categoryFilter, statusFilter, sortField, sortDirection]);

  // Paginated chunk
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedVendors, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage);

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.email || !newVendor.gstNumber) return;

    const vendorId = newVendor.name.toLowerCase().replace(/\s+/g, '-').substring(0, 10);
    const completedVendor: Vendor = {
      id: vendorId,
      name: newVendor.name,
      contactPerson: newVendor.contactPerson || 'N/A',
      email: newVendor.email,
      phone: newVendor.phone || 'N/A',
      country: newVendor.country || 'N/A',
      gstNumber: newVendor.gstNumber,
      status: (newVendor.status as any) || 'Pending',
      category: newVendor.category || 'General Services',
      rating: newVendor.rating || 5,
      onboardingDate: new Date().toISOString().split('T')[0],
      spend: 0,
      activeRfqs: 0,
      deliveryRate: 100,
      qualityScore: 100
    };

    setVendors([...vendors, completedVendor]);
    onAddLog(`Registered Vendor Node: ${completedVendor.name} (${completedVendor.category})`, 'Vendor');
    setShowAddModal(false);
    
    // Reset Form
    setNewVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      country: '',
      gstNumber: '',
      category: 'Electronics',
      status: 'Pending',
      rating: 5,
      spend: 0,
      activeRfqs: 0,
      deliveryRate: 100,
      qualityScore: 100
    });
  };

  const handleEditVendorClick = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ ...vendor });
    setShowEditModal(true);
  };

  const handleEditVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    setVendors(vendors.map(v => v.id === editForm.id ? editForm : v));
    onAddLog(`Updated Vendor Profile: ${editForm.name}`, 'Vendor');
    setShowEditModal(false);
    
    if (selectedVendor && selectedVendor.id === editForm.id) {
      setSelectedVendor(editForm);
    }
  };

  const handleDeleteVendor = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to terminate vendor node registration for ${name}?`)) {
      setVendors(vendors.filter(v => v.id !== id));
      onAddLog(`Deleted Vendor Node: ${name}`, 'Vendor');
      if (selectedVendor && selectedVendor.id === id) {
        setSelectedVendor(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Verified: 'bg-green-50 text-green-700 border-green-100',
      Pending: 'bg-amber-50 text-amber-700 border-amber-100',
      Unverified: 'bg-slate-50 text-slate-600 border-slate-100'
    };
    return badges[status as keyof typeof badges] || badges.Unverified;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Vendors Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Add, manage, and audit supplier contracts and performance cards.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow-md shadow-green-200 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard New Vendor</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name, contact person, or GST Number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending Approval</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Main Vendor Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th onClick={() => handleSort('name')} className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">Company Name</th>
                <th onClick={() => handleSort('category')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">Category</th>
                <th onClick={() => handleSort('gstNumber')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">GST Tax ID</th>
                <th onClick={() => handleSort('status')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">Status</th>
                <th onClick={() => handleSort('rating')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">Score</th>
                <th onClick={() => handleSort('spend')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">Total Spend</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center font-medium text-slate-400">
                    No vendor matches found.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor) => (
                  <tr 
                    key={vendor.id}
                    onClick={() => setSelectedVendor(vendor)}
                    className="hover:bg-slate-50/70 cursor-pointer group transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div>
                        <span className="group-hover:text-green-600 transition-colors flex items-center">
                          {vendor.name}
                          <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 text-green-500 transition-opacity" />
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">{vendor.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600">{vendor.category}</td>
                    <td className="py-4 px-4 font-mono font-medium text-slate-500">{vendor.gstNumber}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1 font-semibold text-slate-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400 shrink-0" />
                        <span>{vendor.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      ${vendor.spend.toLocaleString()} USD
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleEditVendorClick(vendor, e)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteVendor(vendor.id, vendor.name, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                          title="Terminate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({filteredAndSortedVendors.length} matching nodes)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="bg-white border border-slate-200 disabled:opacity-50 text-slate-600 px-3 py-1 text-xs rounded hover:bg-slate-50 transition-colors font-semibold"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="bg-white border border-slate-200 disabled:opacity-50 text-slate-600 px-3 py-1 text-xs rounded hover:bg-slate-50 transition-colors font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VENDOR PROFILE DRAWER */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedVendor(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="h-10 w-10 bg-green-100 rounded-lg border border-green-200 flex items-center justify-center text-green-700">
                    <Building className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{selectedVendor.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">Node ID: {selectedVendor.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Score indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rating</span>
                    <span className="text-sm font-bold text-slate-700 mt-1 flex items-center justify-center">
                      {selectedVendor.rating} <Star className="h-3 w-3 text-amber-400 fill-amber-400 ml-0.5 shrink-0" />
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Delivery</span>
                    <span className="text-sm font-bold text-green-600 mt-1 block">{selectedVendor.deliveryRate}%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Quality</span>
                    <span className="text-sm font-bold text-green-600 mt-1 block">{selectedVendor.qualityScore}%</span>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
                  <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Contract Integrity Metrics</h4>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Verification Badge:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedVendor.status)}`}>
                      {selectedVendor.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Active RFQ Bidding:</span>
                    <span className="text-slate-700 font-bold">{selectedVendor.activeRfqs} RFQs</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Total Sourced Volume:</span>
                    <span className="text-slate-800 font-bold">${selectedVendor.spend.toLocaleString()} USD</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">GST Register Number:</span>
                    <span className="text-slate-700 font-mono font-bold">{selectedVendor.gstNumber}</span>
                  </div>
                </div>

                {/* Supplier Contact Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
                  <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Primary Agent Profile</h4>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <User className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold leading-none">Contact Person</span>
                      <span className="text-slate-700 font-bold mt-1 block">{selectedVendor.contactPerson}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold leading-none">Corporate Email</span>
                      <span className="text-slate-700 font-medium mt-1 block">{selectedVendor.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold leading-none">Telephone Call</span>
                      <span className="text-slate-700 font-medium mt-1 block">{selectedVendor.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <Globe className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold leading-none">Location Country</span>
                      <span className="text-slate-700 font-bold mt-1 block flex items-center">
                        <MapPin className="h-3 w-3 text-rose-500 mr-1 shrink-0" />
                        {selectedVendor.country}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold leading-none">Onboarding Stamp</span>
                      <span className="text-slate-700 font-medium mt-1 block">{selectedVendor.onboardingDate}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Onboard New Vendor Node</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddVendorSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                    placeholder="e.g. Apex Industrial"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">GST Registration ID *</label>
                  <input
                    type="text"
                    required
                    value={newVendor.gstNumber}
                    onChange={(e) => setNewVendor({ ...newVendor, gstNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-mono"
                    placeholder="e.g. 27BBBBB1111B2Z4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Contact Person Name</label>
                  <input
                    type="text"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                    placeholder="johndoe@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Category Specialty</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Heavy Machinery & Tooling">Heavy Machinery & Tooling</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="General Services">General Services</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Country Location</label>
                  <input
                    type="text"
                    value={newVendor.country}
                    onChange={(e) => setNewVendor({ ...newVendor, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                    placeholder="e.g. Singapore"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-green-100"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Edit Vendor Node Information</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditVendorSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">GST Registration ID</label>
                  <input
                    type="text"
                    required
                    value={editForm.gstNumber}
                    onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Contact Person Name</label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Category Specialty</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Heavy Machinery & Tooling">Heavy Machinery & Tooling</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="General Services">General Services</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Verification Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-green-500 font-medium"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-green-100"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
