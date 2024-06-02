import axios from "axios";
const BASEURL = "http://192.168.1.2:1338/api";

const axiosClient = axios.create({
	baseURL: BASEURL,
	headers: {
        Authorization: "Bearer 56fb467900871ac8cef9b5d568a24610e413797f6b1129d6c51c587b065ff916763eff359f80f9df651ea75accaec7359bb278d019d272af34b68a231bd63fdb4dc1f77050ca11e2a8cf70d036cbe59b6951b820f70599177af8e4f0ba8e18d0d7bf6eec8035a79ab6295d0e2d4cbd716b14df2b40e92f11b38502726880ca04"
    }
});

export default axiosClient;