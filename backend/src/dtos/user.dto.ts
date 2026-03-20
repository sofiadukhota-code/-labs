export interface User {
    id: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    createdAt: string;
}

export interface UserResponseDto {
    id: string;  
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    createdAt: string;  
}

export interface CreateUserRequestDto {
    username: string;       
    email: string;        
    role: 'student' | 'teacher' | 'admin';
}

export interface UpdateUserRequestDto {
    username?: string;     
    email?: string;
    role?: 'student' | 'teacher' | 'admin';
}