export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    createdAt: string;
}

export interface UserResponseDto {
    id: string;  
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    createdAt: string;  
}

export interface CreateUserRequestDto {
    name: string;       
    email: string;        
    role: 'student' | 'teacher' | 'admin';
}

export interface UpdateUserRequestDto {
    name?: string;     
    email?: string;
    role?: 'student' | 'teacher' | 'admin';
}