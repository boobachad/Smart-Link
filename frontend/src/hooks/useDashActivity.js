import { useEffect, useState } from "react";
import { dashboardStats } from "@/utils/api";

export const useDashActivity = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async() => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardStats();
            console.log("stats", res);
            setData(res);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() =>{
        fetchStats();
    },[])

    return { data, loading, error }
}

