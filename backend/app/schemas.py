from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# Base schemas for request/response
class UserBase(BaseModel):
    userName: str
    userEmail: EmailStr
    rank: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    role: str = "faculty"
    researchExpDetails: Optional[str] = None
    isDepartmentHead: bool = False
    isDean: bool = False
    googleScholarLink: Optional[str] = None


class UserCreate(UserBase):
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "userName": "John Doe",
                "userEmail": "john.doe@example.com",
                "password": "securepassword",
                "rank": "Associate Professor",
                "college": "College of Engineering",
                "department": "Computer Science",
                "role": "faculty"
            }
        }


class UserUpdate(BaseModel):
    userName: Optional[str] = None
    rank: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    researchExpDetails: Optional[str] = None
    isDepartmentHead: Optional[bool] = None
    isDean: Optional[bool] = None
    googleScholarLink: Optional[str] = None


class UserInDB(UserBase):
    userId: int
    dolibarr_third_party_id: Optional[int] = None
    
    class Config:
        orm_mode = True


class UserResponse(UserInDB):
    pass


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    userEmail: Optional[str] = None
    role: Optional[str] = None


# Degree schemas
class DegreeBase(BaseModel):
    school: str
    year: int
    degreeType: str


class DegreeCreate(DegreeBase):
    pass


class DegreeUpdate(BaseModel):
    school: Optional[str] = None
    year: Optional[int] = None
    degreeType: Optional[str] = None


class DegreeInDB(DegreeBase):
    degreeId: int
    userId: int
    
    class Config:
        orm_mode = True


# Research Interest schemas
class ResearchInterestBase(BaseModel):
    resInt: str


class ResearchInterestCreate(ResearchInterestBase):
    pass


class ResearchInterestUpdate(BaseModel):
    resInt: Optional[str] = None


class ResearchInterestInDB(ResearchInterestBase):
    rllId: int
    userId: int
    
    class Config:
        orm_mode = True


# Affiliations schemas
class AffiliationsBase(BaseModel):
    affInt: str


class AffiliationsCreate(AffiliationsBase):
    pass


class AffiliationsUpdate(BaseModel):
    affInt: Optional[str] = None


class AffiliationsInDB(AffiliationsBase):
    affId: int
    userId: int
    
    class Config:
        orm_mode = True


# Research Experience schemas
class ResearchExperienceBase(BaseModel):
    resExpLoc: str
    startDate: date
    endDate: Optional[date] = None


class ResearchExperienceCreate(ResearchExperienceBase):
    pass


class ResearchExperienceUpdate(BaseModel):
    resExpLoc: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None


class ResearchExperienceInDB(ResearchExperienceBase):
    rElId: int
    userId: int
    
    class Config:
        orm_mode = True


# SDG Subset schemas
class SDGSubsetBase(BaseModel):
    sdgSNum: int
    sdgSDesc: str


class SDGSubsetCreate(SDGSubsetBase):
    pass


class SDGSubsetInDB(SDGSubsetBase):
    sdgSId: int
    sdgId: int
    
    class Config:
        orm_mode = True


# SDG schemas
class SDGBase(BaseModel):
    sdgNum: int
    sdgDesc: str


class SDGCreate(SDGBase):
    subsets: Optional[List[SDGSubsetCreate]] = None


class SDGInDB(SDGBase):
    sdgId: int
    raId: int
    subsets: Optional[List[SDGSubsetInDB]] = None
    
    class Config:
        orm_mode = True


# Research Activities schemas
class ResearchActivitiesBase(BaseModel):
    title: str
    institute: str
    authors: str
    datePublished: date
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    journal: Optional[str] = None
    citedAs: Optional[str] = None
    doi: Optional[str] = None
    publicationType: str


class ResearchActivitiesCreate(ResearchActivitiesBase):
    supportingDocument: Optional[str] = None
    sdgs: Optional[List[SDGCreate]] = None


class ResearchActivitiesUpdate(BaseModel):
    title: Optional[str] = None
    institute: Optional[str] = None
    authors: Optional[str] = None
    datePublished: Optional[date] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    journal: Optional[str] = None
    citedAs: Optional[str] = None
    doi: Optional[str] = None
    publicationType: Optional[str] = None
    supportingDocument: Optional[str] = None


class ResearchActivitiesInDB(ResearchActivitiesBase):
    raId: int
    userId: int
    supportingDocument: Optional[str] = None
    status: str
    currentApprover: Optional[int] = None
    approvalPath: Optional[str] = None
    approverStatus: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sdgs: Optional[List[SDGInDB]] = None
    
    class Config:
        orm_mode = True


