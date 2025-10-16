# 🧩 COMPONENT DOCUMENTATION GUIDE

## 📋 **CORE COMPONENTS REFERENCE**

### **🏗️ Layout Components**

#### **LayoutAdmin**
```typescript
// Main application layout wrapper
<LayoutAdmin>
  {children}
</LayoutAdmin>

// Features:
- Loading overlay on route changes
- Dark mode background switching
- Sidebar navigation integration
- Responsive design
```

#### **NavigationAdmin (Sidebar)**
```typescript
// Smart sidebar with auto-expansion
Features:
- Auto-expanding submenus when child routes active
- Dark mode support
- User profile section
- Collapsible navigation groups
- Active state detection
```

---

### **🎴 Card Components**

#### **CardProject** (Reusable)
```typescript
interface CardProjectProps {
  data: ProjectDataResponse;
  variant?: "manager" | "development" | "procurement" | "deployment";
  linkPath?: string;
  actionLabel?: string;
  actionIcon?: any;
}

// Usage Examples:
<CardProject data={project} variant="manager" />
<CardProject data={project} variant="development" />
<CardProject 
  data={project} 
  variant="manager"
  linkPath="/custom/path"
  actionLabel="Custom Action"
  actionIcon={FiTarget}
/>

// Variants:
- manager: Blue theme, "Manage Project", Settings icon
- development: Purple theme, "Start Development", Code icon
- deployment: Green theme, "Manage Deployment", Server icon
- procurement: Yellow theme, "Manage Procurement", Target icon
```

#### **Card Styling Pattern**
```typescript
<Card
  w="full"
  h="480px"                    // Fixed height for grid consistency
  bg={colorMode === "light" ? "white" : "gray.800"}
  border="1px"
  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
  rounded="2xl"                // Standard radius
  shadow={isHovered ? "2xl" : "lg"}
  transition="all 0.3s ease"
  _hover={{
    cursor: "pointer",
    shadow: "2xl"
  }}
>
```

---

### **📊 Data Display Components**

#### **TableComponents**
```typescript
// Standardized table with pagination
Features:
- Built-in pagination
- Search functionality
- Column sorting
- Loading states
- Dark mode support
- Responsive design

// Usage:
<TableComponents
  data={tableData}
  columns={columnDefinitions}
  onRowClick={handleRowClick}
  isLoading={loading}
/>
```

#### **HeaderContent**
```typescript
interface HeaderContentProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

// Usage:
<HeaderContent
  title="Project Management"
  breadcrumb={[
    { label: "Home", href: "/home" },
    { label: "Projects", href: "/projects" }
  ]}
  actions={
    <Button colorScheme="blue">Add Project</Button>
  }
/>
```

---

### **📝 Form Components**

#### **Form Pattern with Formik**
```typescript
// Standard form implementation
const formik = useFormik<PayloadType>({
  initialValues: {
    field1: "",
    field2: ""
  },
  validationSchema: Yup.object({
    field1: Yup.string().required("Required"),
    field2: Yup.string().min(3, "Min 3 characters")
  }),
  validateOnChange: false,
  validateOnBlur: false,
  onSubmit: async (values) => {
    await handleSubmit(values);
  }
});

// Form Control Pattern:
<FormControl isInvalid={!!formik.errors.field1}>
  <FormLabel>Field Label</FormLabel>
  <Input
    name="field1"
    value={formik.values.field1}
    onChange={formik.handleChange}
    rounded={radiusStyle}
  />
  <FormErrorMessage>{formik.errors.field1}</FormErrorMessage>
</FormControl>
```

#### **Select Components**
```typescript
// Chakra React Select
<Select
  options={options}
  value={selectedOption}
  onChange={handleChange}
  placeholder="Select option..."
  chakraStyles={{
    control: (provided) => ({
      ...provided,
      borderRadius: radiusStyle
    })
  }}
/>

// Standard Chakra Select
<SelectC
  value={value}
  onChange={handleChange}
  rounded={radiusStyle}
>
  <option value="">Select...</option>
  {options.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</SelectC>
```

---

### **🔄 Loading Components**

#### **LoadingOverlay**
```typescript
// Full-screen loading overlay
<LoadingOverlay isLoading={loading} />

// Features:
- Backdrop blur effect
- Centered spinner
- Prevents user interaction
- Smooth fade in/out
```

