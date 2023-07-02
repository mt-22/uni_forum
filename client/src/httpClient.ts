import axios from "axios"

export default axios.create({
    withCredentials: true
})

export const hostURL = "//localhost:5000/"