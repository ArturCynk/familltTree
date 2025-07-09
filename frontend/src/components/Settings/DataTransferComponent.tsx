import React, { useState } from 'react';
import axios, { ResponseType } from 'axios';
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
        burialPlace: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [exportSuccess, setExportSuccess] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fieldsPerPage = 8;
    const availableFields = allAvailableFields.filter(
        field => !selectedFields.includes(field) &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Walidacja dat
        if (name.includes('Before') || name.includes('After')) {
            if (value && isNaN(new Date(value).getTime())) {
                setError(`Invalid date in ${name.replace(/([A-Z])/g, ' $1')}`);
                return;
            }
        }

        setFilters(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newFields = Array.from(selectedFields);
        const [movedItem] = newFields.splice(result.source.index, 1);
        newFields.splice(result.destination.index, 0, movedItem);

        setSelectedFields(newFields);
    };

    const resetFilters = () => {
        setResetting(true);
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
            burialPlace: ''
        });
        setTimeout(() => setResetting(false), 300);
    };

    const exportData = async (format: 'json' | 'excel' | 'csv') => {
        try {
            setLoading(true);
            setError('');
            setExportSuccess(false);

            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token is missing. Please log in again.');
                setLoading(false);
                return;
            }

            const params = {
                fields: selectedFields.join(','),
                ...filters
            };

            let responseType: ResponseType;
            if (format === 'json') {
                responseType = 'json';
            } else {
                responseType = 'blob';
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params,
                responseType
            };

            let response;
            const filename = `persons_export_${Date.now()}`;

            switch (format) {
                case 'json':
                    response = await axios.get('http://localhost:3001/api/data-transfer/export/json', config);
                    const jsonBlob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                    saveAs(jsonBlob, `${filename}.json`);
                    break;

                case 'excel':
                    response = await axios.get('http://localhost:3001/api/data-transfer/export/excel', config);
                    const excelBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(excelBlob, `${filename}.xlsx`);
                    break;

                case 'csv':
                    response = await axios.get('http://localhost:3001/api/data-transfer/export/csv', config);
                    const csvBlob = new Blob([response.data], { type: 'text/csv' });
                    saveAs(csvBlob, `${filename}.csv`);
                    break;
            }

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Export failed. Please try again later.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Data Export</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select fields, apply filters, and export your data in multiple formats
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Fields Selection */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Fields Selection</h2>
                                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                                    {selectedFields.length} selected
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="text-sm text-gray-500 mb-3">
                                    Fields will be exported in the order shown below
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="fields">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="min-h-[250px] max-h-[300px] overflow-y-auto bg-white rounded-lg border border-gray-200 p-3 space-y-2"
                                            >
                                                {selectedFields.length === 0 && (
                                                    <div className="text-gray-400 text-center py-8">
                                                        No fields selected. Add fields below.
                                                    </div>
                                                )}

                                                {selectedFields.map((field, index) => (
                                                    <Draggable
                                                        key={field}
                                                        draggableId={field}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${snapshot.isDragging
                                                                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg mr-3">
                                                                        <span className="text-gray-500">{index + 1}</span>
                                                                    </div>
                                                                    <span className="font-medium text-gray-700">{field}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() =>
                                                                        setSelectedFields((prev) => prev.filter((f) => f !== field))
                                                                    }
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-700 font-medium">Available fields</h3>
                                    <input
                                        type="text"
                                        placeholder="Search fields..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="text-sm p-2 rounded border border-gray-300 w-40"
                                    />
                                </div>

                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => setSelectedFields(allAvailableFields)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={() => setSelectedFields([])}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                                    >
                                        Deselect All
                                    </button>
                                    <button
                                        onClick={() => setSelectedFields(['personId', 'firstName', 'lastName', 'birthDate'])}
                                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                                    >
                                        Basic Fields
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {availableFields.length === 0 ? (
                                        <div className="text-gray-400 text-sm py-2 w-full text-center">
                                            {searchTerm ? 'No matching fields found' : 'All fields are selected'}
                                        </div>
                                    ) : (
                                        availableFields
                                            .slice(page * fieldsPerPage, (page + 1) * fieldsPerPage)
                                            .map((field) => (
                                                <button
                                                    key={field}
                                                    onClick={() => setSelectedFields((prev) => [...prev, field])}
                                                    className="px-3 py-1.5 bg-white text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {field}
                                                </button>
                                            ))
                                    )}
                                </div>

                                {availableFields.length > fieldsPerPage && (
                                    <div className="flex justify-center mt-3">
                                        <button
                                            disabled={page === 0}
                                            onClick={() => setPage(p => p - 1)}
                                            className="mx-1 px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                        >
                                            &larr;
                                        </button>
                                        <button
                                            disabled={(page + 1) * fieldsPerPage >= availableFields.length}
                                            onClick={() => setPage(p => p + 1)}
                                            className="mx-1 px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                        >
                                            &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Filters and Export */}
                        <div>
                            {/* Filters Section */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                                    <button
                                        onClick={resetFilters}
                                        disabled={resetting}
                                        className="text-sm text-gray-500 hover:text-blue-600 flex items-center disabled:opacity-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                        {resetting ? 'Resetting...' : 'Reset filters'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select
                                                name="gender"
                                                value={filters.gender}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All genders</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All statuses</option>
                                                <option value="alive">Alive</option>
                                                <option value="deceased">Deceased</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Born After</label>
                                            <input
                                                type="date"
                                                name="bornAfter"
                                                value={filters.bornAfter}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Born Before</label>
                                            <input
                                                type="date"
                                                name="bornBefore"
                                                value={filters.bornBefore}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Died After</label>
                                            <input
                                                type="date"
                                                name="diedAfter"
                                                value={filters.diedAfter}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Died Before</label>
                                            <input
                                                type="date"
                                                name="diedBefore"
                                                value={filters.diedBefore}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Has Spouse</label>
                                            <select
                                                name="hasSpouse"
                                                value={filters.hasSpouse}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Has Children</label>
                                            <select
                                                name="hasChildren"
                                                value={filters.hasChildren}
                                                onChange={handleFilterChange}
                                                className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                                        <input
                                            type="text"
                                            name="birthPlace"
                                            value={filters.birthPlace}
                                            onChange={handleFilterChange}
                                            placeholder="Enter birth place"
                                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Death Place</label>
                                        <input
                                            type="text"
                                            name="deathPlace"
                                            value={filters.deathPlace}
                                            onChange={handleFilterChange}
                                            placeholder="Enter death place"
                                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Burial Place</label>
                                        <input
                                            type="text"
                                            name="burialPlace"
                                            value={filters.burialPlace}
                                            onChange={handleFilterChange}
                                            placeholder="Enter burial place"
                                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Export Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Data</h2>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => exportData('json')}
                                        disabled={loading || selectedFields.length === 0}
                                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                                JSON
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => exportData('excel')}
                                        disabled={loading || selectedFields.length === 0}
                                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white text-green-700 rounded-lg border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Excel
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => exportData('csv')}
                                        disabled={loading || selectedFields.length === 0}
                                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                CSV
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p>Exported data will include {selectedFields.length} selected fields with applied filters.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success message */}
                    {exportSuccess && (
                        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Export completed successfully! Your download should start shortly.</span>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            <div className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <div className="font-medium">Export Error</div>
                                    <div>{error}</div>
                                    <button
                                        onClick={() => setError('')}
                                        className="mt-2 text-red-800 hover:underline text-sm"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataTransferComponent;