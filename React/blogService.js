import axios from 'axios';
import { onGlobalError, onGlobalSuccess, API_HOST_PREFIX } from './serviceHelpers';

const endpoint = { blogUrls: `${API_HOST_PREFIX}/api/blogs` };

const post = (payload) => {
    const config = {
        method: 'POST',
        url: `${endpoint.blogUrls}`,
        data: payload,
        crossdomain: true,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    };
    return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const search = (pageIndex, pageSize, query) => {
    const config = {
        method: 'GET',
        url: `${endpoint.blogUrls}/search?pageIndex=${pageIndex}&pageSize=${pageSize}&query=${query}`,
        crossdomain: true,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    };
    return axios(config);
};

const get = (pageIndex, pageSize) => {
    const config = {
        method: 'GET',
        url: `${endpoint.blogUrls}/?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        crossdomain: true,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    };
    return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getBlogByCategory = (id, pageIndex, pageSize) => {
    const config = {
        method: 'GET',
        url: `${endpoint.blogUrls}/categories/${id}/?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        withCredentials: true,
        crossdomain: true,
        headers: { 'Content-Type': 'application/json' },
    };

    return axios(config);
};

const getBlogById = (id) => {
    const config = {
        method: 'GET',
        url: `${endpoint.blogUrls}/${id}`,
        withCredentials: true,
        crossdomain: true,
        headers: { 'Content-Type': 'application/json' },
    };

    return axios(config);
};

const deleteBlog = (id) => {
    const config = {
        method: 'DELETE',
        url: `${endpoint.blogUrls}/${id}`,
        crossdomain: true,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
    };

    return axios(config).then(() => {
        return id;
    });
};

const edit = (id, payload) => {
    const config = {
        method: 'PUT',
        url: `${endpoint.blogUrls}/${id}`,
        data: payload,
        withCredentials: true,
        crossdomain: true,
        headers: { 'Content-Type': 'application/json' },
    };

    return axios(config).then(() => {
        return { id, payload };
    });
};

const blogService = { post, search, get, getBlogByCategory, getBlogById, deleteBlog, edit };

export default blogService;
