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

// const useDebounce = (delay = 200, searchedString: string) => {
//   const [searchedValue, setSearchedValue] = useState<string>();

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

const Developer = () => {
  return <div style={{ ...globalStyles }}>Developer</div>;
};

export default Developer;
