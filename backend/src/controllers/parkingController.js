import { getParkings } from "../services/parkingService.js";

export const fetchParkings = async (req, res) => {
  try {
    const { city, zone } = req.query;
    const userId = req.user.id;
    const parkings = await getParkings(city, zone, userId);
    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};