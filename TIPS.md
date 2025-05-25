# Troubleshooting Tips: Dolibarr Integration

This document provides troubleshooting tips for common issues when implementing or reimplementing the Dolibarr integration, especially for authentication problems.

## Authentication Issues (401 Unauthorized)

If you're seeing errors like:

```
Error fetching profile data: 
Object { message: "Request failed with status code 401", name: "AxiosError", code: "ERR_BAD_REQUEST", ... }
```

Here are the most likely causes and solutions:

### 1. API Key Configuration

**Problem**: The Dolibarr API key might not be correctly set in your project's settings.

**Solutions**:
- Verify that `DOLIBARR_API_KEY` is correctly set in your environment variables or config file
- Check that the API key is valid and has not expired
- Ensure the API key has the necessary permissions in Dolibarr

**Example configuration**:
```javascript
// In .env file
DOLIBARR_API_URL=http://your-dolibarr-instance/api/index.php
DOLIBARR_API_KEY=your_api_key_here
```

### 2. Authentication Headers

**Problem**: The `DOLAPIKEY` header might not be correctly set in your HTTP requests.

**Solution**: Ensure your API client includes the correct headers:

```javascript
// JavaScript/TypeScript example
const headers = {
  "DOLAPIKEY": process.env.DOLIBARR_API_KEY,
  "Accept": "application/json",
  "Content-Type": "application/json"
};

// Python example
self.headers = {
    "DOLAPIKEY": settings.DOLIBARR_API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json"
}
```

### 3. JWT Token Issues

**Problem**: If your frontend is using JWT for authentication, the token might be missing or expired.

**Solutions**:
- Check if your token is being stored correctly (localStorage, sessionStorage, etc.)
- Verify that the token is included in the Authorization header
- Implement token refresh logic if tokens are short-lived

**Example**:
```javascript
// Adding JWT token to requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Other Common Issues

### 4. Different API Endpoints

**Problem**: Dolibarr API endpoints might be different in your environment.

**Solutions**:
- Verify that the base URL is correct: `settings.DOLIBARR_API_URL`
- Check Dolibarr API documentation for your specific version
- Use API discovery if available in your Dolibarr instance

### 5. CORS Configuration

**Problem**: Cross-Origin Resource Sharing might not be properly configured.

**Solutions**:
- Check if your Dolibarr instance allows requests from your frontend domain
- Add appropriate CORS headers in your backend if you're using a proxy
- Consider using a proxy server if CORS issues persist

### 6. Different Table Setup

**Problem**: Database schema differences can cause mapping issues.

**Solutions**:
- Review and adjust the mapping function to match your schema:
  ```python
  def map_faculty_to_third_party(self, faculty_data: Dict[str, Any]) -> Dict[str, Any]:
      # Adjust field mappings to match your schema
      third_party_data = {
          "name": faculty_data.get("full_name", ""),  # Adjust field names as needed
          "email": faculty_data.get("email", ""),
          # ...other fields
      }
      return third_party_data
  ```
- Check if custom fields in Dolibarr match your expectations
- Verify that required fields are not missing in your data

## Debugging Steps

1. **Examine Network Requests**:
   - Use browser developer tools (F12) → Network tab
   - Look at request headers, payload, and response
   - Check for authentication headers and correct endpoints

2. **Test API Directly**:
   - Use tools like Postman or curl to test Dolibarr API directly
   - Verify that your API key works with a simple endpoint

   ```bash
   curl -X GET "http://your-dolibarr/api/index.php/thirdparties" \
     -H "DOLAPIKEY: your_api_key_here" \
     -H "Accept: application/json"
   ```

3. **Check Backend Logs**:
   - Review your application logs for detailed error messages
   - Look for specific HTTP error codes and response bodies

4. **Verify Dolibarr Configuration**:
   - Check that the API module is enabled in Dolibarr
   - Verify user permissions for API access
   - Check if IP restrictions are in place

## Common Dolibarr API Endpoints

For reference, here are common endpoints used in the integration:

- `GET /thirdparties` - List all third parties
- `GET /thirdparties/{id}` - Get a specific third party
- `POST /thirdparties` - Create a new third party
- `PUT /thirdparties/{id}` - Update an existing third party
- `DELETE /thirdparties/{id}` - Delete a third party

Always refer to your specific Dolibarr version's API documentation for the most accurate information.
