# 🎨 FRONTEND UI/UX STYLE GUIDE

## 📋 **DESIGN SYSTEM OVERVIEW**

### **🎯 Core Technology Stack**
- **Framework**: Next.js 15 + TypeScript
- **UI Library**: Chakra UI v2
- **Icons**: React Icons (Feather Icons)
- **Fonts**: Poppins (Primary), Source Sans Pro (Secondary)
- **Animation**: Framer Motion
- **Styling**: CSS-in-JS + Global CSS

---

## 🎨 **COLOR SYSTEM**

### **✅ Primary Color Palette**
```typescript
// Main Brand Colors
blue: {
  50: "#eff7ff",
  100: "#c4e1ff", 
  200: "#98caff",
  300: "#66b0ff",
  500: "#3182ce",  // Primary Blue
  600: "#2c5aa0",
  900: "#1a365d"
}

// Secondary Colors
secondary: {
  500: "#805ad5",  // Purple accent
  600: "#6b46c1"
}

// Status Colors
green: "Success states, active projects"
orange: "Warning states, on-hold items"
red: "Error states, inactive items"
gray: "Neutral states, disabled items"
```

### **🌙 Dark Mode Support**
```typescript
// Color Mode Pattern (PREFERRED)
const { colorMode } = useColorMode();
bg={colorMode === "light" ? "white" : "gray.800"}
borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
```

---

## 📐 **LAYOUT SYSTEM**

### **✅ Grid Structure**
```typescript
// Desktop Layout
<Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
  <GridItem>Main Content</GridItem>
  <GridItem>Sidebar</GridItem>
</Grid>

// Mobile: Single column, stacked layout
```

### **✅ Spacing System**
```typescript
spacing={4}   // Standard spacing (16px)
spacing={6}   // Section spacing (24px)  
spacing={8}   // Page spacing (32px)
```

### **✅ Border Radius**
```typescript
export const radiusStyle = "2xl";  // Standard: 16px

rounded="lg"    // Standard components (8px)
rounded="xl"    // Cards and containers (12px)
rounded="2xl"   // Headers and special elements (16px)
rounded="full"  // Buttons and badges (50%)
```

---

## 🧩 **COMPONENT PATTERNS**

### **✅ Card Component Structure**
```typescript
<Card
  w="full"
  h="480px"           // Fixed height for consistency
  bg={colorMode === "light" ? "white" : "gray.800"}
  border="1px"
  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
  rounded="2xl"
  shadow={isHovered ? "2xl" : "lg"}
  transition="all 0.3s ease"
  _hover={{
    cursor: "pointer",
    shadow: "2xl"
  }}
>
```

### **✅ Button Variants**
```typescript
// Primary Actions
<Button colorScheme="blue" rounded="full">

// Secondary Actions  
<Button variant="ghost" rounded="full">

// Icon Buttons
<Button leftIcon={<Icon />} colorScheme="blue">

// Status-based Colors
colorScheme="green"    // Success, active states
colorScheme="orange"   // Warnings, in-progress
colorScheme="red"      // Errors, inactive states
colorScheme="purple"   // Secondary actions, features
```

### **✅ Status Indicators**
```typescript
<Badge colorScheme="green">ACTIVE</Badge>
<Badge colorScheme="orange">ONHOLD</Badge>
<Badge colorScheme="red">INACTIVE</Badge>
<Badge colorScheme="blue">COMPLETED</Badge>
```

---

## 🎭 **ANIMATION PATTERNS**

### **✅ Hover Effects**
```typescript
// Card Hover Animation
transition="all 0.3s ease"
_hover={{
  cursor: "pointer",
  shadow: "2xl",
  transform: "translateY(-4px)"  // Subtle lift effect
}}
```

### **✅ Loading States**
```typescript
// Loading Overlay Pattern
<LoadingOverlay isLoading={loading} />

// Component Loading States
{IsLoadingProcess && <LoadingMiniSignature />}
```

---

## 📱 **RESPONSIVE DESIGN**

### **✅ Breakpoint System**
```typescript
// Chakra UI Responsive Props
templateColumns={{ base: "1fr", lg: "1fr 300px" }}
display={{ base: "none", md: "flex" }}
fontSize={{ base: "sm", md: "md" }}

// Breakpoints:
// base: 0px (mobile)
// md: 768px (tablet)
// lg: 1024px (desktop)
```

### **✅ Mobile-First Approach**
- Stack layouts vertically on mobile
- Hide non-essential elements on small screens
- Touch-friendly button sizes (min 44px)
- Readable font sizes (min 16px)

---

## 🎯 **COMPONENT VARIANTS**

