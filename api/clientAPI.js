import axios from "axios";
const BASEURL = "http://0.0.0.0:1338/api";

const axiosClient = axios.create({
	baseURL: BASEURL,
	headers: {
        Authorization: "Bearer e28a9b192a75797d6cda00b1545aae3586c05ac2695326910876b24d1c8c8a74a398fe3cea7d6c3181d6d961091fa8b7f3a4c614a6d0236f19dc41e091166c7d4258e062f4c35d2b7871b7d719efca91819fd04eb172c4f88cdf2b1151b1b85561581651a7ec9cc86076fe959230983ce9c1933e1a37e4f1a18a50fed165dd96"
    }
});

export default axiosClient;