# Course and SET schemas
class CourseAndSETBase(BaseModel):
    academicYear: str
    term: str
    courseNum: str
    section: str
    courseDesc: str
    courseType: str
    percentContri: float
    loadCreditUnits: float
    noOfRespondents: int
    partOneStudent: Optional[float] = None
    partTwoCourse: Optional[float] = None
    partThreeTeaching: Optional[float] = None
    teachingPoints: Optional[float] = None


class CourseAndSETCreate(CourseAndSETBase):
    supportingDocuments: Optional[str] = None


class CourseAndSETUpdate(BaseModel):
    academicYear: Optional[str] = None
    term: Optional[str] = None
    courseNum: Optional[str] = None
    section: Optional[str] = None
    courseDesc: Optional[str] = None
    courseType: Optional[str] = None
    percentContri: Optional[float] = None
    loadCreditUnits: Optional[float] = None
    noOfRespondents: Optional[int] = None
    partOneStudent: Optional[float] = None
    partTwoCourse: Optional[float] = None
    partThreeTeaching: Optional[float] = None
    teachingPoints: Optional[float] = None
    supportingDocuments: Optional[str] = None


class CourseAndSETInDB(CourseAndSETBase):
    caSId: int
    userId: int
    supportingDocuments: Optional[str] = None
    status: str
    currentApprover: Optional[int] = None
    approvalPath: Optional[str] = None
    approverStatus: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Extension schemas
class ExtensionBase(BaseModel):
    position: str
    office: str
    startDate: date
    endDate: Optional[date] = None
    number: Optional[str] = None
    extOfService: str


class ExtensionCreate(ExtensionBase):
    supportingDocument: Optional[str] = None


class ExtensionUpdate(BaseModel):
    position: Optional[str] = None
    office: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    number: Optional[str] = None
    extOfService: Optional[str] = None
    supportingDocument: Optional[str] = None


class ExtensionInDB(ExtensionBase):
    extensionId: int
    userId: int
    supportingDocument: Optional[str] = None
    status: str
    currentApprover: Optional[int] = None
    approvalPath: Optional[str] = None
    approverStatus: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Authorship schemas
class AuthorshipBase(BaseModel):
    title: str
    authors: str
    date: date
    upCourse: Optional[str] = None
    recommendingUnit: str
    publisher: str
    authorshipType: str
    numberOfAuthors: int


class AuthorshipCreate(AuthorshipBase):
    supportingDocument: Optional[str] = None


class AuthorshipUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    date: Optional[date] = None
    upCourse: Optional[str] = None
    recommendingUnit: Optional[str] = None
    publisher: Optional[str] = None
    authorshipType: Optional[str] = None
    numberOfAuthors: Optional[int] = None
    supportingDocument: Optional[str] = None


class AuthorshipInDB(AuthorshipBase):
    authorId: int
    userId: int
    supportingDocument: Optional[str] = None
    status: str
    currentApprover: Optional[int] = None
    approvalPath: Optional[str] = None
    approverStatus: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Approval Path schemas
class ApprovalPathBase(BaseModel):
    department: str
    college: str
    approver_email: str
    approval_number: int
    isDeptHead: bool = False
    isDean: bool = False


class ApprovalPathCreate(ApprovalPathBase):
    pass


class ApprovalPathUpdate(BaseModel):
    approver_email: Optional[str] = None
    approval_number: Optional[int] = None
    isDeptHead: Optional[bool] = None
    isDean: Optional[bool] = None


class ApprovalPathInDB(ApprovalPathBase):
    approvalPathId: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Profile schemas for combined user data
class ProfileResponse(BaseModel):
    user: UserResponse
    degrees: List[DegreeInDB] = []
    research_interests: List[ResearchInterestInDB] = []
    affiliations: List[AffiliationsInDB] = []
    research_experiences: List[ResearchExperienceInDB] = []
    
    class Config:
        orm_mode = True


# Approval status update schema
class ApprovalStatusUpdate(BaseModel):
    status: str = Field(..., description="Status can be 'approved', 'rejected', or 'pending'")
    comments: Optional[str] = None


# Record summary schema
class RecordCountInfo(BaseModel):
    count: int
    pending: int


class RecordSummaryResponse(BaseModel):
    publications: RecordCountInfo
    teaching: RecordCountInfo
    extensions: RecordCountInfo
    authorships: RecordCountInfo
    pendingApprovals: int
