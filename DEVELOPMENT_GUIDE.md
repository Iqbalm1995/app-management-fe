# 🔧 Development Guide - Revo-Kobra App Management

> **Critical Development Patterns & Standards**  
> This document contains essential patterns that must be followed in every development session.

## 📋 Table of Contents

- [🎯 Critical Patterns](#-critical-patterns)
- [🏗️ Component Architecture](#️-component-architecture)
- [🎨 UI/UX Standards](#-uiux-standards)
- [📊 Data Management](#-data-management)
- [🔐 Authentication](#-authentication)
- [📡 API Integration](#-api-integration)
- [🐛 Error Handling](#-error-handling)
- [🚀 Performance](#-performance)

---

## 🎯 Critical Patterns

> **⚠️ MANDATORY**: These patterns must be used in every component

### **🔧 Standard Component Structure**

```typescript
"use client";

// 1. IMPORTS (Order matters)
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box, Card, CardBody, Button, VStack, HStack,
  Text, Heading, useColorMode
} from "@chakra-ui/react";

// 2. SERVICES & HELPERS
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";

// 3. CONSTANTS
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle
} from "@/app/constants/applicationConstants";

function ComponentName() {
  // 4. HOOKS (Order matters)
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();

  // 5. AUTH SETUP (MANDATORY - Copy exactly)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    
    if (token) setTokenData(token);
  }, [DataAuth]);

  // 6. DATA STATE
  const [Data, setData] = useState<DataType | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);

  // 7. DATA FETCHING
  useEffect(() => {
    if (DataAuth && DataAuth.team) {
      fetchData();
    }
  }, [DataAuth, RefreshData]);

  // 8. FUNCTIONS
  const fetchData = async () => {
    // Implementation
  };

  const refreshAction = () => setRefreshData(prev => prev + 1);

  // 9. RENDER
  return (
    <LayoutAdmin>
      {/* Component content */}
    </LayoutAdmin>
  );
}

export default ComponentName;
```

### **📊 Data Fetching Pattern (MANDATORY)**

```typescript
// ALWAYS use this exact pattern for API calls
const fetchData = async () => {
  try {
    setIsLoadingProcess(true);
    
    const requestData = await APICall(params, tokenData);
    
    // CRITICAL: Check response structure
    if (!requestData || requestData.statusCode !== RES_CODE_OK) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    }
    
    // Success handling
    const data = requestData.data as DataType;
    setData(data);
    
  } catch (error) {
    console.error("Error:", error);
    showToast({
      description: "An unexpected error occurred",
      statusToast: "error",
    });
  } finally {
    setIsLoadingProcess(false);
  }
};
```

---

## 🏗️ Component Architecture

### **🎯 Page Component Structure**

```typescript
// Main Page Component
function PageComponent() {
  return (
    <LayoutAdmin>
      <HeaderContent titleName="Page Title" breadCrumb={[...]} />
      
      <Box px={4}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
          <GridItem>
            <MainContent />
          </GridItem>
          <GridItem>
            <SidebarContent />
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}

// Sub-components (inline or separate files)
const MainContent = () => {
  return (
    <Card>
      <CardBody>
        {/* Main content */}
      </CardBody>
    </Card>
  );
};
```

### **🎨 Tab System Pattern**

```typescript
// Standard tab implementation
<Tabs variant="enclosed" colorScheme="blue">
  <TabList bg="gray.50" px={4}>
    <Tab fontWeight="medium" fontSize="sm">
      <HStack spacing={2}>
        <FiIcon size={16} />
        <Text>Tab Name</Text>
      </HStack>
    </Tab>
  </TabList>
  
  <TabPanels>
    <TabPanel p={6}>
      <Suspense fallback={<LoadingMiniSignature />}>
        <TabContent />
      </Suspense>
    </TabPanel>
  </TabPanels>
</Tabs>
```

---

## 🎨 UI/UX Standards

### **🌈 Color System (MANDATORY)**

```typescript
// Primary Colors
colorScheme="blue"     // Primary actions, info, progress
colorScheme="green"    // Success, active states, completed
colorScheme="orange"   // Warnings, in-progress, pending
colorScheme="red"      // Errors, inactive, danger
colorScheme="purple"   // Secondary actions, features
colorScheme="gray"     // Neutral, disabled states

// Status Colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE": return "green";
    case "INACTIVE": return "red";
    case "ONHOLD": return "orange";
    case "COMPLETED": return "blue";
    case "DEVELOPMENT": return "purple";
    default: return "gray";
  }
};
```

### **📏 Spacing System (CONSISTENT)**

```typescript
// Standard spacing values
spacing={2}   // Tight spacing (8px)
spacing={4}   // Standard spacing (16px)
spacing={6}   // Section spacing (24px)
spacing={8}   // Page spacing (32px)

// Padding/Margin patterns
p={4}         // Standard padding
px={6}        // Horizontal padding
py={4}        // Vertical padding
mb={6}        // Bottom margin
```

### **🎯 Border Radius (CONSISTENT)**

```typescript
rounded="md"     // Small components (4px)
rounded="lg"     // Standard components (8px)
rounded="xl"     // Cards and containers (12px)
rounded="2xl"    // Headers and special elements (16px)
rounded="full"   // Buttons and badges (9999px)
```

### **🎨 Gradient System**

```typescript
// Header gradients
bgGradient="linear(135deg, blue.500, purple.600, pink.500)"

// Card gradients
bgGradient="linear(to-br, blue.400, purple.500)"

// Button gradients
bgGradient="linear(135deg, green.400, green.600)"
```

---

## 📊 Data Management

### **🔄 State Management Pattern**

```typescript
// Refresh pattern (USE EVERYWHERE)
const [RefreshData, setRefreshData] = useState<number>(0);
const refreshAction = () => setRefreshData(prev => prev + 1);

// Loading states (MANDATORY)
const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
const [ActionLoading, setActionLoading] = useState(false);

// Data state
const [Data, setData] = useState<DataType | null>(null);
const [DataList, setDataList] = useState<DataType[]>([]);
```

### **📝 Form Handling (MANDATORY)**

```typescript
// Formik + Yup pattern
const ValidationSchema = Yup.object().shape({
  field: Yup.string()
    .required("Field is required")
    .min(3, "Minimum 3 characters")
    .max(100, "Maximum 100 characters"),
});

const formik = useFormik<PayloadType>({
  initialValues: initialValues,
  validationSchema: ValidationSchema,
  validateOnChange: false,
  validateOnBlur: false,
  onSubmit: async (values) => {
    await handleSubmit(values);
  },
});

// Form component
<FormControl isInvalid={formik.errors.field ? true : false} isRequired>
  <FormLabel>Field Label</FormLabel>
  <Input
    name="field"
    value={formik.values.field}
    onChange={formik.handleChange}
    placeholder="Enter value"
  />
  <FormErrorMessage>{formik.errors.field}</FormErrorMessage>
</FormControl>
```

---

## 🔐 Authentication

### **🎫 Auth Setup (CRITICAL - Copy Exactly)**

```typescript
// MANDATORY: Use this exact pattern in every component
const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
const [tokenData, setTokenData] = useState<string>("");

useEffect(() => {
  const storedData = localStorage.getItem("authData");
  const token = localStorage.getItem("tokenData") as string;
  
  if (DataAuth == null && storedData) {
    const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
    const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
    setDataAuth(UserData);
  }
  
  if (token) setTokenData(token);
}, [DataAuth]);
```

### **🔒 Protected Operations**

```typescript
// Always check auth before API calls
if (DataAuth && DataAuth.team && tokenData) {
  await performOperation();
} else {
  showToast({
    description: "Authentication required",
    statusToast: "error",
  });
}
```

---

## 📡 API Integration

### **🔌 Service Hook Pattern**

```typescript
// Custom hook structure
export const useServiceName = () => {
  const apiMethod = async (payload: PayloadType, token: string) => {
    try {
      const response = await axiosInstance.post('/endpoint', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  };
  
  return { apiMethod };
};

// Usage in components
const { apiMethod } = useServiceName();
```

### **📊 Response Handling**

```typescript
// Standard response check
const requestData = await apiMethod(payload, tokenData);

if (!requestData || requestData.statusCode !== RES_CODE_OK) {
  showToast({
    description: requestData?.message || RES_GENERIC_ERROR_MSG,
    statusToast: "error",
  });
  return;
}

const data = requestData.data as DataType;
```

---

## 🐛 Error Handling

### **⚠️ Error Patterns (MANDATORY)**

```typescript
// Try-catch pattern
try {
  setIsLoadingProcess(true);
  const result = await operation();
  // Handle success
} catch (error) {
  console.error("Operation failed:", error);
  showToast({
    description: "Operation failed. Please try again.",
    statusToast: "error",
  });
} finally {
  setIsLoadingProcess(false);
}

// Null checking
if (!data || !data.property) {
  showToast({
    description: "Invalid data received",
    statusToast: "error",
  });
  return;
}

// Optional chaining
const value = data?.property?.subProperty || "default";
```

### **🎯 Toast Messages**

```typescript
// Success
showToast({
  description: "Operation completed successfully",
  statusToast: "success",
});

// Error
showToast({
  description: "Operation failed. Please try again.",
  statusToast: "error",
});

// Warning
showToast({
  description: "Please check your input",
  statusToast: "warning",
});

// Info
showToast({
  description: "Information updated",
  statusToast: "info",
});
```

---

## 🚀 Performance

### **⚡ Optimization Patterns**

```typescript
// Lazy loading
const LazyComponent = lazy(() => import('./Component'));

// Suspense boundaries
<Suspense fallback={<LoadingMiniSignature />}>
  <LazyComponent />
</Suspense>

// Memoization
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Callback memoization
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### **🎯 Loading States**

```typescript
// Component loading
{IsLoadingProcess ? (
  <LoadingMiniSignature />
) : (
  <ComponentContent />
)}

// Button loading
<Button
  isLoading={ActionLoading}
  loadingText="Processing..."
  onClick={handleAction}
>
  Submit
</Button>
```

---

## 📝 Documentation Standards

### **📚 Component Documentation**

```typescript
/**
 * ComponentName - Brief description
 * 
 * @param {ComponentProps} props - Component properties
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * <ComponentName data={data} onAction={handleAction} />
 */
interface ComponentProps {
  data: DataType;
  onAction: () => void;
}

const ComponentName = ({ data, onAction }: ComponentProps) => {
  // Implementation
};
```

### **🔧 Function Documentation**

```typescript
/**
 * Fetches project data by ID
 * 
 * @param {string} projectId - Project identifier
 * @param {string} token - Authentication token
 * @returns {Promise<ProjectDataResponse>} Project data
 */
const fetchProjectData = async (projectId: string, token: string) => {
  // Implementation
};
```

---

## ✅ Checklist for New Components

### **🎯 Before Creating Component:**
- [ ] Check if similar component exists
- [ ] Define TypeScript interfaces
- [ ] Plan component structure
- [ ] Identify required services

### **🔧 During Development:**
- [ ] Follow standard component structure
- [ ] Implement auth setup pattern
- [ ] Add proper error handling
- [ ] Use consistent styling
- [ ] Add loading states
- [ ] Implement form validation (if needed)

### **✅ Before Committing:**
- [ ] Test all functionality
- [ ] Check TypeScript compilation
- [ ] Verify responsive design
- [ ] Test error scenarios
- [ ] Update documentation
- [ ] Add to navigation (if needed)

---

**📝 Last Updated**: December 2024  
**🔄 Version**: 2.0.0  
**👨‍💻 Maintained by**: Development Team

---

> **⚠️ CRITICAL**: This document contains mandatory patterns. Always refer to this guide when developing new features or modifying existing ones.
