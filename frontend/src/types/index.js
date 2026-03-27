// This file defines TypeScript types or interfaces used throughout the frontend application.

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Post {
    id: number;
    title: string;
    description: string;
    author: User;
    date: string;
    images: Image[];
    likes: number;
    comments: Comment[];
}

export interface Image {
    id: number;
    postId: number;
    url: string;
}

export interface Comment {
    id: number;
    postId: number;
    author: User;
    content: string;
    date: string;
}