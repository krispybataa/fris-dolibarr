from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Date, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    userId = Column(Integer, primary_key=True, index=True)
    userName = Column(String, index=True)
    userEmail = Column(String, unique=True, index=True)
    password = Column(String)  # Hashed password
    rank = Column(String)
    college = Column(String)
    department = Column(String)
    role = Column(String)  # 'faculty', 'admin', etc.
    researchExpDetails = Column(Text)
    isDepartmentHead = Column(Boolean, default=False)
    isDean = Column(Boolean, default=False)
    googleScholarLink = Column(String)
    dolibarr_third_party_id = Column(Integer, nullable=True)  # Link to Dolibarr
    
    # Relationships
    degrees = relationship("Degree", back_populates="user")
    research_interests = relationship("ResearchInterest", back_populates="user")
    affiliations = relationship("Affiliations", back_populates="user")
    research_experiences = relationship("ResearchExperience", back_populates="user")
    research_activities = relationship("ResearchActivities", back_populates="user")
    courses = relationship("CourseAndSET", back_populates="user")
    extensions = relationship("Extension", back_populates="user")
    authorships = relationship("Authorship", back_populates="user")


class Degree(Base):
    __tablename__ = "degrees"
    
    degreeId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    school = Column(String)
    year = Column(Integer)
    degreeType = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="degrees")


class ResearchInterest(Base):
    __tablename__ = "research_interests"
    
    rllId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    resInt = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="research_interests")


class Affiliations(Base):
    __tablename__ = "affiliations"
    
    affId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    affInt = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="affiliations")


class ResearchExperience(Base):
    __tablename__ = "research_experiences"
    
    rElId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    resExpLoc = Column(String)
    startDate = Column(Date)
    endDate = Column(Date, nullable=True)  # Nullable for ongoing experiences
    
    # Relationships
    user = relationship("User", back_populates="research_experiences")


class ResearchActivities(Base):
    __tablename__ = "research_activities"
    
    raId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    title = Column(String)
    institute = Column(String)
    authors = Column(Text)
    datePublished = Column(Date)
    startDate = Column(Date, nullable=True)
    endDate = Column(Date, nullable=True)
    journal = Column(String, nullable=True)
    citedAs = Column(Text, nullable=True)
    doi = Column(String, nullable=True)
    publicationType = Column(String)
    supportingDocument = Column(String, nullable=True)  # Path to document
    status = Column(String, default="pending")
    currentApprover = Column(Integer, nullable=True)  # User ID of current approver
    approvalPath = Column(String, nullable=True)  # JSON string of approval path
    approverStatus = Column(String, nullable=True)  # JSON string of approver statuses
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="research_activities")
    sdgs = relationship("SDG", back_populates="research_activity")


class CourseAndSET(Base):
    __tablename__ = "courses_and_set"
    
    caSId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    academicYear = Column(String)
    term = Column(String)
    courseNum = Column(String)
    section = Column(String)
    courseDesc = Column(Text)
    courseType = Column(String)
    percentContri = Column(Float)
    loadCreditUnits = Column(Float)
    noOfRespondents = Column(Integer)
    partOneStudent = Column(Float, nullable=True)
    partTwoCourse = Column(Float, nullable=True)
    partThreeTeaching = Column(Float, nullable=True)
    teachingPoints = Column(Float, nullable=True)
    supportingDocuments = Column(String, nullable=True)  # Path to document
    status = Column(String, default="pending")
    currentApprover = Column(Integer, nullable=True)
    approvalPath = Column(String, nullable=True)
    approverStatus = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="courses")


class Extension(Base):
    __tablename__ = "extensions"
    
    extensionId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    position = Column(String)
    office = Column(String)
    startDate = Column(Date)
    endDate = Column(Date, nullable=True)
    number = Column(String, nullable=True)
    extOfService = Column(Text)
    supportingDocument = Column(String, nullable=True)  # Path to document
    status = Column(String, default="pending")
    currentApprover = Column(Integer, nullable=True)
    approvalPath = Column(String, nullable=True)
    approverStatus = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="extensions")


class Authorship(Base):
    __tablename__ = "authorships"
    
    authorId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"))
    title = Column(String)
    authors = Column(Text)
    date = Column(Date)
    upCourse = Column(String, nullable=True)
    recommendingUnit = Column(String)
    publisher = Column(String)
    authorshipType = Column(String)
    numberOfAuthors = Column(Integer)
    supportingDocument = Column(String, nullable=True)  # Path to document
    status = Column(String, default="pending")
    currentApprover = Column(Integer, nullable=True)
    approvalPath = Column(String, nullable=True)
    approverStatus = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="authorships")


class SDG(Base):
    __tablename__ = "sdgs"
    
    sdgId = Column(Integer, primary_key=True, index=True)
    raId = Column(Integer, ForeignKey("research_activities.raId"))
    sdgNum = Column(Integer)
    sdgDesc = Column(Text)
    
    # Relationships
    research_activity = relationship("ResearchActivities", back_populates="sdgs")
    subsets = relationship("SDGSubset", back_populates="sdg")


class SDGSubset(Base):
    __tablename__ = "sdg_subsets"
    
    sdgSId = Column(Integer, primary_key=True, index=True)
    sdgId = Column(Integer, ForeignKey("sdgs.sdgId"))
    sdgSNum = Column(Integer)
    sdgSDesc = Column(Text)
    
    # Relationships
    sdg = relationship("SDG", back_populates="subsets")


class ApprovalPath(Base):
    __tablename__ = "approval_paths"
    
    approvalPathId = Column(Integer, primary_key=True, index=True)
    department = Column(String)
    college = Column(String)
    approver_email = Column(String)
    approval_number = Column(Integer)  # Order in approval chain
    isDeptHead = Column(Boolean, default=False)
    isDean = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
