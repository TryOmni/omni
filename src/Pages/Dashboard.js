import React, {useState, useEffect} from 'react';
import Papa from 'papaparse';
import Modal from 'react-modal';
import axios from 'axios';

const Dashboard = () => {
    const [starredProjects, setStarredProjects] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'ascending'});
    const [selectedProject, setSelectedProject] = useState(null);
    const [file, setFile] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [savedSpreadsheets, setSavedSpreadsheets] = useState([]);
    const [showStarredColumn, setShowStarredColumn] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [headerDescriptions, setHeaderDescriptions] = useState({});
    const [searchQuery, setSearchQuery] = useState(''); // State for the search query
    const [filteredData, setFilteredData] = useState([]); // State to hold the filtered data
    const [relevantColumns, setRelevantColumns] = useState([]); // State to hold relevant columns

    useEffect(() => {
        setFilteredData(tableData); // Initialize filtered data with the complete table data
    }, [tableData]);

    const generateAndSortData = async (query, tableData, descriptions, relevantC) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/generate_vectors_and_sort', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    tableData,
                    descriptions,
                    relevantC
                })
            });
            const result = await response.json();
            console.log(result)
            return result;
        } catch (error) {
            console.error('Error generating and sorting data:', error);
            return null;
        }
    };

const handleSearch = async (event) => {
    event.preventDefault();

    const descriptions = headerDescriptions;

    if (!descriptions || Object.keys(descriptions).length === 0) {
        console.error('No column descriptions available.');
        return;
    }

    // Step 1: Retrieve the relevant columns from the LLM
    const prompt = `
Given the following column descriptions:

${JSON.stringify(descriptions, null, 2)}

And the following natural language query:

"${searchQuery}"

Identify which columns from the CSV should be parsed to fulfill the query. Return the result as a JSON list of column names. Example:

{
    "columns": ["Name", "Age"]
}
DO NOT ADD ANY EXTRA INFO OR RESPONSE BEFORE OR AFTER. JUST GIVE THE JSON AND THATS IT. 

`;

    try {
        const response = await fetch("https://proxy.tune.app/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "sk-tune-Tsu5pDnz1SQQBUMtzilosOouThYfgfp0hNU",
            },
            body: JSON.stringify({
                temperature: 0.7,
                messages: [
                    {
                        "role": "system",
                        "content": "You are an AI assistant that helps identify relevant CSV columns based on user queries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model: "themoonwalker/themoonwalker-llama3-1-8b",
                stream: false,
                frequency_penalty: 0.2,
                max_tokens: 200
            })
        });

        const result = await response.json();

        if (result && result.choices && result.choices[0].message && result.choices[0].message.content) {
            console.log(result);
            const parsedResponse = JSON.parse(result.choices[0].message.content.trim());
            const relevantColumns = parsedResponse.columns;

            console.log('Relevant Columns:', relevantColumns);
            setRelevantColumns(relevantColumns)

            // Step 2: Directly use the local relevantColumns variable for filtering and API call
            // // Optional: Filter data based on relevant columns
            // const filteredData = tableData.map(row => {
            //     const filteredRow = {};
            //     relevantColumns.forEach(col => {
            //         filteredRow[col] = row[col];
            //     });
            //     return filteredRow;
            // });

            // setFilteredData(filteredData);

            // Step 3: Call generateAndSortData with relevantColumns
            const generateResult = await generateAndSortData(searchQuery, tableData, headerDescriptions, relevantColumns);
            if (generateResult) {
                const { sortedData } = generateResult;
                setTableData(sortedData);
            } else {
                console.error('Failed to generate and sort data');
            }

        } else {
            console.error('Invalid response format from LLM:', result);
        }
    } catch (error) {
        console.error('Error searching:', error);
    }
};



    const fetchColumnDescriptions = async (headers) => {
        try {
            // Create a prompt that requests descriptions for each header in a standardized format
            const prompt = `
        I have the following column headers in a CSV file: [${headers.join(', ')}].
        For each column, provide a description in the following JSON format:

        {
            "header1": "Description of header1",
            "header2": "Description of header2",
            ...
        }

        Example:

        {
            "Name": "The name of the individual",
            "Age": "The age of the individual in years",
            "Country": "The country where the individual resides"
        }
        
        DO NOT ADD ANY EXTRA INFO OR RESPONSE BEFORE OR AFTER. JUST GIVE THE JSON AND THATS IT. 
        `;

            // Make the API call to the LLM
            const response = await fetch("https://proxy.tune.app/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "sk-tune-Tsu5pDnz1SQQBUMtzilosOouThYfgfp0hNU",
                },
                body: JSON.stringify({
                    temperature: 0.7, // Adjust as needed
                    messages: [
                        {
                            "role": "system",
                            "content": "You are an AI assistant that provides detailed descriptions for column headers in CSV files."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    model: "themoonwalker/themoonwalker-llama3-1-8b",
                    stream: false,
                    frequency_penalty: 0.2,
                    max_tokens: 300 // Increase max tokens to accommodate more headers
                })
            });

            // Parse the response
            const result = await response.json();

            // Ensure the response contains a valid JSON structure
            if (result && result.choices && result.choices[0].message && result.choices[0].message.content) {
                const descriptions = JSON.parse(result.choices[0].message.content.trim());
                setHeaderDescriptions(descriptions);
            } else {
                console.error('Invalid response format from LLM:', result);
            }
        } catch (error) {
            console.error('Error fetching column descriptions:', error);
        }
    };


    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: async (result) => { // Added async keyword here
                    if (result.data && result.data.length > 0) {
                        const headers = result.data[0];
                        setTableHeaders(Array.isArray(headers) ? headers : []);

                        const data = result.data.slice(1);
                        const parsedData = data
                            .filter(row => row.some(cell => cell.trim() !== '')) // Remove empty rows
                            .map(row => {
                                const rowData = {};
                                headers.forEach((header, index) => {
                                    rowData[header] = row[index];
                                });
                                return rowData;
                            });
                        setTableData(parsedData);

                        // Fetch column descriptions from the backend using JSON data
                        await fetchColumnDescriptions(headers);

                        // Save the new spreadsheet
                        const newSpreadsheet = {
                            name: file.name,
                            headers: headers,
                            data: parsedData,
                            starredProjects: [],
                            sortConfig: {key: null, direction: 'ascending'}
                        };
                        setSavedSpreadsheets(prev => [...prev, newSpreadsheet]);
                        setSelectedProject(file.name);
                        setShowStarredColumn(true); // Show the starred column after a spreadsheet is uploaded
                        setModalIsOpen(true); // Open the modal after a spreadsheet is uploaded
                    } else {
                        console.error('Parsed data is empty or invalid');
                        setTableHeaders([]);
                        setTableData([]);
                        setShowStarredColumn(false); // Hide the starred column if data is invalid
                    }
                },
                header: false,
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    setTableHeaders([]);
                    setTableData([]);
                    setShowStarredColumn(false); // Hide the starred column on error
                }
            });
        }
    };


    const toggleStar = (projectName) => {
        setStarredProjects(prev => {
            const newStarredProjects = prev.includes(projectName)
                ? prev.filter(name => name !== projectName)
                : [...prev, projectName];

            // Update the saved spreadsheet
            setSavedSpreadsheets(sheets =>
                sheets.map(sheet =>
                    sheet.name === selectedProject
                        ? {...sheet, starredProjects: newStarredProjects}
                        : sheet
                )
            );

            return newStarredProjects;
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});

        // Update the saved spreadsheet
        setSavedSpreadsheets(sheets =>
            sheets.map(sheet =>
                sheet.name === selectedProject
                    ? {...sheet, sortConfig: {key, direction}}
                    : sheet
            )
        );
    };

    const getSortedData = () => {
        const sortableData = [...tableData];
        if (sortConfig.key !== null) {
            sortableData.sort((a, b) => {
                if (sortConfig.key === 'starred') {
                    const aStarred = starredProjects.includes(a[tableHeaders[0]]);
                    const bStarred = starredProjects.includes(b[tableHeaders[0]]);
                    if (aStarred === bStarred) return 0;
                    return sortConfig.direction === 'ascending' ? (aStarred ? -1 : 1) : (aStarred ? 1 : -1);
                }
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    };

    const SortIcon = ({column}) => {
        if (sortConfig.key !== column) {
            return <span className="ml-1">⇅</span>;
        }
        return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleFileUpload(event);
        }
    };

    const selectSpreadsheet = (name) => {
        const selected = savedSpreadsheets.find(sheet => sheet.name === name);
        if (selected) {
            setSelectedProject(name);
            setTableHeaders(selected.headers);
            setTableData(selected.data);
            setStarredProjects(selected.starredProjects);
            setSortConfig(selected.sortConfig);
            setShowStarredColumn(true); // Show the starred column when a spreadsheet is selected
        }
    };

    const exportToCSV = () => {
        const csvData = [tableHeaders, ...tableData.map(row => tableHeaders.map(header => row[header]))];
        const csvContent = Papa.unparse(csvData);
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${selectedProject}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleDescriptionChange = (header, description) => {
        setHeaderDescriptions(prev => ({...prev, [header]: description}));
    };

    return (
        <div className="flex flex-col h-screen">

            {/* Top bar */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#3D4B7F] text-white">
                <div className="text-xl font-bold">Omni</div>
                {/* <div>@user</div> */}
            </div>

            {/* Hamburger button bar */}
            <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>

                <div className="flex justify-center items-center h-full space-x-2">
                    <form>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="fileInput"
                            accept=".csv"
                        />
                        <label htmlFor="fileInput"
                               className="cursor-pointer bg-[#7d8ed0] hover:bg-[#3D4B7F] text-white font-bold py-2 px-4 rounded h-10 flex items-center justify-center">
                            Upload Spreadsheet
                        </label>
                    </form>
                    <button
                        onClick={openModal}
                        className="bg-orange-700 hover:bg-orange-900 text-white font-bold py-2 px-4 rounded h-10 flex items-center justify-center"
                    >
                        Edit Fields
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded h-10 flex items-center justify-center"
                    >
                        Export to CSV
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 ">
                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? 'w-1/6 border-r border-gray-200' : 'w-0'} bg-gray-100 transition-all duration-300 overflow-hidden h-full`}>
                    <div className="bg-white p-3 h-full">
                        <h2 className="text-base font-semibold mb-4">Saved Spreadsheets</h2>
                        <div className="space-y-1">
                            {savedSpreadsheets.map((sheet, index) => (
                                <div
                                    key={index}
                                    className={`p-2 cursor-pointer transition-colors duration-200 ease-in-out rounded-md ${selectedProject === sheet.name ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
                                    onClick={() => selectSpreadsheet(sheet.name)}
                                >
                                    {sheet.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Spreadsheet */}
                <div className="flex-1 p-4 overflow-hidden">

                    {selectedProject && (<div className="flex justify-center items-center mb-4">
                            <form onSubmit={handleSearch} className="flex w-full max-w-md">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border rounded-l-md p-2 w-full"
                                    placeholder="Add your natural language input here!"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#7d8ed0] hover:bg-[#3D4B7F] text-white p-2 rounded-r-md font-bold"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    )}
                    <div className="overflow-auto max-h-[calc(100vh-12rem)]">
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                            <tr className="bg-white">
                                {showStarredColumn &&
                                    <th className="border p-2 w-28 sticky top-0 bg-gray-100 cursor-pointer"
                                        onClick={() => sortData('starred')}>
                                        Starred <SortIcon column="starred"/>
                                    </th>}
                                {relevantColumns && Array.isArray(tableHeaders) && tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className={`border p-2 sticky top-0 cursor-pointer ${
                                            relevantColumns.includes(header) ? 'bg-blue-200' : 'bg-gray-100'
                                        }`}
                                        onClick={() => sortData(header)}
                                    >
                                        {header} <SortIcon column={header}/>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getSortedData().map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {showStarredColumn && <td className="border p-2 w-28">
                                        <div className="flex justify-center items-center h-full">
                                            <button
                                                className="focus:outline-none"
                                                onClick={() => toggleStar(row[tableHeaders[0]])}
                                            >
                                                <svg
                                                    className={`w-6 h-6 ${starredProjects.includes(row[tableHeaders[0]]) ? 'text-yellow-400' : 'text-gray-400'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>}
                                    {relevantColumns && Array.isArray(tableHeaders) && tableHeaders.map((header, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className={`border p-2 truncate ${
                                                relevantColumns.includes(header) ? 'bg-blue-100' : ''
                                            }`} // Apply darker background to relevant columns in body cells
                                        >
                                            {row[header]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for editing field descriptions */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Field Descriptions"
                className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Edit Field Descriptions</h2>
                        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="field-descriptions space-y-4">
                        {relevantColumns && tableHeaders.map((header, index) => (
                            <div key={index} className="field-description">
                                <label className="block font-bold mb-1">{header}</label>
                                <input
                                    type="text"
                                    value={headerDescriptions[header] || ''}
                                    onChange={(e) => handleDescriptionChange(header, e.target.value)}
                                    className="border p-2 w-full"
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <button
                            onClick={closeModal}
                            className="mt-4 bg-[#7d8ed0] hover:bg-[#3D4B7F] text-white font-bold py-2 px-4 rounded"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;