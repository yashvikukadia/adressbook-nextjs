'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Plus, Search, Edit, Trash2, X, Users, Phone,
  Mail as MailIcon, MapPin, Globe, Upload, UserCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [persons, setPersons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const ITEMS_PER_PAGE = 12;
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', state: '', country_id: '',
    website: '', profile_pic: '', group_ids: []
  });

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => { router.push('/login'); });
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedGroup) params.set('group_id', selectedGroup);
      params.set('page', currentPage.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());

      const [personsRes, groupsRes, countriesRes] = await Promise.all([
        fetch(`/api/persons?${params}`, { credentials: 'include' }),
        fetch('/api/groups', { credentials: 'include' }),
        fetch('/api/countries', { credentials: 'include' })
      ]);

      const [personsData, groupsData, countriesData] = await Promise.all([
        personsRes.json(), groupsRes.json(), countriesRes.json()
      ]);

      setPersons(personsData.data || []);
      setPagination(personsData.pagination || null);
      setGroups(groupsData);
      setCountries(countriesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  }, [searchTerm, selectedGroup, currentPage]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  const openModal = (person = null) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name, email: person.email, phone: person.phone,
        street: person.address?.street || '', city: person.address?.city || '',
        state: person.address?.state || '', country_id: person.address?.country?.id?.toString() || '',
        website: person.profile?.website || '', profile_pic: person.profile?.profile_pic || '',
        group_ids: person.groups?.map(g => g.id.toString()) || []
      });
    } else {
      setEditingPerson(null);
      setFormData({
        name: '', email: '', phone: '', street: '', city: '',
        state: '', country_id: '', website: '', profile_pic: '', group_ids: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingPerson(null); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      setFormData(prev => ({ ...prev, profile_pic: data.path }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name, email: formData.email, phone: formData.phone,
      address: (formData.street || formData.city || formData.country_id) ? {
        street: formData.street, city: formData.city, state: formData.state, country_id: formData.country_id
      } : null,
      profile: { profile_pic: formData.profile_pic || null, website: formData.website || null },
      group_ids: formData.group_ids
    };

    try {
      const url = editingPerson ? `/api/persons/${editingPerson.id}` : '/api/persons';
      const method = editingPerson ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(editingPerson ? 'Contact updated!' : 'Contact added!');
      closeModal();
      fetchData();
    } catch {
      toast.error('Failed to save contact');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await fetch(`/api/persons/${id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Contact deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName }), credentials: 'include'
      });
      toast.success('Group created!');
      setShowGroupModal(false);
      setGroupName('');
      fetchData();
    } catch {
      toast.error('Failed to create group');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await fetch(`/api/groups/${id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Group deleted');
      if (selectedGroup === id.toString()) setSelectedGroup(null);
      fetchData();
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const getGroupColor = (index) => {
    const colors = ['bg-[#A7F3D0]', 'bg-[#FECDD3]', 'bg-[#FDE047]', 'bg-[#BAE6FD]', 'bg-[#E9D5FF]'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-16 h-16 border-4 border-[#BAE6FD] border-t-[#171717] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="dashboard-page">
      {/* Header */}
      <header className="h-20 border-b-2 border-[#171717] bg-white/70 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] font-outfit">Address Book</h1>
          <p className="text-sm text-[#525252] font-medium">Welcome, {user?.name}</p>
        </div>
        <button
          data-testid="logout-button"
          onClick={handleLogout}
          className="bg-[#FECDD3] text-[#171717] font-bold py-2 px-4 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Logout
        </button>
      </header>

      <div className="p-8">
        {/* Search & Actions */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#171717]" strokeWidth={2} />
            <input
              data-testid="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border-2 border-[#171717] p-3 pl-12 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium placeholder:text-neutral-400"
              placeholder="Search contacts..."
            />
          </div>
          <div className="flex gap-3">
            <button data-testid="create-group-button" onClick={() => setShowGroupModal(true)} className="bg-[#E9D5FF] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all flex items-center gap-2">
              <Users className="w-5 h-5" strokeWidth={2} />New Group
            </button>
            <button data-testid="add-contact-button" onClick={() => openModal()} className="bg-[#BAE6FD] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" strokeWidth={2} />Add Contact
            </button>
          </div>
        </div>

        {/* Groups Filter */}
        {groups.length > 0 && (
          <div className="mb-8" data-testid="groups-filter">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-3">Filter by Group</h3>
            <div className="flex flex-wrap gap-3">
              <button data-testid="filter-all-button" onClick={() => { setSelectedGroup(null); setCurrentPage(1); }}
                className={`px-4 py-2 border-2 border-[#171717] font-bold text-xs rounded-full transition-all ${selectedGroup === null ? 'bg-[#171717] text-white' : 'bg-white text-[#171717] hover:bg-[#FAFAFA]'}`}>
                All Contacts
              </button>
              {groups.map((group) => (
                <div key={group.id} className="relative group/item">
                  <button data-testid={`filter-group-${group.id}`} onClick={() => { setSelectedGroup(group.id.toString()); setCurrentPage(1); }}
                    className={`px-4 py-2 border-2 border-[#171717] font-bold text-xs rounded-full transition-all ${selectedGroup === group.id.toString() ? 'bg-[#171717] text-white' : 'bg-white text-[#171717] hover:bg-[#FAFAFA]'}`}>
                    {group.name} ({group.person_count})
                  </button>
                  <button data-testid={`delete-group-${group.id}`} onClick={() => handleDeleteGroup(group.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Grid */}
        {persons.length === 0 ? (
          <div className="text-center py-20" data-testid="no-contacts-message">
            <UserCircle className="w-24 h-24 mx-auto mb-4 text-[#525252]" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-[#171717] font-outfit mb-2">No contacts found</h3>
            <p className="text-[#525252] font-medium mb-6">Start by adding your first contact</p>
            <button data-testid="add-first-contact-button" onClick={() => openModal()}
              className="bg-[#BAE6FD] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all inline-flex items-center gap-2">
              <Plus className="w-5 h-5" strokeWidth={2} />Add Your First Contact
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="contacts-grid">
            {persons.map((person, index) => (
              <motion.div key={person.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                data-testid={`contact-card-${person.id}`}
                className="bg-white border-2 border-[#171717] p-6 rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_#171717] transition-all duration-300 flex flex-col items-center text-center">
                
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border-2 border-[#171717] overflow-hidden mb-4 bg-gradient-to-br from-[#BAE6FD] to-[#E9D5FF] flex items-center justify-center">
                  {person.profile?.profile_pic ? (
                    <img src={person.profile.profile_pic} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-12 h-12 text-[#171717]" strokeWidth={2} />
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#171717] font-outfit mb-1">{person.name}</h3>

                <div className="space-y-2 w-full mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
                    <MailIcon className="w-4 h-4 shrink-0" strokeWidth={2} /><span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
                    <Phone className="w-4 h-4 shrink-0" strokeWidth={2} /><span>{person.phone}</span>
                  </div>
                  {person.address && (
                    <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
                      <MapPin className="w-4 h-4 shrink-0" strokeWidth={2} /><span className="truncate">{person.address.city}, {person.address.country?.code}</span>
                    </div>
                  )}
                  {person.profile?.website && (
                    <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
                      <Globe className="w-4 h-4 shrink-0" strokeWidth={2} /><a href={person.profile.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">Website</a>
                    </div>
                  )}
                </div>

                {person.groups?.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {person.groups.map((group, idx) => (
                      <span key={group.id} className={`${getGroupColor(idx)} text-[#171717] text-xs font-bold px-3 py-1 border-2 border-[#171717] rounded-full`}>{group.name}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <button data-testid={`edit-contact-${person.id}`} onClick={() => openModal(person)}
                    className="bg-[#A7F3D0] text-[#171717] font-bold py-2 px-4 rounded-none border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all flex items-center gap-2">
                    <Edit className="w-4 h-4" strokeWidth={2} />Edit
                  </button>
                  <button data-testid={`delete-contact-${person.id}`} onClick={() => handleDelete(person.id)}
                    className="bg-[#FECDD3] text-[#171717] font-bold py-2 px-4 rounded-none border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" strokeWidth={2} />Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4" data-testid="pagination">
            <p className="text-sm font-medium text-[#525252]">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              <span className="font-bold text-[#171717]">{pagination.total}</span> contacts
            </p>

            <div className="flex items-center gap-2">
              <button
                data-testid="pagination-prev"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="bg-white text-[#171717] font-bold py-2 px-3 rounded-none border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-[#525252] font-bold">...</span>
                  ) : (
                    <button
                      key={item}
                      data-testid={`pagination-page-${item}`}
                      onClick={() => setCurrentPage(item)}
                      className={`w-10 h-10 font-bold text-sm border-2 border-[#171717] rounded-none transition-all ${
                        currentPage === item
                          ? 'bg-[#171717] text-white shadow-none'
                          : 'bg-white text-[#171717] shadow-[3px_3px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                data-testid="pagination-next"
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className="bg-white text-[#171717] font-bold py-2 px-3 rounded-none border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
              >
                Next<ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-white border-4 border-[#171717] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="contact-modal">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#171717] font-outfit">{editingPerson ? 'Edit Contact' : 'Add New Contact'}</h2>
                <button data-testid="close-modal-button" onClick={closeModal} className="text-[#171717] hover:text-[#525252] transition-colors">
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {formData.profile_pic && (
                      <img src={formData.profile_pic} alt="Preview" className="w-20 h-20 rounded-full border-2 border-[#171717] object-cover" />
                    )}
                    <label className="bg-[#E9D5FF] text-[#171717] font-bold py-2 px-4 rounded-none border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" strokeWidth={2} />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input data-testid="upload-profile-pic" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Name *</label>
                    <input data-testid="contact-name-input" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Email *</label>
                    <input data-testid="contact-email-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Phone *</label>
                  <input data-testid="contact-phone-input" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" required />
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-bold text-[#171717] font-outfit mb-3">Address (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Street</label>
                      <input data-testid="contact-street-input" type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">City</label>
                      <input data-testid="contact-city-input" type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">State</label>
                      <input data-testid="contact-state-input" type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Country</label>
                      <select data-testid="contact-country-select" value={formData.country_id} onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                        className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium">
                        <option value="">Select a country</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Website (Optional)</label>
                  <input data-testid="contact-website-input" type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium" placeholder="https://example.com" />
                </div>

                {/* Groups */}
                {groups.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Groups (Optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {groups.map((group) => (
                        <label key={group.id}
                          className={`px-4 py-2 border-2 border-[#171717] font-bold text-xs rounded-full cursor-pointer transition-all ${formData.group_ids.includes(group.id.toString()) ? 'bg-[#171717] text-white' : 'bg-white text-[#171717] hover:bg-[#FAFAFA]'}`}>
                          <input data-testid={`group-checkbox-${group.id}`} type="checkbox"
                            checked={formData.group_ids.includes(group.id.toString())}
                            onChange={(e) => {
                              const gid = group.id.toString();
                              if (e.target.checked) setFormData({ ...formData, group_ids: [...formData.group_ids, gid] });
                              else setFormData({ ...formData, group_ids: formData.group_ids.filter(id => id !== gid) });
                            }} className="hidden" />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button data-testid="cancel-contact-button" type="button" onClick={closeModal}
                    className="bg-white text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">Cancel</button>
                  <button data-testid="save-contact-button" type="submit"
                    className="bg-[#BAE6FD] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">
                    {editingPerson ? 'Update Contact' : 'Add Contact'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGroupModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-white border-4 border-[#171717] p-8 max-w-md w-full" data-testid="group-modal">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#171717] font-outfit">Create New Group</h2>
                <button data-testid="close-group-modal-button" onClick={() => setShowGroupModal(false)} className="text-[#171717] hover:text-[#525252] transition-colors">
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">Group Name</label>
                  <input data-testid="group-name-input" type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-white border-2 border-[#171717] p-3 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium"
                    placeholder="e.g., Family, Work, Friends" required />
                </div>
                <div className="flex gap-3 justify-end">
                  <button data-testid="cancel-group-button" type="button" onClick={() => setShowGroupModal(false)}
                    className="bg-white text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">Cancel</button>
                  <button data-testid="create-group-submit-button" type="submit"
                    className="bg-[#E9D5FF] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">Create Group</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
