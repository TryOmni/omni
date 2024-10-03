import React, { useState } from 'react';

const Dashboard = () => {
    const [starredProjects, setStarredProjects] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [selectedProject, setSelectedProject] = useState('Virtual Machine');
    const [file, setFile] = useState(null);

    // Dummy JSON data
    const dummyData = [
        {
        name: "Joseph Jojoe",
        alignment: "75%",
        email: "joseph.jojoe@example.com",
        linkedin: "linkedin.com/in/joseph-jojoe",
        phone: "(555) 555-1000",
        yoe: "1"
        },
        {
        name: "Jessica Ye",
        alignment: "50%",
        email: "jessica.ye@example.com",
        linkedin: "linkedin.com/in/jessica-ye",
        phone: "(555) 555-1001",
        yoe: "2"
        },
        {
        name: "Chinmay Bhandaru",
        alignment: "25%",
        email: "chinmay.bhandaru@example.com",
        linkedin: "linkedin.com/in/chinmay-bhandaru",
        phone: "(555) 555-1002",
        yoe: "3"
        },
    ];

    const dummyData1 = [
        {
        name: "Tomato Jojoe",
        alignment: "40%",
        email: "joseph.jojoe@example.com",
        linkedin: "linkedin.com/in/joseph-jojoe",
        phone: "(555) 555-1000",
        yoe: "1"
        },
        {
        name: "Cheese Ye",
        alignment: "80%",
        email: "jessica.ye@example.com",
        linkedin: "linkedin.com/in/jessica-ye",
        phone: "(555) 555-1001",
        yoe: "2"
        },
        {
        name: "Cabbage Bhandaru",
        alignment: "95%",
        email: "chinmay.bhandaru@example.com",
        linkedin: "linkedin.com/in/chinmay-bhandaru",
        phone: "(555) 555-1002",
        yoe: "3"
        },
    ];

    const dummyData2 = [
        {
        name: "Joseph Calcium",
        alignment: "75%",
        email: "joseph.jojoe@example.com",
        linkedin: "linkedin.com/in/joseph-jojoe",
        phone: "(555) 555-1000",
        yoe: "1"
        },
        {
        name: "Jessica Yttrium",
        alignment: "50%",
        email: "jessica.ye@example.com",
        linkedin: "linkedin.com/in/jessica-ye",
        phone: "(555) 555-1001",
        yoe: "2"
        },
        {
        name: "Chinmay Potassium",
        alignment: "25%",
        email: "chinmay.bhandaru@example.com",
        linkedin: "linkedin.com/in/chinmay-bhandaru",
        phone: "(555) 555-1002",
        yoe: "3"
        },
    ];

    const projectData = {
        'Virtual Machine': dummyData,
        'CNN Model Development': dummyData1,
        'Sales & Trading': dummyData2
    };
    
    const toggleStar = (projectName) => {
        setStarredProjects(prev => 
            prev.includes(projectName) 
            ? prev.filter(name => name !== projectName)
            : [...prev, projectName]
        );
    };
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortedData = () => {
        const sortableData = [...projectData[selectedProject]];
        if (sortConfig.key !== null) {
          sortableData.sort((a, b) => {
            if (sortConfig.key === 'starred') {
              const aStarred = starredProjects.includes(a.name);
              const bStarred = starredProjects.includes(b.name);
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
    
    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
          return <span className="ml-1">⇅</span>;
        }
        return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    // Handle file selection
    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('http://127.0.0.1:5000/upload-resume', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Success:', data);
                // Handle success (e.g., show a success message)
            } catch (error) {
                console.error('Error uploading file:', error.message);
                // Handle error (e.g., show an error message to the user)
            }
        }
    };
    
  
    // Handle form submit (for uploading or processing the file)
    const handleSubmit = (event) => {
        event.preventDefault();
        if (file) {
        console.log('Selected file:', file);
        // You can perform an upload here using fetch, axios, etc.
        // Example with FormData:
        const formData = new FormData();
        formData.append('file', file);
  
        // Example: Uploading the file
        fetch('/upload-endpoint', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error uploading file:', error));
        } else {
        alert('Please select a file');
        }
    };

    return (
        <div className="flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#3D4B7F] text-white">
            <div className="text-xl font-bold">Omni</div>
            <div>@user</div>
        </div>
        
        {/* Hamburger button bar */}
        <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>

            <div className="flex justify-end">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="fileInput" 
                        accept=".pdf,.doc,.docx"  // Specify accepted file types
                    />
                    <label htmlFor="fileInput" className="cursor-pointer bg-[#7d8ed0] hover:bg-[#3D4B7F] text-white font-bold py-2 px-4 rounded">
                        Upload Resume
                    </label>
                </form>
                {/* {file && <p className="ml-2 text-sm">Selected file: {file.name}</p>} */}
            </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1 ">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-1/6 border-r border-gray-200' : 'w-0'} bg-gray-100 transition-all duration-300 overflow-hidden h-full`}>
            <div className="bg-white p-3 h-full">
                <h2 className="text-base font-semibold mb-2">Projects</h2>
                <div className="space-y-1">
                {Object.keys(projectData).map((project) => (
                    <div 
                    key={project}
                    className={`px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors duration-200 cursor-pointer ${selectedProject === project ? 'bg-blue-100' : ''}`}
                    onClick={() => setSelectedProject(project)}
                    >
                    {project}
                    </div>
                ))}
                </div>
            </div>
            </div>
            
            {/* Spreadsheet */}
            <div className="flex-1 p-4 overflow-hidden">
            <div className="overflow-auto max-h-[calc(100vh-12rem)]">
                <h2 className="text-base font-semibold mb-2">Candidates</h2>
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-white">
                    <th className="border p-2 w-28 sticky top-0 bg-white cursor-pointer" onClick={() => sortData('starred')}>
                        Starred <SortIcon column="starred" />
                    </th>
                    <th className="border p-2 w-32 sticky top-0 bg-white cursor-pointer" onClick={() => sortData('name')}>
                        Name <SortIcon column="name" />
                    </th>
                    <th className="border p-2 w-32 sticky top-0 bg-white cursor-pointer" onClick={() => sortData('alignment')}>
                        Alignment <SortIcon column="alignment" />
                    </th>
                    <th className="border p-2 w-48 sticky top-0 bg-white">Email</th>
                    <th className="border p-2 w-48 sticky top-0 bg-white">LinkedIn</th>
                    <th className="border p-2 w-32 sticky top-0 bg-white">Phone Number</th>
                    <th className="border p-2 w-24 sticky top-0 bg-white">YOE</th>
                    <th className="border p-2 flex-grow sticky top-0 bg-white">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {getSortedData().map((project, index) => (
                    <tr key={index}>
                        <td className="border p-2 w-28">
                        <div className="flex justify-center items-center h-full">
                            <button 
                            className="focus:outline-none" 
                            onClick={() => toggleStar(project.name)}
                            >
                            <svg 
                                className={`w-6 h-6 ${starredProjects.includes(project.name) ? 'text-yellow-400' : 'text-gray-400'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            </button>
                        </div>
                        </td>
                        <td className="border p-2 w-32 truncate">{project.name}</td>
                        <td className="border p-2 w-32 truncate">{project.alignment}</td>
                        <td className="border p-2 w-48 truncate">
                        <a href={`mailto:${project.email}`} className="inline-block px-2 py-1 bg-gray-200 rounded-md text-sm">
                            {project.email}
                        </a>
                        </td>
                        <td className="border p-2 w-48 truncate">{project.linkedin}</td>
                        <td className="border p-2 w-32 truncate">{project.phone}</td>
                        <td className="border p-2 w-24 truncate">{project.yoe}</td>
                        <td className="border p-2 flex-grow"></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </div>
    );
};

export default Dashboard;
