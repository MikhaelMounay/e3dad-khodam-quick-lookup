import { Timestamp } from "firebase/firestore";

interface UserData {
    NameAr: string;
    NameEn: string;
    Gender: boolean;
    Phone: string;
    Age: number;
    Alert: string;
    PenanceFather: string;
    RecommendationLetter: string;
    NationalId: string;
    GroupName: string;
    ServantName: string;
    Address: string;
    Region: string;
    BirthDate: Timestamp;
    Attendance: Record<string, boolean | null>;
    AttendanceRate: string;
    Quizzes: Record<string, number>;
    Grades: Record<string, string>;
}

export type { UserData };
