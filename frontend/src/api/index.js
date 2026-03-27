import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export default api;

// Auth API
export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

// Posts API
export const fetchPosts = async () => {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
};

export const createPost = async (postData) => {
    const response = await axios.post(`${API_URL}/posts`, postData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchPostById = async (postId) => {
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    return response.data;
};

// Comments API
export const fetchComments = async (postId) => {
    const response = await axios.get(`${API_URL}/comments/${postId}`);
    return response.data;
};

export const addComment = async (postId, commentData) => {
    const response = await axios.post(`${API_URL}/comments/${postId}`, commentData);
    return response.data;
};

// Likes API
export const likePost = async (postId) => {
    const response = await axios.post(`${API_URL}/likes/${postId}`);
    return response.data;
};

export const unlikePost = async (postId) => {
    const response = await axios.delete(`${API_URL}/likes/${postId}`);
    return response.data;
};