#### **LoadingMiniSignature**
```typescript
// Inline loading indicator
{IsLoadingProcess && <LoadingMiniSignature />}

// Use for:
- Button loading states
- Inline content loading
- Small component updates
```

---

### **🎯 Interactive Components**

#### **ConfirmationDialog**
```typescript
// Reusable confirmation modal
<ConfirmationDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  confirmText="Yes, Continue"
  cancelText="Cancel"
/>
```

#### **Toast Helper**
```typescript
// Standardized toast notifications
const showToast = useToastHelper();

// Usage:
showToast({
  description: "Success message",
  statusToast: "success"
});

showToast({
  description: "Error message", 
  statusToast: "error"
});

// Status options: "success", "error", "warning", "info"
```

---

### **🎨 Status Components**

#### **Badge System**
```typescript
// Status badges with consistent colors
<Badge colorScheme="green">ACTIVE</Badge>
<Badge colorScheme="orange">ONHOLD</Badge>
<Badge colorScheme="red">INACTIVE</Badge>
<Badge colorScheme="blue">COMPLETED</Badge>

// Custom badge styling:
<Badge
  colorScheme={getStatusColor(status)}
  variant="solid"
  rounded="full"
  px={3}
  py={1}
>
  {status}
</Badge>
```

#### **Progress Indicators**
```typescript
// Progress bars with color coding
<Progress
  value={percentage}
  colorScheme={getProgressColor(percentage)}
  rounded="full"
  size="sm"
  bg={colorMode === "light" ? "gray.200" : "gray.700"}
/>

// Color logic:
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return "green";
  if (percentage >= 60) return "blue";
  if (percentage >= 40) return "orange";
  return "red";
};
```

---

### **👥 User Components**

#### **Avatar System**
```typescript
// Single avatar
<Avatar
  size="sm"
  name={user.name}
  src={user.avatar}
/>

// Avatar group for teams
<AvatarGroup size="sm" max={3}>
  {users.map(user => (
    <Avatar
      key={user.id}
      name={user.name}
      src={user.avatar}
    />
  ))}
</AvatarGroup>

// Sizes: xs, sm, md, lg, xl, 2xl
```

---

### **📱 Responsive Patterns**

#### **Grid Layouts**
```typescript
// Desktop: Sidebar + Main content
<Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
  <GridItem>
    <MainContent />
  </GridItem>
  <GridItem>
    <Sidebar />
  </GridItem>
</Grid>

// Card grids
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
  {items.map(item => (
    <CardComponent key={item.id} data={item} />
  ))}
</SimpleGrid>
```

#### **Responsive Utilities**
```typescript
// Show/hide based on screen size
display={{ base: "none", md: "block" }}
display={{ base: "block", md: "none" }}

// Responsive spacing
spacing={{ base: 4, md: 6, lg: 8 }}

// Responsive text
fontSize={{ base: "sm", md: "md", lg: "lg" }}
```

---

### **🎭 Animation Components**

#### **Hover Effects**
```typescript
// Standard hover animation
const [isHovered, setIsHovered] = useState(false);

<Box
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  transition="all 0.3s ease"
  transform={isHovered ? "translateY(-4px)" : "translateY(0)"}
  shadow={isHovered ? "2xl" : "lg"}
>
```

#### **Framer Motion Integration**
```typescript
import { motion } from "framer-motion";
const MotionBox = motion(Box);

<MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</MotionBox>
```

---

## 📋 **COMPONENT USAGE GUIDELINES**

### **✅ DO's**
- Use consistent props naming across similar components
- Follow the established color scheme patterns
- Implement proper loading states
- Add hover effects for interactive elements
- Use responsive props for mobile compatibility
- Include proper TypeScript interfaces
- Follow the established spacing system

### **❌ DON'Ts**
- Don't create custom colors outside the theme
- Don't use hardcoded pixel values for spacing
- Don't skip loading states for async operations
- Don't ignore dark mode support
- Don't create components without proper interfaces
- Don't use inline styles instead of Chakra props

---

**📅 Last Updated:** October 2024  
**🔄 Version:** 1.0  
**👨💻 Maintained by:** Frontend Team
