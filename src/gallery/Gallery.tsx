import './style.css';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';

export type StudentItemType = {
  _id: string;
  photoUrl: string;
};

export default function App() {
  const galleryRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [number, setNumber] = useState(11);
  const [refresh, setRefresh] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [columnData, setColumnData] = useState({ firstRow: 0, twoRows: 0 });

  const handleResize = () => {
    const galleryElm = galleryRef.current;
    if (galleryElm) {
      const gridComputedStyle = window.getComputedStyle(galleryElm);
      const gridColumnCount = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
      const firstRow = (gridColumnCount - (gridColumnCount % 2)) / 2;
      const twoRows = gridColumnCount % 2 === 1 ? firstRow * 2 : firstRow * 2 - 1;
      setColumnData({
        firstRow: firstRow,
        twoRows: twoRows,
      });
    }
  };

  const isMovedLeft = (order: number) => {
    const { firstRow, twoRows } = columnData;
    return (order - firstRow) % twoRows === 1;
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  useEffect(() => {
    setStatus('loading');
    fetch(`https://api-blue-archive.vercel.app/api/character/random?count=${number}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.data?.length > 0) {
          setStudentList(data.data);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch((e) => {
        console.log(e);
        setStatus('error');
      });
  }, [refresh]);

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [status]);

  return (
    <div className="App">
      <div className="input-container">
        <label>Number of students</label>
        <input type="number" value={number} onChange={(e) => setNumber(+(e.target.value || 0))} />
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {status === 'success' ? (
        <>
          <div className={`gallery gallery--${status}`} ref={galleryRef}>
            {studentList.map((item: StudentItemType, index) => (
              <div key={item._id} className={`item ${isMovedLeft(index + 1) ? 'moved-left' : ''}`}>
                <img src={item.photoUrl} />
              </div>
            ))}
          </div>
          <div className={`gallery gallery--${status} gallery--honeycomb`} ref={galleryRef}>
            {studentList.map((item: StudentItemType, index) => (
              <div key={item._id} className={`item ${isMovedLeft(index + 1) ? 'moved-left' : ''}`}>
                <img src={item.photoUrl} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="loading">{status}</div>
      )}
    </div>
  );
}
