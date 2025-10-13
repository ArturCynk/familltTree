import React, { useState } from 'react';
import axios from 'axios';
import { ResponseType } from 'axios';
import { saveAs } from 'file-saver';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';

const allAvailableFields = [
  'personId',
  'gender',
  'firstName',
  'middleName',
  'lastName',
  'maidenName',
  'birthDateType',
  'birthDate',
  'birthDateFrom',
  'birthDateTo',
  'birthDateFreeText',
  'birthPlace',
  'status',
  'deathDateType',
  'deathDate',
  'deathDateFrom',
  'deathDateTo',
  'deathDateFreeText',
  'deathPlace',
  'burialPlace',
  'photo',
  'parents',
  'siblings',
  'spouses',
  'children'
];

const DataTransferComponent = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>(allAvailableFields);
  const [filters, setFilters] = useState({
    gender: '',
    status: '',
    bornBefore: '',
    bornAfter: '',
    diedBefore: '',
    diedAfter: '',
    hasSpouse: '',
    hasChildren: '',
    hasSiblings: '',
    birthPlace: '',
    deathPlace: '',
    burialPlace: '',
    relationFormat: 'name' // Added relation format filter
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'filters'>('fields');
  const [searchTerm, setSearchTerm] = useState('');

  const availableFields = allAvailableFields.filter(
    field => !selectedFields.includes(field) &&
      field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newFields = [...selectedFields];
    const [movedItem] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, movedItem);
    
    setSelectedFields(newFields);
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      status: '',
      bornBefore: '',
      bornAfter: '',
      diedBefore: '',
      diedAfter: '',
      hasSpouse: '',
      hasChildren: '',
      hasSiblings: '',
      birthPlace: '',
      deathPlace: '',
      burialPlace: '',
      relationFormat: 'name' // Reset to default
    });
  };

  const exportData = async (format: 'json' | 'excel' | 'csv') => {
    try {
      setLoading(true);
      setError('');
      setExportSuccess(false);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token missing');
        setLoading(false);
        return;
      }

      const params = {
        fields: selectedFields.join(','),
        ...filters
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: (format === 'json' ? 'json' : 'blob') as ResponseType
      };

      const endpoints = {
        json: 'http://localhost:3001/api/data-transfer/export/json',
        excel: 'http://localhost:3001/api/data-transfer/export/excel',
        csv: 'http://localhost:3001/api/data-transfer/export/csv'
      };

      const response = await axios.get(endpoints[format], config);
      const filename = `export_${Date.now()}`;
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        saveAs(blob, `${filename}.json`);
      } else {
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        const mimeType = format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv';
        
        const blob = new Blob([response.data], { type: mimeType });
        saveAs(blob, `${filename}.${extension}`);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Data Export Manager
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your data export with precision
          </p>
        </header>

        {/* Export Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {(['json', 'excel', 'csv'] as const).map(format => (
            <button
              key={format}
              onClick={() => exportData(format)}
              disabled={loading || selectedFields.length === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl shadow-md transition-all
                ${format === 'json' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                ${format === 'excel' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                ${format === 'csv' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">Export as {format.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'fields'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('fields')}
            >
              Fields Selection
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'filters'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('filters')}
            >
              Filters
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'fields' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Fields */}
                <div className="lg:col-span-1">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Available Fields</h2>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 w-full max-w-xs"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSelectedFields(allAvailableFields)}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedFields([])}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={() => setSelectedFields(['personId', 'firstName', 'lastName', 'birthDate'])}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200"
                    >
                      Basic Fields
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    {availableFields.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No matching fields' : 'All fields selected'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableFields.map(field => (
                          <button
                            key={field}
                            onClick={() => setSelectedFields(prev => [...prev, field])}
                            className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="font-medium text-gray-700">{field}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected Fields */}
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Selected Fields <span className="text-indigo-600">({selectedFields.length})</span>
                    </h2>
                    <div className="text-sm text-gray-500">
                      Drag to reorder fields
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="selectedFields">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3 min-h-[300px]"
                          >
                            {selectedFields.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>No fields selected</p>
                                <p className="text-sm mt-1">Add fields from the left panel</p>
                              </div>
                            ) : (
                              selectedFields.map((field, index) => (
                                <Draggable key={field} draggableId={field} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`
                                        flex items-center justify-between p-4 rounded-xl border
                                        ${snapshot.isDragging
                                          ? 'bg-indigo-50 border-indigo-300 shadow-md'
                                          : 'bg-white border-gray-200'}
                                      `}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-800">{field}</div>
                                          <div className="text-xs text-gray-500">Position: {index + 1}</div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setSelectedFields(prev => prev.filter(f => f !== field))}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'filters' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Filters Column 1 */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={filters.gender}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All genders</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All statuses</option>
                          <option value="alive">Alive</option>
                          <option value="deceased">Deceased</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Born After</label>
                          <input
                            type="date"
                            name="bornAfter"
                            value={filters.bornAfter}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Born Before</label>
                          <input
                            type="date"
                            name="bornBefore"
                            value={filters.bornBefore}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Relationships</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Has Spouse</label>
                        <select
                          name="hasSpouse"
                          value={filters.hasSpouse}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Has Children</label>
                        <select
                          name="hasChildren"
                          value={filters.hasChildren}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Has Siblings</label>
                        <select
                          name="hasSiblings"
                          value={filters.hasSiblings}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>

                      {/* Added Relation Format Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relation Format
                        </label>
                        <select
                          name="relationFormat"
                          value={filters.relationFormat}
                          onChange={handleFilterChange}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="name">Show Names</option>
                          <option value="id">Show IDs</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Controls how relationships (parents, siblings, etc.) are displayed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Filters Column 2 */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Life Events</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Died After</label>
                          <input
                            type="date"
                            name="diedAfter"
                            value={filters.diedAfter}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Died Before</label>
                          <input
                            type="date"
                            name="diedBefore"
                            value={filters.diedBefore}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Locations</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Birth Place</label>
                        <input
                          type="text"
                          name="birthPlace"
                          value={filters.birthPlace}
                          onChange={handleFilterChange}
                          placeholder="Enter birth place"
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Death Place</label>
                        <input
                          type="text"
                          name="deathPlace"
                          value={filters.deathPlace}
                          onChange={handleFilterChange}
                          placeholder="Enter death place"
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Burial Place</label>
                        <input
                          type="text"
                          name="burialPlace"
                          value={filters.burialPlace}
                          onChange={handleFilterChange}
                          placeholder="Enter burial place"
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 space-y-3">
          {exportSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                Export completed successfully! Your download should start shortly.
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium">Export Error</div>
                <div>{error}</div>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-800 hover:text-red-900"
                aria-label="Dismiss error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTransferComponent;