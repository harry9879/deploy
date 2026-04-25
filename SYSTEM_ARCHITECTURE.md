# System Architecture - File Sharing Application

## Complete System Architecture Diagram

graph LR
    %% -------------------------------------
    %% --- 1. Style Definitions
    %% -------------------------------------
    classDef client fill:#e1f5fe,stroke:#4fc3f7,stroke-width:2px;
    classDef api fill:#e8f5e9,stroke:#66bb6a,stroke-width:2px;
    classDef logic fill:#f3e5f5,stroke:#ab47bc,stroke-width:2px;
    classDef data fill:#fffde7,stroke:#ffee58,stroke-width:2px;
    classDef storage fill:#fbe9e7,stroke:#ff7043,stroke-width:2px;
    classDef external fill:#fce4ec,stroke:#ec407a,stroke-width:2px;
    classDef security fill:#fff3e0,stroke:#ffa726,stroke-width:2px;
    classDef utils fill:#e8eaf6,stroke:#5c6bc0,stroke-width:2px;
    classDef cron fill:#ede7f6,stroke:#7e57c2,stroke-width:2px;

    %% -------------------------------------
    %% --- 2. Subgraphs (Layers)
    %% -------------------------------------

    subgraph "Client Layer - React + TypeScript"
        direction LR
        A[User Browser] --> B[React App]
        B --> C[Auth Context]
        B --> D[Pages]
        D --> D1[Landing]
        D --> D2[Login/Register]
        D --> D3[Upload]
        D --> D4[Dashboard]
        D --> D5[Download]
        D --> D6[Email Verification]
        B --> E[Services]
        E --> E1[Auth Service]
        E --> E2[File Service]
        E --> E3[API Client]
    end
    class A,B,C,D,D1,D2,D3,D4,D5,D6,E,E1,E2,E3 client;

    subgraph "API Layer - Express.js"
        direction LR
        F[Express Server]
        F --> G[Middleware]
        G --> G1[CORS]
        G --> G2[Helmet Security]
        G --> G3[JWT Auth]
        G --> G4[Multer Upload]
        G --> G5[Storage Check]
        
        F --> H[Routes]
        H --> H1["/api/auth"]
        H --> H2["/api/files"]
        H --> H3["/api/dashboard"]
        H --> H4["/api/admin"]
        
        H1 --> I[Auth Controller]
        H2 --> J[File Controller]
        H3 --> K[Dashboard Controller]
        H4 --> L[Admin Controller]
    end
    class F,G,G1,G2,G3,G4,G5,H,H1,H2,H3,H4,I,J,K,L api;

    subgraph "Business Logic"
        direction LR
        I --> M[User Management]
        M --> M1[Register]
        M --> M2[Login]
        M --> M3[Email Verification]
        M --> M4[Token Generation]
        
        J --> N[File Management]
        N --> N1[Upload Files]
        N --> N2[Download Files]
        N --> N3[Stream Files]
        N --> N4[PIN Protection]
        N --> N5[Zip Multiple Files]
        
        K --> O[Analytics]
        O --> O1[User Stats]
        O --> O2[File Metrics]
        O --> O3[Download Logs]
        
        L --> P[Admin Functions]
        P --> P1[User Management]
        P --> P2[Global Stats]
        P --> P3[System Monitor]
    end
    class M,M1,M2,M3,M4,N,N1,N2,N3,N4,N5,O,O1,O2,O3,P,P1,P2,P3 logic;

    subgraph "Data Layer - MongoDB"
        direction TB
        Q[(MongoDB Atlas)]
        Q --> R[Collections]
        R --> R1[Users]
        R --> R2[Files]
        R --> R3[Download Logs]
        
        subgraph "Schemas"
            R1 --> S1[Schema: User]
            S1 --> S1A[Authentication]
            S1 --> S1B[Storage Quota]
            S1 --> S1C[Email Verification]
            
            R2 --> S2[Schema: File]
            S2 --> S2A[Metadata]
            S2 --> S2B[Expiry Tracking]
            S2 --> S2C[Download Limits]
            S2 --> S2D[PIN Protection]
            
            R3 --> S3[Schema: Download Log]
            S3 --> S3A[Analytics]
            S3 --> S3B[IP Tracking]
            S3 --> S3C[User Agent]
        end
    end
    class Q,R,R1,R2,R3,S1,S1A,S1B,S1C,S2,S2A,S2B,S2C,S2D,S3,S3A,S3B,S3C data;

    subgraph "Storage Layer"
        direction TB
        T[File System]
        T --> U[User Directories]
        U --> V["/uploads/userId/fileUuid"]
        V --> V1[Original Files]
        V --> V2[Zipped Archives]
    end
    class T,U,V,V1,V2 storage;

    subgraph "External Services"
        direction TB
        W[Email Service]
        W --> W1[Verification Emails]
        W --> W2[File Share Notifications]
        W --> W3[Admin Alerts]
        
        X[Cron Jobs]
        X --> X1[File Cleanup - Daily 2 AM]
        X --> X2[Storage Monitoring]
        X --> X3[Expired File Deletion]
    end
    class W,W1,W2,W3 external;
    class X,X1,X2,X3 cron;

    subgraph "Security & Utilities"
        direction LR
        subgraph "Security"
            Y[Security]
            Y --> Y1[JWT Authentication]
            Y --> Y2[Password Hashing - bcrypt]
            Y --> Y3[PIN Hashing]
            Y --> Y4[Rate Limiting]
            Y --> Y5[CORS Protection]
        end
        
        subgraph "Utilities"
            Z[Utilities]
            Z --> Z1[File Helpers]
            Z --> Z2[Email Helpers]
            Z --> Z3[Validation]
            Z --> Z4[Error Handling]
        end
    end
    class Y,Y1,Y2,Y3,Y4,Y5 security;
    class Z,Z1,Z2,Z3,Z4 utils;
    
    %% -------------------------------------
    %% --- 3. Connections Between Layers
    %% -------------------------------------
    
    %% Client -> API
    E3[API Client] --> F[Express Server]

    %% Business Logic -> Data & Storage
    M[User Management] --> R1[Users]
    N[File Management] --> R2[Files]
    N[File Management] --> R3[Download Logs]
    N[File Management] --> T[File System]
    O[Analytics] --> R2[Files]
    O[Analytics] --> R3[Download Logs]
    P[Admin Functions] --> R1[Users]
    P[Admin Functions] --> R2[Files]
    
    %% Business Logic -> External Services
    M[User Management] --> W[Email Service]
    N[File Management] --> W[Email Service]
    P[Admin Functions] --> W[Email Service]
    
    %% Cron Jobs -> Data & Storage
    X[Cron Jobs] --> N[File Management]
    X[Cron Jobs] --> R1[Users]
    X[Cron Jobs] --> R2[Files]
    X[Cron Jobs] --> T[File System]
    
    %% Connections to Security
    G3[JWT Auth] --> Y1[JWT Authentication]
    M[User Management] --> Y2[Password Hashing - bcrypt]
    N4[PIN Protection] --> Y3[PIN Hashing]
    G[Middleware] --> Y4[Rate Limiting]
    G1[CORS] --> Y5[CORS Protection]
    
    %% Connections to Utilities
    N[File Management] --> Z1[File Helpers]
    M[User Management] --> Z2[Email Helpers]
    I[Auth Controller] --> Z3[Validation]
    J[File Controller] --> Z3[Validation]
    F[Express Server] --> Z4[Error Handling]

    %% -------------------------------------
    %% --- 4. Link Styling
    %% -------------------------------------
    linkStyle default stroke:#616161,stroke-width:1.5px,fill:none;

---

## System Highlights

### ✅ Core Features
- **Multi-file Upload**: Upload up to 10 files (200MB each) simultaneously
- **Auto-ZIP**: Automatic ZIP creation for multiple files
- **Expiry Control**: Set expiration time (5 min - 24 hours)
- **Download Limits**: Optional max download count
- **PIN Protection**: 4-digit PIN with rate limiting (9 attempts, 15min lockout)
- **Email Notifications**: Share files via email with custom messages
- **Storage Management**: Per-user (500MB) and global (10GB) quotas
- **Automated Cleanup**: Daily cron job removes expired files
- **Download Analytics**: Track downloads with IP, user-agent, and timestamps

### 🔒 Security Features
- JWT-based authentication
- bcrypt password hashing
- PIN protection with attempt limiting
- CORS and Helmet security
- Email verification required for uploads
- Admin role management

### 📊 Monitoring & Analytics
- Real-time storage tracking
- Download logs and statistics
- User dashboard with file management
- Admin dashboard with system metrics
- Storage warning system

---

**Generated**: November 1, 2025
**Version**: 1.0
**Project**: File Sharing Application
