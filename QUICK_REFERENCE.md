# ⚡ Quick Reference - Revo-Kobra App Management

> **Essential Information for Every Development Session**  
> Critical patterns, commands, and configurations at a glance

## 🚀 Quick Start Commands

```bash
# Development
npm run dev          # Start dev server (port 8998)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Access URLs
http://localhost:8998                           # Main app
http://localhost:8998/projects-manager          # Projects list
http://localhost:8998/projects-manager/detail   # Project detail
```

---

## 🎯 Critical Code Patterns

### **🔐 Auth Setup (Copy Exactly)**
```typescript
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

### **📡 API Call Pattern**
```typescript
try {
  setIsLoadingProcess(true);
  const requestData = await APICall(params, tokenData);
  
  if (!requestData || requestData.statusCode !== RES_CODE_OK) {
    showToast({
      description: requestData?.message || RES_GENERIC_ERROR_MSG,
      statusToast: "error",
    });
    return;
  }
  
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
```

### **🎨 Component Structure**
```typescript
function ComponentName() {
  // 1. Hooks
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  
  // 2. Auth (mandatory)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  
  // 3. Data state
  const [Data, setData] = useState<DataType | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  
  // 4. Auth effect (copy exactly)
  // 5. Data fetching effect
  // 6. Render with LayoutAdmin
}
```

---

## 🎨 UI Quick Reference

### **🌈 Color Schemes**
```typescript
colorScheme="blue"     // Primary actions, info
colorScheme="green"    // Success, active states
colorScheme="orange"   // Warnings, in-progress
colorScheme="red"      // Errors, inactive states
colorScheme="purple"   // Secondary actions, features
colorScheme="gray"     // Neutral, disabled states
```

### **📏 Spacing & Radius**
```typescript
spacing={4}   // Standard spacing
spacing={6}   // Section spacing
spacing={8}   // Page spacing

rounded="lg"    // Standard components
rounded="xl"    // Cards and containers
rounded="2xl"   // Headers and special elements
rounded="full"  // Buttons and badges
```

### **🎯 Layout Pattern**
```typescript
<LayoutAdmin>
  <Box px={4}>
    <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
      <GridItem>Main Content</GridItem>
      <GridItem>Sidebar</GridItem>
    </Grid>
  </Box>
</LayoutAdmin>
```

---

## 📊 Data Structures

### **🎯 Project Data**
```typescript
interface ProjectDataResponse {
  id: string;
  projectNo: string;
  projectName: string;
  projectDesc: string | null;
  projectStatus: string;
  projectStatusPercentage: number;
  projectType: string;
  projectCategory: string;
  userAssignment: ProjectUserAssignmentResponse[];
  appsProject?: AppsResponse;
}
```

### **🔐 Auth Data**
```typescript
interface AuthDataResponse {
  id: string;
  nama: string;
  email: string;
  team: TeamData;
}
```

---

## 🔧 Service Hooks

### **📡 Available Services**
```typescript
const { GetDetailById, UpdateProjects } = useProjects();
const { List: ListUsers, GetDetailById: GetUserById } = useUsers();
const { CountTaskByProjectId } = useTasks();
const { List: ListTeams } = useTeams();
```

### **🎯 Common API Calls**
```typescript
// Get project detail
const projectData = await GetDetailById(projectId, tokenData);

// Update project
const updateResult = await UpdateProjects(payload, tokenData);

// Get users list
const usersList = await ListUsers(payload, tokenData);
```

---

## 🎨 Common UI Components

### **📋 Form Pattern**
```typescript
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

### **🎯 Tab Pattern**
```typescript
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
    <TabPanel p={6}>Content</TabPanel>
  </TabPanels>
</Tabs>
```

### **📊 Card Pattern**
```typescript
<Card shadow="sm" rounded="lg">
  <CardHeader>
    <Heading size="sm">Card Title</Heading>
  </CardHeader>
  <CardBody>
    Card content
  </CardBody>
</Card>
```

---

## 🐛 Common Issues & Solutions

### **❌ TypeScript Errors**
```typescript
// Issue: Property does not exist
// Solution: Use optional chaining
data?.property?.subProperty

// Issue: Null reference
// Solution: Check before use
if (!requestData || requestData.statusCode !== RES_CODE_OK) {
  return;
}
```

### **❌ API Issues**
```typescript
// Issue: Wrong property name
// Use: requestData.statusCode (not responseCode)
// Use: appsStatus (not appStatus)

// Issue: Missing null check
// Always check: if (!requestData || requestData.statusCode !== RES_CODE_OK)
```

### **❌ Auth Issues**
```typescript
// Issue: Auth data not loading
// Check: localStorage.getItem("authData")
// Check: localStorage.getItem("tokenData")

// Issue: Token not passed
// Ensure: All API calls include tokenData parameter
```

---

## 📁 File Locations

### **🎯 Core Files**
```
src/app/(pages)/projects-manager/detail/projectManagerDetail.tsx  # Main detail page
src/app/components/layoutAdmin.tsx                                # Main layout
src/app/components/sidebar.tsx                                    # Navigation
src/app/services/useProjects.ts                                  # Projects API
src/app/context/AuthContext.tsx                                  # Auth context
```

### **📚 Documentation**
```
README.md              # Main documentation
DEVELOPMENT_GUIDE.md   # Development patterns
PROJECT_STATUS.md      # Current status
QUICK_REFERENCE.md     # This file
docs/archive/          # Old documentation
```

---

## 🎯 Status Indicators

### **✅ Project Status**
- **NEW** - Just created
- **ACTIVE** - Currently working
- **ONHOLD** - Temporarily paused
- **COMPLETED** - Finished
- **INACTIVE** - Stopped/cancelled

### **✅ App Status**
- **ACTIVE** - Running/live
- **INACTIVE** - Stopped
- **DEVELOPMENT** - In development
- **TESTING** - In testing phase

---

## 🚀 Performance Tips

### **⚡ Optimization**
```typescript
// Lazy loading
const LazyComponent = lazy(() => import('./Component'));

// Suspense
<Suspense fallback={<LoadingMiniSignature />}>
  <LazyComponent />
</Suspense>

// Memoization
const memoizedValue = useMemo(() => calculation(data), [data]);
```

### **🎯 Loading States**
```typescript
// Component loading
{IsLoadingProcess ? <LoadingMiniSignature /> : <Content />}

// Button loading
<Button isLoading={ActionLoading} loadingText="Processing...">
  Submit
</Button>
```

---

## 📞 Emergency Contacts

### **🆘 When Things Break**
1. **Check this quick reference first**
2. **Review DEVELOPMENT_GUIDE.md**
3. **Check PROJECT_STATUS.md for current state**
4. **Look at existing working components**
5. **Check console for errors**

### **🔧 Common Fixes**
- **TypeScript errors**: Check interfaces in types/
- **API errors**: Verify response structure
- **Auth errors**: Check localStorage data
- **UI errors**: Verify Chakra UI props

---

**📝 Last Updated**: December 2024  
**⚡ Quick Reference Version**: 2.0.0  
**👨‍💻 Maintained by**: Development Team

---

> **⚡ QUICK TIP**: Bookmark this file for instant access to critical information during development sessions!
