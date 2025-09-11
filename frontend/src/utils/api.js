import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
export const getBuses = async (page = 1, pageSize = 10) => {
    const res = await axios.get(`${API_BASE_URL}/api/buses`, {
        params: { page, pageSize },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("userAuth")}`
        },
    });
    return res.data;
};

export const dashboardStats = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("userAuth")}`
        }
    });
    return res.data;
}

export const getBusDataById = async (id) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/buses/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userAuth")}`,
            },
        });
        return res.data;
    } catch (err) {
        console.error("API error:", err.response?.data || err.message);
        throw err;
    }
}

export const updateBusData = async (id, busData) => {
    console.log("API Update Payload:", id,busData);
    const res = await axios.patch(`http://localhost:5000/api/buses/${id}`, busData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("userAuth")}`,
        },
    })
    return res.data.bus;
}

export const getStation = async(page = 1, limit = 1000) => {
    const res = await axios.get(`${API_BASE_URL}/api/stations`, {
        params: { page, limit }
    });
    return res.data;
}