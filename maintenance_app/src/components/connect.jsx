// API client for connecting React app to the backend MySQL database
const baseUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

const toJson = async (response) => {
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const handleResponse = async (response) => {
  if (response.ok) {
    return toJson(response);
  }

  let message = `Request failed with status ${response.status}`;

  try {
    const payload = await response.json();
    message = payload?.error || payload?.message || message;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Failed to parse error response", err);
    }
  }

  throw new Error(message);
};

const request = async (path, options = {}) => {
  try {
    const response = await fetch(`${baseUrl}${path}`, options);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Network request failed");
    }
    throw new Error("Network request failed");
  }
};

// Login user
export const login = (email, password) =>
  request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

// Fetch all roles from database
export const fetchRoles = () => request("/roles");

// Fetch requests based on user role
export const fetchRequests = (user) => {
  const params = new URLSearchParams({
    userId: String(user.user_id),
    userRole: String(user.user_role),
  });

  return request(`/requests?${params.toString()}`);
};

// Submit new maintenance request
export const submitRequest = (payload) =>
  request("/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      locationBuilding: payload.locationBuilding,
      roomNumber: payload.roomNumber,
      userId: payload.userId,
    }),
  });

// Update request status
export const updateRequestStatus = (requestId, status) =>
  request(`/requests/${requestId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

// Update request role assignment
export const updateRequestRole = (requestId, roleId) =>
  request(`/requests/${requestId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestRole: roleId }),
  });
