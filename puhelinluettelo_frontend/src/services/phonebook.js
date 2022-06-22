
import axios from 'axios'


const domain = 'api/persons';

const getAll = () => {
    return axios.get(domain).then(r => r.data);
}

const addNumber = num => {
    return axios.post(domain, num).then(r => r.data);
}

const delNumber = id => {
    return axios.delete(`${domain}/${id}`).then(r => r.data);
}

const updNumber = (id, person) => {
    return axios.put(`${domain}/${id}`, person).then(r => r.data);
}

const numService = { getAll, addNumber, delNumber, updNumber};


export default numService;

