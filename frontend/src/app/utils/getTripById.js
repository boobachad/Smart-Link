import { fetchTrip } from '@/utils/api';
import axios from 'axios';

export const getTripData = async(id="68c2ed928c91b9b2ce471c04") => {
    const res = await fetchTrip(id);
    const data = res.data;
    return data;
}