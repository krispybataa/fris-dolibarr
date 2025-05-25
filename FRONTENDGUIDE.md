# FRIS Frontend Guide

This guide provides a comprehensive overview of the FRIS (Faculty Research Information System) frontend architecture, component structure, and styling guidelines to help collaborators safely modify the UI without breaking existing functionality.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Theme and Styling](#theme-and-styling)
4. [Component Architecture](#component-architecture)
5. [Layout Components](#layout-components)
6. [Common Components](#common-components)
7. [Pages](#pages)
8. [Safe Modification Guidelines](#safe-modification-guidelines)
9. [Best Practices](#best-practices)

## Project Overview

The FRIS frontend is built with React-Vite and Material UI. It provides an interface for faculty members to manage their research profiles, publications, teaching activities, and extension services. The application includes role-based access control with different views for faculty members, department heads, deans, and administrators.

**Key Technologies:**
- React with TypeScript
- Material UI for components
- React Router for navigation
- Formik and Yup for form validation
- Axios for API requests

## Directory Structure

```
frontend/
├── public/           # Static assets and index.html
└── src/              # Source code
    ├── assets/       # Images, icons, and other assets
    ├── components/   # Reusable UI components
    │   ├── auth/     # Authentication-related components
    │   ├── common/   # Shared UI components
    │   ├── dashboard/# Dashboard-specific components
    │   ├── extension/# Extension service components
    │   ├── layout/   # Layout components (Header, SideMenu)
    │   ├── profile/  # User profile components
    │   ├── records/  # Record management components
    │   ├── research/ # Research activity components
    │   └── teaching/ # Teaching activity components
    ├── contexts/     # React contexts (Auth, etc.)
    ├── pages/        # Page components
    ├── services/     # API services and utilities
    ├── theme/        # Theme configuration
    └── utils/        # Utility functions
```

## Theme and Styling

The application uses a consistent theme defined in `src/theme/index.ts`. The theme includes:

### Color Palette

The FRIS color palette consists of:

```typescript
// Primary FRIS colors
deepBlue: '#263c5a',
skyBlue: '#60bbc1',
white: '#ffffff',

// Additional colors in the blue palette
lightBlue: '#a8d5e2',
paleBlue: '#e0f4f5',
darkBlue: '#1a2a40',
navyBlue: '#0f1c2d',

// Neutral colors
gray: '#6c757d',
lightGray: '#f5f5f5',
mediumGray: '#adb5bd',
darkGray: '#343a40',

// Functional colors
success: '#4caf50',
error: '#f44336',
warning: '#ff9800',
info: '#2196f3',
```

Additionally, there are FRIS branding colors used in various components:
```typescript
burgundy: '#8b1f41',
green: '#006747',
gold: '#f2c75c'
```

### Typography

The application uses the Roboto font family with a consistent typography scale:

```typescript
fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
h1: { fontWeight: 600, fontSize: '2.5rem' },
h2: { fontWeight: 600, fontSize: '2rem' },
h3: { fontWeight: 600, fontSize: '1.75rem' },
h4: { fontWeight: 600, fontSize: '1.5rem' },
h5: { fontWeight: 600, fontSize: '1.25rem' },
h6: { fontWeight: 600, fontSize: '1rem' },
```

### Component Styling

Material UI components are customized in the theme with consistent styling:

- Buttons have 8px border radius and no text transform
- Cards have 12px border radius and subtle shadows
- Form fields have 8px border radius
- Consistent spacing using the MUI spacing system

## Component Architecture

### Layout Components

Located in `src/components/layout/`, these components define the overall structure of the application:

1. **Layout.tsx**: The main layout wrapper that includes the Header and content container
2. **Header.tsx**: The top navigation bar with the FRIS logo and menu toggle
3. **SideMenu.tsx**: The navigation drawer with links to different sections

### Common Components

Located in `src/components/common/`, these are reusable UI elements:

1. **CardWithIcon.tsx**: Card component with an icon
2. **DataTable.tsx**: Reusable table component for displaying data
3. **GridWrapper.tsx**: Grid layout wrapper
4. **PageHeader.tsx**: Consistent page header with title and optional back button
5. **ResponsiveContainer.tsx**: Container with responsive behavior

## Layout Components

### Layout Component

The `Layout` component is the main wrapper for all pages. It includes the Header and a container for the page content:

```typescript
const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};
```

### Header Component

The `Header` component displays the application logo and includes the menu toggle button:

```typescript
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: FRIS_COLORS.burgundy }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              <span style={{ color: '#fff' }}>FR</span>
              <span style={{ color: FRIS_COLORS.gold }}>iS</span>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <SideMenu open={menuOpen} onClose={toggleMenu} />
    </>
  );
};
```

### SideMenu Component

The `SideMenu` component is a drawer that provides navigation links based on the user's role:

```typescript
const SideMenu = ({ open, onClose }: SideMenuProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Navigation items based on user role
  // ...
};
```

## Pages

The application includes various pages for different features:

1. **HomePage.tsx**: The landing page with navigation cards
2. **LoginPage.tsx**: User authentication
3. **ProfilePage.tsx**: User profile management
4. **RecordsPage.tsx**: Overview of user records
5. **ResearchActivitiesPage.tsx**: Research publications management
6. **TeachingActivitiesPage.tsx**: Teaching activities management
7. **ExtensionActivitiesPage.tsx**: Extension services management
8. **PublicationApprovalPage.tsx**: Approval workflow for publications
9. **UsersPage.tsx**: User management (admin only)

## Safe Modification Guidelines

When modifying the frontend, follow these guidelines to avoid breaking existing functionality:

### DO:
1. **Use the existing theme**: Always reference the theme colors and typography from `src/theme/index.ts`
2. **Extend existing components**: Build upon the common components rather than creating new ones
3. **Maintain responsive design**: Ensure all UI changes work on different screen sizes
4. **Follow the component hierarchy**: Respect the existing component structure
5. **Use Material UI components**: Leverage the existing Material UI components and styling system

### DON'T:
1. **Change component props**: Don't modify the props interface of existing components
2. **Remove existing functionality**: Don't remove features or navigation items
3. **Modify authentication logic**: Don't change the authentication flow
4. **Hard-code styles**: Don't use inline styles that override the theme
5. **Change routing structure**: Don't modify the existing routes without updating all references

## Best Practices

### Styling Components

1. **Use the sx prop**: Leverage Material UI's `sx` prop for styling components:
   ```tsx
   <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 1 }}>
     Content
   </Box>
   ```

2. **Use theme colors**: Reference colors from the theme:
   ```tsx
   <Button sx={{ bgcolor: FRIS_COLORS.burgundy }}>Submit</Button>
   ```

3. **Responsive design**: Use the breakpoints system:
   ```tsx
   <Box sx={{ 
     width: { xs: '100%', md: '50%' },
     p: { xs: 2, md: 4 }
   }}>
     Content
   </Box>
   ```

### Adding New Components

1. **Create in the appropriate directory**: Place components in the correct subdirectory
2. **Follow naming conventions**: Use PascalCase for component names
3. **Use TypeScript interfaces**: Define props with TypeScript interfaces
4. **Document your components**: Add comments explaining the purpose and usage

### Modifying Existing Components

1. **Preserve existing props**: Don't remove or change the type of existing props
2. **Maintain backward compatibility**: Ensure existing usages still work
3. **Test thoroughly**: Verify the component works in all contexts where it's used

### Performance Considerations

1. **Memoize components**: Use React.memo for pure components
2. **Optimize renders**: Use useMemo and useCallback hooks
3. **Lazy load components**: Use React.lazy for code splitting

By following these guidelines, you can safely enhance the UI without disrupting the existing functionality.
