# Icon Registry System Documentation

## Overview

The Icon Registry System provides a centralized, tree-shakeable way to manage icons across the application. Icons are stored as strings in the database and dynamically converted to React Icon components at runtime.

## Architecture

### Components

1. **Icon Registry** (`/src/app/utils/iconRegistry.ts`)
   - Central registry mapping icon names to IconType components
   - Supports 20 icon libraries from react-icons
   - Provides utility functions for icon management

2. **Database Storage**
   - Icons stored as strings (e.g., "FiHome", "TbUsers")
   - Stored in `MST_MENU.MENU_ICON` column

3. **Runtime Conversion**
   - `getIconComponent()` converts string to IconType
   - Falls back to FiCircle if icon not found
   - Type-safe with proper TypeScript support

## Supported Icon Libraries

| Prefix | Library | Package | Example |
|--------|---------|---------|---------|
| Fi | Feather Icons | react-icons/fi | FiHome, FiUsers |
| Tb | Tabler Icons | react-icons/tb | TbLayoutDashboardFilled |
| Md | Material Design | react-icons/md | MdOutlineCode |
| Bs | Bootstrap Icons | react-icons/bs | BsRocketTakeoff |
| Fa | Font Awesome | react-icons/fa | FaCode, FaRegHeart |
| Fa6 | Font Awesome 6 | react-icons/fa6 | FaDiagramProject |
| Hi | Heroicons | react-icons/hi | HiOutlineDesktopComputer |
| Io5 | Ionicons 5 | react-icons/io5 | IoCalendarOutline |
| Ri | Remix Icons | react-icons/ri | RiApps2AiLine |
| Ai | Ant Design | react-icons/ai | AiOutlineVideoCamera |
| Bi | BoxIcons | react-icons/bi | BiAnalyse |
| Ci | Circum Icons | react-icons/ci | CiMobile2 |
| Gr | Grommet Icons | react-icons/gr | GrHelpBook |
| Im | IcoMoon | react-icons/im | ImUserTie |
| Io | Ionicons | react-icons/io | IoIosCodeDownload |
| Lia | Line Awesome | react-icons/lia | LiaFileContractSolid |
| Lu | Lucide | react-icons/lu | LuBookHeart |
| Pi | Phosphor Icons | react-icons/pi | PiCertificate |
| Rx | Radix Icons | react-icons/rx | RxActivityLog |
| Ti | Typicons | react-icons/ti | TiThMenuOutline |

## Usage

### In Components

```typescript
import { getIconComponent } from "@/app/utils/iconRegistry";

// Convert icon string to IconType
const icon = getIconComponent("FiHome");

// Use with Chakra UI
<Icon as={icon} />
```

### In Menu System

Icons are automatically converted when loading menus from `accessData`:

```typescript
const buildMenuFromAccess = (menus: any[]) => {
  return menus.map((menu) => ({
    name: menu.menuName,
    icon: getIconComponent(menu.menuIcon), // Automatic conversion
    link: menu.menuLink,
    // ...
  }));
};
```

## Adding New Icons

### Step 1: Find the Icon

