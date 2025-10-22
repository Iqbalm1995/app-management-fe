# 🔌 API INTEGRATION PATTERNS

## 🎯 **SERVICE HOOK PATTERN**

### **✅ Standard Service Structure**
```typescript
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
```

### **✅ Component Integration**
```typescript
// 1. Import service
const { GetData, UpdateData } = useServiceName();

// 2. API call pattern
const fetchData = async () => {
  try {
    setIsLoadingProcess(true);
    const response = await GetData(params, tokenData);
    
    if (!response || response.statusCode !== RES_CODE_OK) {
      showToast({
        description: response?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    }
    
    setData(response.data);
  } catch (error) {
    showToast({
      description: "An unexpected error occurred",
      statusToast: "error",
    });
  } finally {
    setIsLoadingProcess(false);
  }
};
```

## 🔐 **AUTHENTICATION PATTERN**

### **✅ Auth Context Usage**
```typescript
// Standard auth setup in components
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

## 📊 **RESPONSE HANDLING**

### **✅ Standard Response Check**
```typescript
const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
if (isErrorResponse || !requestData) {
  showToast({
    description: requestData?.message || RES_GENERIC_ERROR_MSG,
    statusToast: "error",
  });
  return;
}
```

### **✅ Loading States**
```typescript
const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
const [RefreshData, setRefreshData] = useState<number>(0);

// Refresh trigger
const refreshAction = () => setRefreshData(prev => prev + 1);
```

---

**📅 Last Updated:** October 2024
