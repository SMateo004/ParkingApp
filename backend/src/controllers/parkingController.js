import { getParkings } from "../services/parkingService.js";

export const fetchParkings = async (req, res) => {
  try {
    const { city, zone } = req.query;
    const parkings = await getParkings(city, zone);
    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};