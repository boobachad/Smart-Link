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