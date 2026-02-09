// import { useEffect, useState } from 'react';

const globalStyles = {
  padding: '8px',
  backgroundColor: '#000',
  height: '100vh',
  widht: '100vw',
  color: '#eee',
};

// const useFetch = (url: string) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUrl = async () => {
//       try {
//         const response = fetch(url);
//         const data = (await response).json();
//         setData(data as any);
//         setLoading(true);
//       } catch (error: unknown) {
//         setError(error as any);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUrl();
//   }, [url]);

//   return {
//     data,
//     loading,
//     error,
//   };
// };

// const useDebounce = (searchedString: string, delay = 200) => {
//   const [searchedValue, setSearchedValue] = useState<string>('');

//   useEffect(() => {
//     const timeOut = setTimeout(() => {
//       setSearchedValue(searchedString);
//     }, delay);

//     return () => clearTimeout(timeOut);
//   }, [searchedString, delay]);

//   return {
//     searchedValue,
//   };
// };

// const useTimer = (start = 0, interval = 200) => {
//   const [timer, setTimer] = useState(start);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setTimer(prev => prev + 1);
//     }, interval);

//     return () => clearInterval(intervalId);
//   }, [interval, start]);

//   return { timer };
// };

// function countFrequency(arr = [], findVal: number) {
//   let count = 0;

//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] === findVal) {
//       count++;
//     }
//   }

//   return count;
// }

// function checkIfExist(arr = [], findVal: number) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] === findVal) {
//       return true;
//     }
//   }

//   return false;
// }

// const TABLE_DATA = [
//   {
//     id: '1',
//     name: 'Apple 1',
//     age: 12,
//   },
//   {
//     id: '2',
//     name: 'Apple 2',
//     age: 13,
//   },
//   {
//     id: '3',
//     name: 'Apple 3',
//     age: 14,
//   },
//   {
//     id: '4',
//     name: 'Apple 4',
//     age: 15,
//   },
//   {
//     id: '5',
//     name: 'Apple 5',
//     age: 16,
//   },
// ];

// const Table = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limitPerPage, setLimitPerPage] = useState(2);
//   const handlePrev = () => {
//     if (currentPage - 1 < 1) {
//       return;
//     }
//     setCurrentPage(prev => prev - 1);
//   };

//   const handleNext = () => {
//     const dataLength = TABLE_DATA.length;
//     const totalPaginationLimit = Math.ceil(dataLength / limitPerPage);

//     if (currentPage + 1 > totalPaginationLimit) {
//       return;
//     }

//     setCurrentPage(prev => prev + 1);
//   };

//   const renderTableData = () => {
//     const arr = [];
//     const startIndex = (currentPage - 1) * limitPerPage;
//     const endIndex = startIndex + limitPerPage;

//     for (let i = startIndex; i < endIndex; i++) {
//       if (TABLE_DATA[i]) {
//         arr.push(TABLE_DATA[i]);
//       }
//     }

//     return arr;
//   };

//   return (
//     <table>
//       <thead>
//         <tr>
//           {Object.keys(TABLE_DATA[0]).map((item, index) => (
//             <th key={index}>{item}</th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>
//         {renderTableData().map(item => (
//           <tr key={item.id}>
//             <td>{item.id}</td>
//             <td>{item.name}</td>
//             <td>{item.age}</td>
//           </tr>
//         ))}
//       </tbody>
//       <tfoot>
//         <button onClick={() => handlePrev()}>Prev</button>
//         <span>{currentPage}</span>
//         <button onClick={() => handleNext()}>Next</button>
//       </tfoot>
//     </table>
//   );
// };

// const ToDoApp = () => {
//   const [input, setInput] = useState('');
//   const [list, setList] = useState<unknown[]>([]);
//   const [editModalOpenDetails, setEditModalOpenDetails] = useState({
//     modalOpen: false,
//     id: null,
//   });

//   const handleAdd = () => {
//     if (
//       String(input).trim() !== '' &&
//       editModalOpenDetails.modalOpen === false
//     ) {
//       const listArr = [
//         ...list,
//         {
//           id: new Date().getTime(),
//           value: input,
//         },
//       ];
//       setList(listArr);
//       setInput('');
//     }

//     if (
//       String(input).trim() !== '' &&
//       editModalOpenDetails.modalOpen === true
//     ) {
//       const listArr = list.map(item => {
//         if (item.id === editModalOpenDetails.id) {
//           return {
//             ...item,
//             value: input,
//           };
//         }
//         return {
//           ...item,
//         };
//       });
//       setList(listArr);
//       setInput('');
//       setEditModalOpenDetails({
//         modalOpen: false,
//         id: null,
//       });
//     }
//   };

//   const handleDelete = id => {
//     const updatedList = list.filter(item => item.id !== id);
//     setList(updatedList);
//   };

//   const handleEdit = id => {
//     setEditModalOpenDetails({
//       modalOpen: true,
//       id: id,
//     });
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={input}
//         onChange={e => setInput(e.target.value)}
//       />
//       <button onClick={() => handleAdd()}>Add</button>
//       <ul>
//         {list.map(item => (
//           <li key={item.id}>
//             {item.value}
//             <button onClick={() => handleEdit(item.id)}>Edit</button>
//             <button onClick={() => handleDelete(item.id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// const DebounceSearchWithAutoSuggestion = () => {
//   const [searchText, setSearchText] = useState('');
//   const { searchedValue } = useDebounce(searchText);

//   const getList = () => {
//     const ans = [];
//     TABLE_DATA.forEach(item => {
//       if (
//         item.name
//           .toLocaleLowerCase()
//           .includes(searchedValue.toLocaleLowerCase()) &&
//         searchedValue !== ''
//       ) {
//         ans.push(item);
//       }
//     });
//     return ans;
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={searchText}
//         onChange={e => setSearchText(e.target.value)}
//       />

//       {/* List */}
//       <ul>
//         {getList().map(item => (
//           <li key={item.id}>{item.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// const SelectInput = () => {
//   const [selectedValue, setSelectedValue] = useState('');
//   const handleChange = e => {
//     setSelectedValue(e.target.value);
//   };

//   const getVal = selectedValue => {
//     const val = TABLE_DATA.find(
//       item => String(item.age) === String(selectedValue)
//     );
//     return val;
//   };
//   return (
//     <div>
//       <select onChange={handleChange} defaultValue={''}>
//         <option disabled>Select Option</option>
//         {TABLE_DATA.map((item, index) => (
//           <option key={index} value={item.age}>
//             {item.name}
//           </option>
//         ))}
//       </select>

//       {getVal(selectedValue)?.name}
//     </div>
//   );
// };

// function findSum(n) {
//   if (n === 1) {
//     return n;
//   }
//   return n * findSum(n - 1);
// }
// console.log(findSum(5));

const Developer = () => {
  return <div style={{ ...globalStyles }}>Developer</div>;
};

export default Developer;
