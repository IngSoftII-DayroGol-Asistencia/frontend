// Input para crear una Enterprise
export interface CreateEnterpriseInput {
    name: string;
    description?: string;  
    logo?: string;         
    website?: string;      
}

export interface EnterpriseUserMinimal {
    id: string;       
    email: string;    
}

export interface UserEnterpriseItem {
    id: string;
    userId: string;
    enterpriseId: string;
    isOwner: boolean;
    joinedAt: string;              
    user: EnterpriseUserMinimal;   
}

export interface EnterpriseCreationResponse {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    isActive: boolean;
    createdAt: string;             
    updatedAt: string;             
    users: UserEnterpriseItem[]; 
}