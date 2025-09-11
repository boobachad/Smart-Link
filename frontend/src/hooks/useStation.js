import { useState, useEffect } from 'react';
import { getStation } from '@/utils/api';

export const useStation = (page=1) => {
    const [station, setStation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStation = async(currentPage = page) => {
        setLoading(true);
        try {
            const res = await getStation(page);
            console.log("Station hook",res.data);
            setStation(res.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStation();
    },[])

    return { station, loading, error}
}