### **✅ CardProject Variants**
```typescript
// Manager Variant (Blue Theme)
<CardProject data={projectData} variant="manager" />
// → Links to: projects-manager/detail
// → Button: "Manage Project" with Settings icon

// Development Variant (Secondary Theme)
<CardProject data={projectData} variant="development" />
// → Links to: project-development/development  
// → Button: "Start Development" with Code icon

// Deployment Variant (Green Theme)
<CardProject data={projectData} variant="deployment" />
// → Links to: projects-deployments/detail
// → Button: "Manage Deployment" with Server icon
```

### **✅ Navigation Patterns**
```typescript
// Smart Sidebar with Auto-Expansion
const [isOpen, setIsOpen] = useState(false);
const [hasActiveChild, setHasActiveChild] = useState(false);

// Auto-expand when child routes are active
useEffect(() => {
  if (isCurrentActive || childActive) {
    setIsOpen(true);
  }
}, [pathname]);
```

---

## 🎨 **GRADIENT SYSTEM**

### **✅ Modern Gradients (CSS Classes)**
```css
.modern-gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.modern-gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.modern-gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
```

### **✅ Chakra UI Gradients**
```typescript
bgGradient="linear(135deg, blue.500, purple.600, pink.500)"
bgGradient="linear(to-r, secondary.500, secondary.600)"
```

---

## 📋 **FORM PATTERNS**

### **✅ Formik Integration**
```typescript
const formik = useFormik<PayloadType>({
  initialValues: initialValues,
  validationSchema: ValidationSchema,
  validateOnChange: false,
  validateOnBlur: false,
  onSubmit: async (values) => {
    await handleSubmit(values);
  },
});
```

### **✅ Form Controls**
```typescript
<FormControl isInvalid={!!formik.errors.field}>
  <FormLabel>Field Label</FormLabel>
  <Input
    name="field"
    value={formik.values.field}
    onChange={formik.handleChange}
    rounded={radiusStyle}
  />
  <FormErrorMessage>{formik.errors.field}</FormErrorMessage>
</FormControl>
```

---

## 🎯 **TYPOGRAPHY SYSTEM**

### **✅ Font Hierarchy**
```typescript
// Headings
<Heading size="2xl">Page Title</Heading>
<Heading size="xl">Section Title</Heading>
<Heading size="lg">Subsection Title</Heading>

// Body Text
<Text fontSize="lg">Large body text</Text>
<Text fontSize="md">Regular body text</Text>
<Text fontSize="sm">Small text, captions</Text>
```

### **✅ Font Weights**
```typescript
fontWeight="700"  // Bold headings
fontWeight="600"  // Semi-bold emphasis
fontWeight="500"  // Medium weight
fontWeight="400"  // Regular text
```

---

## 📊 **DATA DISPLAY PATTERNS**

### **✅ Table Structure**
```typescript
<TableContainer>
  <Table variant="simple">
    <Thead>
      <Tr>
        <Th>Column Header</Th>
      </Tr>
    </Thead>
    <Tbody>
      <Tr>
        <Td>Data Cell</Td>
      </Tr>
    </Tbody>
  </Table>
</TableContainer>
```

### **✅ Progress Indicators**
```typescript
<Progress 
  value={percentage} 
  colorScheme={getProgressColor(percentage)}
  rounded="full"
  size="sm"
/>
```

---

## 🎨 **ICON SYSTEM**

### **✅ Feather Icons (React Icons)**
```typescript
import { 
  FiHome, FiUser, FiSettings, FiCode, 
  FiServer, FiTarget, FiActivity 
} from "react-icons/fi";

// Usage
<Icon as={FiHome} boxSize={5} />
```

### **✅ Icon Sizing**
```typescript
boxSize={4}   // Small icons (16px)
boxSize={5}   // Regular icons (20px)
boxSize={6}   // Large icons (24px)
```

---

## 📝 **DEVELOPMENT GUIDELINES**

### **✅ Component Structure**
```typescript
// Standard Component Pattern
function ComponentName() {
  // 1. Hooks and State
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  
  // 2. Auth Setup (if needed)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  
  // 3. Component Logic
  // 4. Return JSX with LayoutAdmin wrapper
}
```

### **✅ Naming Conventions**
- **Components**: PascalCase (`CardProject`, `LayoutAdmin`)
- **Props**: camelCase (`variant`, `linkPath`, `actionLabel`)
- **Constants**: UPPER_SNAKE_CASE (`radiusStyle`, `DELAY_MEDIUM`)
- **Files**: camelCase (`projectManagerDetail.tsx`)

---

**📅 Last Updated:** October 2024  
**🔄 Version:** 1.0  
**👨💻 Maintained by:** Frontend Team