Visit [react-icons.github.io/react-icons](https://react-icons.github.io/react-icons) and search for your icon.

Example: You want to use `FiFolder` from Feather Icons.

### Step 2: Update Icon Registry

Open `/src/app/utils/iconRegistry.ts`:

**A. Add to imports:**
```typescript
// Feather Icons
import {
  FiAward,
  FiCircle,
  FiDatabase,
  FiFolder,  // ← Add new icon here
  FiKey,
  // ...
} from "react-icons/fi";
```

**B. Add to registry object:**
```typescript
const iconRegistry: Record<string, IconType> = {
  // ...
  
  // Feather Icons (Fi)
  FiAward,
  FiCircle,
  FiDatabase,
  FiFolder,  // ← Add new icon here
  FiKey,
  // ...
};
```

### Step 3: Use in Database

When creating or updating a menu, set `menuIcon` to the exact icon name:

```sql
UPDATE MST_MENU 
SET MENU_ICON = 'FiFolder' 
WHERE MENU_CODE = 'MN0001';
```

Or via API:
```json
{
  "menuIcon": "FiFolder"
}
```

### Step 4: Rebuild Application

```bash
npm run build
```

The icon will now be available throughout the application.

## API Reference

### getIconComponent()

Converts an icon name string to an IconType component.

**Signature:**
```typescript
getIconComponent(iconName: string | null | undefined): IconType
```

**Parameters:**
- `iconName` - The name of the icon (e.g., "FiHome", "TbUsers")

**Returns:**
- `IconType` - The icon component, or FiCircle if not found

**Example:**
```typescript
const homeIcon = getIconComponent("FiHome");
const unknownIcon = getIconComponent("InvalidIcon"); // Returns FiCircle
const nullIcon = getIconComponent(null); // Returns FiCircle
```

### hasIcon()

Checks if an icon exists in the registry.

**Signature:**
```typescript
hasIcon(iconName: string): boolean
```

**Parameters:**
- `iconName` - The name of the icon to check

**Returns:**
- `boolean` - true if icon exists, false otherwise

**Example:**
```typescript
if (hasIcon("FiHome")) {
  console.log("Icon exists!");
}
```

### getAvailableIcons()

Returns all registered icon names.

**Signature:**
```typescript
getAvailableIcons(): string[]
```

**Returns:**
- `string[]` - Sorted array of all icon names

**Example:**
```typescript
const allIcons = getAvailableIcons();
console.log(allIcons); // ["AiOutlineVideoCamera", "BiAnalyse", ...]
```

## Best Practices

### 1. Icon Naming Convention

Always use the exact icon name from react-icons:
- ✅ Correct: `"FiHome"`, `"TbUsers"`, `"MdOutlineCode"`
- ❌ Wrong: `"fi-home"`, `"tb_users"`, `"md-outline-code"`

### 2. Fallback Handling

The system automatically falls back to FiCircle for missing icons:
```typescript
// If "FiInvalidIcon" doesn't exist
const icon = getIconComponent("FiInvalidIcon"); 
// Returns FiCircle and logs warning to console
```

### 3. Tree-Shaking

Only import icons that are actually used to maintain small bundle size:
- ✅ Import specific icons: `import { FiHome } from "react-icons/fi"`
- ❌ Import all icons: `import * as FiIcons from "react-icons/fi"`

### 4. Icon Library Selection

Choose icons from the same library for consistency:
- **Primary**: Feather Icons (Fi) - Clean, minimal design
- **Secondary**: Tabler Icons (Tb) - More variety, modern style
- **Fallback**: Other libraries for specific needs

## Troubleshooting

### Icon Not Displaying

**Problem:** Icon shows as FiCircle instead of expected icon.

**Solutions:**
1. Check console for warning: `Icon "IconName" not found in registry`
2. Verify icon name spelling in database matches exactly
3. Ensure icon is added to iconRegistry.ts
4. Rebuild application after adding new icons

### Build Error: Module has no exported member

**Problem:** `Module 'react-icons/fi' has no exported member 'FiInvalidIcon'`

**Solution:**
1. Verify icon exists at [react-icons.github.io](https://react-icons.github.io/react-icons)
2. Check you're importing from correct library (Fi, Tb, Md, etc.)
3. Some icons may have different names or be in different libraries

### Icon Not Updating After Database Change

**Problem:** Changed icon in database but UI still shows old icon.

**Solutions:**
1. Clear browser cache and localStorage
2. Logout and login again to refresh accessData
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## Performance Considerations

### Bundle Size

The icon registry only includes icons that are explicitly imported:
- **Current registry**: ~90 icons
- **Bundle impact**: ~15-20KB (compressed)
- **Tree-shaking**: Unused icons are automatically removed

### Runtime Performance

Icon lookup is O(1) constant time:
```typescript
// Fast hash map lookup
const icon = iconRegistry[iconName]; // O(1)
```

### Caching

Icons are loaded once and cached:
- Menu data cached in localStorage as `accessData`
- Icons converted during initial menu build
- No repeated conversions during navigation

## Migration Guide

### From Hardcoded Icons

**Before:**
```typescript
icon: FiCircle  // All menus used same icon
```

**After:**
```typescript
icon: getIconComponent(menu.menuIcon)  // Dynamic from database
```

### From String Mapping

**Before:**
```typescript
const getIcon = (name: string) => {
  switch(name) {
    case "home": return FiHome;
    case "users": return FiUsers;
    // ... 100+ cases
  }
};
```

**After:**
```typescript
const icon = getIconComponent("FiHome");  // Direct lookup
```

## Security Considerations

### Input Validation

The system safely handles invalid input:
- Null/undefined values return FiCircle
- Invalid icon names return FiCircle with warning
- No code injection risk (icons are pre-imported)

### XSS Prevention

Icons are not dynamically imported from external sources:
- All icons imported at build time
- No runtime eval() or dynamic imports
- Type-safe with TypeScript

## Future Enhancements

### Planned Features

1. **Icon Picker Component**
   - Visual icon selector for menu management
   - Search and filter capabilities
   - Preview before selection

2. **Icon Categories**
   - Group icons by category (navigation, actions, etc.)
   - Easier discovery of appropriate icons

3. **Custom Icons**
   - Support for custom SVG icons
   - Organization-specific icon library

4. **Icon Variants**
   - Support for filled/outlined variants
   - Size and color presets

## Support

For issues or questions:
1. Check console warnings for missing icons
2. Verify icon exists in react-icons library
3. Review this documentation
4. Contact development team

## Changelog

### Version 1.0.0 (2026-01-18)
- Initial implementation
- Support for 20 icon libraries
- Tree-shakeable architecture
- Fallback handling
- Type-safe implementation
